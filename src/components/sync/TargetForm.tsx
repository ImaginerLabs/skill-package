// ============================================================
// components/sync/TargetForm.tsx — 同步目标表单组件
// ============================================================

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PathPreset } from "../../../shared/types";
import { validateSyncPath } from "../../lib/api";
import { PathPresetSelect } from "../shared/PathPresetSelect";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface TargetFormProps {
  pathPresets: PathPreset[];
  onSubmit: (name: string, path: string) => Promise<void>;
  onCancel: () => void;
  initialName?: string;
  initialPath?: string;
  submitLabel?: string;
  submitting?: boolean;
}

/**
 * TargetForm — 同步目标新增/编辑表单
 */
export default function TargetForm({
  pathPresets,
  onSubmit,
  onCancel,
  initialName = "",
  initialPath = "",
  submitLabel,
  submitting = false,
}: TargetFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [path, setPath] = useState(initialPath);
  const [validating, setValidating] = useState(false);
  const [pathStatus, setPathStatus] = useState<{
    exists: boolean;
    writable: boolean;
  } | null>(null);

  const handleValidatePath = async (targetPath: string) => {
    if (!targetPath.trim()) {
      setPathStatus(null);
      return;
    }
    setValidating(true);
    const currentPath = targetPath;
    try {
      const result = await validateSyncPath(targetPath);
      // Only update if this is still the current path being validated
      if (currentPath === path) {
        setPathStatus(result);
      }
    } catch {
      if (currentPath === path) {
        setPathStatus(null);
      }
    } finally {
      setValidating(false);
    }
  };

  const handlePresetSelect = (preset: PathPreset) => {
    setPath(preset.path);
    setName(preset.label ?? "");
    setPathStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;
    await onSubmit(name.trim(), path.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] p-4 space-y-3"
    >
      <Input
        placeholder={t("syncTarget.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 text-sm"
        aria-label={t("syncTarget.nameLabel")}
      />
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            placeholder={t("syncTarget.pathPlaceholder")}
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setPathStatus(null);
            }}
            onBlur={() => handleValidatePath(path)}
            className="h-9 text-sm font-[var(--font-code)]"
            aria-label={t("syncTarget.pathLabel")}
          />
          <PathPresetSelect
            presets={pathPresets}
            onSelect={handlePresetSelect}
          />
        </div>
        {validating && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {t("syncTarget.validating")}
          </p>
        )}
        {pathStatus && !validating && (
          <p
            className={`text-xs ${
              pathStatus.exists && pathStatus.writable
                ? "text-[hsl(var(--primary))]"
                : pathStatus.exists
                  ? "text-[hsl(var(--warning))]"
                  : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {pathStatus.exists && pathStatus.writable
              ? t("syncTarget.pathValid")
              : pathStatus.exists
                ? "⚠ " + t("syncTarget.pathInvalid")
                : t("syncTarget.pathInvalid")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim() || !path.trim() || submitting}
          className="gap-1.5"
        >
          <Plus size={14} />
          {submitting
            ? t("common.processing")
            : (submitLabel ?? t("common.confirm"))}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

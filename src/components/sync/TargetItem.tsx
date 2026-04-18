// ============================================================
// components/sync/TargetItem.tsx — 同步目标项组件
// ============================================================

import { Check, Edit2, Eraser, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncTarget } from "../../../shared/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface TargetItemProps {
  target: SyncTarget;
  onToggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  onStartEdit: (target: SyncTarget) => void;
  onSaveEdit: (id: string, name: string, path: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: (id: string) => void;
  isDeleting?: boolean;
  isEditing?: boolean;
}

/**
 * TargetItem — 单个同步目标项
 *
 * 支持两种模式：显示模式和编辑模式
 */
export default function TargetItem({
  target,
  onToggleEnabled,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDeleteAll,
  isDeleting = false,
  isEditing = false,
}: TargetItemProps) {
  const { t } = useTranslation();
  const [editName, setEditName] = useState(target.name);
  const [editPath, setEditPath] = useState(target.path);

  const handleSave = async () => {
    if (!editName.trim() || !editPath.trim()) return;
    await onSaveEdit(target.id, editName.trim(), editPath.trim());
  };

  if (isEditing) {
    return (
      <div className="rounded-md border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] p-3 space-y-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder={t("syncTarget.nameLabel")}
          className="h-8 text-sm"
        />
        <Input
          value={editPath}
          onChange={(e) => setEditPath(e.target.value)}
          placeholder={t("syncTarget.pathLabel")}
          className="h-8 text-sm font-[var(--font-code)]"
        />
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
            aria-label={t("common.save")}
          >
            <Check size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCancelEdit}
            aria-label={t("common.cancel")}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-md border px-4 py-3 transition-colors ${
        target.enabled
          ? "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          : "border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.5)] opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => onToggleEnabled(target.id, target.enabled)}
        >
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
              {target.name}
            </p>
            <Badge
              variant={target.enabled ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {target.enabled
                ? t("syncTarget.enabledLabel")
                : t("common.close")}
            </Badge>
          </div>
          <p className="text-xs font-[var(--font-code)] text-[hsl(var(--muted-foreground))] truncate">
            {target.path}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(target);
            }}
            aria-label={`${t("common.edit")} ${target.name}`}
          >
            <Edit2 size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAll(target.id);
            }}
            aria-label={`${t("syncTarget.deleteAllSkillsTitle")} ${target.name}`}
          >
            <Eraser size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[hsl(var(--destructive))]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(target.id);
            }}
            aria-label={`${t("common.delete")} ${target.name}`}
            disabled={isDeleting}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

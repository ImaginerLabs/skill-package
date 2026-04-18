// ============================================================
// components/settings/CategoryForm.tsx — 分类表单组件
// ============================================================

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface CategoryFormProps {
  onSubmit: (
    name: string,
    displayName: string,
    description?: string,
  ) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  initialName?: string;
  initialDisplayName?: string;
  initialDescription?: string;
  submitting?: boolean;
}

/**
 * CategoryForm — 分类新建/编辑表单
 */
export default function CategoryForm({
  onSubmit,
  onCancel,
  submitLabel,
  initialName = "",
  initialDisplayName = "",
  initialDescription = "",
  submitting = false,
}: CategoryFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !displayName.trim()) return;
    await onSubmit(
      name.trim(),
      displayName.trim(),
      description.trim() || undefined,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
    >
      <div className="grid gap-3">
        <Input
          placeholder={t("category.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        <Input
          placeholder={t("category.displayNamePlaceholder")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={submitting}
        />
        <Input
          placeholder={t("category.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={!name.trim() || !displayName.trim() || submitting}
            className="gap-1"
          >
            {submitting ? <Check size={14} /> : <Plus size={14} />}
            {submitting
              ? t("common.processing")
              : (submitLabel ?? t("category.createButton"))}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-1"
          >
            <X size={14} />
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </form>
  );
}

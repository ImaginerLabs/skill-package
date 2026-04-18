// ============================================================
// components/settings/CategoryItem.tsx — 单个分类项组件
// ============================================================

import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillMeta } from "../../../shared/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import SkillChecklist from "./SkillChecklist";

export interface CategoryItemProps {
  category: Category;
  skills: SkillMeta[];
  selectedSkillIds: Set<string>;
  isExpanded: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (displayName: string, description?: string) => Promise<void>;
  onDelete: () => void;
  onToggleSkill: (skillId: string) => void;
  onToggleAll: () => void;
  onBatchRemove: () => void;
  batchLoading?: boolean;
}

/**
 * CategoryItem — 单个分类项（展开/折叠/编辑/删除）
 */
export default function CategoryItem({
  category,
  skills,
  selectedSkillIds,
  isExpanded,
  isEditing,
  isDeleting,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleSkill,
  onToggleAll,
  onBatchRemove,
  batchLoading = false,
}: CategoryItemProps) {
  const { t } = useTranslation();
  const [editDisplayName, setEditDisplayName] = useState(category.displayName);
  const [editDescription, setEditDescription] = useState(
    category.description || "",
  );

  const handleSave = async () => {
    await onSaveEdit(
      editDisplayName.trim(),
      editDescription.trim() || undefined,
    );
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <div className="flex-1 grid gap-2">
            <Input
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder={t("category.displayNamePlaceholder")}
              className="h-8 text-sm"
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={t("category.descriptionLabel")}
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-7 w-7 text-[hsl(var(--primary))]"
              >
                <Plus size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancelEdit}
                className="h-7 w-7"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      {/* 分类头部行 */}
      <div className="flex items-center gap-3 p-3">
        {/* 展开/折叠按钮 */}
        <button
          onClick={onToggleExpand}
          className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label={
            isExpanded ? t("category.collapse") : t("category.expand")
          }
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* 分类信息 */}
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{category.displayName}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
              {category.name}
            </span>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {category.skillCount} Skill
            </Badge>
          </div>
          {category.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {category.description}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onStartEdit}
          className="h-8 w-8"
          title={t("common.edit")}
        >
          <Pencil size={14} />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
              title={t("common.delete")}
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("category.deleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("category.deleteConfirmDesc", { name: category.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                {t("category.deleteConfirmTitle")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 展开的 Skill 列表 */}
      {isExpanded && (
        <SkillChecklist
          categoryName={category.name}
          skills={skills}
          selectedSkillIds={selectedSkillIds}
          onToggleSkill={onToggleSkill}
          onToggleAll={onToggleAll}
          onBatchRemove={onBatchRemove}
          batchLoading={batchLoading}
        />
      )}
    </div>
  );
}

// ============================================================
// components/settings/SkillChecklist.tsx — 分类下的 Skill 勾选列表
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

export interface SkillChecklistProps {
  categoryName: string;
  skills: SkillMeta[];
  selectedSkillIds: Set<string>;
  onToggleSkill: (skillId: string) => void;
  onToggleAll: () => void;
  onBatchRemove: () => void;
  batchLoading?: boolean;
}

/**
 * SkillChecklist — 分类下的 Skill 勾选列表
 */
export default function SkillChecklist({
  categoryName,
  skills,
  selectedSkillIds,
  onToggleSkill,
  onToggleAll,
  onBatchRemove,
  batchLoading = false,
}: SkillChecklistProps) {
  const { t } = useTranslation();

  const allSelected =
    skills.length > 0 && skills.every((s) => selectedSkillIds.has(s.id));
  const selectedCount = skills.filter((s) => selectedSkillIds.has(s.id)).length;

  if (skills.length === 0) {
    return (
      <p className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
        {t("category.noSkills")}
      </p>
    );
  }

  return (
    <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      {/* 批量操作工具栏 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[hsl(var(--border))]">
        <Checkbox
          id={`select-all-${categoryName}`}
          checked={allSelected}
          onCheckedChange={onToggleAll}
        />
        <label
          htmlFor={`select-all-${categoryName}`}
          className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer select-none"
        >
          {selectedCount > 0
            ? t("category.selectedCount", { count: selectedCount })
            : t("category.selectAllLabel")}
        </label>
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-7 text-xs gap-1 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))/0.4] hover:bg-[hsl(var(--destructive))/0.1]"
            onClick={onBatchRemove}
            disabled={batchLoading}
          >
            {batchLoading
              ? t("category.processing")
              : t("category.batchRemoveButton", { count: selectedCount })}
          </Button>
        )}
      </div>

      {/* Skill 列表 */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Checkbox
              id={`skill-${skill.id}`}
              checked={selectedSkillIds.has(skill.id)}
              onCheckedChange={() => onToggleSkill(skill.id)}
            />
            {skill.type === "workflow" ? (
              <GitBranch
                size={13}
                className="shrink-0 text-[hsl(var(--info))]"
              />
            ) : (
              <FileText
                size={13}
                className="shrink-0 text-[hsl(var(--primary))]"
              />
            )}
            <label
              htmlFor={`skill-${skill.id}`}
              className="flex-1 text-sm cursor-pointer select-none truncate"
            >
              {skill.name}
            </label>
            {skill.description && (
              <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                {skill.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

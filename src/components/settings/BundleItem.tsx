// ============================================================
// components/settings/BundleItem.tsx — Single bundle item
// ============================================================

import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillBundle, SkillMeta } from "../../../shared/types";
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
import SkillSelector, { type SkillSelectorTab } from "./SkillSelector";

/** Source mapping */
const SOURCE_MAP: Record<string, { icon: string; displayName: string }> = {
  "": { icon: "👤", displayName: "" },
  "anthropic-official": { icon: "🏢", displayName: "Anthropic" },
  "awesome-copilot": { icon: "🌟", displayName: "Awesome" },
};

function getSourceIcon(source: string): string {
  return SOURCE_MAP[source]?.icon || "📦";
}

function getSourceDisplay(source: string): string {
  return SOURCE_MAP[source]?.displayName || source || "我的 Skill";
}

export interface BundleItemProps {
  bundle: SkillBundle;
  skills: SkillMeta[];
  categories: Category[];
  isExpanded: boolean;
  isEditing: boolean;
  selectedSkills: Set<string>;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (
    displayName: string,
    description: string | undefined,
    criteria: { skills?: string[] },
  ) => Promise<void>;
  onDelete: () => void;
  onToggleSkill: (skillId: string) => void;
  onToggleGroup?: (groupKey: string) => void;
  expandedGroups: Set<string>;
  isDeleting?: boolean;
  isSaving?: boolean;
}

const emptyCriteria = {};

/**
 * BundleItem — Single bundle item with display/edit/expanded modes
 */
export default function BundleItem({
  bundle,
  skills,
  categories,
  isExpanded,
  isEditing,
  selectedSkills,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleSkill,
  onToggleGroup,
  expandedGroups,
  isDeleting = false,
  isSaving = false,
}: BundleItemProps) {
  const { t } = useTranslation();
  const [editDisplayName, setEditDisplayName] = useState(bundle.displayName);
  const [editDescription, setEditDescription] = useState(
    bundle.description || "",
  );
  const [editTab, setEditTab] = useState<SkillSelectorTab>("category");
  const [editSearchQuery, setEditSearchQuery] = useState("");

  const matchedSkillCount = getBundleMatchedSkillIds(bundle, skills).size;

  const handleSave = async () => {
    if (!editDisplayName.trim() || selectedSkills.size === 0) return;
    const criteria =
      selectedSkills.size > 0 ? { skills: [...selectedSkills] } : emptyCriteria;
    await onSaveEdit(
      editDisplayName.trim(),
      editDescription.trim() || undefined,
      criteria,
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
              placeholder={t("bundle.displayNamePlaceholder")}
              className="h-8 text-sm"
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={t("bundle.descriptionPlaceholder")}
              className="h-8 text-sm"
            />

            <SkillSelector
              selectedSkills={selectedSkills}
              onToggleSkill={onToggleSkill}
              onToggleGroup={onToggleGroup}
              expandedGroups={expandedGroups}
              skills={skills}
              categories={categories}
              tab={editTab}
              onTabChange={setEditTab}
              searchQuery={editSearchQuery}
              onSearchChange={setEditSearchQuery}
              previewCount={selectedSkills.size}
              showPreview={true}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="gap-1"
                disabled={
                  !editDisplayName.trim() ||
                  selectedSkills.size === 0 ||
                  isSaving
                }
              >
                <span className="sr-only">{t("common.save")}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {isSaving ? t("common.saving") : t("bundle.confirmCreate")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="gap-1"
              >
                <span className="sr-only">{t("common.cancel")}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center gap-3 p-3">
        {/* Expand/collapse button */}
        <button
          onClick={onToggleExpand}
          className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label={isExpanded ? t("common.collapse") : t("common.expand")}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Bundle info */}
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{bundle.displayName}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
              {bundle.name}
            </span>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {matchedSkillCount} Skill
            </Badge>
            {bundle.brokenCategoryNames.length > 0 && (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] border-[hsl(var(--warning))] text-[hsl(var(--warning))]"
              >
                {t("bundle.brokenRef", {
                  count: bundle.brokenCategoryNames.length,
                })}
              </Badge>
            )}
          </div>
          {bundle.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {bundle.description}
            </p>
          )}
        </div>

        {/* Edit button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onStartEdit}
          className="h-8 w-8"
          title={t("bundle.edit")}
        >
          <Pencil size={14} />
        </Button>

        {/* Delete button with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
              title={t("bundle.delete")}
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("metadata.deleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("category.deleteConfirmDesc", {
                  name: bundle.displayName,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                {t("metadata.deleteConfirmTitle")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded detail view */}
      {isExpanded && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
          {bundle.criteria.categories?.length && (
            <div className="mb-3">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wide">
                分类
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bundle.criteria.categories.map((name) => {
                  const cat = categories.find((c) => c.name === name);
                  const isBroken = bundle.brokenCategoryNames.includes(name);
                  const skillCount = getCategorySkillCount(
                    bundle,
                    name,
                    skills,
                  );
                  return (
                    <Badge
                      key={`cat-${name}`}
                      variant={isBroken ? "outline" : "secondary"}
                      className="text-xs gap-1"
                    >
                      <span className="font-medium">
                        {cat?.displayName || name}
                      </span>
                      <span className="text-[10px] opacity-70">
                        ({skillCount} SKILL)
                      </span>
                      {isBroken && (
                        <span className="text-[10px] text-[hsl(var(--warning))]">
                          (deleted)
                        </span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          {bundle.criteria.sources?.length && (
            <div className="mb-3">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wide">
                来源
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bundle.criteria.sources.map((source) => {
                  const skillCount = getSourceSkillCount(
                    bundle,
                    source,
                    skills,
                  );
                  return (
                    <Badge
                      key={`src-${source}`}
                      variant="secondary"
                      className="text-xs gap-1"
                    >
                      <span>{getSourceIcon(source)}</span>
                      <span className="font-medium">
                        {getSourceDisplay(source)}
                      </span>
                      <span className="text-[10px] opacity-70">
                        ({skillCount} SKILL)
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          {bundle.criteria.skills?.length && (
            <div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wide">
                手动选择 ({bundle.criteria.skills.length} 个 Skill)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bundle.criteria.skills.slice(0, 10).map((skillId) => {
                  const skill = skills.find((s) => s.id === skillId);
                  return (
                    <Badge
                      key={`sk-${skillId}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill?.name || skillId}
                    </Badge>
                  );
                })}
                {bundle.criteria.skills.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{bundle.criteria.skills.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helper functions
// ============================================================

function getBundleMatchedSkillIds(
  bundle: SkillBundle,
  skills: SkillMeta[],
): Set<string> {
  const matchedIds = new Set<string>();

  if (bundle.criteria.categories?.length) {
    const catSet = new Set(
      bundle.criteria.categories.map((c) => c.toLowerCase()),
    );
    for (const skill of skills) {
      if (catSet.has(skill.category.toLowerCase())) {
        matchedIds.add(skill.id);
      }
    }
  }

  if (bundle.criteria.sources?.length) {
    for (const skill of skills) {
      if (bundle.criteria.sources.includes(skill.source || "")) {
        matchedIds.add(skill.id);
      }
    }
  }

  for (const skillId of bundle.criteria.skills ?? []) {
    matchedIds.add(skillId);
  }

  return matchedIds;
}

function getCategorySkillCount(
  bundle: SkillBundle,
  categoryName: string,
  skills: SkillMeta[],
): number {
  const matchedIds = getBundleMatchedSkillIds(bundle, skills);
  const catLower = categoryName.toLowerCase();
  let count = 0;
  for (const skill of skills) {
    if (matchedIds.has(skill.id) && skill.category.toLowerCase() === catLower) {
      count++;
    }
  }
  return count;
}

function getSourceSkillCount(
  bundle: SkillBundle,
  source: string,
  skills: SkillMeta[],
): number {
  const matchedIds = getBundleMatchedSkillIds(bundle, skills);
  let count = 0;
  for (const skill of skills) {
    if (matchedIds.has(skill.id) && (skill.source || "") === source) {
      count++;
    }
  }
  return count;
}

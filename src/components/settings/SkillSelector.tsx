// ============================================================
// components/settings/SkillSelector.tsx — Skill selection UI
// ============================================================

import { GitBranch, Layers, Package, Search } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillMeta } from "../../../shared/types";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

/** Tab type */
export type SkillSelectorTab = "category" | "source" | "skill";

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

export interface SkillSelectorProps {
  selectedSkills: Set<string>;
  onToggleSkill: (skillId: string) => void;
  onToggleGroup?: (groupKey: string) => void;
  expandedGroups: Set<string>;
  skills: SkillMeta[];
  categories: Category[];
  tab: SkillSelectorTab;
  onTabChange: (tab: SkillSelectorTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Preview count label */
  previewCount?: number;
  /** Show preview count bar */
  showPreview?: boolean;
}

interface CategoryGroup {
  name: string;
  displayName: string;
  skills: SkillMeta[];
}

interface SourceGroup {
  key: string;
  displayName: string;
  icon: string;
  skills: SkillMeta[];
}

/**
 * SkillSelector — Three-tab skill selection UI (category/source/skill)
 */
export default function SkillSelector({
  selectedSkills,
  onToggleSkill,
  onToggleGroup,
  expandedGroups,
  skills,
  categories,
  tab,
  onTabChange,
  searchQuery,
  onSearchChange,
  previewCount = 0,
  showPreview = true,
}: SkillSelectorProps) {
  const { t } = useTranslation();

  // Category groups
  const categoryGroups = useMemo((): CategoryGroup[] => {
    const groups = new Map<string, SkillMeta[]>();
    for (const skill of skills) {
      const cat = skill.category.toLowerCase();
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(skill);
    }
    return [...groups.entries()]
      .map(([name, skillList]) => {
        const category = categories.find((c) => c.name.toLowerCase() === name);
        return {
          name,
          displayName: category?.displayName || name,
          skills: skillList,
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [skills, categories]);

  // Source groups
  const sourceGroups = useMemo((): SourceGroup[] => {
    const groups = new Map<string, SkillMeta[]>();
    for (const skill of skills) {
      const source = skill.source || "";
      if (!groups.has(source)) {
        groups.set(source, []);
      }
      groups.get(source)!.push(skill);
    }
    return [...groups.entries()]
      .map(([key, skillList]) => ({
        key,
        displayName: getSourceDisplay(key),
        icon: getSourceIcon(key),
        skills: skillList,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [skills]);

  // Filter skills for skill tab
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [skills, searchQuery]);

  // Filter groups by search
  const filteredCategoryGroups = useMemo(
    () =>
      categoryGroups.filter((group) =>
        group.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categoryGroups, searchQuery],
  );

  const filteredSourceGroups = useMemo(
    () =>
      sourceGroups.filter((group) =>
        group.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [sourceGroups, searchQuery],
  );

  const searchPlaceholder =
    tab === "category"
      ? t("bundle.searchCategories")
      : tab === "source"
        ? t("bundle.searchSources")
        : t("bundle.searchSkills");

  return (
    <div className="space-y-2">
      {/* Tab buttons */}
      <div className="flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg">
        <button
          onClick={() => onTabChange("category")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "category"
              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Layers size={12} />
          {t("bundle.byCategory") || "按分类"}
        </button>
        <button
          onClick={() => onTabChange("source")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "source"
              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <GitBranch size={12} />
          {t("bundle.bySource") || "按来源"}
        </button>
        <button
          onClick={() => onTabChange("skill")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "skill"
              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Package size={12} />
          {t("bundle.bySkill") || "手动选择"}
        </button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-2.5 text-[hsl(var(--muted-foreground))]"
        />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Category tab */}
      {tab === "category" && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredCategoryGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.name);
            const selectedInGroup = group.skills.filter((s) =>
              selectedSkills.has(s.id),
            ).length;
            const isAllSelected =
              group.skills.length > 0 &&
              selectedInGroup === group.skills.length;

            return (
              <div
                key={group.name}
                className="border border-[hsl(var(--border))] rounded-md"
              >
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[hsl(var(--accent))] transition-colors">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        el.dataset.indeterminate = String(
                          selectedInGroup > 0 && !isAllSelected,
                        );
                      }
                    }}
                    onCheckedChange={() => {
                      if (isAllSelected) {
                        group.skills.forEach((s) => {
                          if (selectedSkills.has(s.id)) {
                            onToggleSkill(s.id);
                          }
                        });
                      } else {
                        group.skills.forEach((s) => {
                          if (!selectedSkills.has(s.id)) {
                            onToggleSkill(s.id);
                          }
                        });
                      }
                    }}
                  />
                  <button
                    onClick={() => onToggleGroup?.(group.name)}
                    className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                  >
                    {isExpanded ? (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    )}
                    <span className="text-sm font-medium flex-1 text-left">
                      {group.displayName}
                    </span>
                  </button>
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {selectedInGroup}/{group.skills.length}
                  </Badge>
                </div>
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                    {group.skills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex items-center gap-2 px-4 py-1 hover:bg-[hsl(var(--accent))] cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedSkills.has(skill.id)}
                          onCheckedChange={() => onToggleSkill(skill.id)}
                        />
                        <span className="text-sm truncate flex-1">
                          {skill.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Source tab */}
      {tab === "source" && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredSourceGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.key);
            const selectedInGroup = group.skills.filter((s) =>
              selectedSkills.has(s.id),
            ).length;
            const isAllSelected =
              group.skills.length > 0 &&
              selectedInGroup === group.skills.length;

            return (
              <div
                key={group.key}
                className="border border-[hsl(var(--border))] rounded-md"
              >
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[hsl(var(--accent))] transition-colors">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        el.dataset.indeterminate = String(
                          selectedInGroup > 0 && !isAllSelected,
                        );
                      }
                    }}
                    onCheckedChange={() => {
                      if (isAllSelected) {
                        group.skills.forEach((s) => {
                          if (selectedSkills.has(s.id)) {
                            onToggleSkill(s.id);
                          }
                        });
                      } else {
                        group.skills.forEach((s) => {
                          if (!selectedSkills.has(s.id)) {
                            onToggleSkill(s.id);
                          }
                        });
                      }
                    }}
                  />
                  <button
                    onClick={() => onToggleGroup?.(group.key)}
                    className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                  >
                    {isExpanded ? (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    )}
                    <span className="text-sm">{group.icon}</span>
                    <span className="text-sm font-medium flex-1 text-left">
                      {group.displayName}
                    </span>
                  </button>
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {selectedInGroup}/{group.skills.length}
                  </Badge>
                </div>
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                    {group.skills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex items-center gap-2 px-4 py-1 hover:bg-[hsl(var(--accent))] cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedSkills.has(skill.id)}
                          onCheckedChange={() => onToggleSkill(skill.id)}
                        />
                        <span className="text-sm truncate flex-1">
                          {skill.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Skill tab */}
      {tab === "skill" && (
        <div className="max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md">
          {filteredSkills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-[hsl(var(--accent))] cursor-pointer"
            >
              <Checkbox
                checked={selectedSkills.has(skill.id)}
                onCheckedChange={() => onToggleSkill(skill.id)}
              />
              <span className="text-sm truncate flex-1">{skill.name}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                {skill.category}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Preview count */}
      {showPreview && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-[hsl(var(--muted)/0.5)]">
          <Package size={14} className="text-[hsl(var(--primary))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {t("bundle.preview") || "预览"}:
          </span>
          <span className="text-sm font-medium text-[hsl(var(--primary))]">
            {previewCount} {t("bundle.skills") || "个 Skill"}
          </span>
        </div>
      )}
    </div>
  );
}

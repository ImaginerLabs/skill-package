// ============================================================
// components/sync/SyncSkillSelector.tsx — Skill 勾选选择列表
// ============================================================

import { CheckSquare, Minus, Search, Square, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SkillMeta } from "../../../shared/types";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import { useSyncStore } from "../../stores/sync-store";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

/**
 * SyncSkillSelector — 同步页面 Skill 勾选列表
 * 支持搜索筛选、逐个勾选、按分类批量选择、全选/取消全选
 */
export default function SyncSkillSelector() {
  const { skills, categories, loading, fetchSkills } = useSkillStore();
  const {
    selectedSkillIds,
    toggleSkillSelection,
    selectByCategory,
    clearSelection,
  } = useSyncStore();
  const [query, setQuery] = useState("");

  const filteredSkills = useSkillSearch(skills, query);

  useEffect(() => {
    if (skills.length === 0 && !loading) {
      fetchSkills();
    }
  }, [skills.length, loading, fetchSkills]);

  // 按分类分组
  const groupedSkills = useMemo(() => {
    const groups = new Map<string, SkillMeta[]>();
    for (const skill of filteredSkills) {
      const cat = skill.category;
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(skill);
    }
    return groups;
  }, [filteredSkills]);

  // 分类显示名映射
  const categoryDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.name, cat.displayName);
    }
    return map;
  }, [categories]);

  // 全选/取消全选
  const allFilteredIds = useMemo(
    () => filteredSkills.map((s) => s.id),
    [filteredSkills],
  );

  const allSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedSkillIds.includes(id));

  const someSelected =
    !allSelected && allFilteredIds.some((id) => selectedSkillIds.includes(id));

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      // 选中所有当前筛选结果
      const newIds = new Set([...selectedSkillIds, ...allFilteredIds]);
      selectByCategory([...newIds]);
    }
  }, [
    allSelected,
    allFilteredIds,
    selectedSkillIds,
    selectByCategory,
    clearSelection,
  ]);

  // 按分类批量选择/取消
  const handleToggleCategory = useCallback(
    (categoryName: string) => {
      const categorySkillIds =
        groupedSkills.get(categoryName)?.map((s) => s.id) ?? [];
      const allCatSelected = categorySkillIds.every((id) =>
        selectedSkillIds.includes(id),
      );

      if (allCatSelected) {
        // 取消该分类所有选中
        const catIdSet = new Set(categorySkillIds);
        selectByCategory(selectedSkillIds.filter((id) => !catIdSet.has(id)));
      } else {
        // 选中该分类所有
        const newIds = new Set([...selectedSkillIds, ...categorySkillIds]);
        selectByCategory([...newIds]);
      }
    },
    [groupedSkills, selectedSkillIds, selectByCategory],
  );

  // 判断分类是否全选/部分选中
  const getCategoryCheckState = useCallback(
    (categoryName: string): "all" | "some" | "none" => {
      const categorySkillIds =
        groupedSkills.get(categoryName)?.map((s) => s.id) ?? [];
      if (categorySkillIds.length === 0) return "none";
      const selectedCount = categorySkillIds.filter((id) =>
        selectedSkillIds.includes(id),
      ).length;
      if (selectedCount === categorySkillIds.length) return "all";
      if (selectedCount > 0) return "some";
      return "none";
    },
    [groupedSkills, selectedSkillIds],
  );

  return (
    <div className="space-y-3">
      {/* 顶部：已选统计 + 搜索 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
            选择 Skill
          </h3>
          {selectedSkillIds.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              已选 {selectedSkillIds.length}
            </Badge>
          )}
        </div>
        {selectedSkillIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            清除选择
          </button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
        />
        <Input
          id="sync-skill-search"
          name="sync-skill-search"
          placeholder="搜索 Skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
          aria-label="搜索 Skill"
        />
      </div>

      {/* 全选 */}
      {filteredSkills.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={handleToggleAll}
            className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label={allSelected ? "取消全选" : "全选"}
          >
            {allSelected ? (
              <CheckSquare size={14} className="text-[hsl(var(--primary))]" />
            ) : someSelected ? (
              <Minus size={14} className="text-[hsl(var(--primary))]" />
            ) : (
              <Square size={14} />
            )}
            {allSelected ? "取消全选" : `全选 (${filteredSkills.length})`}
          </button>
        </div>
      )}

      {/* Skill 列表（按分类分组） */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            加载中...
          </p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search
            size={32}
            className="text-[hsl(var(--muted-foreground))] mb-2 opacity-40"
          />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {query ? "未找到匹配的 Skill" : "暂无可用 Skill"}
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {[...groupedSkills.entries()].map(
              ([categoryName, categorySkills]) => {
                const checkState = getCategoryCheckState(categoryName);
                const displayName =
                  categoryDisplayNames.get(categoryName) ?? categoryName;

                return (
                  <div key={categoryName} className="space-y-1">
                    {/* 分类标题（可点击批量选择） */}
                    <button
                      onClick={() => handleToggleCategory(categoryName)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
                      aria-label={`${checkState === "all" ? "取消选择" : "选择"}分类 ${displayName} 下所有 Skill`}
                    >
                      {checkState === "all" ? (
                        <CheckSquare
                          size={14}
                          className="text-[hsl(var(--primary))] shrink-0"
                        />
                      ) : checkState === "some" ? (
                        <Minus
                          size={14}
                          className="text-[hsl(var(--primary))] shrink-0"
                        />
                      ) : (
                        <Square
                          size={14}
                          className="text-[hsl(var(--muted-foreground))] shrink-0"
                        />
                      )}
                      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {displayName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 ml-auto"
                      >
                        {categorySkills.length}
                      </Badge>
                    </button>

                    {/* 分类下的 Skill 列表 */}
                    <div className="pl-2 space-y-0.5">
                      {categorySkills.map((skill) => {
                        const isSelected = selectedSkillIds.includes(skill.id);
                        return (
                          <label
                            key={skill.id}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[hsl(var(--primary)/0.08)]"
                                : "hover:bg-[hsl(var(--accent))]"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleSkillSelection(skill.id)
                              }
                              aria-label={`选择 ${skill.name}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {skill.type === "workflow" && (
                                  <Zap
                                    size={12}
                                    className="text-[hsl(var(--primary))] shrink-0"
                                  />
                                )}
                                <span className="text-sm font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                                  {skill.name}
                                </span>
                              </div>
                              {skill.description && (
                                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            {skill.type === "workflow" && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 shrink-0"
                              >
                                workflow
                              </Badge>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

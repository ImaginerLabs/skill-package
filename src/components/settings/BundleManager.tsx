// ============================================================
// components/settings/BundleManager.tsx — 套件管理组件（V3）
// ============================================================

import {
  Check,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Layers,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  Category,
  SkillBundleCriteria,
  SkillMeta,
} from "../../../shared/types";
import { fetchCategories, fetchSkills } from "../../lib/api";
import { useBundleStore } from "../../stores/bundle-store";
import { useSkillStore } from "../../stores/skill-store";
import { toast } from "../shared/toast-store";
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
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

/** 套件名称校验正则 */
const VALID_BUNDLE_NAME_RE = /^[a-z0-9-]+$/;

/** 来源映射 */
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

/** Tab 类型 */
type SelectTab = "category" | "source" | "skill";

interface SourceItem {
  key: string;
  displayName: string;
  count: number;
}

/**
 * 套件管理 — 创建、查看、编辑、删除套件（V3）
 */
export default function BundleManager() {
  const {
    bundles,
    bundlesLoading,
    bundlesError,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
  } = useBundleStore();
  const { skills } = useSkillStore();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(
    new Set(),
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategorySearch, setNewCategorySearch] = useState("");
  const [newSourceSearch, setNewSourceSearch] = useState("");
  const [newSkillSearch, setNewSkillSearch] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [addTab, setAddTab] = useState<SelectTab>("category");

  // 统一的选择状态：存储选中的Skill ID（新建套件）
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set(),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  // 统一的选择状态：存储选中的Skill ID（编辑套件）
  const [editSelectedSkills, setEditSelectedSkills] = useState<Set<string>>(
    new Set(),
  );
  const [editCategorySearch, setEditCategorySearch] = useState("");
  const [editSourceSearch, setEditSourceSearch] = useState("");
  const [editSkillSearch, setEditSkillSearch] = useState("");
  const [editTab, setEditTab] = useState<SelectTab>("category");
  const [editExpandedCategories, setEditExpandedCategories] = useState<
    Set<string>
  >(new Set());
  const [editExpandedSources, setEditExpandedSources] = useState<Set<string>>(
    new Set(),
  );
  const [updating, setUpdating] = useState(false);

  // 统一的切换Skill选择函数（新建套件）
  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  // 统一的切换Skill选择函数（编辑套件）
  const toggleEditSkill = (skillId: string) => {
    setEditSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  // 按分类分组的Skill（新建套件）
  const categoryGroups = useMemo(() => {
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

  // 按分类分组的Skill（编辑套件）
  const editCategoryGroups = useMemo(() => {
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

  // 按来源分组的Skill（新建套件）
  const sourceGroups = useMemo(() => {
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

  // 按来源分组的Skill（编辑套件）
  const editSourceGroups = useMemo(() => {
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

  // 预览计数（新建套件）
  const previewCount = useMemo(() => {
    return selectedSkills.size;
  }, [selectedSkills]);

  // 预览计数（编辑套件）
  const editPreviewCount = useMemo(() => {
    return editSelectedSkills.size;
  }, [editSelectedSkills]);

  // 切换分类分组展开/折叠（新建套件）
  const toggleCategoryExpand = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // 切换来源分组展开/折叠（新建套件）
  const toggleSourceExpand = (sourceKey: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceKey)) {
        next.delete(sourceKey);
      } else {
        next.add(sourceKey);
      }
      return next;
    });
  };

  // 切换分类分组展开/折叠
  const toggleEditCategoryExpand = (categoryName: string) => {
    setEditExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // 切换来源分组展开/折叠
  const toggleEditSourceExpand = (sourceKey: string) => {
    setEditExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceKey)) {
        next.delete(sourceKey);
      } else {
        next.add(sourceKey);
      }
      return next;
    });
  };

  const _sources: SourceItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const skill of skills) {
      const key = skill.source || "";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()]
      .map(([key, count]) => ({
        key,
        displayName: getSourceDisplay(key),
        count,
      }))
      .sort((a, b) => {
        if (a.key === "") return -1;
        if (b.key === "") return 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [skills]);

  const loadData = useCallback(async () => {
    setSkillsLoading(true);
    try {
      const [cats, skillsData] = await Promise.all([
        fetchCategories(),
        fetchSkills(),
      ]);
      setCategories(cats);
      useSkillStore.getState().setSkills(skillsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("bundle.loadFailed"));
    } finally {
      setSkillsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
    fetchBundles();
  }, [loadData, fetchBundles]);

  const toggleExpand = (id: string) => {
    setExpandedBundles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    setNewName(value);
    if (value && !VALID_BUNDLE_NAME_RE.test(value)) {
      setNameError(t("bundle.nameError"));
    } else {
      setNameError(null);
    }
  };

  const buildCriteria = (): SkillBundleCriteria => {
    const criteria: SkillBundleCriteria = {};
    if (selectedSkills.size > 0) {
      criteria.skills = [...selectedSkills];
    }
    return criteria;
  };

  const hasSelection = selectedSkills.size > 0;

  const handleCreate = async () => {
    if (
      !newName.trim() ||
      !newDisplayName.trim() ||
      !hasSelection ||
      nameError
    ) {
      return;
    }
    setCreating(true);
    try {
      await createBundle({
        name: newName.trim(),
        displayName: newDisplayName.trim(),
        description: newDescription.trim() || undefined,
        criteria: buildCriteria(),
      });
      toast.success(t("bundle.createSuccess"));
      resetAddForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.createFailed"),
      );
    } finally {
      setCreating(false);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewName("");
    setNewDisplayName("");
    setNewDescription("");
    setSelectedSkills(new Set());
    setExpandedCategories(new Set());
    setExpandedSources(new Set());
    setNewCategorySearch("");
    setNewSourceSearch("");
    setNewSkillSearch("");
    setNameError(null);
  };

  const startEdit = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;

    // 将所有criteria转换为统一的选择状态（Skill ID集合）
    const selectedSkillIds = new Set<string>();

    // 如果有分类criteria，获取该分类下的所有Skill ID
    if (bundle.criteria.categories?.length) {
      const catSet = new Set(
        bundle.criteria.categories.map((c) => c.toLowerCase()),
      );
      for (const skill of skills) {
        if (catSet.has(skill.category.toLowerCase())) {
          selectedSkillIds.add(skill.id);
        }
      }
    }

    // 如果有来源criteria，获取该来源下的所有Skill ID
    if (bundle.criteria.sources?.length) {
      for (const skill of skills) {
        if (bundle.criteria.sources.includes(skill.source || "")) {
          selectedSkillIds.add(skill.id);
        }
      }
    }

    // 添加手动选择的Skill ID
    if (bundle.criteria.skills?.length) {
      for (const skillId of bundle.criteria.skills) {
        selectedSkillIds.add(skillId);
      }
    }

    setEditingId(bundleId);
    setEditDisplayName(bundle.displayName);
    setEditDescription(bundle.description ?? "");
    setEditSelectedSkills(selectedSkillIds);
    setEditCategorySearch("");
    setEditSourceSearch("");
    setEditSkillSearch("");
    setEditTab("category");
    setEditExpandedCategories(new Set());
    setEditExpandedSources(new Set());
  };

  const buildEditCriteria = (): SkillBundleCriteria => {
    const criteria: SkillBundleCriteria = {};
    if (editSelectedSkills.size > 0) {
      criteria.skills = [...editSelectedSkills];
    }
    return criteria;
  };

  const handleUpdate = async (id: string) => {
    if (!editDisplayName.trim() || editSelectedSkills.size === 0) return;
    setUpdating(true);
    try {
      await updateBundle(id, {
        displayName: editDisplayName.trim(),
        description: editDescription.trim() || undefined,
        criteria: buildEditCriteria(),
      });
      toast.success(t("bundle.updateSuccess"));
      setEditingId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.updateFailed"),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBundle(id);
      toast.success(t("bundle.deleteSuccess"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.deleteFailed"),
      );
    }
  };

  const filteredSkills = (search: string) => {
    const q = search.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  };

  const getBundleMatchedSkillCount = (bundle: (typeof bundles)[0]): number => {
    return getBundleMatchedSkillIds(bundle).size;
  };

  const getBundleMatchedSkillIds = (
    bundle: (typeof bundles)[0],
  ): Set<string> => {
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
  };

  const getCategorySkillCount = (
    bundle: (typeof bundles)[0],
    categoryName: string,
  ): number => {
    const matchedIds = getBundleMatchedSkillIds(bundle);
    const catLower = categoryName.toLowerCase();
    let count = 0;
    for (const skill of skills) {
      if (
        matchedIds.has(skill.id) &&
        skill.category.toLowerCase() === catLower
      ) {
        count++;
      }
    }
    return count;
  };

  const getSourceSkillCount = (
    bundle: (typeof bundles)[0],
    source: string,
  ): number => {
    const matchedIds = getBundleMatchedSkillIds(bundle);
    let count = 0;
    for (const skill of skills) {
      if (matchedIds.has(skill.id) && (skill.source || "") === source) {
        count++;
      }
    }
    return count;
  };

  if (bundlesLoading || skillsLoading) {
    return (
      <div className="text-[hsl(var(--muted-foreground))] text-sm py-4">
        {t("common.loading")}
      </div>
    );
  }

  if (bundlesError) {
    return (
      <div className="p-3 rounded-md bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3] text-sm text-[hsl(var(--destructive))]">
        {bundlesError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[var(--font-code)]">
          {t("bundle.title")}
        </h2>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gap-1"
          disabled={showAddForm}
        >
          <Plus size={14} />
          {t("bundle.createNew")}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="grid gap-3">
            <div>
              <Input
                placeholder={t("bundle.namePlaceholder")}
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {nameError && (
                <p className="text-xs text-[hsl(var(--destructive))] mt-1">
                  {nameError}
                </p>
              )}
            </div>
            <Input
              placeholder={t("bundle.displayNamePlaceholder")}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <Input
              placeholder={t("bundle.descriptionPlaceholder")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <div className="flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg">
              <button
                onClick={() => setAddTab("category")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  addTab === "category"
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Layers size={12} />
                {t("bundle.byCategory") || "按分类"}
              </button>
              <button
                onClick={() => setAddTab("source")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  addTab === "source"
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <GitBranch size={12} />
                {t("bundle.bySource") || "按来源"}
              </button>
              <button
                onClick={() => setAddTab("skill")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  addTab === "skill"
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Package size={12} />
                {t("bundle.bySkill") || "手动选择"}
              </button>
            </div>

            {addTab === "category" && (
              <div>
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-2.5 text-[hsl(var(--muted-foreground))]"
                  />
                  <Input
                    placeholder={t("bundle.searchCategories")}
                    value={newCategorySearch}
                    onChange={(e) => setNewCategorySearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {categoryGroups
                    .filter((group) =>
                      group.displayName
                        .toLowerCase()
                        .includes(newCategorySearch.toLowerCase()),
                    )
                    .map((group) => {
                      const isExpanded = expandedCategories.has(group.name);
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
                                  setSelectedSkills((prev) => {
                                    const next = new Set(prev);
                                    group.skills.forEach((s) =>
                                      next.delete(s.id),
                                    );
                                    return next;
                                  });
                                } else {
                                  setSelectedSkills((prev) => {
                                    const next = new Set(prev);
                                    group.skills.forEach((s) => next.add(s.id));
                                    return next;
                                  });
                                }
                              }}
                            />
                            <button
                              onClick={() => toggleCategoryExpand(group.name)}
                              className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                            >
                              {isExpanded ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                              <span className="text-sm font-medium flex-1 text-left">
                                {group.displayName}
                              </span>
                            </button>
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1"
                            >
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
                                    onCheckedChange={() =>
                                      toggleSkill(skill.id)
                                    }
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
              </div>
            )}

            {addTab === "source" && (
              <div>
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-2.5 text-[hsl(var(--muted-foreground))]"
                  />
                  <Input
                    placeholder={t("bundle.searchSources") || "搜索来源"}
                    value={newSourceSearch}
                    onChange={(e) => setNewSourceSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {sourceGroups
                    .filter((group) =>
                      group.displayName
                        .toLowerCase()
                        .includes(newSourceSearch.toLowerCase()),
                    )
                    .map((group) => {
                      const isExpanded = expandedSources.has(group.key);
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
                                  setSelectedSkills((prev) => {
                                    const next = new Set(prev);
                                    group.skills.forEach((s) =>
                                      next.delete(s.id),
                                    );
                                    return next;
                                  });
                                } else {
                                  setSelectedSkills((prev) => {
                                    const next = new Set(prev);
                                    group.skills.forEach((s) => next.add(s.id));
                                    return next;
                                  });
                                }
                              }}
                            />
                            <button
                              onClick={() => toggleSourceExpand(group.key)}
                              className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                            >
                              {isExpanded ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                              <span className="text-sm">{group.icon}</span>
                              <span className="text-sm font-medium flex-1 text-left">
                                {group.displayName}
                              </span>
                            </button>
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1"
                            >
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
                                    onCheckedChange={() =>
                                      toggleSkill(skill.id)
                                    }
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
              </div>
            )}

            {addTab === "skill" && (
              <div>
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-2.5 text-[hsl(var(--muted-foreground))]"
                  />
                  <Input
                    placeholder={t("bundle.searchSkills") || "搜索 Skill"}
                    value={newSkillSearch}
                    onChange={(e) => setNewSkillSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md">
                  {filteredSkills(newSkillSearch).map((skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[hsl(var(--accent))] cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedSkills.has(skill.id)}
                        onCheckedChange={() => toggleSkill(skill.id)}
                      />
                      <span className="text-sm truncate flex-1">
                        {skill.name}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {skill.category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-2 rounded-md bg-[hsl(var(--muted)/0.5)]">
              <Package size={14} className="text-[hsl(var(--primary))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {t("bundle.preview") || "预览"}:
              </span>
              <span className="text-sm font-medium text-[hsl(var(--primary))]">
                {previewCount} {t("bundle.skills") || "个 Skill"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                size="sm"
                className="gap-1"
                disabled={
                  !newName.trim() ||
                  !newDisplayName.trim() ||
                  !hasSelection ||
                  !!nameError ||
                  creating
                }
              >
                <Check size={14} />
                {creating ? t("common.creating") : t("bundle.confirmCreate")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAddForm}
                className="gap-1"
              >
                <X size={14} />
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bundles.length === 0 ? (
        <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">{t("bundle.empty")}</p>
          <p className="text-xs">{t("bundle.emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bundles.map((bundle) => {
            const isExpanded = expandedBundles.has(bundle.id);
            const isEditing = editingId === bundle.id;
            const matchedSkillCount = getBundleMatchedSkillCount(bundle);

            return (
              <div
                key={bundle.id}
                className="rounded-lg border overflow-hidden border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="flex items-center gap-3 p-3">
                  {isEditing ? (
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

                      <div className="flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg">
                        <button
                          onClick={() => setEditTab("category")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            editTab === "category"
                              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          }`}
                        >
                          <Layers size={12} />
                          {t("bundle.byCategory") || "按分类"}
                        </button>
                        <button
                          onClick={() => setEditTab("source")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            editTab === "source"
                              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          }`}
                        >
                          <GitBranch size={12} />
                          {t("bundle.bySource") || "按来源"}
                        </button>
                        <button
                          onClick={() => setEditTab("skill")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            editTab === "skill"
                              ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          }`}
                        >
                          <Package size={12} />
                          {t("bundle.bySkill") || "手动选择"}
                        </button>
                      </div>

                      {editTab === "category" && (
                        <div>
                          <div className="relative mb-1">
                            <Search
                              size={14}
                              className="absolute left-2.5 top-2 text-[hsl(var(--muted-foreground))]"
                            />
                            <Input
                              placeholder={t("bundle.searchCategories")}
                              value={editCategorySearch}
                              onChange={(e) =>
                                setEditCategorySearch(e.target.value)
                              }
                              className="pl-8 h-7 text-xs"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {editCategoryGroups
                              .filter((group) =>
                                group.displayName
                                  .toLowerCase()
                                  .includes(editCategorySearch.toLowerCase()),
                              )
                              .map((group) => {
                                const isExpanded = editExpandedCategories.has(
                                  group.name,
                                );
                                const selectedInGroup = group.skills.filter(
                                  (s) => editSelectedSkills.has(s.id),
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
                                              selectedInGroup > 0 &&
                                                !isAllSelected,
                                            );
                                          }
                                        }}
                                        onCheckedChange={() => {
                                          if (isAllSelected) {
                                            setEditSelectedSkills((prev) => {
                                              const next = new Set(prev);
                                              group.skills.forEach((s) =>
                                                next.delete(s.id),
                                              );
                                              return next;
                                            });
                                          } else {
                                            setEditSelectedSkills((prev) => {
                                              const next = new Set(prev);
                                              group.skills.forEach((s) =>
                                                next.add(s.id),
                                              );
                                              return next;
                                            });
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          toggleEditCategoryExpand(group.name)
                                        }
                                        className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                                      >
                                        {isExpanded ? (
                                          <ChevronDown size={14} />
                                        ) : (
                                          <ChevronRight size={14} />
                                        )}
                                        <span className="text-xs font-medium flex-1 text-left">
                                          {group.displayName}
                                        </span>
                                      </button>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5 px-1"
                                      >
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
                                              checked={editSelectedSkills.has(
                                                skill.id,
                                              )}
                                              onCheckedChange={() =>
                                                toggleEditSkill(skill.id)
                                              }
                                            />
                                            <span className="text-xs truncate flex-1">
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
                        </div>
                      )}

                      {editTab === "source" && (
                        <div>
                          <div className="relative mb-1">
                            <Search
                              size={14}
                              className="absolute left-2.5 top-2 text-[hsl(var(--muted-foreground))]"
                            />
                            <Input
                              placeholder={
                                t("bundle.searchSources") || "搜索来源"
                              }
                              value={editSourceSearch}
                              onChange={(e) =>
                                setEditSourceSearch(e.target.value)
                              }
                              className="pl-8 h-7 text-xs"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {editSourceGroups
                              .filter((group) =>
                                group.displayName
                                  .toLowerCase()
                                  .includes(editSourceSearch.toLowerCase()),
                              )
                              .map((group) => {
                                const isExpanded = editExpandedSources.has(
                                  group.key,
                                );
                                const selectedInGroup = group.skills.filter(
                                  (s) => editSelectedSkills.has(s.id),
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
                                              selectedInGroup > 0 &&
                                                !isAllSelected,
                                            );
                                          }
                                        }}
                                        onCheckedChange={() => {
                                          if (isAllSelected) {
                                            setEditSelectedSkills((prev) => {
                                              const next = new Set(prev);
                                              group.skills.forEach((s) =>
                                                next.delete(s.id),
                                              );
                                              return next;
                                            });
                                          } else {
                                            setEditSelectedSkills((prev) => {
                                              const next = new Set(prev);
                                              group.skills.forEach((s) =>
                                                next.add(s.id),
                                              );
                                              return next;
                                            });
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          toggleEditSourceExpand(group.key)
                                        }
                                        className="flex-1 flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors -ml-2 pl-2"
                                      >
                                        {isExpanded ? (
                                          <ChevronDown size={14} />
                                        ) : (
                                          <ChevronRight size={14} />
                                        )}
                                        <span className="text-xs">
                                          {group.icon}
                                        </span>
                                        <span className="text-xs font-medium flex-1 text-left">
                                          {group.displayName}
                                        </span>
                                      </button>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5 px-1"
                                      >
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
                                              checked={editSelectedSkills.has(
                                                skill.id,
                                              )}
                                              onCheckedChange={() =>
                                                toggleEditSkill(skill.id)
                                              }
                                            />
                                            <span className="text-xs truncate flex-1">
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
                        </div>
                      )}

                      {editTab === "skill" && (
                        <div>
                          <div className="relative mb-1">
                            <Search
                              size={14}
                              className="absolute left-2.5 top-2 text-[hsl(var(--muted-foreground))]"
                            />
                            <Input
                              placeholder={
                                t("bundle.searchSkills") || "搜索 Skill"
                              }
                              value={editSkillSearch}
                              onChange={(e) =>
                                setEditSkillSearch(e.target.value)
                              }
                              className="pl-8 h-7 text-xs"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md">
                            {filteredSkills(editSkillSearch).map((skill) => (
                              <label
                                key={skill.id}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[hsl(var(--accent))] cursor-pointer"
                              >
                                <Checkbox
                                  checked={editSelectedSkills.has(skill.id)}
                                  onCheckedChange={() =>
                                    toggleEditSkill(skill.id)
                                  }
                                />
                                <span className="text-xs truncate flex-1">
                                  {skill.name}
                                </span>
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">
                                  {skill.category}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-1.5 rounded-md bg-[hsl(var(--muted)/0.5)]">
                        <Package
                          size={12}
                          className="text-[hsl(var(--primary))]"
                        />
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {t("bundle.preview") || "预览"}:
                        </span>
                        <span className="text-xs font-medium text-[hsl(var(--primary))]">
                          {editPreviewCount} {t("bundle.skills") || "个 Skill"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdate(bundle.id)}
                          size="sm"
                          className="gap-1"
                          disabled={
                            !editDisplayName.trim() ||
                            editSelectedSkills.size === 0 ||
                            updating
                          }
                        >
                          <Check size={14} />
                          {updating
                            ? t("common.saving")
                            : t("bundle.confirmCreate")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="gap-1"
                        >
                          <X size={14} />
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpand(bundle.id)}
                        className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        aria-label={
                          isExpanded ? t("common.collapse") : t("common.expand")
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleExpand(bundle.id)}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {bundle.displayName}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                            {bundle.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px]"
                          >
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(bundle.id)}
                        className="h-8 w-8"
                        title={t("bundle.edit")}
                      >
                        <Pencil size={14} />
                      </Button>

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
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(bundle.id)}
                            >
                              {t("metadata.deleteConfirmTitle")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>

                {isExpanded && !isEditing && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                    {bundle.criteria.categories?.length && (
                      <div className="mb-3">
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wide">
                          分类
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {bundle.criteria.categories.map((name) => {
                            const cat = categories.find((c) => c.name === name);
                            const isBroken =
                              bundle.brokenCategoryNames.includes(name);
                            const skillCount = getCategorySkillCount(
                              bundle,
                              name,
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
                          {bundle.criteria.skills
                            .slice(0, 10)
                            .map((skillId) => {
                              const skill = skills.find(
                                (s) => s.id === skillId,
                              );
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
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// components/settings/CategoryManager.tsx — 分类管理组件（重构版）
// ============================================================

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillMeta } from "../../../shared/types";
import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  updateCategory as apiUpdateCategory,
  fetchCategories,
  fetchSkills,
  moveSkillCategory,
} from "../../lib/api";
import { toast } from "../shared/toast-store";
import { Button } from "../ui/button";
import CategoryForm from "./CategoryForm";
import CategoryItem from "./CategoryItem";

/**
 * CategoryManager — 分类管理
 * 支持添加、修改、删除分类，支持展开查看 Skill 并批量操作
 */
export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSkills, setAllSkills] = useState<SkillMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // 新建表单
  const [showAddForm, setShowAddForm] = useState(false);

  // 展开状态
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // 选中状态：{ [categoryName]: Set<skillId> }
  const [selectedSkills, setSelectedSkills] = useState<
    Record<string, Set<string>>
  >({});

  // 编辑状态
  const [editingName, setEditingName] = useState<string | null>(null);

  // 批量操作 loading
  const [batchLoading, setBatchLoading] = useState<string | null>(null);

  // 加载分类列表和 Skill 列表
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, skills] = await Promise.all([
        fetchCategories(),
        fetchSkills(),
      ]);
      setCategories(cats);
      setAllSkills(skills);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("category.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 获取某分类下的 Skill 列表
  const getSkillsForCategory = useCallback(
    (catName: string) =>
      allSkills.filter(
        (s) => s.category.toLowerCase() === catName.toLowerCase(),
      ),
    [allSkills],
  );

  // 切换分类展开/折叠
  const toggleExpand = useCallback((catName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
        // 折叠时清除该分类的选中状态
        setSelectedSkills((s) => {
          const ns = { ...s };
          delete ns[catName];
          return ns;
        });
      } else {
        next.add(catName);
      }
      return next;
    });
  }, []);

  // 切换单个 Skill 选中状态
  const toggleSkillSelect = useCallback((catName: string, skillId: string) => {
    setSelectedSkills((prev) => {
      const catSet = new Set(prev[catName] ?? []);
      if (catSet.has(skillId)) {
        catSet.delete(skillId);
      } else {
        catSet.add(skillId);
      }
      return { ...prev, [catName]: catSet };
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(
    (catName: string) => {
      const skills = getSkillsForCategory(catName);
      const currentSelected = selectedSkills[catName] ?? new Set<string>();
      const allSelected =
        skills.length > 0 && skills.every((s) => currentSelected.has(s.id));
      setSelectedSkills((prev) => ({
        ...prev,
        [catName]: allSelected
          ? new Set<string>()
          : new Set(skills.map((s) => s.id)),
      }));
    },
    [getSkillsForCategory, selectedSkills],
  );

  // 批量移出分类
  const handleBatchRemove = useCallback(
    async (catName: string) => {
      const ids = Array.from(selectedSkills[catName] ?? []);
      if (ids.length === 0) return;
      setBatchLoading(catName);
      try {
        await Promise.all(
          ids.map((id) => moveSkillCategory(id, "uncategorized")),
        );
        toast.success(t("category.batchRemoveSuccess", { count: ids.length }));
        setSelectedSkills((prev) => {
          const ns = { ...prev };
          delete ns[catName];
          return ns;
        });
        await loadData();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("category.batchRemoveFailed"),
        );
      } finally {
        setBatchLoading(null);
      }
    },
    [selectedSkills, loadData, t],
  );

  // 创建分类
  const handleCreate = useCallback(
    async (name: string, displayName: string, description?: string) => {
      try {
        await apiCreateCategory({ name, displayName, description });
        setShowAddForm(false);
        await loadData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("category.createFailed"),
        );
        throw err;
      }
    },
    [loadData, t],
  );

  // 更新分类
  const handleUpdate = useCallback(
    async (name: string, displayName: string, description?: string) => {
      try {
        await apiUpdateCategory(name, { displayName, description });
        setEditingName(null);
        await loadData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("category.updateFailed"),
        );
        throw err;
      }
    },
    [loadData, t],
  );

  // 删除分类
  const handleDelete = useCallback(
    async (name: string) => {
      try {
        await apiDeleteCategory(name);
        await loadData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("category.deleteFailed"),
        );
      }
    },
    [loadData, t],
  );

  // 开始编辑
  const startEdit = useCallback((cat: Category) => {
    setEditingName(cat.name);
  }, []);

  // 渲染分类列表
  const renderCategoryList = () => {
    if (categories.length === 0) {
      return (
        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
          <p className="mb-2">{t("category.empty")}</p>
          <p className="text-xs">{t("category.emptyHint")}</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {categories.map((cat) => (
          <CategoryItem
            key={cat.name}
            category={cat}
            skills={getSkillsForCategory(cat.name)}
            selectedSkillIds={selectedSkills[cat.name] ?? new Set()}
            isExpanded={expandedCategories.has(cat.name)}
            isEditing={editingName === cat.name}
            isDeleting={false}
            onToggleExpand={() => toggleExpand(cat.name)}
            onStartEdit={() => startEdit(cat)}
            onCancelEdit={() => setEditingName(null)}
            onSaveEdit={(displayName, description) =>
              handleUpdate(cat.name, displayName, description)
            }
            onDelete={() => handleDelete(cat.name)}
            onToggleSkill={(skillId) => toggleSkillSelect(cat.name, skillId)}
            onToggleAll={() => toggleSelectAll(cat.name)}
            onBatchRemove={() => handleBatchRemove(cat.name)}
            batchLoading={batchLoading === cat.name}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-[hsl(var(--muted-foreground))]">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[var(--font-code)]">
          {t("category.title")}
        </h2>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="gap-1"
          >
            <Plus size={14} />
            {t("category.createButton")}
          </Button>
        )}
      </div>

      {showAddForm && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddForm(false)}
          submitLabel={t("category.createButton")}
        />
      )}

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3] text-sm text-[hsl(var(--destructive))] flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {renderCategoryList()}
    </div>
  );
}

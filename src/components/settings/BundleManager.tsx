// ============================================================
// components/settings/BundleManager.tsx — Bundle manager (V4 refactored)
// ============================================================

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../shared/types";
import { useExpandedState } from "../../hooks/useExpandedState";
import { useSelectionState } from "../../hooks/useSelectionState";
import { fetchCategories, fetchSkills } from "../../lib/api";
import { useBundleStore } from "../../stores/bundle-store";
import { useSkillStore } from "../../stores/skill-store";
import { toast } from "../shared/toast-store";
import { Button } from "../ui/button";
import BundleForm from "./BundleForm";
import BundleList from "./BundleList";

/**
 * BundleManager — Bundle management coordinator (V4)
 *
 * Refactored to use sub-components:
 * - BundleList: list rendering
 * - BundleItem: single bundle item (display/edit/expand modes)
 * - BundleForm: create/edit form
 * - SkillSelector: three-tab skill selection
 *
 * State management:
 * - useExpandedState for expanded bundles
 * - useSelectionState for selected skills per bundle
 * - Local state for editing/form state
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

  // Create mode state
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createExpandedGroups, setCreateExpandedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Create form selection state
  const {
    selected: createSelectedSkills,
    toggle: toggleCreateSkill,
    deselectAll: deselectAllCreateSkills,
  } = useSelectionState<string>();

  // Edit mode state (per bundle)
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [savingBundleIds, setSavingBundleIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletingBundleIds, setDeletingBundleIds] = useState<Set<string>>(
    new Set(),
  );

  // Per-bundle expanded state
  const { expandedSet: expandedBundleIds, toggle: toggleBundleExpand } =
    useExpandedState<string>();

  // Per-bundle selected skills (for edit mode)
  const [bundleSelectedSkills, setBundleSelectedSkills] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [bundleExpandedGroups, setBundleExpandedGroups] = useState<
    Map<string, Set<string>>
  >(new Map());

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

  // ============================================================
  // Create bundle handlers
  // ============================================================

  const handleCreateToggleGroup = (groupKey: string) => {
    setCreateExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const handleCreateSubmit = async (
    name: string,
    displayName: string,
    description: string | undefined,
    criteria: { skills?: string[] },
  ) => {
    if (createSelectedSkills.size === 0) return;
    setCreating(true);
    try {
      await createBundle({
        name,
        displayName,
        description,
        criteria,
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
    deselectAllCreateSkills();
    setCreateExpandedGroups(new Set());
  };

  // ============================================================
  // Edit bundle handlers
  // ============================================================

  const handleStartEdit = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;

    // Convert bundle criteria to selected skill IDs
    const selectedSkillIds = new Set<string>();

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

    if (bundle.criteria.sources?.length) {
      for (const skill of skills) {
        if (bundle.criteria.sources.includes(skill.source || "")) {
          selectedSkillIds.add(skill.id);
        }
      }
    }

    if (bundle.criteria.skills?.length) {
      for (const skillId of bundle.criteria.skills) {
        selectedSkillIds.add(skillId);
      }
    }

    // Set bundle's selected skills
    setBundleSelectedSkills((prev) => {
      const next = new Map(prev);
      next.set(bundleId, selectedSkillIds);
      return next;
    });

    // Initialize expanded groups for this bundle
    setBundleExpandedGroups((prev) => {
      const next = new Map(prev);
      next.set(bundleId, new Set());
      return next;
    });

    setEditingBundleId(bundleId);
  };

  const handleCancelEdit = () => {
    setEditingBundleId(null);
    // Note: bundleSelectedSkills and bundleExpandedGroups Maps retain entries for the
    // cancelled bundleId. These are cleaned up when handleStartEdit re-initializes
    // for the same bundle, or can be considered expired after edit session ends.
  };

  const handleSaveEdit = async (
    bundleId: string,
    displayName: string,
    description: string | undefined,
    criteria: { skills?: string[] },
  ) => {
    const selected = bundleSelectedSkills.get(bundleId) ?? new Set();
    if (selected.size === 0) return;

    setSavingBundleIds((prev) => new Set(prev).add(bundleId));
    try {
      await updateBundle(bundleId, {
        displayName,
        description,
        criteria,
      });
      toast.success(t("bundle.updateSuccess"));
      setEditingBundleId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.updateFailed"),
      );
    } finally {
      setSavingBundleIds((prev) => {
        const next = new Set(prev);
        next.delete(bundleId);
        return next;
      });
    }
  };

  const handleDelete = async (bundleId: string) => {
    setDeletingBundleIds((prev) => new Set(prev).add(bundleId));
    try {
      await deleteBundle(bundleId);
      toast.success(t("bundle.deleteSuccess"));
      // Clear edit state if deleting the bundle being edited
      if (editingBundleId === bundleId) {
        setEditingBundleId(null);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.deleteFailed"),
      );
    } finally {
      setDeletingBundleIds((prev) => {
        const next = new Set(prev);
        next.delete(bundleId);
        return next;
      });
    }
  };

  // ============================================================
  // Per-bundle skill selection handlers
  // ============================================================

  const handleToggleBundleSkill = (bundleId: string, skillId: string) => {
    setBundleSelectedSkills((prev) => {
      const next = new Map(prev);
      const current = next.get(bundleId) ?? new Set();
      const updated = new Set(current);
      if (updated.has(skillId)) {
        updated.delete(skillId);
      } else {
        updated.add(skillId);
      }
      next.set(bundleId, updated);
      return next;
    });
  };

  const handleToggleBundleGroup = (bundleId: string, groupKey: string) => {
    setBundleExpandedGroups((prev) => {
      const next = new Map(prev);
      const current = next.get(bundleId) ?? new Set();
      const updated = new Set(current);
      if (updated.has(groupKey)) {
        updated.delete(groupKey);
      } else {
        updated.add(groupKey);
      }
      next.set(bundleId, updated);
      return next;
    });
  };

  // ============================================================
  // Loading/Error states
  // ============================================================

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

  // ============================================================
  // Render
  // ============================================================

  return (
    <div>
      {/* Header */}
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

      {/* Create form */}
      {showAddForm && (
        <BundleForm
          mode="create"
          skills={skills}
          categories={categories}
          selectedSkills={createSelectedSkills}
          onToggleSkill={toggleCreateSkill}
          onSubmit={handleCreateSubmit}
          onCancel={resetAddForm}
          onToggleGroup={handleCreateToggleGroup}
          expandedGroups={createExpandedGroups}
          submitting={creating}
        />
      )}

      {/* Bundle list */}
      <BundleList
        bundles={bundles}
        skills={skills}
        categories={categories}
        expandedBundleIds={expandedBundleIds}
        editingBundleId={editingBundleId}
        selectedSkills={bundleSelectedSkills}
        onToggleExpand={toggleBundleExpand}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onToggleSkill={handleToggleBundleSkill}
        onToggleGroup={handleToggleBundleGroup}
        expandedGroups={bundleExpandedGroups}
        deletingBundleIds={deletingBundleIds}
        savingBundleIds={savingBundleIds}
      />
    </div>
  );
}

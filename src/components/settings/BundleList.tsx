// ============================================================
// components/settings/BundleList.tsx — Bundle list renderer
// ============================================================

import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Category, SkillBundle, SkillMeta } from "../../../shared/types";
import BundleItem from "./BundleItem";

export interface BundleListProps {
  bundles: SkillBundle[];
  skills: SkillMeta[];
  categories: Category[];
  expandedBundleIds: Set<string>;
  editingBundleId: string | null;
  selectedSkills: Map<string, Set<string>>;
  onToggleExpand: (bundleId: string) => void;
  onStartEdit: (bundleId: string) => void;
  onCancelEdit: (bundleId: string) => void;
  onSaveEdit: (
    bundleId: string,
    displayName: string,
    description: string | undefined,
    criteria: { skills?: string[] },
  ) => Promise<void>;
  onDelete: (bundleId: string) => void;
  onToggleSkill: (bundleId: string, skillId: string) => void;
  onToggleGroup?: (bundleId: string, groupKey: string) => void;
  expandedGroups: Map<string, Set<string>>;
  deletingBundleIds: Set<string>;
  savingBundleIds: Set<string>;
}

/**
 * BundleList — Stateless list renderer for bundles
 */
export default function BundleList({
  bundles,
  skills,
  categories,
  expandedBundleIds,
  editingBundleId,
  selectedSkills,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleSkill,
  onToggleGroup,
  expandedGroups,
  deletingBundleIds,
  savingBundleIds,
}: BundleListProps) {
  const { t } = useTranslation();

  if (bundles.length === 0) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium mb-1">{t("bundle.empty")}</p>
        <p className="text-xs">{t("bundle.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bundles.map((bundle) => (
        <BundleItem
          key={bundle.id}
          bundle={bundle}
          skills={skills}
          categories={categories}
          isExpanded={expandedBundleIds.has(bundle.id)}
          isEditing={editingBundleId === bundle.id}
          selectedSkills={selectedSkills.get(bundle.id) ?? new Set()}
          onToggleExpand={() => onToggleExpand(bundle.id)}
          onStartEdit={() => onStartEdit(bundle.id)}
          onCancelEdit={() => onCancelEdit(bundle.id)}
          onSaveEdit={(displayName, description, criteria) =>
            onSaveEdit(bundle.id, displayName, description, criteria)
          }
          onDelete={() => onDelete(bundle.id)}
          onToggleSkill={(skillId) => onToggleSkill(bundle.id, skillId)}
          onToggleGroup={
            onToggleGroup
              ? (groupKey) => onToggleGroup(bundle.id, groupKey)
              : undefined
          }
          expandedGroups={expandedGroups.get(bundle.id) ?? new Set()}
          isDeleting={deletingBundleIds.has(bundle.id)}
          isSaving={savingBundleIds.has(bundle.id)}
        />
      ))}
    </div>
  );
}

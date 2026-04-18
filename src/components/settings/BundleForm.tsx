// ============================================================
// components/settings/BundleForm.tsx — Bundle create/edit form
// ============================================================

import { Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillBundle, SkillMeta } from "../../../shared/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import SkillSelector, { type SkillSelectorTab } from "./SkillSelector";

/** Bundle name validation regex */
const VALID_BUNDLE_NAME_RE = /^[a-z0-9-]+$/;

export interface BundleFormProps {
  mode: "create" | "edit";
  bundle?: SkillBundle;
  skills: SkillMeta[];
  categories: Category[];
  selectedSkills: Set<string>;
  onToggleSkill: (skillId: string) => void;
  onSubmit: (
    name: string,
    displayName: string,
    description: string | undefined,
    criteria: { skills?: string[] },
  ) => Promise<void>;
  onCancel: () => void;
  onToggleGroup?: (groupKey: string) => void;
  expandedGroups: Set<string>;
  submitting?: boolean;
}

const emptyCriteria = {};

/**
 * BundleForm — Create or edit bundle form
 */
export default function BundleForm({
  mode,
  bundle,
  skills,
  categories,
  selectedSkills,
  onToggleSkill,
  onSubmit,
  onCancel,
  onToggleGroup,
  expandedGroups,
  submitting = false,
}: BundleFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(bundle?.name ?? "");
  const [displayName, setDisplayName] = useState(bundle?.displayName ?? "");
  const [description, setDescription] = useState(bundle?.description ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [tab, setTab] = useState<SkillSelectorTab>("category");
  const [searchQuery, setSearchQuery] = useState("");

  const previewCount = selectedSkills.size;
  const hasSelection = selectedSkills.size > 0;

  const handleNameChange = (value: string) => {
    setName(value);
    if (value && !VALID_BUNDLE_NAME_RE.test(value)) {
      setNameError(t("bundle.nameError"));
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      if (!name.trim() || !displayName.trim() || !hasSelection || nameError) {
        return;
      }
    } else {
      if (!displayName.trim() || !hasSelection) {
        return;
      }
    }

    const criteria =
      selectedSkills.size > 0 ? { skills: [...selectedSkills] } : emptyCriteria;

    await onSubmit(
      mode === "create" ? name.trim() : bundle!.name,
      displayName.trim(),
      description.trim() || undefined,
      criteria,
    );
  };

  return (
    <div className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="grid gap-3">
        {/* Name input (create mode only) */}
        {mode === "create" && (
          <div>
            <Input
              placeholder={t("bundle.namePlaceholder")}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={submitting}
            />
            {nameError && (
              <p className="text-xs text-[hsl(var(--destructive))] mt-1">
                {nameError}
              </p>
            )}
          </div>
        )}

        {/* Display name input */}
        <Input
          placeholder={t("bundle.displayNamePlaceholder")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={submitting}
        />

        {/* Description input */}
        <Input
          placeholder={t("bundle.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />

        {/* Skill selector */}
        <SkillSelector
          selectedSkills={selectedSkills}
          onToggleSkill={onToggleSkill}
          onToggleGroup={onToggleGroup}
          expandedGroups={expandedGroups}
          skills={skills}
          categories={categories}
          tab={tab}
          onTabChange={setTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          previewCount={previewCount}
          showPreview={true}
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            size="sm"
            className="gap-1"
            disabled={
              mode === "create"
                ? !name.trim() ||
                  !displayName.trim() ||
                  !hasSelection ||
                  !!nameError ||
                  submitting
                : !displayName.trim() || !hasSelection || submitting
            }
          >
            <Check size={14} />
            {submitting
              ? t("common.processing")
              : mode === "create"
                ? t("bundle.confirmCreate")
                : t("common.save")}
          </Button>
          <Button
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
    </div>
  );
}

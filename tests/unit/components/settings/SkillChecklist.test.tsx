// ============================================================
// tests/unit/components/settings/SkillChecklist.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../../../shared/types";
import SkillChecklist from "../../../../src/components/settings/SkillChecklist";
import i18n from "../../../../src/i18n";

const mockSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "Skill One",
    description: "Description one",
    category: "test-category",
    type: "workflow",
    filePath: "/path/to/skill1.md",
  },
  {
    id: "skill-2",
    name: "Skill Two",
    description: "Description two",
    category: "test-category",
    type: "instruction",
    filePath: "/path/to/skill2.md",
  },
];

const renderChecklist = (
  props: Partial<React.ComponentProps<typeof SkillChecklist>> = {},
) => {
  const defaultProps = {
    categoryName: "test-category",
    skills: mockSkills,
    selectedSkillIds: new Set<string>(),
    onToggleSkill: vi.fn(),
    onToggleAll: vi.fn(),
    onBatchRemove: vi.fn(),
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <SkillChecklist {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("SkillChecklist", () => {
  it("renders skill list", () => {
    renderChecklist();
    expect(screen.getByText("Skill One")).toBeInTheDocument();
    expect(screen.getByText("Skill Two")).toBeInTheDocument();
  });

  it("renders checkboxes for each skill", () => {
    renderChecklist();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(mockSkills.length + 1); // +1 for select-all
  });

  it("select-all checkbox is unchecked when no skills selected", () => {
    renderChecklist({ selectedSkillIds: new Set() });
    const selectAll = screen.getAllByRole("checkbox")[0];
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checkbox is checked when all skills selected", () => {
    renderChecklist({ selectedSkillIds: new Set(["skill-1", "skill-2"]) });
    const selectAll = screen.getAllByRole("checkbox")[0];
    expect(selectAll).toBeChecked();
  });

  it("batch remove button appears when skills are selected", () => {
    renderChecklist({ selectedSkillIds: new Set(["skill-1"]) });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("calls onToggleSkill when skill checkbox is clicked", () => {
    const onToggleSkill = vi.fn();
    renderChecklist({ onToggleSkill });
    const skillCheckbox = screen.getByLabelText("Skill One");
    fireEvent.click(skillCheckbox);
    expect(onToggleSkill).toHaveBeenCalledWith("skill-1");
  });

  it("calls onToggleAll when select-all checkbox is clicked", () => {
    const onToggleAll = vi.fn();
    renderChecklist({ onToggleAll });
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(selectAllCheckbox);
    expect(onToggleAll).toHaveBeenCalled();
  });

  it("calls onBatchRemove when batch remove button is clicked", () => {
    const onBatchRemove = vi.fn();
    renderChecklist({ selectedSkillIds: new Set(["skill-1"]), onBatchRemove });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onBatchRemove).toHaveBeenCalled();
  });

  it("displays skill descriptions when present", () => {
    renderChecklist();
    expect(screen.getByText("Description one")).toBeInTheDocument();
    expect(screen.getByText("Description two")).toBeInTheDocument();
  });

  it("shows icons for skills", () => {
    renderChecklist();
    const skillOneRow = screen.getByText("Skill One").closest("div");
    expect(skillOneRow?.querySelector("svg")).toBeInTheDocument();
  });
});

// ============================================================
// tests/unit/components/settings/CategoryItem.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type { Category, SkillMeta } from "../../../../shared/types";
import CategoryItem from "../../../../src/components/settings/CategoryItem";
import i18n from "../../../../src/i18n";

const mockCategory: Category = {
  name: "test-category",
  displayName: "Test Category",
  description: "Test description",
  skillCount: 2,
};

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

const renderItem = (
  props: Partial<React.ComponentProps<typeof CategoryItem>> = {},
) => {
  const defaultProps = {
    category: mockCategory,
    skills: mockSkills,
    selectedSkillIds: new Set<string>(),
    isExpanded: false,
    isEditing: false,
    isDeleting: false,
    onToggleExpand: vi.fn(),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onSaveEdit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
    onToggleSkill: vi.fn(),
    onToggleAll: vi.fn(),
    onBatchRemove: vi.fn(),
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <CategoryItem {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("CategoryItem", () => {
  it("renders category display name", () => {
    renderItem();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("renders category name (code style)", () => {
    renderItem();
    expect(screen.getByText("test-category")).toBeInTheDocument();
  });

  it("renders skill count in badge", () => {
    renderItem();
    expect(screen.getByText(/Skill/)).toBeInTheDocument();
  });

  it("renders description when present", () => {
    renderItem();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("does not render description when absent", () => {
    renderItem({ category: { ...mockCategory, description: "" } });
    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("shows expand button when collapsed", () => {
    renderItem({ isExpanded: false });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows collapse button when expanded", () => {
    renderItem({ isExpanded: true });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onToggleExpand when expand/collapse button is clicked", () => {
    const onToggleExpand = vi.fn();
    renderItem({ onToggleExpand });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onToggleExpand).toHaveBeenCalled();
  });

  it("shows edit form with inputs when isEditing is true", () => {
    renderItem({ isEditing: true });
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("edit form has pre-filled values from category", () => {
    renderItem({ isEditing: true });
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("Test Category");
  });

  it("renders SkillChecklist when expanded", () => {
    renderItem({ isExpanded: true });
    expect(screen.getByText("Skill One")).toBeInTheDocument();
    expect(screen.getByText("Skill Two")).toBeInTheDocument();
  });

  it("does not render SkillChecklist when collapsed", () => {
    renderItem({ isExpanded: false });
    expect(screen.queryByText("Skill One")).not.toBeInTheDocument();
  });

  it("clicking on category info row expands it", () => {
    const onToggleExpand = vi.fn();
    renderItem({ onToggleExpand });
    fireEvent.click(screen.getByText("Test Category"));
    expect(onToggleExpand).toHaveBeenCalled();
  });
});

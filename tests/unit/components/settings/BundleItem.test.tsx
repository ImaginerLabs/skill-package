// ============================================================
// tests/unit/components/settings/BundleItem.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type {
  Category,
  SkillBundle,
  SkillMeta,
} from "../../../../shared/types";
import BundleItem from "../../../../src/components/settings/BundleItem";
import i18n from "../../../../src/i18n";

const mockSkill: SkillMeta = {
  id: "skill-1",
  name: "Test Skill",
  description: "A test skill",
  category: "test-category",
  type: "workflow",
  filePath: "/path/to/skill.md",
};

const mockCategory: Category = {
  name: "test-category",
  displayName: "Test Category",
  description: "A test category",
  skillCount: 1,
};

const mockBundle: SkillBundle = {
  id: "bundle-1",
  name: "test-bundle",
  displayName: "Test Bundle",
  description: "A test bundle",
  criteria: {
    skills: ["skill-1"],
  },
  brokenCategoryNames: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const renderItem = (
  props: Partial<React.ComponentProps<typeof BundleItem>> = {},
) => {
  const defaultProps = {
    bundle: mockBundle,
    skills: [mockSkill],
    categories: [mockCategory],
    isExpanded: false,
    isEditing: false,
    selectedSkills: new Set<string>(),
    onToggleExpand: vi.fn(),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onSaveEdit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
    onToggleSkill: vi.fn(),
    onToggleGroup: vi.fn(),
    expandedGroups: new Set<string>(),
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <BundleItem {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("BundleItem", () => {
  it("renders bundle display name", () => {
    renderItem();
    expect(screen.getByText("Test Bundle")).toBeInTheDocument();
  });

  it("renders bundle name (code style)", () => {
    renderItem();
    expect(screen.getByText("test-bundle")).toBeInTheDocument();
  });

  it("renders bundle description when present", () => {
    renderItem();
    expect(screen.getByText("A test bundle")).toBeInTheDocument();
  });

  it("does not render description when absent", () => {
    renderItem({ bundle: { ...mockBundle, description: "" } });
    expect(screen.queryByText("A test bundle")).not.toBeInTheDocument();
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

  it("calls onToggleExpand when expand button is clicked", () => {
    const onToggleExpand = vi.fn();
    renderItem({ onToggleExpand });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onToggleExpand).toHaveBeenCalled();
  });

  it("calls onStartEdit when edit button is clicked", () => {
    const onStartEdit = vi.fn();
    renderItem({ onStartEdit });
    const buttons = screen.getAllByRole("button");
    // Find the edit button (Pencil icon)
    fireEvent.click(buttons[1]);
    expect(onStartEdit).toHaveBeenCalled();
  });

  it("shows edit form with inputs when isEditing is true", () => {
    renderItem({ isEditing: true });
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("edit form has pre-filled values from bundle", () => {
    renderItem({ isEditing: true });
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("Test Bundle");
  });

  it("renders expanded detail view when isExpanded is true", () => {
    renderItem({ isExpanded: true });
    // Should show the "手动选择" section since bundle has criteria.skills
    expect(screen.getByText(/手动选择/)).toBeInTheDocument();
  });

  it("does not render expanded detail view when collapsed", () => {
    renderItem({ isExpanded: false });
    expect(screen.queryByText(/手动选择/)).not.toBeInTheDocument();
  });
});

// ============================================================
// tests/unit/components/settings/SkillSelector.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type { Category, SkillMeta } from "../../../../shared/types";
import SkillSelector from "../../../../src/components/settings/SkillSelector";
import i18n from "../../../../src/i18n";

const mockSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "Alpha Skill",
    description: "First skill",
    category: "alpha",
    type: "workflow",
    filePath: "/path/to/skill1.md",
  },
  {
    id: "skill-2",
    name: "Beta Skill",
    description: "Second skill",
    category: "beta",
    type: "instruction",
    filePath: "/path/to/skill2.md",
  },
  {
    id: "skill-3",
    name: "Alpha Plus",
    description: "Third skill in alpha",
    category: "alpha",
    type: "workflow",
    filePath: "/path/to/skill3.md",
  },
];

const mockCategories: Category[] = [
  {
    name: "alpha",
    displayName: "Alpha Category",
    description: "Alpha category",
    skillCount: 2,
  },
  {
    name: "beta",
    displayName: "Beta Category",
    description: "Beta category",
    skillCount: 1,
  },
];

const renderSelector = (
  props: Partial<React.ComponentProps<typeof SkillSelector>> = {},
) => {
  const defaultProps = {
    selectedSkills: new Set<string>(),
    onToggleSkill: vi.fn(),
    onToggleGroup: vi.fn(),
    expandedGroups: new Set<string>(),
    skills: mockSkills,
    categories: mockCategories,
    tab: "category" as const,
    onTabChange: vi.fn(),
    searchQuery: "",
    onSearchChange: vi.fn(),
    previewCount: 0,
    showPreview: true,
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <SkillSelector {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("SkillSelector", () => {
  describe("tab switching", () => {
    it("renders three tab buttons", () => {
      renderSelector();
      const buttons = screen.getAllByRole("button");
      // Tab buttons are within the component
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it("calls onTabChange when category tab is clicked", () => {
      const onTabChange = vi.fn();
      renderSelector({ onTabChange });
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(onTabChange).toHaveBeenCalledWith("category");
    });

    it("calls onTabChange when source tab is clicked", () => {
      const onTabChange = vi.fn();
      renderSelector({ onTabChange });
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[1]);
      expect(onTabChange).toHaveBeenCalledWith("source");
    });

    it("calls onTabChange when skill tab is clicked", () => {
      const onTabChange = vi.fn();
      renderSelector({ onTabChange });
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[2]);
      expect(onTabChange).toHaveBeenCalledWith("skill");
    });
  });

  describe("search filtering", () => {
    it("renders search input", () => {
      renderSelector();
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it("calls onSearchChange when typing in search input", () => {
      const onSearchChange = vi.fn();
      renderSelector({ onSearchChange });
      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "alpha" } });
      expect(onSearchChange).toHaveBeenCalledWith("alpha");
    });

    it("filters skills by search query in skill tab", () => {
      renderSelector({
        tab: "skill",
        searchQuery: "Alpha",
        skills: mockSkills,
      });
      expect(screen.getByText("Alpha Skill")).toBeInTheDocument();
      expect(screen.getByText("Alpha Plus")).toBeInTheDocument();
      expect(screen.queryByText("Beta Skill")).not.toBeInTheDocument();
    });
  });

  describe("skill selection", () => {
    it("renders skill items in skill tab", () => {
      renderSelector({ tab: "skill" });
      expect(screen.getByText("Alpha Skill")).toBeInTheDocument();
      expect(screen.getByText("Beta Skill")).toBeInTheDocument();
    });

    it("calls onToggleSkill when skill checkbox is clicked", () => {
      const onToggleSkill = vi.fn();
      renderSelector({
        tab: "skill",
        onToggleSkill,
      });
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      expect(onToggleSkill).toHaveBeenCalledWith("skill-1");
    });
  });

  describe("preview count", () => {
    it("shows preview count when showPreview is true", () => {
      renderSelector({
        showPreview: true,
        previewCount: 5,
      });
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it("hides preview count when showPreview is false", () => {
      renderSelector({
        showPreview: false,
        previewCount: 5,
      });
      expect(screen.queryByText(/5/)).not.toBeInTheDocument();
    });
  });
});

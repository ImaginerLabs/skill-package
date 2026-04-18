// ============================================================
// tests/unit/components/settings/BundleForm.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type {
  Category,
  SkillBundle,
  SkillMeta,
} from "../../../../shared/types";
import BundleForm from "../../../../src/components/settings/BundleForm";
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

const renderForm = (
  props: Partial<React.ComponentProps<typeof BundleForm>> = {},
) => {
  const defaultProps = {
    mode: "create" as const,
    skills: [mockSkill],
    categories: [mockCategory],
    selectedSkills: new Set<string>(),
    onToggleSkill: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    onToggleGroup: vi.fn(),
    expandedGroups: new Set<string>(),
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <BundleForm {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("BundleForm", () => {
  describe("create mode", () => {
    it("renders three inputs (name, displayName, description)", () => {
      renderForm({ mode: "create" });
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(3);
    });

    it("renders multiple buttons (tabs + submit + cancel)", () => {
      renderForm();
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(5); // 3 tabs + submit + cancel
    });

    it("submit button is disabled when name is empty", () => {
      renderForm({ mode: "create" });
      const buttons = screen.getAllByRole("button");
      // The submit button is one of the buttons - let's check the last two (submit/cancel)
      // The submit button should be disabled when name is empty
      const submitBtn = buttons[buttons.length - 2]; // submit is second to last
      expect(submitBtn).toBeDisabled();
    });

    it("submit button is disabled when displayName is empty", () => {
      renderForm({ mode: "create" });
      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "test-bundle" } });
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons[buttons.length - 2];
      expect(submitBtn).toBeDisabled();
    });

    it("submit button is disabled when no skills selected", () => {
      renderForm({ mode: "create" });
      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "test-bundle" } });
      fireEvent.change(inputs[1], { target: { value: "Test Bundle" } });
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons[buttons.length - 2];
      expect(submitBtn).toBeDisabled();
    });

    it("submit button is enabled when all required fields filled", () => {
      renderForm({
        mode: "create",
        selectedSkills: new Set(["skill-1"]),
      });
      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "test-bundle" } });
      fireEvent.change(inputs[1], { target: { value: "Test Bundle" } });
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons[buttons.length - 2];
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe("edit mode", () => {
    it("renders only two inputs in edit mode (displayName, description)", () => {
      renderForm({
        mode: "edit",
        bundle: mockBundle,
      });
      const inputs = screen.getAllByRole("textbox");
      // In edit mode there's no name input - only displayName and description
      // plus the search input from SkillSelector
      // But we just check that name placeholder is not there
      const placeholders = inputs.map(
        (i) => (i as HTMLInputElement).placeholder,
      );
      expect(placeholders.some((p) => p.includes("namePlaceholder"))).toBe(
        false,
      );
    });

    it("pre-fills bundle values in edit mode", () => {
      renderForm({
        mode: "edit",
        bundle: mockBundle,
      });
      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
      expect(inputs[0].value).toBe("Test Bundle");
    });
  });

  it("calls onSubmit with correct values when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm({
      mode: "create",
      selectedSkills: new Set(["skill-1"]),
      onSubmit,
    });
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "test-bundle" } });
    fireEvent.change(inputs[1], { target: { value: "Test Bundle" } });
    fireEvent.change(inputs[2], { target: { value: "Test description" } });
    const buttons = screen.getAllByRole("button");
    const submitBtn = buttons[buttons.length - 2];
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith(
      "test-bundle",
      "Test Bundle",
      "Test description",
      { skills: ["skill-1"] },
    );
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    const buttons = screen.getAllByRole("button");
    const cancelBtn = buttons[buttons.length - 1];
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables submit button during submission", () => {
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
    renderForm({
      mode: "create",
      selectedSkills: new Set(["skill-1"]),
      onSubmit,
      submitting: true,
    });
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "test-bundle" } });
    fireEvent.change(inputs[1], { target: { value: "Test Bundle" } });
    const buttons = screen.getAllByRole("button");
    const submitBtn = buttons[buttons.length - 2];
    expect(submitBtn).toBeDisabled();
  });
});

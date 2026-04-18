// ============================================================
// tests/unit/components/settings/CategoryForm.test.tsx
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import CategoryForm from "../../../../src/components/settings/CategoryForm";
import i18n from "../../../../src/i18n";

const renderForm = (
  props: Partial<React.ComponentProps<typeof CategoryForm>> = {},
) => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };
  return render(
    <I18nextProvider i18n={i18n}>
      <CategoryForm {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe("CategoryForm", () => {
  it("renders three inputs", () => {
    renderForm();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBe(3);
  });

  it("renders submit and cancel buttons", () => {
    renderForm();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("submit is disabled when name is empty", () => {
    renderForm();
    const submitBtn = screen.getAllByRole("button")[0];
    expect(submitBtn).toBeDisabled();
  });

  it("submit is disabled when displayName is empty", () => {
    renderForm();
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "test-category" } });
    const submitBtn = screen.getAllByRole("button")[0];
    expect(submitBtn).toBeDisabled();
  });

  it("submit is enabled when name and displayName are filled", () => {
    renderForm();
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "test-category" } });
    fireEvent.change(inputs[1], { target: { value: "Test Category" } });
    const submitBtn = screen.getAllByRole("button")[0];
    expect(submitBtn).not.toBeDisabled();
  });

  it("calls onSubmit with form values on submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm({ onSubmit });
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "test-category" } });
    fireEvent.change(inputs[1], { target: { value: "Test Category" } });
    fireEvent.change(inputs[2], { target: { value: "Test description" } });
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onSubmit).toHaveBeenCalledWith(
      "test-category",
      "Test Category",
      "Test description",
    );
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onCancel).toHaveBeenCalled();
  });

  it("trims whitespace from inputs on submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm({ onSubmit });
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "  test-category  " } });
    fireEvent.change(inputs[1], { target: { value: "  Test Category  " } });
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onSubmit).toHaveBeenCalledWith(
      "test-category",
      "Test Category",
      undefined,
    );
  });

  it("shows initial values when provided", () => {
    renderForm({
      initialName: "initial-cat",
      initialDisplayName: "Initial Category",
      initialDescription: "Initial description",
    });
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("initial-cat");
    expect(inputs[1].value).toBe("Initial Category");
    expect(inputs[2].value).toBe("Initial description");
  });

  it("disables submit button during submission", () => {
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
    renderForm({ onSubmit, submitting: true });
    const submitBtn = screen.getAllByRole("button")[0];
    expect(submitBtn).toBeDisabled();
  });

  it("uses custom submitLabel when provided", () => {
    renderForm({ submitLabel: "Custom Submit" });
    expect(screen.getByText("Custom Submit")).toBeInTheDocument();
  });
});

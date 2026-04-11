import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../../../../src/components/ui/checkbox";

describe("Checkbox", () => {
  it("渲染 checkbox 元素", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("button");
    expect(checkbox).toBeInTheDocument();
  });

  it("支持 className 扩展", () => {
    const { container } = render(<Checkbox className="custom-check" />);
    const checkbox = container.querySelector("button");
    expect(checkbox?.className).toContain("custom-check");
  });

  it("默认未选中", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("button");
    expect(checkbox?.getAttribute("data-state")).toBe("unchecked");
  });

  it("点击后切换选中状态", async () => {
    const user = userEvent.setup();
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("button")!;
    await user.click(checkbox);
    expect(checkbox.getAttribute("data-state")).toBe("checked");
  });

  it("disabled 状态下不可交互", () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector("button");
    expect(checkbox).toBeDisabled();
  });

  it("包含暗色主题样式", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("button");
    expect(checkbox?.className).toContain("border");
    expect(checkbox?.className).toContain("rounded-sm");
  });
});

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Input } from "../../../../src/components/ui/input";

describe("Input", () => {
  it("渲染 input 元素", () => {
    render(<Input placeholder="输入内容" />);
    expect(screen.getByPlaceholderText("输入内容")).toBeInTheDocument();
  });

  it("支持 className 扩展", () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("custom-class");
  });

  it("支持 ref 转发", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("支持 type 属性", () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");
  });

  it("支持 disabled 状态", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("包含暗色主题样式类", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("rounded-md");
    expect(input.className).toContain("border");
  });
});

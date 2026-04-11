import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "../../../../src/components/ui/separator";

describe("Separator", () => {
  it("渲染水平分隔线", () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toBeInTheDocument();
    expect(separator.className).toContain("h-[1px]");
    expect(separator.className).toContain("w-full");
  });

  it("渲染垂直分隔线", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator.className).toContain("h-full");
    expect(separator.className).toContain("w-[1px]");
  });

  it("支持 className 扩展", () => {
    const { container } = render(<Separator className="my-custom" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator.className).toContain("my-custom");
  });

  it("包含暗色主题边框色", () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator.className).toContain("bg-[hsl(var(--border))]");
  });

  it("默认为 decorative", () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
  });
});

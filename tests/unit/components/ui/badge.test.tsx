import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "../../../../src/components/ui/badge";

describe("Badge", () => {
  it("渲染 badge 元素", () => {
    render(<Badge>标签</Badge>);
    expect(screen.getByText("标签")).toBeInTheDocument();
  });

  it("支持 className 扩展", () => {
    render(<Badge className="custom-class">标签</Badge>);
    const badge = screen.getByText("标签");
    expect(badge.className).toContain("custom-class");
  });

  it("支持 ref 转发", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Badge ref={ref}>标签</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("渲染 default variant（绿色）", () => {
    render(<Badge variant="default">分类</Badge>);
    const badge = screen.getByText("分类");
    expect(badge.className).toContain("bg-[hsl(var(--primary))]");
  });

  it("渲染 secondary variant（蓝色）", () => {
    render(<Badge variant="secondary">类型</Badge>);
    const badge = screen.getByText("类型");
    expect(badge.className).toContain("bg-[hsl(var(--info))]");
  });

  it("渲染 outline variant（灰色边框）", () => {
    render(<Badge variant="outline">标签</Badge>);
    const badge = screen.getByText("标签");
    expect(badge.className).toContain("border-[hsl(var(--border))]");
  });

  it("渲染 destructive variant（红色）", () => {
    render(<Badge variant="destructive">错误</Badge>);
    const badge = screen.getByText("错误");
    expect(badge.className).toContain("bg-[hsl(var(--destructive))]");
  });

  it("默认使用 default variant", () => {
    render(<Badge>默认</Badge>);
    const badge = screen.getByText("默认");
    expect(badge.className).toContain("bg-[hsl(var(--primary))]");
  });
});

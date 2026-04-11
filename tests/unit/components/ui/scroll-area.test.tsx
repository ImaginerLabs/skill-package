import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "../../../../src/components/ui/scroll-area";

describe("ScrollArea", () => {
  it("渲染 ScrollArea 容器", () => {
    const { container } = render(
      <ScrollArea data-testid="scroll">
        <div>内容</div>
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root.className).toContain("overflow-hidden");
  });

  it("渲染子内容", () => {
    const { getByText } = render(
      <ScrollArea>
        <p>滚动内容</p>
      </ScrollArea>,
    );
    expect(getByText("滚动内容")).toBeInTheDocument();
  });

  it("支持 className 扩展", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <div>内容</div>
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("custom-scroll");
  });

  it("包含 viewport 子元素", () => {
    const { container } = render(
      <ScrollArea>
        <div>内容</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    expect(viewport).toBeInTheDocument();
  });
});

// ============================================================
// tests/unit/components/ui/tabs.test.tsx
// Story 7.3: 分类管理 Tab 滑块平移动画
// 验收标准：
//   AC-1: 点击 Tab 时滑块平移动画
//   AC-2: 使用 transform: translateX()
//   AC-3: Tab 内容区域正确切换
//   AC-4: prefers-reduced-motion 降级
//   AC-5: 视觉一致性（激活/非激活文字颜色）
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../src/components/ui/tabs";

// ─────────────────────────────────────────────
// 测试辅助：渲染标准两 Tab 组件
// ─────────────────────────────────────────────
function renderTwoTabs(defaultValue = "tab1") {
  return render(
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">内容 1</TabsContent>
      <TabsContent value="tab2">内容 2</TabsContent>
    </Tabs>,
  );
}

describe("Tabs 滑块动画 — Story 7.3", () => {
  // ─────────────────────────────────────────────
  // AC-2: 滑块使用 transform: translateX()
  // ─────────────────────────────────────────────
  describe("AC-2: 滑块位置计算", () => {
    it("默认激活第一个 Tab 时滑块 translateX 为 0%", () => {
      renderTwoTabs("tab1");
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transform).toBe("translateX(calc(0 * 100%))");
    });

    it("默认激活第二个 Tab 时滑块 translateX 为 100%", () => {
      renderTwoTabs("tab2");
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transform).toBe("translateX(calc(1 * 100%))");
    });

    it("点击第二个 Tab 后滑块 translateX 更新为 100%", () => {
      renderTwoTabs("tab1");
      fireEvent.click(screen.getByText("Tab 2"));
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transform).toBe("translateX(calc(1 * 100%))");
    });

    it("点击第一个 Tab 后滑块 translateX 回到 0%", () => {
      renderTwoTabs("tab2");
      fireEvent.click(screen.getByText("Tab 1"));
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transform).toBe("translateX(calc(0 * 100%))");
    });
  });

  // ─────────────────────────────────────────────
  // AC-1: 滑块有过渡动画
  // ─────────────────────────────────────────────
  describe("AC-1: 滑块过渡动画", () => {
    it("正常情况下滑块有 transition 样式", () => {
      // mock matchMedia 返回 false（不偏好减少动画）
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderTwoTabs();
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transition).toBe("transform 200ms ease-in-out");
    });
  });

  // ─────────────────────────────────────────────
  // AC-4: prefers-reduced-motion 降级
  // ─────────────────────────────────────────────
  describe("AC-4: prefers-reduced-motion 降级", () => {
    it("开启减少动画时滑块 transition 为 none", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderTwoTabs();
      const slider = screen.getByTestId("tab-slider");
      expect(slider.style.transition).toBe("none");
    });
  });

  // ─────────────────────────────────────────────
  // AC-3: Tab 内容区域正确切换
  // ─────────────────────────────────────────────
  describe("AC-3: Tab 内容切换", () => {
    it("默认显示第一个 Tab 内容", () => {
      renderTwoTabs("tab1");
      expect(screen.getByText("内容 1")).toBeInTheDocument();
      expect(screen.queryByText("内容 2")).not.toBeInTheDocument();
    });

    it("点击第二个 Tab 后显示第二个内容", () => {
      renderTwoTabs("tab1");
      fireEvent.click(screen.getByText("Tab 2"));
      expect(screen.getByText("内容 2")).toBeInTheDocument();
      expect(screen.queryByText("内容 1")).not.toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────
  // AC-5: 激活/非激活文字颜色
  // ─────────────────────────────────────────────
  describe("AC-5: 视觉一致性", () => {
    it("激活 Tab 文字颜色为 foreground", () => {
      renderTwoTabs("tab1");
      const tab1 = screen.getByText("Tab 1").closest("button")!;
      expect(tab1.className).toContain("text-[hsl(var(--foreground))]");
    });

    it("非激活 Tab 文字颜色为 muted-foreground", () => {
      renderTwoTabs("tab1");
      const tab2 = screen.getByText("Tab 2").closest("button")!;
      expect(tab2.className).toContain("text-[hsl(var(--muted-foreground))]");
    });

    it("TabsTrigger 有 relative z-10 确保文字在滑块上方", () => {
      renderTwoTabs();
      const tab1 = screen.getByText("Tab 1").closest("button")!;
      expect(tab1.className).toContain("relative");
      expect(tab1.className).toContain("z-10");
    });

    it("滑块有 aria-hidden 属性", () => {
      renderTwoTabs();
      const slider = screen.getByTestId("tab-slider");
      expect(slider).toHaveAttribute("aria-hidden", "true");
    });
  });
});

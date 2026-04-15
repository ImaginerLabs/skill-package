import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "nav.byCategory": "按分类",
        "nav.bySource": "按来源",
        "nav.viewSwitcher": "视图切换",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

import ViewTab from "../../../../src/components/skills/ViewTab";

describe("ViewTab", () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染两个 Tab：按分类和按来源", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      expect(screen.getByText("按分类")).toBeInTheDocument();
      expect(screen.getByText("按来源")).toBeInTheDocument();
    });

    it("默认选中按分类 Tab", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      expect(categoryTab).toHaveAttribute("aria-selected", "true");

      const sourceTab = screen.getByText("按来源");
      expect(sourceTab).toHaveAttribute("aria-selected", "false");
    });

    it("activeView 为 source 时选中按来源 Tab", () => {
      render(<ViewTab activeView="source" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      expect(categoryTab).toHaveAttribute("aria-selected", "false");

      const sourceTab = screen.getByText("按来源");
      expect(sourceTab).toHaveAttribute("aria-selected", "true");
    });

    it("选中 Tab 有底边框样式", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      expect(categoryTab).toHaveClass("border-[hsl(var(--primary))]");
    });
  });

  describe("交互", () => {
    it("点击按来源 Tab 触发 onViewChange('source')", async () => {
      const user = userEvent.setup();
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      await user.click(screen.getByText("按来源"));

      expect(mockOnViewChange).toHaveBeenCalledWith("source");
    });

    it("点击按分类 Tab 触发 onViewChange('category')", async () => {
      const user = userEvent.setup();
      render(<ViewTab activeView="source" onViewChange={mockOnViewChange} />);

      await user.click(screen.getByText("按分类"));

      expect(mockOnViewChange).toHaveBeenCalledWith("category");
    });
  });

  describe("键盘导航", () => {
    it("ArrowRight 将焦点移到下一个 Tab", async () => {
      const user = userEvent.setup();
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      categoryTab.focus();
      await user.keyboard("{ArrowRight}");

      expect(screen.getByText("按来源")).toHaveFocus();
    });

    it("ArrowLeft 将焦点移到上一个 Tab（循环）", async () => {
      const user = userEvent.setup();
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      categoryTab.focus();
      await user.keyboard("{ArrowLeft}");

      // 循环到最后一个 Tab
      expect(screen.getByText("按来源")).toHaveFocus();
    });
  });

  describe("ARIA 无障碍", () => {
    it("容器有 role=tablist", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("每个 Tab 有 role=tab", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
    });

    it("选中 Tab 的 tabIndex 为 0，未选中为 -1", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      const sourceTab = screen.getByText("按来源");

      expect(categoryTab).toHaveAttribute("tabindex", "0");
      expect(sourceTab).toHaveAttribute("tabindex", "-1");
    });

    it("Tab 有 aria-controls 属性", () => {
      render(<ViewTab activeView="category" onViewChange={mockOnViewChange} />);

      const categoryTab = screen.getByText("按分类");
      expect(categoryTab).toHaveAttribute("aria-controls", "panel-category");

      const sourceTab = screen.getByText("按来源");
      expect(sourceTab).toHaveAttribute("aria-controls", "panel-source");
    });
  });
});

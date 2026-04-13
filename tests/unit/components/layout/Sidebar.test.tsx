// ============================================================
// tests/unit/components/layout/Sidebar.test.tsx
// Story NAV-01 + Story 7.1
// 验收标准：
//   AC-1: 有分类筛选时点击"Skill 库"应清除 selectedCategory
//   AC-2: 无分类筛选时点击"Skill 库"应幂等（不触发额外操作）
//   AC-3: 在其他路由点击"Skill 库"应导航到 /
//   AC-5: 有分类筛选时"Skill 库"显示父级弱激活态（无绿线）
//   Story 7.1: 「分类」导航项已从主 Sidebar 移除
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Sidebar from "../../../../src/components/layout/Sidebar";

// ─────────────────────────────────────────────
// Mock react-router-dom
// ─────────────────────────────────────────────
const mockNavigate = vi.fn();
let mockPathname = "/";

vi.mock("react-router-dom", () => ({
  NavLink: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className: (arg: { isActive: boolean }) => string;
  }) => {
    const isActive = mockPathname === to;
    return (
      <a href={to} className={className({ isActive })}>
        {children}
      </a>
    );
  },
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

// ─────────────────────────────────────────────
// Mock stats 组件（避免依赖 skill-store 的 skills/categories 字段）
// ─────────────────────────────────────────────
vi.mock("../../../../src/components/stats/StatsPanel", () => ({
  default: () => <div data-testid="stats-panel-mock" />,
}));

vi.mock("../../../../src/components/stats/ActivityHeatmap", () => ({
  default: () => <div data-testid="activity-heatmap-mock" />,
}));

// ─────────────────────────────────────────────
// Mock stores
// ─────────────────────────────────────────────
const mockSetCategory = vi.fn();
let mockSelectedCategory: string | null = null;

vi.mock("../../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({ sidebarOpen: true })),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn((selector: (s: any) => any) => {
    const state = {
      setCategory: mockSetCategory,
      selectedCategory: mockSelectedCategory,
    };
    return selector ? selector(state) : state;
  }),
}));

import { useSkillStore } from "../../../../src/stores/skill-store";

describe("Sidebar — Skill 库导航 (Story NAV-01 + Story 7.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
    mockSelectedCategory = null;
    vi.mocked(useSkillStore).mockImplementation((selector: any) => {
      const state = {
        setCategory: mockSetCategory,
        selectedCategory: mockSelectedCategory,
      };
      return selector ? selector(state) : state;
    });
  });

  // ─────────────────────────────────────────────
  // AC-1: 有分类筛选时点击"Skill 库"应清除 selectedCategory
  // ─────────────────────────────────────────────
  describe("AC-1: 有分类筛选时点击 Skill 库清除筛选", () => {
    it("点击 Skill 库按钮时调用 setCategory(null)", () => {
      mockSelectedCategory = "编程开发";
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          setCategory: mockSetCategory,
          selectedCategory: mockSelectedCategory,
        };
        return selector ? selector(state) : state;
      });

      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));

      expect(mockSetCategory).toHaveBeenCalledWith(null);
      expect(mockSetCategory).toHaveBeenCalledTimes(1);
    });

    it("有分类筛选时点击 Skill 库不触发 navigate（已在 / 路由）", () => {
      mockSelectedCategory = "编程开发";
      mockPathname = "/";
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          setCategory: mockSetCategory,
          selectedCategory: mockSelectedCategory,
        };
        return selector ? selector(state) : state;
      });

      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // AC-2: 无分类筛选时点击"Skill 库"应幂等
  // ─────────────────────────────────────────────
  describe("AC-2: 无分类筛选时点击 Skill 库幂等", () => {
    it("无分类筛选时点击 Skill 库仍调用 setCategory(null)（幂等）", () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));
      expect(mockSetCategory).toHaveBeenCalledWith(null);
    });

    it("无分类筛选且在 / 路由时不触发 navigate", () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // AC-3: 在其他路由点击"Skill 库"应导航到 /
  // ─────────────────────────────────────────────
  describe("AC-3: 在其他路由点击 Skill 库导航到 /", () => {
    it("在 /settings 路由点击 Skill 库应调用 navigate('/')", () => {
      mockPathname = "/settings";
      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("在 /workflow 路由点击 Skill 库应调用 navigate('/')", () => {
      mockPathname = "/workflow";
      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("在其他路由点击 Skill 库同时清除分类筛选", () => {
      mockPathname = "/settings";
      mockSelectedCategory = "编程开发";
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          setCategory: mockSetCategory,
          selectedCategory: mockSelectedCategory,
        };
        return selector ? selector(state) : state;
      });

      render(<Sidebar />);
      fireEvent.click(screen.getByTestId("nav-skill-library"));

      expect(mockSetCategory).toHaveBeenCalledWith(null);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // ─────────────────────────────────────────────
  // AC-5: 视觉状态 — 三态样式
  // ─────────────────────────────────────────────
  describe("AC-5: Skill 库三态视觉样式", () => {
    it("在 / 路由且无分类筛选时显示强激活态（含左侧绿线）", () => {
      render(<Sidebar />);
      const btn = screen.getByTestId("nav-skill-library");
      expect(btn.className).toContain("border-[hsl(var(--primary))]");
      expect(btn.className).toContain("bg-[hsl(var(--accent))]");
      expect(btn.className).toContain("text-[hsl(var(--primary))]");
    });

    it("在 / 路由且有分类筛选时显示弱激活/父级态（无绿线）", () => {
      mockSelectedCategory = "编程开发";
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          setCategory: mockSetCategory,
          selectedCategory: mockSelectedCategory,
        };
        return selector ? selector(state) : state;
      });

      render(<Sidebar />);
      const btn = screen.getByTestId("nav-skill-library");
      expect(btn.className).toContain("border-transparent");
      expect(btn.className).toContain("bg-[hsl(var(--accent))]");
      expect(btn.className).not.toContain("border-[hsl(var(--primary))]");
    });

    it("在其他路由时显示非激活态（无背景）", () => {
      mockPathname = "/settings";
      render(<Sidebar />);
      const btn = screen.getByTestId("nav-skill-library");
      expect(btn.className).not.toMatch(
        /(?<!hover:)bg-\[hsl\(var\(--accent\)\)\]/,
      );
      expect(btn.className).toContain("text-[hsl(var(--muted-foreground))]");
    });
  });

  // ─────────────────────────────────────────────
  // Story 7.1: 导航项变更验证
  // ─────────────────────────────────────────────
  describe("Story 7.1: 导航项变更", () => {
    it("渲染所有保留的导航项", () => {
      render(<Sidebar />);
      expect(screen.getByTestId("nav-skill-library")).toBeInTheDocument();
      expect(screen.getByText("工作流")).toBeInTheDocument();
      expect(screen.getByText("同步")).toBeInTheDocument();
      expect(screen.getByText("导入")).toBeInTheDocument();
      expect(screen.getByText("路径配置")).toBeInTheDocument();
    });

    it("「分类」导航项已从主 Sidebar 移除", () => {
      render(<Sidebar />);
      expect(screen.queryByText("分类")).not.toBeInTheDocument();
    });

    it("sidebarOpen 为 false 时不渲染侧边栏", async () => {
      const { useUIStore } = await import("../../../../src/stores/ui-store");
      vi.mocked(useUIStore).mockReturnValue({ sidebarOpen: false } as any);
      const { container } = render(<Sidebar />);
      expect(container.firstChild).toBeNull();
    });
  });
});

// ============================================================
// tests/unit/components/layout/AppLayout.test.tsx
// Story 7.1: 分类导航迁移至 Skill 库二级 Sidebar
// 验收标准：
//   AC-3: 路由 / 时 SecondarySidebar 存在
//   AC-4: 路由非 / 时 SecondarySidebar 不存在
//   AC-7: 主 Sidebar 宽度不受影响
// ============================================================

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppLayout from "../../../../src/components/layout/AppLayout";

// ─────────────────────────────────────────────
// Mock react-router-dom
// ─────────────────────────────────────────────
let mockPathname = "/";

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet-mock" />,
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => vi.fn(),
  NavLink: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className: (arg: { isActive: boolean }) => string;
  }) => (
    <a
      href={to}
      className={
        typeof className === "function"
          ? className({ isActive: mockPathname === to })
          : className
      }
    >
      {children}
    </a>
  ),
}));

// ─────────────────────────────────────────────
// Mock 子组件（避免依赖链）
// ─────────────────────────────────────────────
vi.mock("../../../../src/components/layout/Header", () => ({
  default: () => <div data-testid="header-mock" />,
}));

vi.mock("../../../../src/components/layout/StatusBar", () => ({
  default: () => <div data-testid="statusbar-mock" />,
}));

vi.mock("../../../../src/components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar-mock" />,
}));

vi.mock("../../../../src/components/layout/SecondarySidebar", () => ({
  default: () => <div data-testid="secondary-sidebar-mock" />,
}));

vi.mock("../../../../src/components/skills/SkillPreview", () => ({
  default: () => <div data-testid="skill-preview-mock" />,
}));

vi.mock("../../../../src/components/shared/CommandPalette", () => ({
  default: () => <div data-testid="command-palette-mock" />,
}));

vi.mock("../../../../src/components/shared/Toast", () => ({
  default: () => <div data-testid="toast-mock" />,
}));

// ─────────────────────────────────────────────
// Mock stores
// ─────────────────────────────────────────────
vi.mock("../../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    previewOpen: false,
    sidebarOpen: true,
    toggleSidebar: vi.fn(),
    togglePreview: vi.fn(),
  })),
}));

import { useUIStore } from "../../../../src/stores/ui-store";

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn((selector: any) => {
    const state = {
      selectedSkillId: null,
      fetchSkills: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

describe("AppLayout — Story 7.1 条件渲染 SecondarySidebar", () => {
  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue({
      previewOpen: false,
      sidebarOpen: true,
      toggleSidebar: vi.fn(),
      togglePreview: vi.fn(),
    } as any);
  });
  // ─────────────────────────────────────────────
  // AC-3: 路由 / 时 SecondarySidebar 存在
  // ─────────────────────────────────────────────
  it("路由为 / 时渲染 SecondarySidebar", () => {
    mockPathname = "/";
    render(<AppLayout />);
    expect(screen.getByTestId("secondary-sidebar-mock")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-4: 路由非 / 时 SecondarySidebar 不存在
  // ─────────────────────────────────────────────
  it("路由为 /workflow 时不渲染 SecondarySidebar", () => {
    mockPathname = "/workflow";
    render(<AppLayout />);
    expect(
      screen.queryByTestId("secondary-sidebar-mock"),
    ).not.toBeInTheDocument();
  });

  it("路由为 /sync 时不渲染 SecondarySidebar", () => {
    mockPathname = "/sync";
    render(<AppLayout />);
    expect(
      screen.queryByTestId("secondary-sidebar-mock"),
    ).not.toBeInTheDocument();
  });

  it("路由为 /settings 时不渲染 SecondarySidebar", () => {
    mockPathname = "/settings";
    render(<AppLayout />);
    expect(
      screen.queryByTestId("secondary-sidebar-mock"),
    ).not.toBeInTheDocument();
  });

  it("路由为 /import 时不渲染 SecondarySidebar", () => {
    mockPathname = "/import";
    render(<AppLayout />);
    expect(
      screen.queryByTestId("secondary-sidebar-mock"),
    ).not.toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // P3 修复：sidebarOpen=false 时不渲染 SecondarySidebar
  // ─────────────────────────────────────────────
  it("主 Sidebar 折叠时（sidebarOpen=false）不渲染 SecondarySidebar", () => {
    mockPathname = "/";
    vi.mocked(useUIStore).mockReturnValue({
      previewOpen: false,
      sidebarOpen: false,
      toggleSidebar: vi.fn(),
      togglePreview: vi.fn(),
    } as any);
    render(<AppLayout />);
    expect(
      screen.queryByTestId("secondary-sidebar-mock"),
    ).not.toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-7: 主 Sidebar 始终渲染（不受路由影响）
  // ─────────────────────────────────────────────
  it("主 Sidebar 在所有路由下均渲染", () => {
    mockPathname = "/workflow";
    render(<AppLayout />);
    expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
  });
});

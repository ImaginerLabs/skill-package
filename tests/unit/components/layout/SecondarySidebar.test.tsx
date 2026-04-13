// ============================================================
// tests/unit/components/layout/SecondarySidebar.test.tsx
// Story 7.1: 分类导航迁移至 Skill 库二级 Sidebar
// 验收标准：
//   AC-3: 二级 Sidebar 渲染 CategoryTree 组件
//   AC-5: 二级 Sidebar 有视觉分隔线和正确宽度
//   AC-8: 底部「管理分类」链接指向 /settings
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SecondarySidebar from "../../../../src/components/layout/SecondarySidebar";

// ─────────────────────────────────────────────
// Mock react-router-dom
// ─────────────────────────────────────────────
const mockPathname = "/";

vi.mock("react-router-dom", () => ({
  NavLink: ({
    to,
    children,
    className,
    "data-testid": testId,
  }: {
    to: string;
    children: React.ReactNode;
    className: (arg: { isActive: boolean }) => string;
    "data-testid"?: string;
  }) => {
    const isActive = mockPathname === to;
    return (
      <a href={to} className={className({ isActive })} data-testid={testId}>
        {children}
      </a>
    );
  },
}));

// ─────────────────────────────────────────────
// Mock CategoryTree（避免依赖链）
// ─────────────────────────────────────────────
vi.mock("../../../../src/components/skills/CategoryTree", () => ({
  default: () => <div data-testid="category-tree-mock">CategoryTree</div>,
}));

describe("SecondarySidebar — Story 7.1", () => {
  // ─────────────────────────────────────────────
  // AC-3: CategoryTree 被渲染
  // ─────────────────────────────────────────────
  it("渲染 CategoryTree 组件", () => {
    render(<SecondarySidebar />);
    expect(screen.getByTestId("category-tree-mock")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-3: 顶部「分类」标题
  // ─────────────────────────────────────────────
  it("渲染顶部「分类」标题", () => {
    render(<SecondarySidebar />);
    expect(screen.getByText("分类")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-5: 组件有正确的 data-testid 和宽度
  // ─────────────────────────────────────────────
  it("组件有 data-testid='secondary-sidebar'", () => {
    render(<SecondarySidebar />);
    const aside = screen.getByTestId("secondary-sidebar");
    expect(aside).toBeInTheDocument();
  });

  it("组件宽度为 220px", () => {
    render(<SecondarySidebar />);
    const aside = screen.getByTestId("secondary-sidebar");
    expect(aside).toHaveStyle({ width: "220px" });
  });

  it("组件包含左侧边框样式（视觉分隔线）", () => {
    render(<SecondarySidebar />);
    const aside = screen.getByTestId("secondary-sidebar");
    expect(aside.className).toContain("border-l");
  });

  // ─────────────────────────────────────────────
  // AC-8: 底部「管理分类」链接指向 /settings
  // ─────────────────────────────────────────────
  it("底部「管理分类」链接指向 /settings", () => {
    render(<SecondarySidebar />);
    const link = screen.getByTestId("secondary-sidebar-manage-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/settings");
  });

  it("「管理分类」链接文字正确", () => {
    render(<SecondarySidebar />);
    expect(screen.getByText("管理分类")).toBeInTheDocument();
  });
});

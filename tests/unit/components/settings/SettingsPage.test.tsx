// ============================================================
// tests/unit/components/settings/SettingsPage.test.tsx
// Story 5.3: 设置页 Tab 化重组织
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "settings.title": "分类管理",
        "settings.tabCategories": "分类设置",
        "settings.tabBundles": "套件管理",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock CategoryManager（避免复杂的 API 依赖）
vi.mock("../../../../src/components/settings/CategoryManager", () => ({
  default: () => <div data-testid="category-manager">CategoryManager</div>,
}));

// Mock BundleManager（避免复杂的 store 和 API 依赖）
vi.mock("../../../../src/components/settings/BundleManager", () => ({
  default: () => <div data-testid="bundle-manager">BundleManager</div>,
}));

// Mock API（CategoryManager 可能间接引用）
vi.mock("../../../../src/lib/api", () => ({
  fetchCategories: vi.fn().mockResolvedValue([]),
  fetchSkills: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  moveSkillCategory: vi.fn(),
}));

// Mock toast
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import SettingsPage from "../../../../src/pages/SettingsPage";

describe("SettingsPage — Tab 化重组织", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("渲染页面标题'分类管理'", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "分类管理",
    );
  });

  it("默认显示'分类设置' Tab 内容（CategoryManager）", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("category-manager")).toBeInTheDocument();
  });

  it("显示两个 Tab 按钮：'分类设置'和'套件管理'", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("tab", { name: "分类设置" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "套件管理" })).toBeInTheDocument();
  });

  it("默认激活'分类设置' Tab", () => {
    render(<SettingsPage />);
    const categoriesTab = screen.getByRole("tab", { name: "分类设置" });
    expect(categoriesTab).toHaveAttribute("aria-selected", "true");
  });

  it("点击'套件管理' Tab 后切换到套件管理内容", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const bundlesTab = screen.getByRole("tab", { name: "套件管理" });
    await user.click(bundlesTab);

    // 套件管理 Tab 被激活
    expect(bundlesTab).toHaveAttribute("aria-selected", "true");
    // 分类设置 Tab 不再激活
    expect(screen.getByRole("tab", { name: "分类设置" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    // BundleManager mock 内容显示
    expect(screen.getByTestId("bundle-manager")).toBeInTheDocument();
  });

  it("切换到'套件管理'后，CategoryManager 不可见（hidden）", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: "套件管理" }));

    // CategoryManager 所在的 TabsContent 应该被 hidden
    const categoryManagerEl = screen.getByTestId("category-manager");
    const tabPanel = categoryManagerEl.closest("[role='tabpanel']");
    expect(tabPanel).toHaveAttribute("hidden");
  });

  it("切换回'分类设置' Tab 后 CategoryManager 重新可见", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    // 先切换到套件管理
    await user.click(screen.getByRole("tab", { name: "套件管理" }));
    // 再切换回分类设置
    await user.click(screen.getByRole("tab", { name: "分类设置" }));

    const categoryManagerEl = screen.getByTestId("category-manager");
    const tabPanel = categoryManagerEl.closest("[role='tabpanel']");
    expect(tabPanel).not.toHaveAttribute("hidden");
  });
});

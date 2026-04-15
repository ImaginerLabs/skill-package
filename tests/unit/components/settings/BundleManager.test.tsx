// ============================================================
// tests/unit/components/settings/BundleManager.test.tsx
// Story 5.4: 套件管理 UI CRUD
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next（使用 zh 翻译资源）
// 注意：t 函数必须在模块级别定义，保持引用稳定，避免 useCallback 依赖变化导致无限循环
vi.mock("react-i18next", async () => {
  const { zh } = await import("../../../../src/i18n/locales/zh");
  function resolve(key: string, obj: Record<string, unknown>): string {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur)
        cur = (cur as Record<string, unknown>)[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  }
  // 稳定的 t 函数引用（模块级别，不在每次 useTranslation 调用时重新创建）
  const stableT = (key: string, params?: Record<string, unknown>) => {
    let text = resolve(key, zh as unknown as Record<string, unknown>);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
      }
    }
    return text;
  };
  const stableI18n = { language: "zh", changeLanguage: vi.fn() };
  return {
    useTranslation: () => ({
      t: stableT,
      i18n: stableI18n,
    }),
  };
});

// Mock bundle-store
const mockFetchBundles = vi.fn();
const mockCreateBundle = vi.fn();
const mockUpdateBundle = vi.fn();
const mockDeleteBundle = vi.fn();

vi.mock("../../../../src/stores/bundle-store", () => ({
  useBundleStore: vi.fn(() => ({
    bundles: [],
    bundlesLoading: false,
    bundlesError: null,
    fetchBundles: mockFetchBundles,
    createBundle: mockCreateBundle,
    updateBundle: mockUpdateBundle,
    deleteBundle: mockDeleteBundle,
  })),
}));

// Mock API
const mockFetchCategories = vi.fn();
vi.mock("../../../../src/lib/api", () => ({
  fetchCategories: (...args: unknown[]) => mockFetchCategories(...args),
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import BundleManager from "../../../../src/components/settings/BundleManager";
import { useBundleStore } from "../../../../src/stores/bundle-store";

const mockCategories = [
  { name: "coding", displayName: "编程", description: "", skillCount: 5 },
  { name: "testing", displayName: "测试", description: "", skillCount: 3 },
];

const mockBundle = {
  id: "bundle-abc123-xyz1",
  name: "frontend-dev",
  displayName: "前端日常开发",
  description: "前端开发常用分类",
  categoryNames: ["coding", "testing"],
  createdAt: "2026-04-13T00:00:00.000Z",
  updatedAt: "2026-04-13T00:00:00.000Z",
  brokenCategoryNames: [],
};

describe("BundleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCategories.mockResolvedValue(mockCategories);
    mockFetchBundles.mockResolvedValue([]);
  });

  // ----------------------------------------------------------------
  // 空状态
  // ----------------------------------------------------------------
  describe("空状态", () => {
    it("套件列表为空时显示空状态引导", async () => {
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("暂无套件")).toBeInTheDocument();
      });
      expect(screen.getByText(/套件是分类的组合/)).toBeInTheDocument();
    });

    it("显示'新建套件'按钮", async () => {
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });
    });
  });

  // ----------------------------------------------------------------
  // 套件列表
  // ----------------------------------------------------------------
  describe("套件列表", () => {
    beforeEach(() => {
      vi.mocked(useBundleStore).mockReturnValue({
        bundles: [mockBundle],
        bundlesLoading: false,
        bundlesError: null,
        fetchBundles: mockFetchBundles,
        createBundle: mockCreateBundle,
        updateBundle: mockUpdateBundle,
        deleteBundle: mockDeleteBundle,
      });
    });

    it("显示套件卡片（名称、标识、分类数量）", async () => {
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });
      expect(screen.getByText("frontend-dev")).toBeInTheDocument();
      expect(screen.getByText("2 Skill")).toBeInTheDocument();
    });

    it("点击展开按钮后显示分类 Tag 列表", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const expandBtn = screen.getByRole("button", { name: "展开" });
      await user.click(expandBtn);

      expect(screen.getByText("coding")).toBeInTheDocument();
      expect(screen.getByText("testing")).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // 新建套件
  // ----------------------------------------------------------------
  describe("新建套件", () => {
    it("点击'新建套件'按钮显示创建表单", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /新建套件/ }));

      expect(screen.getByPlaceholderText(/套件标识/)).toBeInTheDocument();
    });

    it("名称格式不符合正则时显示错误提示", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /新建套件/ }));
      await user.type(screen.getByPlaceholderText(/套件标识/), "Invalid Name");

      expect(screen.getByText(/只能包含小写字母/)).toBeInTheDocument();
    });

    it("未选择分类时'确认创建'按钮禁用", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /新建套件/ }));
      await user.type(screen.getByPlaceholderText(/套件标识/), "my-bundle");
      await user.type(screen.getByPlaceholderText(/显示名称/), "我的套件");

      const createBtn = screen.getByRole("button", { name: /确认创建/ });
      expect(createBtn).toBeDisabled();
    });

    it("成功创建套件后显示成功 toast", async () => {
      const user = userEvent.setup();
      mockCreateBundle.mockResolvedValue(undefined);
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /新建套件/ }));
      await user.type(screen.getByPlaceholderText(/套件标识/), "my-bundle");
      await user.type(screen.getByPlaceholderText(/显示名称/), "我的套件");

      // 等待分类列表加载
      await waitFor(() => {
        expect(screen.getByText("编程")).toBeInTheDocument();
      });

      // 选择一个分类
      const codingCheckbox = screen.getAllByRole("checkbox")[0];
      await user.click(codingCheckbox);

      const createBtn = screen.getByRole("button", { name: /确认创建/ });
      await user.click(createBtn);

      await waitFor(() => {
        expect(mockCreateBundle).toHaveBeenCalledOnce();
        expect(mockToastSuccess).toHaveBeenCalledWith("套件创建成功");
      });
    });
  });

  // ----------------------------------------------------------------
  // 删除套件
  // ----------------------------------------------------------------
  describe("删除套件", () => {
    beforeEach(() => {
      vi.mocked(useBundleStore).mockReturnValue({
        bundles: [mockBundle],
        bundlesLoading: false,
        bundlesError: null,
        fetchBundles: mockFetchBundles,
        createBundle: mockCreateBundle,
        updateBundle: mockUpdateBundle,
        deleteBundle: mockDeleteBundle,
      });
    });

    it("点击删除按钮显示确认对话框", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const deleteBtn = screen.getByTitle("删除");
      await user.click(deleteBtn);

      // 对话框标题（h2）
      expect(
        screen.getByRole("heading", { name: "确认删除" }),
      ).toBeInTheDocument();
      // 对话框描述
      expect(
        screen.getByText(/确定要删除分类.*前端日常开发.*吗/),
      ).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // 损坏引用处理
  // ----------------------------------------------------------------
  describe("损坏引用处理", () => {
    const brokenBundle = {
      ...mockBundle,
      categoryNames: ["coding", "deleted-category"],
      brokenCategoryNames: ["deleted-category"],
    };

    beforeEach(() => {
      vi.mocked(useBundleStore).mockReturnValue({
        bundles: [brokenBundle],
        bundlesLoading: false,
        bundlesError: null,
        fetchBundles: mockFetchBundles,
        createBundle: mockCreateBundle,
        updateBundle: mockUpdateBundle,
        deleteBundle: mockDeleteBundle,
      });
    });

    it("损坏套件显示黄色警告 Badge", async () => {
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      expect(screen.getByText("1 个分类引用已失效")).toBeInTheDocument();
    });

    it("展开损坏套件时已删除分类 Tag 显示删除线样式", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "展开" }));

      // 已删除分类显示"(已删除)"标注
      expect(screen.getByText(/deleted-category.*deleted/)).toBeInTheDocument();
    });
  });
});

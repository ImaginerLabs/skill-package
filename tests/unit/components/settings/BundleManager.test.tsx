// ============================================================
// tests/unit/components/settings/BundleManager.test.tsx
// Story 5.4: 套件管理 UI CRUD（V3）
// ============================================================

import "@testing-library/jest-dom/vitest";
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
const mockFetchSkills = vi.fn();
vi.mock("../../../../src/lib/api", () => ({
  fetchCategories: (...args: unknown[]) => mockFetchCategories(...args),
  fetchSkills: (...args: unknown[]) => mockFetchSkills(...args),
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

const mockSkills = [
  {
    id: "skill-1",
    name: "Skill 1",
    description: "描述",
    category: "coding",
    source: "",
    filePath: "",
    fileSize: 100,
    lastModified: "",
    tags: [],
  },
  {
    id: "skill-2",
    name: "Skill 2",
    description: "描述",
    category: "coding",
    source: "",
    filePath: "",
    fileSize: 100,
    lastModified: "",
    tags: [],
  },
];

// V3 格式套件
const mockBundle = {
  id: "bundle-abc123-xyz1",
  name: "frontend-dev",
  displayName: "前端日常开发",
  description: "前端开发常用分类",
  criteria: { categories: ["coding", "testing"] },
  createdAt: "2026-04-13T00:00:00.000Z",
  updatedAt: "2026-04-13T00:00:00.000Z",
  brokenCategoryNames: [],
};

describe("BundleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCategories.mockResolvedValue(mockCategories);
    mockFetchSkills.mockResolvedValue(mockSkills);
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

    it("显示套件卡片（名称、标识、条件数量）", async () => {
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });
      expect(screen.getByText("frontend-dev")).toBeInTheDocument();
      // V3 显示：条件数量 Skill
      expect(screen.getByText(/2.*Skill/)).toBeInTheDocument();
    });

    it("点击展开按钮后显示分类 Tag 列表", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const expandBtn = screen.getByRole("button", { name: "展开" });
      await user.click(expandBtn);

      expect(screen.getByText("编程")).toBeInTheDocument();
      expect(screen.getByText("测试")).toBeInTheDocument();
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

      // V3 表单：名称 placeholder
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

      // 确认创建按钮应该禁用（因为没有选择任何分类）
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
      criteria: { categories: ["coding", "deleted-category"] },
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

      expect(screen.getByText(/1.*个分类引用已失效/)).toBeInTheDocument();
    });

    it("展开损坏套件时已删除分类 Tag 显示删除标注", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "展开" }));

      // 已删除分类显示"(deleted)"标注
      expect(screen.getByText(/\(deleted\)/)).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // 编辑套件（V3 完整功能）
  // ----------------------------------------------------------------
  describe("编辑套件", () => {
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

    it("点击编辑按钮显示编辑表单", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 显示编辑表单，显示名称输入框
      expect(screen.getByPlaceholderText(/显示名称/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/描述/)).toBeInTheDocument();
    });

    it("编辑表单包含三个Tab（分类、来源、Skill）", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 验证三个Tab都存在
      expect(
        screen.getByRole("button", { name: /按分类/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /按来源/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /手动选择/ }),
      ).toBeInTheDocument();
    });

    it("可以切换到来源Tab并选择来源", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 切换到来源Tab
      await user.click(screen.getByRole("button", { name: /按来源/ }));

      // 来源Tab应该显示来源分组列表
      expect(screen.getByPlaceholderText(/搜索来源/)).toBeInTheDocument();
    });

    it("可以切换到Skill Tab并选择Skill", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 切换到Skill Tab
      await user.click(screen.getByRole("button", { name: /手动选择/ }));

      // Skill Tab应该显示Skill列表
      expect(screen.getByPlaceholderText(/搜索 Skill/)).toBeInTheDocument();
    });

    it("编辑表单显示预览计数", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 预览应该显示匹配的Skill数量
      expect(screen.getByText(/预览/)).toBeInTheDocument();
      expect(screen.getByText(/\d+.*个 Skill/)).toBeInTheDocument();
    });

    it("编辑分类Tab可以搜索分类", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 输入搜索关键词
      const searchInput = screen.getByPlaceholderText(/搜索分类/);
      await user.type(searchInput, "编程");

      // 应该只显示匹配的分类
      expect(screen.getByText("编程")).toBeInTheDocument();
    });

    it("编辑时取消按钮关闭编辑表单", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 编辑表单应该显示
      expect(screen.getByPlaceholderText(/显示名称/)).toBeInTheDocument();

      // 点击取消按钮（编辑表单的取消按钮）
      const cancelBtn = screen.getAllByRole("button", { name: /取消/ })[0];
      await user.click(cancelBtn);

      // 编辑表单应该关闭，显示套件卡片（通过验证头部存在）
      expect(
        screen.getByRole("heading", { name: "套件管理" }),
      ).toBeInTheDocument();
    });

    it("编辑后未选择任何条件时确认按钮禁用", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 取消选择所有分类（模拟清空）
      const checkboxes = screen.getAllByRole("checkbox");
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      // 确认按钮应该禁用
      const confirmBtn = screen.getByRole("button", { name: /确认创建/ });
      expect(confirmBtn).toBeDisabled();
    });

    it("成功更新套件后显示成功toast", async () => {
      const user = userEvent.setup();
      mockUpdateBundle.mockResolvedValue(undefined);

      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 修改显示名称
      const displayNameInput = screen.getByPlaceholderText(/显示名称/);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, "前端开发套件");

      // 确认按钮应该可用（因为编辑表单初始化时已经选中了原有的分类）
      const confirmBtn = screen.getByRole("button", { name: /确认创建/ });
      expect(confirmBtn).toBeEnabled();

      await user.click(confirmBtn);

      await waitFor(() => {
        expect(mockUpdateBundle).toHaveBeenCalledWith(
          "bundle-abc123-xyz1",
          expect.objectContaining({
            displayName: "前端开发套件",
          }),
        );
        expect(mockToastSuccess).toHaveBeenCalledWith("套件更新成功");
      });
    });

    it("编辑来源Tab时搜索来源", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 切换到来源Tab
      await user.click(screen.getByRole("button", { name: /按来源/ }));

      // 输入搜索关键词
      const searchInput = screen.getByPlaceholderText(/搜索来源/);
      await user.type(searchInput, "我的");

      // 应该只显示匹配的来源
      expect(screen.getByText(/我的 Skill/)).toBeInTheDocument();
    });

    it("编辑Skill Tab时搜索Skill", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 切换到Skill Tab
      await user.click(screen.getByRole("button", { name: /手动选择/ }));

      // 输入搜索关键词
      const searchInput = screen.getByPlaceholderText(/搜索 Skill/);
      await user.type(searchInput, "Skill 1");

      // 应该只显示匹配的Skill
      expect(screen.getByText("Skill 1")).toBeInTheDocument();
      expect(screen.queryByText("Skill 2")).not.toBeInTheDocument();
    });

    it("编辑时分类分组可以展开", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 默认分类分组是折叠的，需要点击展开
      const categoryGroup = screen.getByRole("button", { name: /编程/ });
      expect(categoryGroup).toBeInTheDocument();

      // 点击展开分类分组
      await user.click(categoryGroup);

      // 展开后应该显示分类下的Skill
      await waitFor(() => {
        expect(screen.getByText("Skill 1")).toBeInTheDocument();
      });
    });

    it("编辑时Tab切换正常工作", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 验证Tab可以正常切换
      await user.click(screen.getByRole("button", { name: /按来源/ }));
      expect(screen.getByPlaceholderText(/搜索来源/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /手动选择/ }));
      expect(screen.getByPlaceholderText(/搜索 Skill/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /按分类/ }));
      expect(screen.getByPlaceholderText(/搜索分类/)).toBeInTheDocument();
    });

    it("编辑时预览计数显示正确", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(screen.getByText("前端日常开发")).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 预览计数应该显示
      const previewText = screen.getByText(/\d+.*个 Skill/);
      expect(previewText).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // 新建与编辑功能一致性
  // ----------------------------------------------------------------
  describe("新建与编辑功能一致性", () => {
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

    it("新建表单和编辑表单都包含三个Tab", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      // 打开新建表单
      await user.click(screen.getByRole("button", { name: /新建套件/ }));

      // 新建表单应该有三个Tab
      expect(
        screen.getByRole("button", { name: /按分类/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /按来源/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /手动选择/ }),
      ).toBeInTheDocument();

      // 关闭新建表单
      await user.click(screen.getByRole("button", { name: /取消/ }));

      // 打开编辑表单
      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 编辑表单也应该有三个Tab
      expect(
        screen.getByRole("button", { name: /按分类/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /按来源/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /手动选择/ }),
      ).toBeInTheDocument();
    });

    it("新建表单和编辑表单都有预览功能", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      // 打开新建表单
      await user.click(screen.getByRole("button", { name: /新建套件/ }));

      // 新建表单应该有预览
      expect(screen.getByText(/预览/)).toBeInTheDocument();
      expect(screen.getByText(/\d+.*个 Skill/)).toBeInTheDocument();

      // 关闭新建表单
      await user.click(screen.getByRole("button", { name: /取消/ }));

      // 打开编辑表单
      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 编辑表单也应该有预览
      expect(screen.getByText(/预览/)).toBeInTheDocument();
      expect(screen.getByText(/\d+.*个 Skill/)).toBeInTheDocument();
    });

    it("新建表单和编辑表单都有搜索功能", async () => {
      const user = userEvent.setup();
      render(<BundleManager />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /新建套件/ }),
        ).toBeInTheDocument();
      });

      // 打开新建表单
      await user.click(screen.getByRole("button", { name: /新建套件/ }));

      // 新建表单分类Tab应该有搜索框
      expect(screen.getByPlaceholderText(/搜索分类/)).toBeInTheDocument();

      // 切换到来源Tab
      await user.click(screen.getByRole("button", { name: /按来源/ }));
      expect(screen.getByPlaceholderText(/搜索来源/)).toBeInTheDocument();

      // 切换到Skill Tab
      await user.click(screen.getByRole("button", { name: /手动选择/ }));
      expect(screen.getByPlaceholderText(/搜索 Skill/)).toBeInTheDocument();

      // 关闭新建表单
      await user.click(screen.getByRole("button", { name: /取消/ }));

      // 打开编辑表单
      const editBtn = screen.getByTitle("编辑");
      await user.click(editBtn);

      // 编辑表单分类Tab应该有搜索框
      expect(screen.getByPlaceholderText(/搜索分类/)).toBeInTheDocument();

      // 切换到来源Tab
      await user.click(screen.getByRole("button", { name: /按来源/ }));
      expect(screen.getByPlaceholderText(/搜索来源/)).toBeInTheDocument();

      // 切换到Skill Tab
      await user.click(screen.getByRole("button", { name: /手动选择/ }));
      expect(screen.getByPlaceholderText(/搜索 Skill/)).toBeInTheDocument();
    });
  });
});

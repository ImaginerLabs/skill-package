// ============================================================
// tests/unit/components/settings/CategoryManager.batch.test.tsx
// Story 3.4: 分类管理批量操作
// 验收标准：
//   - 点击分类卡片可展开，显示该分类下的 Skill 列表
//   - 选中 Skill 后出现批量操作工具栏
//   - 点击"移出此分类"调用 moveSkillCategory(id, "uncategorized")
//   - 批量操作成功后显示成功 toast 并刷新数据
//   - 批量操作失败时显示错误 toast
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

// Mock API
const mockFetchCategories = vi.fn();
const mockFetchSkills = vi.fn();
const mockMoveSkillCategory = vi.fn();
const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockDeleteCategory = vi.fn();

vi.mock("../../../../src/lib/api", () => ({
  fetchCategories: (...args: unknown[]) => mockFetchCategories(...args),
  fetchSkills: (...args: unknown[]) => mockFetchSkills(...args),
  moveSkillCategory: (...args: unknown[]) => mockMoveSkillCategory(...args),
  createCategory: (...args: unknown[]) => mockCreateCategory(...args),
  updateCategory: (...args: unknown[]) => mockUpdateCategory(...args),
  deleteCategory: (...args: unknown[]) => mockDeleteCategory(...args),
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

import CategoryManager from "../../../../src/components/settings/CategoryManager";

// 测试数据
const mockCategories = [
  {
    name: "development",
    displayName: "编程开发",
    description: "开发相关",
    skillCount: 2,
  },
  {
    name: "writing",
    displayName: "写作",
    description: "",
    skillCount: 0,
  },
];

const mockSkills = [
  {
    id: "s1",
    name: "代码审查",
    description: "自动化代码审查",
    category: "development",
    type: "skill" as const,
    tags: [],
    filePath: "/skills/code-review.md",
    lastModified: "2024-06-15T10:00:00.000Z",
  },
  {
    id: "s2",
    name: "单元测试",
    description: "生成单元测试",
    category: "development",
    type: "skill" as const,
    tags: [],
    filePath: "/skills/unit-test.md",
    lastModified: "2024-06-15T10:00:00.000Z",
  },
];

describe("CategoryManager — 批量操作 (Story 3.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCategories.mockResolvedValue(mockCategories);
    mockFetchSkills.mockResolvedValue(mockSkills);
    mockMoveSkillCategory.mockResolvedValue(undefined);
  });

  // ─────────────────────────────────────────────
  // 分类展开/折叠
  // ─────────────────────────────────────────────
  describe("分类展开/折叠", () => {
    it("初始状态下分类列表已加载，Skill 列表未展开", async () => {
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      // Skill 列表未展开，不显示 Skill 名称
      expect(screen.queryByText("代码审查")).not.toBeInTheDocument();
    });

    it("点击分类卡片后展开，显示该分类下的 Skill 列表", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      // 点击展开按钮（ChevronRight 按钮）
      const expandBtn = screen.getAllByRole("button", { name: "展开" })[0];
      await user.click(expandBtn);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
        expect(screen.getByText("单元测试")).toBeInTheDocument();
      });
    });

    it("再次点击已展开的分类，折叠 Skill 列表", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      // 展开
      const expandBtn = screen.getAllByRole("button", { name: "展开" })[0];
      await user.click(expandBtn);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 折叠
      const collapseBtn = screen.getByRole("button", { name: "折叠" });
      await user.click(collapseBtn);

      await waitFor(() => {
        expect(screen.queryByText("代码审查")).not.toBeInTheDocument();
      });
    });

    it("空分类展开后显示'该分类下暂无 Skill'提示", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("写作")).toBeInTheDocument();
      });

      // 点击写作分类的展开按钮
      const expandBtns = screen.getAllByRole("button", { name: "展开" });
      await user.click(expandBtns[1]); // 第二个分类（写作）

      await waitFor(() => {
        expect(screen.getByText("该分类下暂无 Skill")).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────────────────────────
  // 批量选中
  // ─────────────────────────────────────────────
  describe("批量选中", () => {
    it("展开后显示全选 Checkbox 和各 Skill 的 Checkbox", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        // 全选 checkbox + 2 个 Skill checkbox = 3 个
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("未选中任何 Skill 时，不显示批量操作按钮", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 未选中时不显示移出按钮
      expect(screen.queryByText(/移出此分类/)).not.toBeInTheDocument();
    });

    it("选中一个 Skill 后，出现批量操作工具栏", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 选中第一个 Skill（代码审查）的 checkbox
      const skillCheckbox = screen.getByRole("checkbox", {
        name: /代码审查/,
      });
      await user.click(skillCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(1\)/)).toBeInTheDocument();
        expect(screen.getByText("已选 1 个")).toBeInTheDocument();
      });
    });

    it("全选后，所有 Skill 被选中，显示正确数量", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 点击全选 checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /全选/,
      });
      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(screen.getByText("已选 2 个")).toBeInTheDocument();
        expect(screen.getByText(/移出此分类 \(2\)/)).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────────────────────────
  // 批量移出分类
  // ─────────────────────────────────────────────
  describe("批量移出分类", () => {
    it("点击'移出此分类'后调用 moveSkillCategory(id, 'uncategorized')", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 选中代码审查
      await user.click(screen.getByRole("checkbox", { name: /代码审查/ }));

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(1\)/)).toBeInTheDocument();
      });

      // 点击移出
      await user.click(screen.getByText(/移出此分类 \(1\)/));

      await waitFor(() => {
        expect(mockMoveSkillCategory).toHaveBeenCalledWith(
          "s1",
          "uncategorized",
        );
      });
    });

    it("批量移出成功后显示成功 toast", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("checkbox", { name: /代码审查/ }));

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(1\)/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/移出此分类 \(1\)/));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "已将 1 个 Skill 移出分类",
        );
      });
    });

    it("批量移出成功后刷新数据（重新调用 fetchCategories 和 fetchSkills）", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      // 记录初始调用次数
      const initialCallCount = mockFetchCategories.mock.calls.length;

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("checkbox", { name: /代码审查/ }));

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(1\)/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/移出此分类 \(1\)/));

      await waitFor(() => {
        // 成功后应重新加载数据
        expect(mockFetchCategories.mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });

    it("批量移出失败时显示错误 toast", async () => {
      mockMoveSkillCategory.mockRejectedValue(new Error("权限不足"));
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("checkbox", { name: /代码审查/ }));

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(1\)/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/移出此分类 \(1\)/));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("权限不足");
      });
    });

    it("批量移出 2 个 Skill 时，对每个 id 都调用 moveSkillCategory", async () => {
      const user = userEvent.setup();
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("编程开发")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "展开" })[0]);

      await waitFor(() => {
        expect(screen.getByText("代码审查")).toBeInTheDocument();
      });

      // 全选
      await user.click(screen.getByRole("checkbox", { name: /全选/ }));

      await waitFor(() => {
        expect(screen.getByText(/移出此分类 \(2\)/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/移出此分类 \(2\)/));

      await waitFor(() => {
        expect(mockMoveSkillCategory).toHaveBeenCalledTimes(2);
        expect(mockMoveSkillCategory).toHaveBeenCalledWith(
          "s1",
          "uncategorized",
        );
        expect(mockMoveSkillCategory).toHaveBeenCalledWith(
          "s2",
          "uncategorized",
        );
      });
    });
  });

  // ─────────────────────────────────────────────
  // 数据加载
  // ─────────────────────────────────────────────
  describe("数据加载", () => {
    it("初始化时并行调用 fetchCategories 和 fetchSkills", async () => {
      render(<CategoryManager />);

      await waitFor(() => {
        expect(mockFetchCategories).toHaveBeenCalledTimes(1);
        expect(mockFetchSkills).toHaveBeenCalledTimes(1);
      });
    });

    it("加载失败时显示错误信息", async () => {
      mockFetchCategories.mockRejectedValue(new Error("网络错误"));
      render(<CategoryManager />);

      await waitFor(() => {
        expect(screen.getByText("网络错误")).toBeInTheDocument();
      });
    });
  });
});

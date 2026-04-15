import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next（使用 zh 翻译资源）
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
  return {
    useTranslation: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        let text = resolve(key, zh as unknown as Record<string, unknown>);
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
          }
        }
        return text;
      },
      i18n: { language: "zh", changeLanguage: vi.fn() },
    }),
  };
});

// Mock fetchSkillBundles API
import { fetchSkillBundles } from "../../../../src/lib/api";
vi.mock("../../../../src/lib/api", () => ({
  fetchSkillBundles: vi.fn().mockResolvedValue([]),
}));

// Mock stores
const mockToggleSkillSelection = vi.fn();
const mockSelectByCategory = vi.fn();
const mockClearSelection = vi.fn();
let mockSelectedSkillIds: string[] = [];

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    selectedSkillIds: mockSelectedSkillIds,
    toggleSkillSelection: mockToggleSkillSelection,
    selectByCategory: mockSelectByCategory,
    clearSelection: mockClearSelection,
  })),
}));

const mockFetchSkills = vi.fn();
let mockSkills: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  type?: "workflow";
  filePath: string;
  fileSize: number;
  lastModified: string;
}> = [];
let mockCategories: Array<{
  name: string;
  displayName: string;
  skillCount: number;
}> = [];

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: mockSkills,
    categories: mockCategories,
    loading: false,
    fetchSkills: mockFetchSkills,
  })),
}));

import SyncSkillSelector from "../../../../src/components/sync/SyncSkillSelector";

describe("SyncSkillSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedSkillIds = [];
    mockSkills = [
      {
        id: "skill-a",
        name: "Skill A",
        description: "描述 A",
        category: "general",
        tags: [],
        filePath: "general/skill-a.md",
        fileSize: 100,
        lastModified: "2026-01-01T00:00:00Z",
      },
      {
        id: "skill-b",
        name: "Skill B",
        description: "描述 B",
        category: "general",
        tags: [],
        filePath: "general/skill-b.md",
        fileSize: 200,
        lastModified: "2026-01-01T00:00:00Z",
      },
      {
        id: "wf-1",
        name: "Workflow 1",
        description: "工作流描述",
        category: "workflows",
        tags: [],
        type: "workflow",
        filePath: "workflows/wf-1.md",
        fileSize: 300,
        lastModified: "2026-01-01T00:00:00Z",
      },
    ];
    mockCategories = [
      { name: "general", displayName: "通用", skillCount: 2 },
      { name: "workflows", displayName: "工作流", skillCount: 1 },
    ];
  });

  describe("渲染", () => {
    it("渲染标题和搜索框", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText("选择 Skill")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("搜索 Skill...")).toBeInTheDocument();
    });

    it("按分类分组渲染 Skill 列表", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText("通用")).toBeInTheDocument();
      expect(screen.getByText("工作流")).toBeInTheDocument();
      expect(screen.getByText("Skill A")).toBeInTheDocument();
      expect(screen.getByText("Skill B")).toBeInTheDocument();
      expect(screen.getByText("Workflow 1")).toBeInTheDocument();
    });

    it("显示 Skill 描述", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText("描述 A")).toBeInTheDocument();
      expect(screen.getByText("工作流描述")).toBeInTheDocument();
    });

    it("workflow 类型显示 badge 标识", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText("workflow")).toBeInTheDocument();
    });

    it("显示分类下 Skill 数量", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText("2")).toBeInTheDocument(); // general 分类
      expect(screen.getByText("1")).toBeInTheDocument(); // workflows 分类
    });

    it("显示全选按钮", () => {
      render(<SyncSkillSelector />);

      expect(screen.getByText(/全选/)).toBeInTheDocument();
    });
  });

  describe("选择状态", () => {
    it("有选中时显示已选数量 badge", () => {
      mockSelectedSkillIds = ["skill-a", "skill-b"];
      render(<SyncSkillSelector />);

      expect(screen.getByText("已选 2")).toBeInTheDocument();
    });

    it("有选中时显示清除选择按钮", () => {
      mockSelectedSkillIds = ["skill-a"];
      render(<SyncSkillSelector />);

      expect(screen.getByText("清除选择")).toBeInTheDocument();
    });

    it("无选中时不显示已选 badge 和清除按钮", () => {
      mockSelectedSkillIds = [];
      render(<SyncSkillSelector />);

      expect(screen.queryByText(/已选/)).not.toBeInTheDocument();
      expect(screen.queryByText("清除选择")).not.toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击 Skill 触发 toggleSkillSelection", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const checkbox = screen.getByLabelText("选择 Skill A");
      await user.click(checkbox);

      expect(mockToggleSkillSelection).toHaveBeenCalledWith("skill-a");
    });

    it("点击清除选择调用 clearSelection", async () => {
      const user = userEvent.setup();
      mockSelectedSkillIds = ["skill-a"];
      render(<SyncSkillSelector />);

      await user.click(screen.getByText("清除选择"));

      expect(mockClearSelection).toHaveBeenCalled();
    });

    it("点击分类标题触发批量选择", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 点击"通用"分类标题
      await user.click(screen.getByLabelText("选择分类 通用 下所有 Skill"));

      expect(mockSelectByCategory).toHaveBeenCalled();
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      expect(calledWith).toContain("skill-a");
      expect(calledWith).toContain("skill-b");
    });

    it("搜索过滤 Skill 列表", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const searchInput = screen.getByPlaceholderText("搜索 Skill...");
      await user.type(searchInput, "Workflow");

      // Workflow 1 应该可见
      expect(screen.getByText("Workflow 1")).toBeInTheDocument();
    });
  });

  describe("空状态", () => {
    it("无 Skill 时显示空状态", () => {
      mockSkills = [];
      render(<SyncSkillSelector />);

      expect(screen.getByText("暂无可用 Skill")).toBeInTheDocument();
    });
  });

  describe("分类折叠/展开", () => {
    it("初始状态下分类内容默认折叠，Skill 不可见", () => {
      render(<SyncSkillSelector />);

      // Skill 列表容器有 hidden class，内容不可见
      const skillA = screen.getByText("Skill A");
      expect(skillA.closest(".hidden")).not.toBeNull();
    });

    it("点击折叠箭头可展开分类，Skill 变为可见", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 点击"通用"分类的展开箭头
      await user.click(screen.getByLabelText("展开 通用"));

      // Skill A 所在容器不再有 hidden class
      const skillA = screen.getByText("Skill A");
      expect(skillA.closest(".hidden")).toBeNull();
    });

    it("展开后再次点击折叠箭头可重新折叠", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 先展开
      await user.click(screen.getByLabelText("展开 通用"));
      // 再折叠
      await user.click(screen.getByLabelText("折叠 通用"));

      const skillA = screen.getByText("Skill A");
      expect(skillA.closest(".hidden")).not.toBeNull();
    });

    it("搜索时自动展开所有分类，Skill 变为可见", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const searchInput = screen.getByPlaceholderText("搜索 Skill...");
      await user.type(searchInput, "Skill");

      // 搜索后分类展开，Skill A 可见
      const skillA = screen.getByText("Skill A");
      expect(skillA.closest(".hidden")).toBeNull();
    });

    it("清空搜索词后分类重新折叠", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const searchInput = screen.getByPlaceholderText("搜索 Skill...");
      // 先输入搜索词展开
      await user.type(searchInput, "Skill");
      // 再清空
      await user.clear(searchInput);

      const skillA = screen.getByText("Skill A");
      expect(skillA.closest(".hidden")).not.toBeNull();
    });

    it("折叠箭头和分类勾选是独立的按钮", () => {
      render(<SyncSkillSelector />);

      // 折叠箭头按钮
      expect(screen.getByLabelText("展开 通用")).toBeInTheDocument();
      // 勾选按钮
      expect(
        screen.getByLabelText("选择分类 通用 下所有 Skill"),
      ).toBeInTheDocument();
    });

    it("折叠状态下点击分类勾选按钮仍可批量选中该分类 Skill", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 不展开，直接点击勾选区
      await user.click(screen.getByLabelText("选择分类 通用 下所有 Skill"));

      expect(mockSelectByCategory).toHaveBeenCalled();
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      expect(calledWith).toContain("skill-a");
      expect(calledWith).toContain("skill-b");
    });

    it("多个分类可独立展开/折叠", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 只展开"通用"
      await user.click(screen.getByLabelText("展开 通用"));

      // 通用分类下 Skill 可见
      expect(screen.getByText("Skill A").closest(".hidden")).toBeNull();
      // 工作流分类下 Skill 仍折叠
      expect(screen.getByText("Workflow 1").closest(".hidden")).not.toBeNull();
    });
  });

  describe("套件选择 — 默认套件全选修复 (V2-1.1)", () => {
    const defaultBundle = {
      id: "bundle-default",
      name: "default",
      displayName: "默认套件",
      description: "包含所有出厂预设分类的完整技能组合",
      categoryNames: ["coding", "workflows"],
      createdAt: "2026-04-14T04:01:28.856Z",
      updatedAt: "2026-04-14T04:01:28.856Z",
      brokenCategoryNames: [],
    };

    beforeEach(() => {
      // 设置包含外部 Skill 的 mock 数据
      mockSkills = [
        {
          id: "code-review",
          name: "Code Review",
          description: "代码审查",
          category: "coding",
          tags: [],
          filePath: "coding/code-review.md",
          fileSize: 100,
          lastModified: "2026-01-01T00:00:00Z",
        },
        {
          id: "pdf-reader",
          name: "PDF Reader",
          description: "PDF 阅读",
          category: "coding",
          tags: [],
          filePath: "coding/pdf-reader.md",
          fileSize: 100,
          lastModified: "2026-01-01T00:00:00Z",
        },
        {
          id: "wf-commit",
          name: "Pre-Commit",
          description: "提交前检查",
          category: "workflows",
          tags: [],
          type: "workflow",
          filePath: "workflows/wf-commit.md",
          fileSize: 200,
          lastModified: "2026-01-01T00:00:00Z",
        },
      ];
      mockCategories = [
        { name: "coding", displayName: "编程开发", skillCount: 2 },
        { name: "workflows", displayName: "工作流", skillCount: 1 },
      ];
      // Mock fetchSkillBundles 返回默认套件
      vi.mocked(fetchSkillBundles).mockResolvedValue([defaultBundle]);
    });

    it("点击默认套件后所有分类下的 Skill 被选中（包括外部 Skill）", async () => {
      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      // 等待套件加载完成
      const bundleButton = await screen.findByText("默认套件");
      await user.click(bundleButton);

      expect(mockSelectByCategory).toHaveBeenCalledTimes(1);
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      // 应包含所有 3 个 Skill ID
      expect(calledWith).toContain("code-review");
      expect(calledWith).toContain("pdf-reader");
      expect(calledWith).toContain("wf-commit");
      expect(calledWith).toHaveLength(3);
    });

    it("分类名大小写不一致时仍能正确匹配（toLowerCase 归一化）", async () => {
      // 模拟外部 Skill 的 category 为大写开头
      mockSkills = [
        {
          id: "ext-skill-1",
          name: "External Skill",
          description: "外部 Skill",
          category: "Coding", // 大写开头
          tags: [],
          filePath: "Coding/ext-skill-1.md",
          fileSize: 100,
          lastModified: "2026-01-01T00:00:00Z",
        },
        {
          id: "local-skill-1",
          name: "Local Skill",
          description: "本地 Skill",
          category: "coding", // 小写
          tags: [],
          filePath: "coding/local-skill-1.md",
          fileSize: 100,
          lastModified: "2026-01-01T00:00:00Z",
        },
      ];
      mockCategories = [
        { name: "coding", displayName: "编程开发", skillCount: 1 },
        { name: "Coding", displayName: "Coding", skillCount: 1 },
      ];

      // 套件 categoryNames 使用小写
      const bundleWithLowerCase = {
        ...defaultBundle,
        categoryNames: ["coding"],
      };
      vi.mocked(fetchSkillBundles).mockResolvedValue([bundleWithLowerCase]);

      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const bundleButton = await screen.findByText("默认套件");
      await user.click(bundleButton);

      expect(mockSelectByCategory).toHaveBeenCalledTimes(1);
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      // 两个 Skill 都应被选中（大小写归一化后匹配）
      expect(calledWith).toContain("ext-skill-1");
      expect(calledWith).toContain("local-skill-1");
      expect(calledWith).toHaveLength(2);
    });

    it("再次点击已全选的套件取消全选（切换逻辑）", async () => {
      // 模拟所有 Skill 已被选中
      mockSelectedSkillIds = ["code-review", "pdf-reader", "wf-commit"];

      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const bundleButton = await screen.findByText("默认套件");
      await user.click(bundleButton);

      expect(mockSelectByCategory).toHaveBeenCalledTimes(1);
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      // 取消全选后应为空数组
      expect(calledWith).toHaveLength(0);
    });

    it("套件包含损坏引用时正确跳过，不影响有效分类", async () => {
      const bundleWithBroken = {
        ...defaultBundle,
        categoryNames: ["coding", "deleted-category"],
        brokenCategoryNames: ["deleted-category"],
      };
      vi.mocked(fetchSkillBundles).mockResolvedValue([bundleWithBroken]);

      const user = userEvent.setup();
      render(<SyncSkillSelector />);

      const bundleButton = await screen.findByText("默认套件");
      await user.click(bundleButton);

      expect(mockSelectByCategory).toHaveBeenCalledTimes(1);
      const calledWith = mockSelectByCategory.mock.calls[0][0] as string[];
      // 只包含 coding 分类下的 Skill，deleted-category 被跳过
      expect(calledWith).toContain("code-review");
      expect(calledWith).toContain("pdf-reader");
      expect(calledWith).toHaveLength(2);
    });

    it("套件选中状态正确反映（全选时显示 all 状态）", async () => {
      // 模拟所有 Skill 已被选中
      mockSelectedSkillIds = ["code-review", "pdf-reader", "wf-commit"];

      render(<SyncSkillSelector />);

      // 等待套件按钮渲染
      const bundleButton = await screen.findByText("默认套件");
      // 全选状态下按钮应有 primary 背景色 class
      expect(bundleButton.closest("button")).toHaveClass(
        "bg-[hsl(var(--primary))]",
      );
    });
  });
});

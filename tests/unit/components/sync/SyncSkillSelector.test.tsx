import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
});

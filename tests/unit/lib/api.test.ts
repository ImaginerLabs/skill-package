import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  addPathPreset,
  addSyncTarget,
  cleanupSourceFiles,
  createCategory,
  createWorkflow,
  deleteCategory,
  deletePathPreset,
  deleteSkill,
  deleteSyncTarget,
  deleteWorkflow,
  detectCodeBuddy,
  fetchCategories,
  fetchPathPresets,
  fetchSkillById,
  fetchSkills,
  fetchSyncTargets,
  fetchWorkflowDetail,
  fetchWorkflows,
  importFiles,
  moveSkillCategory,
  previewWorkflow,
  pushSync,
  refreshSkills,
  scanDirectory,
  updateCategory,
  updatePathPreset,
  updateSkillMeta,
  updateSyncTarget,
  updateWorkflow,
  validateSyncPath,
} from "../../../src/lib/api";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock 成功响应
const mockSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

// Mock 错误响应
const mockErrorResponse = (code: string, message: string) => ({
  success: false as const,
  error: { code, message },
});

describe("api.ts", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchSkills", () => {
    it("成功获取 Skill 列表", async () => {
      const mockSkills = [
        {
          id: "skill-1",
          name: "React 组件抽取",
          description: "描述",
          category: "frontend",
          tags: ["react"],
          filePath: "skills/skill-1.md",
          fileSize: 1024,
          lastModified: "2024-01-01T00:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockSkills),
      });

      const result = await fetchSkills();
      expect(result).toEqual(mockSkills);
      expect(mockFetch).toHaveBeenCalledWith("/api/skills", expect.any(Object));
    });

    it("API 错误时抛出 ApiError", async () => {
      // 设置 mock 返回错误响应
      mockFetch.mockResolvedValue({
        json: async () => mockErrorResponse("FETCH_ERROR", "获取失败"),
      });

      // 第一次调用验证抛出错误
      try {
        await fetchSkills();
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe("FETCH_ERROR");
        expect((error as ApiError).message).toBe("获取失败");
      }
    });
  });

  describe("fetchSkillById", () => {
    it("成功获取单个 Skill", async () => {
      const mockSkill = {
        id: "skill-1",
        name: "React 组件抽取",
        description: "描述",
        category: "frontend",
        tags: ["react"],
        filePath: "skills/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-01T00:00:00Z",
        content: "# 内容",
        rawContent: "---\nname: test\n---\n# 内容",
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockSkill),
      });

      const result = await fetchSkillById("skill-1");
      expect(result).toEqual(mockSkill);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/skills/skill-1",
        expect.any(Object),
      );
    });

    it("特殊字符 ID 正确编码", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse({ id: "skill-with spaces" }),
      });

      await fetchSkillById("skill with spaces");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/skills/skill%20with%20spaces",
        expect.any(Object),
      );
    });

    it("Skill 不存在时抛出错误", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockErrorResponse("SKILL_NOT_FOUND", "Skill 不存在"),
      });

      await expect(fetchSkillById("non-existent")).rejects.toThrow(ApiError);
    });
  });

  describe("fetchCategories", () => {
    it("成功获取分类列表", async () => {
      const mockCategories = [
        { name: "frontend", displayName: "前端开发", skillCount: 10 },
        { name: "backend", displayName: "后端开发", skillCount: 5 },
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockCategories),
      });

      const result = await fetchCategories();
      expect(result).toEqual(mockCategories);
    });
  });

  describe("createCategory", () => {
    it("成功创建分类", async () => {
      const newCategory = {
        name: "testing",
        displayName: "测试",
        description: "测试相关技能",
      };

      const mockResponse = {
        name: "testing",
        displayName: "测试",
        description: "测试相关技能",
        skillCount: 0,
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await createCategory(newCategory);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/categories", {
        method: "POST",
        body: JSON.stringify(newCategory),
        headers: expect.any(Object),
      });
    });
  });

  describe("updateCategory", () => {
    it("成功更新分类", async () => {
      const updateData = { displayName: "新名称" };
      const mockResponse = {
        name: "frontend",
        displayName: "新名称",
        skillCount: 10,
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await updateCategory("frontend", updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteCategory", () => {
    it("成功删除分类", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteCategory("old-category")).resolves.toBeUndefined();
    });
  });

  describe("updateSkillMeta", () => {
    it("成功更新 Skill 元数据", async () => {
      const updateData = {
        name: "新名称",
        description: "新描述",
        tags: ["new-tag"],
      };

      const mockResponse = {
        id: "skill-1",
        name: "新名称",
        description: "新描述",
        category: "frontend",
        tags: ["new-tag"],
        filePath: "skills/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-02T00:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await updateSkillMeta("skill-1", updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("moveSkillCategory", () => {
    it("成功移动 Skill 到其他分类", async () => {
      const mockResponse = {
        id: "skill-1",
        name: "React 组件抽取",
        category: "backend", // 移动后的分类
        filePath: "skills/backend/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-02T00:00:00Z",
        description: "",
        tags: [],
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await moveSkillCategory("skill-1", "backend");
      expect(result.category).toBe("backend");
    });
  });

  describe("deleteSkill", () => {
    it("成功删除 Skill", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteSkill("skill-1")).resolves.toBeUndefined();
    });
  });

  describe("refreshSkills", () => {
    it("成功触发刷新", async () => {
      const mockResponse = { total: 10, success: 9, errors: 1 };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await refreshSkills();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/refresh", {
        method: "POST",
        headers: expect.any(Object),
      });
    });
  });

  describe("ApiError", () => {
    it("正确构造错误对象", () => {
      const error = new ApiError("TEST_ERROR", "测试错误", { detail: "info" });

      expect(error.name).toBe("ApiError");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("测试错误");
      expect(error.details).toEqual({ detail: "info" });
    });
  });

  // ---- Import API ----

  describe("scanDirectory", () => {
    it("成功扫描目录", async () => {
      const mockResult = {
        files: [{ absolutePath: "/tmp/skill.md", name: "skill", size: 512 }],
        total: 1,
        scanRoot: "/tmp",
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await scanDirectory("/tmp");
      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/import/scan",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("不传路径时也能调用", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          mockSuccessResponse({ files: [], total: 0, scanRoot: "" }),
      });
      await scanDirectory();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/import/scan",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("importFiles", () => {
    it("成功导入文件", async () => {
      const mockResult = { imported: 2, skipped: 0, errors: [] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const items = [{ absolutePath: "/tmp/a.md", name: "a" }];
      const result = await importFiles(items, "frontend");
      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/import/execute",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("detectCodeBuddy", () => {
    it("成功检测 CodeBuddy 目录", async () => {
      const mockResult = {
        detected: true,
        path: "/home/.codebuddy/skills",
        fileCount: 5,
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await detectCodeBuddy();
      expect(result.detected).toBe(true);
      expect(result.fileCount).toBe(5);
    });
  });

  describe("cleanupSourceFiles", () => {
    it("成功清理源文件", async () => {
      const mockResult = { total: 3, success: 3, failed: 0, errors: [] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await cleanupSourceFiles([
        "/tmp/a.md",
        "/tmp/b.md",
        "/tmp/c.md",
      ]);
      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
    });

    it("部分清理失败时返回错误列表", async () => {
      const mockResult = {
        total: 2,
        success: 1,
        failed: 1,
        errors: ["无法删除 /tmp/b.md"],
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await cleanupSourceFiles(["/tmp/a.md", "/tmp/b.md"]);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ---- Workflow API ----

  describe("fetchWorkflows", () => {
    it("成功获取工作流列表", async () => {
      const mockList = [
        {
          id: "wf-1",
          name: "代码审查",
          description: "自动化代码审查",
          filePath: "skills/workflows/code-review.md",
        },
      ];
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockList),
      });

      const result = await fetchWorkflows();
      expect(result).toEqual(mockList);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows",
        expect.any(Object),
      );
    });
  });

  describe("fetchWorkflowDetail", () => {
    it("成功获取工作流详情（含 steps）", async () => {
      const mockDetail = {
        id: "wf-1",
        name: "代码审查",
        description: "自动化代码审查",
        filePath: "skills/workflows/code-review.md",
        steps: [
          { skillId: "skill-1", skillName: "审查", order: 1, description: "" },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockDetail),
      });

      const result = await fetchWorkflowDetail("wf-1");
      expect(result.steps).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows/wf-1",
        expect.any(Object),
      );
    });

    it("ID 含特殊字符时正确编码", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          mockSuccessResponse({
            id: "wf 1",
            name: "",
            description: "",
            filePath: "",
            steps: [],
          }),
      });
      await fetchWorkflowDetail("wf 1");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows/wf%201",
        expect.any(Object),
      );
    });
  });

  describe("createWorkflow", () => {
    it("成功创建工作流", async () => {
      const workflow = { name: "新工作流", description: "描述", steps: [] };
      const mockResult = { id: "wf-new", filePath: "skills/workflows/new.md" };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await createWorkflow(workflow);
      expect(result.id).toBe("wf-new");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("previewWorkflow", () => {
    it("成功预览工作流内容", async () => {
      const workflow = { name: "预览工作流", description: "", steps: [] };
      const mockResult = { content: "# 预览工作流\n\n描述" };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await previewWorkflow(workflow);
      expect(result.content).toContain("预览工作流");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows/preview",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("updateWorkflow", () => {
    it("成功更新工作流", async () => {
      const workflow = { name: "更新后", description: "", steps: [] };
      const mockResult = {
        id: "wf-1",
        filePath: "skills/workflows/updated.md",
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await updateWorkflow("wf-1", workflow);
      expect(result.id).toBe("wf-1");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows/wf-1",
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });

  describe("deleteWorkflow", () => {
    it("成功删除工作流", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteWorkflow("wf-1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/workflows/wf-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  // ---- Sync Target API ----

  describe("fetchSyncTargets", () => {
    it("成功获取同步目标列表", async () => {
      const mockTargets = [
        { id: "t1", name: "项目A", path: "/tmp/a", enabled: true },
      ];
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockTargets),
      });

      const result = await fetchSyncTargets();
      expect(result).toEqual(mockTargets);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sync/targets",
        expect.any(Object),
      );
    });
  });

  describe("addSyncTarget", () => {
    it("成功添加同步目标", async () => {
      const mockTarget = {
        id: "t2",
        name: "项目B",
        path: "/tmp/b",
        enabled: true,
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockTarget),
      });

      const result = await addSyncTarget({ name: "项目B", path: "/tmp/b" });
      expect(result.id).toBe("t2");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sync/targets",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("updateSyncTarget", () => {
    it("成功更新同步目标", async () => {
      const mockTarget = {
        id: "t1",
        name: "新名称",
        path: "/tmp/a",
        enabled: false,
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockTarget),
      });

      const result = await updateSyncTarget("t1", {
        name: "新名称",
        enabled: false,
      });
      expect(result.name).toBe("新名称");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sync/targets/t1",
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });

  describe("deleteSyncTarget", () => {
    it("成功删除同步目标", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteSyncTarget("t1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sync/targets/t1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("validateSyncPath", () => {
    it("路径存在且可写时返回正确状态", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse({ exists: true, writable: true }),
      });

      const result = await validateSyncPath("/tmp/valid");
      expect(result.exists).toBe(true);
      expect(result.writable).toBe(true);
    });

    it("路径不存在时返回 exists: false", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          mockSuccessResponse({ exists: false, writable: false }),
      });

      const result = await validateSyncPath("/tmp/nonexistent");
      expect(result.exists).toBe(false);
    });
  });

  // ---- Sync Push API ----

  describe("pushSync", () => {
    it("成功推送同步", async () => {
      const mockResult = {
        total: 2,
        success: 2,
        failed: 0,
        results: [
          { skillId: "s1", status: "copied" },
          { skillId: "s2", status: "copied" },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      const result = await pushSync(["s1", "s2"]);
      expect(result.success).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sync/push",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("指定 targetIds 时正确传参", async () => {
      const mockResult = { total: 1, success: 1, failed: 0, results: [] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResult),
      });

      await pushSync(["s1"], ["t1"]);
      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(callBody.targetIds).toEqual(["t1"]);
    });

    it("推送失败时抛出 ApiError", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockErrorResponse("SYNC_FAILED", "同步失败"),
      });

      await expect(pushSync(["s1"])).rejects.toThrow(ApiError);
    });
  });

  // ---- Path Preset API ----

  describe("fetchPathPresets", () => {
    it("成功获取路径预设列表", async () => {
      const mockPresets = [{ id: "p1", path: "/tmp/preset", label: "预设A" }];
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockPresets),
      });

      const result = await fetchPathPresets();
      expect(result).toEqual(mockPresets);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/path-presets",
        expect.any(Object),
      );
    });
  });

  describe("addPathPreset", () => {
    it("成功添加路径预设", async () => {
      const mockPreset = { id: "p2", path: "/tmp/new", label: "新预设" };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockPreset),
      });

      const result = await addPathPreset({ path: "/tmp/new", label: "新预设" });
      expect(result.id).toBe("p2");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/path-presets",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("updatePathPreset", () => {
    it("成功更新路径预设", async () => {
      const mockPreset = { id: "p1", path: "/tmp/updated", label: "更新后" };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockPreset),
      });

      const result = await updatePathPreset("p1", { label: "更新后" });
      expect(result.label).toBe("更新后");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/path-presets/p1",
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });

  describe("deletePathPreset", () => {
    it("成功删除路径预设", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deletePathPreset("p1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/path-presets/p1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});

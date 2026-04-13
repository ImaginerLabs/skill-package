/**
 * 套件 API 集成测试
 * 使用 Supertest 测试 Express API 端点
 * Mock 服务层，专注验证 HTTP 层（路由、中间件、请求/响应格式）
 */

import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock bundleService — 在 createApp 导入之前
vi.mock("../../../server/services/bundleService", () => ({
  getBundles: vi.fn(),
  addBundle: vi.fn(),
  updateBundle: vi.fn(),
  removeBundle: vi.fn(),
  applyBundle: vi.fn(),
}));

// Mock 其他依赖服务（createApp 需要）
vi.mock("../../../server/services/skillService", () => ({
  getAllSkills: vi.fn(),
  getSkillMeta: vi.fn(),
  getSkillFull: vi.fn(),
  getParseErrors: vi.fn(),
  refreshSkillCache: vi.fn(),
  initializeSkillCache: vi.fn(),
  deleteSkill: vi.fn(),
  updateSkillMeta: vi.fn(),
  moveSkillToCategory: vi.fn(),
  getSkillsRoot: vi.fn().mockReturnValue("/mock/skills"),
}));

vi.mock("../../../server/services/categoryService", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

vi.mock("../../../server/services/configService", () => ({
  loadConfig: vi.fn(),
  loadSettings: vi.fn(),
  loadCategories: vi.fn(),
}));

vi.mock("../../../server/services/syncService", () => ({
  getSyncTargets: vi.fn(),
  addSyncTarget: vi.fn(),
  updateSyncTarget: vi.fn(),
  removeSyncTarget: vi.fn(),
  validateSyncPath: vi.fn(),
  pushSync: vi.fn(),
}));

vi.mock("../../../server/services/pathPresetService", () => ({
  getPathPresets: vi.fn(),
  addPathPreset: vi.fn(),
  updatePathPreset: vi.fn(),
  removePathPreset: vi.fn(),
}));

vi.mock("../../../server/services/workflowService", () => ({
  getWorkflows: vi.fn(),
  getWorkflowById: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  previewWorkflow: vi.fn(),
}));

vi.mock("../../../server/services/scanService", () => ({
  scanDirectory: vi.fn(),
  detectCodeBuddy: vi.fn(),
  getDefaultScanPath: vi.fn(),
}));

vi.mock("../../../server/services/importService", () => ({
  importFiles: vi.fn(),
  cleanupFiles: vi.fn(),
  getSkillsRoot: vi.fn().mockReturnValue("/mock/skills"),
}));

import { createApp } from "../../../server/app";
import {
  addBundle,
  applyBundle,
  getBundles,
  removeBundle,
  updateBundle,
} from "../../../server/services/bundleService";
import { AppError } from "../../../server/types/errors";

// ---- Mock 数据 ----

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

// ---- 测试 ----

describe("Bundle API 集成测试", () => {
  let app: Express;

  beforeAll(() => {
    app = createApp({ isProduction: false, distPath: "" });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // GET /api/skill-bundles（向后兼容）
  // ----------------------------------------------------------------
  describe("GET /api/skill-bundles — 向后兼容", () => {
    it("旧版 settings.yaml 无 skillBundles 字段时返回空数组", async () => {
      // getBundles 在旧版 settings 场景下返回空数组（bundleService 已处理）
      vi.mocked(getBundles).mockResolvedValue([]);

      const res = await request(app).get("/api/skill-bundles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });
  describe("GET /api/skill-bundles", () => {
    it("返回套件列表", async () => {
      vi.mocked(getBundles).mockResolvedValue([mockBundle]);

      const res = await request(app).get("/api/skill-bundles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("frontend-dev");
    });

    it("返回空列表", async () => {
      vi.mocked(getBundles).mockResolvedValue([]);

      const res = await request(app).get("/api/skill-bundles");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // POST /api/skill-bundles
  // ----------------------------------------------------------------
  describe("POST /api/skill-bundles", () => {
    it("成功创建套件，返回 201", async () => {
      vi.mocked(addBundle).mockResolvedValue(mockBundle);

      const res = await request(app)
        .post("/api/skill-bundles")
        .send({
          name: "frontend-dev",
          displayName: "前端日常开发",
          categoryNames: ["coding", "testing"],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("frontend-dev");
    });

    it("请求体缺少必填字段时返回 400", async () => {
      const res = await request(app)
        .post("/api/skill-bundles")
        .send({ name: "test" }); // 缺少 displayName 和 categoryNames

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("名称格式不符合正则时返回 400", async () => {
      const res = await request(app)
        .post("/api/skill-bundles")
        .send({
          name: "Invalid Name",
          displayName: "无效名称",
          categoryNames: ["coding"],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("套件数量超限时返回 400", async () => {
      vi.mocked(addBundle).mockRejectedValue(AppError.bundleLimitExceeded());

      const res = await request(app)
        .post("/api/skill-bundles")
        .send({
          name: "new-bundle",
          displayName: "新套件",
          categoryNames: ["coding"],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // GET /api/skill-bundles/export（501 占位）
  // ----------------------------------------------------------------
  describe("GET /api/skill-bundles/export", () => {
    it("返回 501 Not Implemented", async () => {
      const res = await request(app).get("/api/skill-bundles/export");

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_IMPLEMENTED");
    });
  });

  // ----------------------------------------------------------------
  // POST /api/skill-bundles/import（501 占位）
  // ----------------------------------------------------------------
  describe("POST /api/skill-bundles/import", () => {
    it("返回 501 Not Implemented", async () => {
      const res = await request(app).post("/api/skill-bundles/import");

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_IMPLEMENTED");
    });
  });

  // ----------------------------------------------------------------
  // PUT /api/skill-bundles/:id
  // ----------------------------------------------------------------
  describe("PUT /api/skill-bundles/:id", () => {
    it("成功更新套件", async () => {
      const updated = { ...mockBundle, displayName: "新名称" };
      vi.mocked(updateBundle).mockResolvedValue(updated);

      const res = await request(app)
        .put(`/api/skill-bundles/${mockBundle.id}`)
        .send({ displayName: "新名称" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe("新名称");
    });

    it("套件不存在时返回 404", async () => {
      vi.mocked(updateBundle).mockRejectedValue(
        AppError.bundleNotFound("nonexistent"),
      );

      const res = await request(app)
        .put("/api/skill-bundles/nonexistent")
        .send({ displayName: "新名称" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("请求体校验失败时返回 400", async () => {
      const res = await request(app)
        .put(`/api/skill-bundles/${mockBundle.id}`)
        .send({ categoryNames: [] }); // 空数组不符合 min(1)

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // ----------------------------------------------------------------
  // DELETE /api/skill-bundles/:id
  // ----------------------------------------------------------------
  describe("DELETE /api/skill-bundles/:id", () => {
    it("成功删除套件", async () => {
      vi.mocked(removeBundle).mockResolvedValue(undefined);

      const res = await request(app).delete(
        `/api/skill-bundles/${mockBundle.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it("套件不存在时返回 404", async () => {
      vi.mocked(removeBundle).mockRejectedValue(
        AppError.bundleNotFound("nonexistent"),
      );

      const res = await request(app).delete("/api/skill-bundles/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // PUT /api/skill-bundles/:id/apply
  // ----------------------------------------------------------------
  describe("PUT /api/skill-bundles/:id/apply", () => {
    it("成功激活套件", async () => {
      vi.mocked(applyBundle).mockResolvedValue({
        applied: ["coding", "testing"],
        skipped: [],
      });

      const res = await request(app).put(
        `/api/skill-bundles/${mockBundle.id}/apply`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.applied).toEqual(["coding", "testing"]);
      expect(res.body.data.skipped).toEqual([]);
    });

    it("激活时跳过损坏引用", async () => {
      vi.mocked(applyBundle).mockResolvedValue({
        applied: ["coding"],
        skipped: ["deleted-category"],
      });

      const res = await request(app).put(
        `/api/skill-bundles/${mockBundle.id}/apply`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.skipped).toEqual(["deleted-category"]);
    });

    it("套件不存在时返回 404", async () => {
      vi.mocked(applyBundle).mockRejectedValue(
        AppError.bundleNotFound("nonexistent"),
      );

      const res = await request(app).put(
        "/api/skill-bundles/nonexistent/apply",
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// tests/unit/server/routes/statsRoutes.test.ts
// Story 7.2: Sidebar 系统状态面板 + 活跃度热力图
// 验收标准 AC-7: GET /api/stats/activity 正确返回活跃度数据
// ============================================================

import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─────────────────────────────────────────────
// Mock skillService.getSkillsRoot
// ─────────────────────────────────────────────
vi.mock("../../../../server/services/skillService.js", () => ({
  getSkillsRoot: vi.fn(() => "/mock/skills"),
}));

// ─────────────────────────────────────────────
// Mock fs-extra
// ─────────────────────────────────────────────
const mockPathExists = vi.fn();
const mockReaddir = vi.fn();
const mockStat = vi.fn();

vi.mock("fs-extra", () => ({
  default: {
    pathExists: (...args: any[]) => mockPathExists(...args),
    readdir: (...args: any[]) => mockReaddir(...args),
    stat: (...args: any[]) => mockStat(...args),
  },
}));

import { statsRoutes } from "../../../../server/routes/statsRoutes.js";

// 创建测试用 Express 应用
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", statsRoutes);
  return app;
}

describe("GET /api/stats/activity — Story 7.2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────
  // AC-7: 正常返回活跃度数据
  // ─────────────────────────────────────────────
  it("skills 目录不存在时返回全零数组（含空 files）", async () => {
    mockPathExists.mockResolvedValue(false);

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(7); // 1 周 = 7 天
    expect(res.body.data.every((d: any) => d.count === 0)).toBe(true);
    // 每个条目都应有空 files 数组
    expect(
      res.body.data.every(
        (d: any) => Array.isArray(d.files) && d.files.length === 0,
      ),
    ).toBe(true);
  });

  it("有文件时正确聚合每日修改次数和文件名", async () => {
    mockPathExists.mockResolvedValue(true);
    mockReaddir.mockResolvedValue([
      { name: "skill1.md", isDirectory: () => false, isFile: () => true },
      { name: "skill2.md", isDirectory: () => false, isFile: () => true },
    ]);

    // 两个文件都在今天修改
    const today = new Date();
    // 为不同文件返回不同的 stat（按调用顺序）
    mockStat
      .mockResolvedValueOnce({ mtime: today }) // skill1.md
      .mockResolvedValueOnce({ mtime: today }); // skill2.md

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(7);

    // 今天的 count 应该是 2，files 应包含去 .md 后缀的文件名
    const todayStr = today.toISOString().slice(0, 10);
    const todayEntry = res.body.data.find((d: any) => d.date === todayStr);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.count).toBe(2);
    expect(todayEntry.files).toEqual(["skill1", "skill2"]); // 排序后
  });

  it("返回数据包含正确的日期格式 YYYY-MM-DD", async () => {
    mockPathExists.mockResolvedValue(false);

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    expect(res.status).toBe(200);
    res.body.data.forEach((d: any) => {
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof d.count).toBe("number");
    });
  });

  it("weeks 参数控制返回天数", async () => {
    mockPathExists.mockResolvedValue(false);

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=4");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(28); // 4 周 = 28 天
  });

  it("默认 weeks=12 时返回 84 天数据", async () => {
    mockPathExists.mockResolvedValue(false);

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(84); // 12 周 = 84 天
  });

  // ─────────────────────────────────────────────
  // HT.1: files 字段验证
  // ─────────────────────────────────────────────
  it("files 字段只包含文件名（不含路径和 .md 后缀）", async () => {
    // 递归扫描：根目录有子目录 sub，sub 下有 deep-skill.md
    mockPathExists.mockResolvedValue(true);
    mockReaddir
      .mockResolvedValueOnce([
        { name: "sub", isDirectory: () => true, isFile: () => false },
      ])
      .mockResolvedValueOnce([
        { name: "deep-skill.md", isDirectory: () => false, isFile: () => true },
      ]);

    const today = new Date();
    mockStat.mockResolvedValue({ mtime: today });

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    const todayStr = today.toISOString().slice(0, 10);
    const todayEntry = res.body.data.find((d: any) => d.date === todayStr);
    expect(todayEntry).toBeDefined();
    // 文件名不含路径，不含 .md 后缀
    expect(todayEntry.files).toEqual(["deep-skill"]);
    expect(todayEntry.files[0]).not.toContain("/");
    expect(todayEntry.files[0]).not.toContain(".md");
  });

  it("files 字段按字母排序", async () => {
    mockPathExists.mockResolvedValue(true);
    mockReaddir.mockResolvedValue([
      { name: "zebra.md", isDirectory: () => false, isFile: () => true },
      { name: "alpha.md", isDirectory: () => false, isFile: () => true },
      { name: "middle.md", isDirectory: () => false, isFile: () => true },
    ]);

    const today = new Date();
    mockStat.mockResolvedValue({ mtime: today });

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    const todayStr = today.toISOString().slice(0, 10);
    const todayEntry = res.body.data.find((d: any) => d.date === todayStr);
    expect(todayEntry.files).toEqual(["alpha", "middle", "zebra"]);
  });

  it("无修改的日期 files 为空数组", async () => {
    mockPathExists.mockResolvedValue(true);
    mockReaddir.mockResolvedValue([
      { name: "skill1.md", isDirectory: () => false, isFile: () => true },
    ]);

    // 文件修改时间在范围外
    const longAgo = new Date("2020-01-01");
    mockStat.mockResolvedValue({ mtime: longAgo });

    const app = createTestApp();
    const res = await request(app).get("/api/stats/activity?weeks=1");

    // 所有日期的 files 都应为空
    expect(
      res.body.data.every(
        (d: any) => Array.isArray(d.files) && d.files.length === 0,
      ),
    ).toBe(true);
  });
});

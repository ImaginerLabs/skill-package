// ============================================================
// tests/unit/server/services/bundleService.test.ts — 套件服务单元测试（V3）
// ============================================================

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖（必须在 import 之前）
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

vi.mock("../../../../server/services/categoryService", () => ({
  getCategories: vi.fn(),
}));

vi.mock("../../../../server/services/skillService", () => ({
  waitForInitialization: vi.fn().mockResolvedValue(undefined),
  getAllSkills: vi.fn().mockReturnValue([]),
}));

import {
  addBundle,
  applyBundle,
  ensureDefaultBundle,
  getBundles,
  migrateBundlesIfNeeded,
  removeBundle,
  resolveBundleSkills,
  updateBundle,
} from "../../../../server/services/bundleService";
import { getCategories } from "../../../../server/services/categoryService";
import { getAllSkills } from "../../../../server/services/skillService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

// 测试用分类数据
const mockCategories = [
  { name: "coding", displayName: "编程", description: "", skillCount: 5 },
  { name: "testing", displayName: "测试", description: "", skillCount: 3 },
  { name: "writing", displayName: "写作", description: "", skillCount: 2 },
];

// 测试用 Skill 数据（用于来源测试）
const mockSkills = [
  { id: "skill-1", name: "Skill 1", category: "coding", source: "" },
  {
    id: "skill-2",
    name: "Skill 2",
    category: "coding",
    source: "anthropic-official",
  },
  {
    id: "skill-3",
    name: "Skill 3",
    category: "testing",
    source: "anthropic-official",
  },
  {
    id: "skill-4",
    name: "Skill 4",
    category: "writing",
    source: "awesome-copilot",
  },
];

// 测试用 V3 套件数据
const mockBundle = {
  id: "bundle-abc123-xyz1",
  name: "frontend-dev",
  displayName: "前端日常开发",
  description: "前端开发常用分类",
  criteria: {
    categories: ["coding", "testing"],
  },
  createdAt: "2026-04-13T00:00:00.000Z",
  updatedAt: "2026-04-13T00:00:00.000Z",
};

// 旧版套件格式（V2）
const mockLegacyBundle = {
  id: "bundle-legacy-xyz",
  name: "legacy-bundle",
  displayName: "旧版套件",
  description: "使用旧格式",
  categoryNames: ["coding", "writing"],
  createdAt: "2026-04-13T00:00:00.000Z",
  updatedAt: "2026-04-13T00:00:00.000Z",
};

describe("bundleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategories).mockResolvedValue(mockCategories);
    vi.mocked(getAllSkills).mockReturnValue(mockSkills);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------
  // migrateBundlesIfNeeded
  // ----------------------------------------------------------------
  describe("migrateBundlesIfNeeded", () => {
    it("所有套件已是 V3 格式时不迁移", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });

      await migrateBundlesIfNeeded();

      expect(writeYaml).not.toHaveBeenCalled();
    });

    it("存在旧格式套件时自动迁移", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockLegacyBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await migrateBundlesIfNeeded();

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: unknown[] };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0]).toHaveProperty("criteria");
      expect(
        (writtenData.skillBundles[0] as { criteria: { categories: string[] } })
          .criteria.categories,
      ).toEqual(["coding", "writing"]);
    });

    it("迁移失败时不阻塞（使用 try/catch）", async () => {
      vi.mocked(readYaml).mockRejectedValue(new Error("读取失败"));

      await expect(migrateBundlesIfNeeded()).resolves.not.toThrow();
    });
  });

  // ----------------------------------------------------------------
  // getBundles
  // ----------------------------------------------------------------
  describe("getBundles", () => {
    it("settings 为 null 时返回空数组", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await getBundles();
      expect(result).toEqual([]);
    });

    it("旧版 settings 无 skillBundles 字段时返回空数组（向后兼容）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.1.0",
        sync: { targets: [] },
        pathPresets: [],
      });

      const result = await getBundles();
      expect(result).toEqual([]);
    });

    it("返回套件列表，自动迁移旧格式，注入 brokenCategoryNames（无损坏引用）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });

      const result = await getBundles();
      expect(result).toHaveLength(1);
      expect(result[0].brokenCategoryNames).toEqual([]);
    });

    it("自动迁移旧格式套件到 V3", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockLegacyBundle],
      });

      const result = await getBundles();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("criteria");
      expect(result[0].criteria.categories).toEqual(["coding", "writing"]);
    });

    it("注入 brokenCategoryNames（有损坏引用）", async () => {
      const bundleWithBroken = {
        ...mockBundle,
        criteria: { categories: ["coding", "deleted-category"] },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithBroken],
      });

      const result = await getBundles();
      expect(result[0].brokenCategoryNames).toEqual(["deleted-category"]);
    });

    it("分类名大小写不敏感匹配（不误判为损坏引用）", async () => {
      const bundleWithUpperCase = {
        ...mockBundle,
        criteria: { categories: ["Coding", "Testing"] },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithUpperCase],
      });

      const result = await getBundles();
      expect(result[0].brokenCategoryNames).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // addBundle（V3 格式）
  // ----------------------------------------------------------------
  describe("addBundle", () => {
    it("成功创建套件（V3 格式）", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "my-bundle",
        displayName: "我的套件",
        criteria: { categories: ["coding", "testing"] },
      });

      expect(result.id).toMatch(/^bundle-/);
      expect(result.name).toBe("my-bundle");
      expect(result.displayName).toBe("我的套件");
      expect(result.criteria.categories).toEqual(["coding", "testing"]);
      expect(result.brokenCategoryNames).toEqual([]);
      expect(writeYaml).toHaveBeenCalledOnce();
    });

    it("成功创建来源套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "source-bundle",
        displayName: "来源套件",
        criteria: { sources: ["anthropic-official"] },
      });

      expect(result.criteria.sources).toEqual(["anthropic-official"]);
    });

    it("成功创建 Skill 套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "skill-bundle",
        displayName: "Skill 套件",
        criteria: { skills: ["skill-1", "skill-2"] },
      });

      expect(result.criteria.skills).toEqual(["skill-1", "skill-2"]);
    });

    it("成功创建含 description 的套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "my-bundle",
        displayName: "我的套件",
        description: "这是描述",
        criteria: { categories: ["coding"] },
      });

      expect(result.description).toBe("这是描述");
    });

    it("名称不符合正则时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(
        addBundle({
          name: "My Bundle",
          displayName: "我的套件",
          criteria: { categories: ["coding"] },
        }),
      ).rejects.toThrow("小写字母");
    });

    it("名称重复时抛出错误（大小写不敏感）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [{ ...mockBundle, name: "my-bundle" }],
      });

      await expect(
        addBundle({
          name: "my-bundle",
          displayName: "重复套件",
          criteria: { categories: ["coding"] },
        }),
      ).rejects.toThrow("已存在");
    });

    it("分类不存在时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(
        addBundle({
          name: "my-bundle",
          displayName: "我的套件",
          criteria: { categories: ["nonexistent-category"] },
        }),
      ).rejects.toThrow("不存在");
    });

    it("套件数量达到上限（50）时抛出错误", async () => {
      const maxBundles = Array.from({ length: 50 }, (_, i) => ({
        ...mockBundle,
        id: `bundle-${i}`,
        name: `bundle-${i}`,
      }));
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: maxBundles });

      await expect(
        addBundle({
          name: "new-bundle",
          displayName: "新套件",
          criteria: { categories: ["coding"] },
        }),
      ).rejects.toThrow("上限");
    });

    it("创建后 writeYaml 写入 V3 格式数据", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await addBundle({
        name: "new-bundle",
        displayName: "新套件",
        criteria: { categories: ["coding"] },
      });

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: unknown[] };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0]).toHaveProperty("criteria");
    });
  });

  // ----------------------------------------------------------------
  // updateBundle
  // ----------------------------------------------------------------
  describe("updateBundle", () => {
    it("成功更新 displayName", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        displayName: "新显示名称",
      });

      expect(result.displayName).toBe("新显示名称");
      expect(result.name).toBe(mockBundle.name);
    });

    it("成功更新 criteria", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        criteria: {
          categories: ["coding", "writing"],
          sources: ["anthropic-official"],
        },
      });

      expect(result.criteria.categories).toEqual(["coding", "writing"]);
      expect(result.criteria.sources).toEqual(["anthropic-official"]);
    });

    it("更新 criteria.categories 包含不存在的分类时抛出错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });

      await expect(
        updateBundle(mockBundle.id, {
          criteria: { categories: ["nonexistent"] },
        }),
      ).rejects.toThrow("不存在");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(
        updateBundle("nonexistent-id", { displayName: "新名称" }),
      ).rejects.toThrow("未找到");
    });

    it("更新后 updatedAt 时间戳更新", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        displayName: "新名称",
      });

      expect(result.updatedAt).not.toBe(mockBundle.updatedAt);
    });
  });

  // ----------------------------------------------------------------
  // removeBundle
  // ----------------------------------------------------------------
  describe("removeBundle", () => {
    it("成功删除套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removeBundle(mockBundle.id);

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: unknown[] };
      expect(writtenData.skillBundles).toHaveLength(0);
    });

    it("删除后其他套件保留", async () => {
      const anotherBundle = {
        ...mockBundle,
        id: "bundle-other",
        name: "other",
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle, anotherBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removeBundle(mockBundle.id);

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: { id: string }[] };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0].id).toBe("bundle-other");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(removeBundle("nonexistent-id")).rejects.toThrow("未找到");
    });

    it("尝试删除默认套件（bundle-default）时抛出 400 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [
          {
            id: "bundle-default",
            name: "default",
            displayName: "默认套件",
            criteria: { categories: ["coding"] },
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      });

      await expect(removeBundle("bundle-default")).rejects.toThrow(
        "默认套件不可删除",
      );
    });
  });

  // ----------------------------------------------------------------
  // ensureDefaultBundle
  // ----------------------------------------------------------------
  describe("ensureDefaultBundle", () => {
    it("默认套件不存在时自动创建（V3 格式）", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        skillBundles: {
          id: string;
          name: string;
          criteria: { categories: string[] };
        }[];
      };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0].id).toBe("bundle-default");
      expect(writtenData.skillBundles[0].name).toBe("default");
      expect(writtenData.skillBundles[0].criteria.categories).toHaveLength(3);
      expect(writtenData.skillBundles[0].criteria.categories).toContain(
        "coding",
      );
    });

    it("默认套件已存在且分类已全部包含时幂等跳过", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [
          {
            id: "bundle-default",
            name: "default",
            displayName: "默认套件",
            criteria: { categories: ["coding", "testing", "writing"] },
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      });
      await ensureDefaultBundle();

      expect(writeYaml).not.toHaveBeenCalled();
    });

    it("默认套件已存在但使用旧格式时自动迁移", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [
          {
            id: "bundle-default",
            name: "default",
            displayName: "默认套件",
            categoryNames: ["coding", "testing"],
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        skillBundles: { criteria?: { categories: string[] } }[];
      };
      expect(writtenData.skillBundles[0]).toHaveProperty("criteria");
    });

    it("settings 为 null 时也能正常创建默认套件", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      expect(writeYaml).toHaveBeenCalledOnce();
    });
  });

  // ----------------------------------------------------------------
  // applyBundle（V3 统一激活逻辑）
  // ----------------------------------------------------------------
  describe("applyBundle", () => {
    it("成功激活分类套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(mockBundle.id);

      expect(result.total).toBeGreaterThan(0);
      expect(result.applied.length).toBe(result.total);
      expect(result.skipped).toEqual([]);
    });

    it("激活来源套件（动态查询）", async () => {
      const sourceBundle = {
        ...mockBundle,
        id: "bundle-source",
        criteria: { sources: ["anthropic-official"] },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [sourceBundle],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(sourceBundle.id);

      expect(result.total).toBe(2);
      expect(result.applied).toContain("skill-2");
      expect(result.applied).toContain("skill-3");
    });

    it("激活 Skill 套件", async () => {
      const skillBundle = {
        ...mockBundle,
        id: "bundle-skills",
        criteria: { skills: ["skill-1", "skill-4"] },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [skillBundle],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(skillBundle.id);

      expect(result.total).toBe(2);
      expect(result.applied).toContain("skill-1");
      expect(result.applied).toContain("skill-4");
    });

    it("混合条件取并集", async () => {
      const mixedBundle = {
        ...mockBundle,
        id: "bundle-mixed",
        criteria: {
          categories: ["coding"],
          sources: ["awesome-copilot"],
        },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mixedBundle],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(mixedBundle.id);

      expect(result.applied).toContain("skill-1");
      expect(result.applied).toContain("skill-2");
      expect(result.applied).toContain("skill-4");
    });

    it("激活时跳过已删除的分类", async () => {
      const bundleWithBroken = {
        ...mockBundle,
        criteria: { categories: ["coding", "deleted-category"] },
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithBroken],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(bundleWithBroken.id);

      expect(result.skipped).toContain("deleted-category");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(applyBundle("nonexistent-id")).rejects.toThrow("未找到");
    });
  });

  // ----------------------------------------------------------------
  // resolveBundleSkills
  // ----------------------------------------------------------------
  describe("resolveBundleSkills", () => {
    it("解析分类条件", () => {
      const result = resolveBundleSkills(mockBundle);

      expect(result.length).toBeGreaterThan(0);
    });

    it("解析来源条件（包含空来源）", () => {
      const sourceBundle = {
        ...mockBundle,
        criteria: { sources: ["", "anthropic-official"] },
      };

      const result = resolveBundleSkills(sourceBundle);

      expect(result).toContain("skill-1");
      expect(result).toContain("skill-2");
      expect(result).toContain("skill-3");
    });

    it("解析 Skill 条件", () => {
      const skillBundle = {
        ...mockBundle,
        criteria: { skills: ["skill-1", "skill-4"] },
      };

      const result = resolveBundleSkills(skillBundle);

      expect(result).toEqual(["skill-1", "skill-4"]);
    });

    it("空条件返回空数组", () => {
      const emptyBundle = {
        ...mockBundle,
        criteria: {},
      };

      const result = resolveBundleSkills(emptyBundle);

      expect(result).toEqual([]);
    });
  });
});

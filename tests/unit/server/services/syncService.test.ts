// ============================================================
// tests/unit/server/services/syncService.test.ts — 同步服务单元测试
// ============================================================

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖
vi.mock("fs-extra");
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

import fs from "fs-extra";
import {
  addSyncTarget,
  getSyncTargets,
  removeSyncTarget,
  updateSyncTarget,
  validateSyncPath,
} from "../../../../server/services/syncService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

describe("syncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSyncTargets", () => {
    it("返回空数组当 settings 为 null", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await getSyncTargets();
      expect(result).toEqual([]);
    });

    it("返回已有的同步目标列表", async () => {
      const targets = [
        { id: "t1", name: "项目A", path: "/tmp/a", enabled: true },
      ];
      vi.mocked(readYaml).mockResolvedValue({
        sync: { targets },
      });

      const result = await getSyncTargets();
      expect(result).toEqual(targets);
    });

    it("sync.targets 不存在时返回空数组", async () => {
      vi.mocked(readYaml).mockResolvedValue({ version: "0.1.0" });

      const result = await getSyncTargets();
      expect(result).toEqual([]);
    });
  });

  describe("addSyncTarget", () => {
    it("成功添加同步目标", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.1.0",
        sync: { targets: [] },
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addSyncTarget({
        name: "测试项目",
        path: "/tmp/test-project",
        enabled: true,
      });

      expect(result.id).toBeTruthy();
      expect(result.name).toBe("测试项目");
      expect(result.path).toBe("/tmp/test-project");
      expect(result.enabled).toBe(true);
      expect(writeYaml).toHaveBeenCalledOnce();
    });

    it("名称为空时抛出校验错误", async () => {
      await expect(
        addSyncTarget({ name: "", path: "/tmp/test", enabled: true }),
      ).rejects.toThrow("名称不能为空");
    });

    it("路径为空时抛出校验错误", async () => {
      await expect(
        addSyncTarget({ name: "测试", path: "", enabled: true }),
      ).rejects.toThrow("路径不能为空");
    });

    it("非绝对路径时抛出校验错误", async () => {
      await expect(
        addSyncTarget({
          name: "测试",
          path: "relative/path",
          enabled: true,
        }),
      ).rejects.toThrow("绝对路径");
    });

    it("路径重复时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: {
          targets: [
            { id: "t1", name: "已有", path: "/tmp/test", enabled: true },
          ],
        },
      });

      await expect(
        addSyncTarget({
          name: "新目标",
          path: "/tmp/test",
          enabled: true,
        }),
      ).rejects.toThrow("路径已存在");
    });
  });

  describe("updateSyncTarget", () => {
    it("成功更新同步目标名称", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: {
          targets: [
            { id: "t1", name: "旧名称", path: "/tmp/test", enabled: true },
          ],
        },
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateSyncTarget("t1", { name: "新名称" });
      expect(result.name).toBe("新名称");
      expect(result.path).toBe("/tmp/test");
    });

    it("成功切换启用状态", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: {
          targets: [
            { id: "t1", name: "测试", path: "/tmp/test", enabled: true },
          ],
        },
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateSyncTarget("t1", { enabled: false });
      expect(result.enabled).toBe(false);
    });

    it("目标不存在时抛出 404", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: { targets: [] },
      });

      await expect(
        updateSyncTarget("nonexistent", { name: "新名称" }),
      ).rejects.toThrow("未找到");
    });

    it("更新路径为非绝对路径时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: {
          targets: [
            { id: "t1", name: "测试", path: "/tmp/test", enabled: true },
          ],
        },
      });

      await expect(
        updateSyncTarget("t1", { path: "relative" }),
      ).rejects.toThrow("绝对路径");
    });
  });

  describe("removeSyncTarget", () => {
    it("成功删除同步目标", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: {
          targets: [
            { id: "t1", name: "测试", path: "/tmp/test", enabled: true },
          ],
        },
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removeSyncTarget("t1");
      expect(writeYaml).toHaveBeenCalledOnce();

      // 验证写入的数据中 targets 为空
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { sync: { targets: unknown[] } };
      expect(writtenData.sync.targets).toHaveLength(0);
    });

    it("目标不存在时抛出 404", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        sync: { targets: [] },
      });

      await expect(removeSyncTarget("nonexistent")).rejects.toThrow("未找到");
    });
  });

  describe("validateSyncPath", () => {
    it("路径存在且可写", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await validateSyncPath("/tmp/test");
      expect(result).toEqual({ exists: true, writable: true });
    });

    it("路径存在但不可写", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockRejectedValue(new Error("EACCES"));

      const result = await validateSyncPath("/tmp/test");
      expect(result).toEqual({ exists: true, writable: false });
    });

    it("路径不存在", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      const result = await validateSyncPath("/tmp/nonexistent");
      expect(result).toEqual({ exists: false, writable: false });
    });

    it("非绝对路径时抛出校验错误", async () => {
      await expect(validateSyncPath("relative")).rejects.toThrow("绝对路径");
    });
  });
});

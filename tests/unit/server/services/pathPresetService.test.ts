// ============================================================
// tests/unit/server/services/pathPresetService.test.ts — 路径预设服务单元测试
// ============================================================

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

import {
  addPathPreset,
  getPathPresets,
  removePathPreset,
  updatePathPreset,
} from "../../../../server/services/pathPresetService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

describe("pathPresetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------
  // getPathPresets
  // ----------------------------------------------------------------
  describe("getPathPresets", () => {
    it("settings 为 null 时返回空数组", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await getPathPresets();
      expect(result).toEqual([]);
    });

    it("返回已有的预设列表", async () => {
      const presets = [
        { id: "preset-1", path: "/tmp/proj", label: "我的项目" },
      ];
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: presets });

      const result = await getPathPresets();
      expect(result).toEqual(presets);
    });

    it("旧版 settings 无 pathPresets 字段时返回空数组（向后兼容）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.1.0",
        sync: { targets: [] },
      });

      const result = await getPathPresets();
      expect(result).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // addPathPreset
  // ----------------------------------------------------------------
  describe("addPathPreset", () => {
    it("成功添加预设路径（含 label）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.1.0",
        pathPresets: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addPathPreset({
        path: "/tmp/my-project",
        label: "我的项目",
      });

      expect(result.id).toMatch(/^preset-/);
      expect(result.path).toBe("/tmp/my-project");
      expect(result.label).toBe("我的项目");
      expect(writeYaml).toHaveBeenCalledOnce();
    });

    it("成功添加预设路径（不含 label，label 字段不写入）", async () => {
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addPathPreset({ path: "/tmp/no-label" });

      expect(result.path).toBe("/tmp/no-label");
      expect(result.label).toBeUndefined();
    });

    it("label 为纯空格时不写入 label 字段", async () => {
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addPathPreset({
        path: "/tmp/spaces",
        label: "   ",
      });

      expect(result.label).toBeUndefined();
    });

    it("路径为空字符串时抛出校验错误", async () => {
      await expect(addPathPreset({ path: "" })).rejects.toThrow("路径不能为空");
    });

    it("路径为纯空格时抛出校验错误", async () => {
      await expect(addPathPreset({ path: "   " })).rejects.toThrow(
        "路径不能为空",
      );
    });

    it("路径为相对路径时抛出校验错误", async () => {
      await expect(addPathPreset({ path: "relative/path" })).rejects.toThrow(
        "绝对路径",
      );
    });

    it("路径重复时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj", label: "已有" }],
      });

      await expect(addPathPreset({ path: "/tmp/proj" })).rejects.toThrow(
        "路径已存在",
      );
    });

    it("路径末尾带斜杠时视为不同路径（Node.js path.normalize 保留末尾斜杠）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      // Node.js path.normalize("/tmp/proj/") === "/tmp/proj/"（保留末尾斜杠）
      // 因此与 "/tmp/proj" 不重复，可以成功添加
      const result = await addPathPreset({ path: "/tmp/proj/" });
      expect(result.path).toBe("/tmp/proj/");
    });
    it("添加后 writeYaml 写入的数据包含新预设", async () => {
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await addPathPreset({ path: "/tmp/new", label: "新路径" });

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { pathPresets: { path: string }[] };
      expect(writtenData.pathPresets).toHaveLength(1);
      expect(writtenData.pathPresets[0].path).toBe("/tmp/new");
    });
  });

  // ----------------------------------------------------------------
  // updatePathPreset
  // ----------------------------------------------------------------
  describe("updatePathPreset", () => {
    it("成功更新路径", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/old", label: "旧路径" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updatePathPreset("preset-1", {
        path: "/tmp/new",
      });

      expect(result.path).toBe("/tmp/new");
      expect(result.label).toBe("旧路径"); // label 未变
    });

    it("成功更新 label", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj", label: "旧备注" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updatePathPreset("preset-1", { label: "新备注" });

      expect(result.label).toBe("新备注");
      expect(result.path).toBe("/tmp/proj"); // path 未变
    });

    it("传入空字符串 label 时清空 label 字段（变为 undefined）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj", label: "有备注" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updatePathPreset("preset-1", { label: "" });

      expect(result.label).toBeUndefined();
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: [] });

      await expect(
        updatePathPreset("nonexistent", { label: "新备注" }),
      ).rejects.toThrow("未找到");
    });

    it("更新路径为相对路径时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj" }],
      });

      await expect(
        updatePathPreset("preset-1", { path: "relative" }),
      ).rejects.toThrow("绝对路径");
    });

    it("更新路径为空字符串时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj" }],
      });

      await expect(updatePathPreset("preset-1", { path: "" })).rejects.toThrow(
        "路径不能为空",
      );
    });

    it("更新路径与其他预设重复时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [
          { id: "preset-1", path: "/tmp/a" },
          { id: "preset-2", path: "/tmp/b" },
        ],
      });

      await expect(
        updatePathPreset("preset-2", { path: "/tmp/a" }),
      ).rejects.toThrow("路径已存在");
    });

    it("更新路径为自身路径时不报重复错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      // 更新为相同路径，不应报重复
      const result = await updatePathPreset("preset-1", {
        path: "/tmp/proj",
      });
      expect(result.path).toBe("/tmp/proj");
    });
  });

  // ----------------------------------------------------------------
  // removePathPreset
  // ----------------------------------------------------------------
  describe("removePathPreset", () => {
    it("成功删除预设", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [{ id: "preset-1", path: "/tmp/proj", label: "项目" }],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removePathPreset("preset-1");

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { pathPresets: unknown[] };
      expect(writtenData.pathPresets).toHaveLength(0);
    });

    it("删除后其他预设保留", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        pathPresets: [
          { id: "preset-1", path: "/tmp/a" },
          { id: "preset-2", path: "/tmp/b" },
        ],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removePathPreset("preset-1");

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        pathPresets: { id: string }[];
      };
      expect(writtenData.pathPresets).toHaveLength(1);
      expect(writtenData.pathPresets[0].id).toBe("preset-2");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ pathPresets: [] });

      await expect(removePathPreset("nonexistent")).rejects.toThrow("未找到");
    });
  });
});

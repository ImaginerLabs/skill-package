import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../src/lib/api";
import { useSyncStore } from "../../../src/stores/sync-store";

// Mock API 模块
vi.mock("../../../src/lib/api", () => ({
  fetchSyncTargets: vi.fn(),
  addSyncTarget: vi.fn(),
  updateSyncTarget: vi.fn(),
  deleteSyncTarget: vi.fn(),
  pushSync: vi.fn(),
  diffSync: vi.fn(),
}));

const mockTarget = {
  id: "t1",
  name: "CodeBuddy 项目",
  path: "/Users/alex/project/.codebuddy/skills",
  enabled: true,
};

const mockTarget2 = {
  id: "t2",
  name: "备用项目",
  path: "/Users/alex/backup/.codebuddy/skills",
  enabled: false,
};

const mockSyncResult = {
  total: 2,
  success: 2,
  failed: 0,
  targets: [
    {
      targetId: "t1",
      targetName: "CodeBuddy 项目",
      copied: 2,
      overwritten: 0,
      errors: [],
    },
  ],
};

describe("sync-store", () => {
  beforeEach(() => {
    useSyncStore.setState({
      targets: [],
      targetsLoading: false,
      selectedSkillIds: [],
      syncStatus: "idle",
      syncResult: null,
      lastSyncTime: null,
      lastSyncError: null,
    });
    vi.clearAllMocks();
  });

  describe("初始状态", () => {
    it("应该有正确的初始值", () => {
      const state = useSyncStore.getState();
      expect(state.targets).toEqual([]);
      expect(state.targetsLoading).toBe(false);
      expect(state.selectedSkillIds).toEqual([]);
      expect(state.syncStatus).toBe("idle");
      expect(state.syncResult).toBeNull();
      expect(state.lastSyncTime).toBeNull();
      expect(state.lastSyncError).toBeNull();
    });
  });

  describe("fetchTargets", () => {
    it("成功获取同步目标列表", async () => {
      vi.mocked(api.fetchSyncTargets).mockResolvedValue([
        mockTarget,
        mockTarget2,
      ]);

      await useSyncStore.getState().fetchTargets();

      const state = useSyncStore.getState();
      expect(state.targets).toEqual([mockTarget, mockTarget2]);
      expect(state.targetsLoading).toBe(false);
    });

    it("获取时设置 loading 状态", async () => {
      vi.mocked(api.fetchSyncTargets).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([mockTarget]), 100),
          ),
      );

      const promise = useSyncStore.getState().fetchTargets();
      expect(useSyncStore.getState().targetsLoading).toBe(true);

      await promise;
      expect(useSyncStore.getState().targetsLoading).toBe(false);
    });

    it("获取失败时 loading 仍然重置为 false", async () => {
      vi.mocked(api.fetchSyncTargets).mockRejectedValue(new Error("网络错误"));

      await useSyncStore.getState().fetchTargets();

      expect(useSyncStore.getState().targetsLoading).toBe(false);
    });
  });

  describe("addTarget", () => {
    it("成功添加同步目标", async () => {
      vi.mocked(api.addSyncTarget).mockResolvedValue(mockTarget);

      const result = await useSyncStore
        .getState()
        .addTarget({ name: "CodeBuddy 项目", path: "/Users/alex/project" });

      expect(result).toEqual(mockTarget);
      expect(useSyncStore.getState().targets).toContain(mockTarget);
    });

    it("添加目标后追加到列表末尾", async () => {
      useSyncStore.setState({ targets: [mockTarget] });
      vi.mocked(api.addSyncTarget).mockResolvedValue(mockTarget2);

      await useSyncStore
        .getState()
        .addTarget({ name: "备用项目", path: "/Users/alex/backup" });

      const { targets } = useSyncStore.getState();
      expect(targets).toHaveLength(2);
      expect(targets[1]).toEqual(mockTarget2);
    });

    it("添加失败时抛出错误", async () => {
      vi.mocked(api.addSyncTarget).mockRejectedValue(new Error("路径重复"));

      await expect(
        useSyncStore.getState().addTarget({ name: "测试", path: "/duplicate" }),
      ).rejects.toThrow("路径重复");
    });
  });

  describe("updateTarget", () => {
    it("成功更新同步目标", async () => {
      useSyncStore.setState({ targets: [mockTarget] });
      const updated = { ...mockTarget, name: "新名称" };
      vi.mocked(api.updateSyncTarget).mockResolvedValue(updated);

      await useSyncStore.getState().updateTarget("t1", { name: "新名称" });

      const { targets } = useSyncStore.getState();
      expect(targets[0].name).toBe("新名称");
    });

    it("只更新匹配 id 的目标", async () => {
      useSyncStore.setState({ targets: [mockTarget, mockTarget2] });
      const updated = { ...mockTarget, enabled: false };
      vi.mocked(api.updateSyncTarget).mockResolvedValue(updated);

      await useSyncStore.getState().updateTarget("t1", { enabled: false });

      const { targets } = useSyncStore.getState();
      expect(targets[0].enabled).toBe(false);
      expect(targets[1]).toEqual(mockTarget2); // t2 不变
    });
  });

  describe("removeTarget", () => {
    it("成功删除同步目标", async () => {
      useSyncStore.setState({ targets: [mockTarget, mockTarget2] });
      vi.mocked(api.deleteSyncTarget).mockResolvedValue(undefined);

      await useSyncStore.getState().removeTarget("t1");

      const { targets } = useSyncStore.getState();
      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual(mockTarget2);
    });

    it("删除失败时抛出错误", async () => {
      useSyncStore.setState({ targets: [mockTarget] });
      vi.mocked(api.deleteSyncTarget).mockRejectedValue(new Error("删除失败"));

      await expect(useSyncStore.getState().removeTarget("t1")).rejects.toThrow(
        "删除失败",
      );
    });
  });

  describe("setTargets", () => {
    it("直接设置目标列表", () => {
      useSyncStore.getState().setTargets([mockTarget, mockTarget2]);
      expect(useSyncStore.getState().targets).toEqual([
        mockTarget,
        mockTarget2,
      ]);
    });
  });

  describe("toggleSkillSelection", () => {
    it("选中未选中的 Skill", () => {
      useSyncStore.getState().toggleSkillSelection("skill-1");
      expect(useSyncStore.getState().selectedSkillIds).toContain("skill-1");
    });

    it("取消已选中的 Skill", () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1", "skill-2"] });
      useSyncStore.getState().toggleSkillSelection("skill-1");
      expect(useSyncStore.getState().selectedSkillIds).not.toContain("skill-1");
      expect(useSyncStore.getState().selectedSkillIds).toContain("skill-2");
    });

    it("多次切换保持正确状态", () => {
      useSyncStore.getState().toggleSkillSelection("skill-1");
      useSyncStore.getState().toggleSkillSelection("skill-1");
      expect(useSyncStore.getState().selectedSkillIds).not.toContain("skill-1");
    });
  });

  describe("selectByCategory", () => {
    it("批量设置选中的 Skill", () => {
      useSyncStore
        .getState()
        .selectByCategory(["skill-1", "skill-2", "skill-3"]);
      expect(useSyncStore.getState().selectedSkillIds).toEqual([
        "skill-1",
        "skill-2",
        "skill-3",
      ]);
    });

    it("覆盖之前的选中状态", () => {
      useSyncStore.setState({ selectedSkillIds: ["old-skill"] });
      useSyncStore.getState().selectByCategory(["new-skill"]);
      expect(useSyncStore.getState().selectedSkillIds).toEqual(["new-skill"]);
    });
  });

  describe("clearSelection", () => {
    it("清空所有选中的 Skill", () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1", "skill-2"] });
      useSyncStore.getState().clearSelection();
      expect(useSyncStore.getState().selectedSkillIds).toEqual([]);
    });
  });

  describe("setSyncStatus", () => {
    it("设置同步状态为 syncing", () => {
      useSyncStore.getState().setSyncStatus("syncing");
      expect(useSyncStore.getState().syncStatus).toBe("syncing");
    });

    it("设置同步状态为 done", () => {
      useSyncStore.getState().setSyncStatus("done");
      expect(useSyncStore.getState().syncStatus).toBe("done");
    });

    it("设置同步状态为 error", () => {
      useSyncStore.getState().setSyncStatus("error");
      expect(useSyncStore.getState().syncStatus).toBe("error");
    });
  });

  describe("setSyncResult", () => {
    it("设置同步结果", () => {
      useSyncStore.getState().setSyncResult(mockSyncResult);
      expect(useSyncStore.getState().syncResult).toEqual(mockSyncResult);
    });

    it("清空同步结果", () => {
      useSyncStore.setState({ syncResult: mockSyncResult });
      useSyncStore.getState().setSyncResult(null);
      expect(useSyncStore.getState().syncResult).toBeNull();
    });
  });

  describe("executePush", () => {
    it("未选中 Skill 时抛出错误", async () => {
      useSyncStore.setState({ selectedSkillIds: [] });

      await expect(useSyncStore.getState().executePush()).rejects.toThrow(
        "SYNC_NO_SKILL_SELECTED",
      );
    });

    it("成功执行同步推送", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1", "skill-2"] });
      vi.mocked(api.pushSync).mockResolvedValue(mockSyncResult);

      const result = await useSyncStore.getState().executePush();

      expect(result).toEqual(mockSyncResult);
      const state = useSyncStore.getState();
      expect(state.syncStatus).toBe("done");
      expect(state.syncResult).toEqual(mockSyncResult);
      expect(state.lastSyncTime).not.toBeNull();
      expect(state.lastSyncError).toBeNull();
    });

    it("同步时设置 syncing 状态", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1"] });
      vi.mocked(api.pushSync).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockSyncResult), 100),
          ),
      );

      const promise = useSyncStore.getState().executePush();
      expect(useSyncStore.getState().syncStatus).toBe("syncing");

      await promise;
      expect(useSyncStore.getState().syncStatus).toBe("done");
    });

    it("同步失败时设置 error 状态", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1"] });
      vi.mocked(api.pushSync).mockRejectedValue(new Error("同步失败"));

      await expect(useSyncStore.getState().executePush()).rejects.toThrow(
        "同步失败",
      );

      const state = useSyncStore.getState();
      expect(state.syncStatus).toBe("error");
      // Error 对象时使用 err.message，非 Error 对象时使用 "SYNC_FAILED"
      expect(state.lastSyncError).toBe("同步失败");
    });

    it("可以传入指定的 targetIds", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1"] });
      vi.mocked(api.pushSync).mockResolvedValue(mockSyncResult);

      await useSyncStore.getState().executePush(["t1"]);

      expect(api.pushSync).toHaveBeenCalledWith(["skill-1"], ["t1"], undefined);
    });

    it("不传 targetIds 时传 undefined", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1"] });
      vi.mocked(api.pushSync).mockResolvedValue(mockSyncResult);

      await useSyncStore.getState().executePush();

      expect(api.pushSync).toHaveBeenCalledWith(
        ["skill-1"],
        undefined,
        undefined,
      );
    });

    it("成功同步后记录 lastSyncTime 为 ISO 格式", async () => {
      useSyncStore.setState({ selectedSkillIds: ["skill-1"] });
      vi.mocked(api.pushSync).mockResolvedValue(mockSyncResult);

      await useSyncStore.getState().executePush();

      const { lastSyncTime } = useSyncStore.getState();
      expect(lastSyncTime).not.toBeNull();
      expect(() => new Date(lastSyncTime!)).not.toThrow();
    });
  });
});

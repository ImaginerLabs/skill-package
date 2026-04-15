// ============================================================
// tests/unit/stores/bundle-store.test.ts — 套件 store 单元测试
// ============================================================

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../src/lib/api";
import { useBundleStore } from "../../../src/stores/bundle-store";

// Mock API 模块
vi.mock("../../../src/lib/api", () => ({
  fetchSkillBundles: vi.fn(),
  createSkillBundle: vi.fn(),
  updateSkillBundle: vi.fn(),
  deleteSkillBundle: vi.fn(),
}));

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

describe("bundle-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBundleStore.setState({
      bundles: [],
      bundlesLoading: false,
      bundlesError: null,
    });
  });

  // ----------------------------------------------------------------
  // fetchBundles
  // ----------------------------------------------------------------
  describe("fetchBundles", () => {
    it("成功加载套件列表", async () => {
      vi.mocked(api.fetchSkillBundles).mockResolvedValue([mockBundle]);

      await useBundleStore.getState().fetchBundles();

      const { bundles, bundlesLoading, bundlesError } =
        useBundleStore.getState();
      expect(bundles).toEqual([mockBundle]);
      expect(bundlesLoading).toBe(false);
      expect(bundlesError).toBeNull();
    });

    it("加载失败时设置 bundlesError", async () => {
      vi.mocked(api.fetchSkillBundles).mockRejectedValue(new Error("网络错误"));

      await useBundleStore.getState().fetchBundles();

      const { bundles, bundlesError } = useBundleStore.getState();
      expect(bundles).toEqual([]);
      expect(bundlesError).toBe("网络错误");
    });

    it("加载过程中 bundlesLoading 为 true", async () => {
      let resolvePromise!: (value: (typeof mockBundle)[]) => void;
      vi.mocked(api.fetchSkillBundles).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const fetchPromise = useBundleStore.getState().fetchBundles();
      expect(useBundleStore.getState().bundlesLoading).toBe(true);

      resolvePromise([mockBundle]);
      await fetchPromise;
      expect(useBundleStore.getState().bundlesLoading).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // createBundle
  // ----------------------------------------------------------------
  describe("createBundle", () => {
    it("成功创建套件并追加到列表", async () => {
      vi.mocked(api.createSkillBundle).mockResolvedValue(mockBundle);

      await useBundleStore.getState().createBundle({
        name: "frontend-dev",
        displayName: "前端日常开发",
        categoryNames: ["coding", "testing"],
      });

      const { bundles } = useBundleStore.getState();
      expect(bundles).toHaveLength(1);
      expect(bundles[0].name).toBe("frontend-dev");
    });

    it("创建失败时抛出错误（不修改 store）", async () => {
      vi.mocked(api.createSkillBundle).mockRejectedValue(
        new Error("名称已存在"),
      );

      await expect(
        useBundleStore.getState().createBundle({
          name: "existing",
          displayName: "已存在",
          categoryNames: ["coding"],
        }),
      ).rejects.toThrow("名称已存在");

      expect(useBundleStore.getState().bundles).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------------
  // updateBundle
  // ----------------------------------------------------------------
  describe("updateBundle", () => {
    it("成功更新套件", async () => {
      useBundleStore.setState({ bundles: [mockBundle] });
      const updated = { ...mockBundle, displayName: "新名称" };
      vi.mocked(api.updateSkillBundle).mockResolvedValue(updated);

      await useBundleStore.getState().updateBundle(mockBundle.id, {
        displayName: "新名称",
      });

      const { bundles } = useBundleStore.getState();
      expect(bundles[0].displayName).toBe("新名称");
    });

    it("更新失败时抛出错误", async () => {
      useBundleStore.setState({ bundles: [mockBundle] });
      vi.mocked(api.updateSkillBundle).mockRejectedValue(
        new Error("套件未找到"),
      );

      await expect(
        useBundleStore.getState().updateBundle("nonexistent", {}),
      ).rejects.toThrow("套件未找到");
    });
  });

  // ----------------------------------------------------------------
  // deleteBundle
  // ----------------------------------------------------------------
  describe("deleteBundle", () => {
    it("成功删除套件", async () => {
      useBundleStore.setState({ bundles: [mockBundle] });
      vi.mocked(api.deleteSkillBundle).mockResolvedValue(undefined);

      await useBundleStore.getState().deleteBundle(mockBundle.id);

      expect(useBundleStore.getState().bundles).toHaveLength(0);
    });

    it("删除后其他套件保留", async () => {
      const anotherBundle = {
        ...mockBundle,
        id: "bundle-other",
        name: "other",
      };
      useBundleStore.setState({ bundles: [mockBundle, anotherBundle] });
      vi.mocked(api.deleteSkillBundle).mockResolvedValue(undefined);

      await useBundleStore.getState().deleteBundle(mockBundle.id);

      const { bundles } = useBundleStore.getState();
      expect(bundles).toHaveLength(1);
      expect(bundles[0].id).toBe("bundle-other");
    });
  });
});

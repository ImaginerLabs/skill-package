// ============================================================
// tests/unit/components/sync/SyncTargetManager.test.tsx — 同步目标管理组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  fetchSyncTargets: vi.fn(() => Promise.resolve([])),
  addSyncTarget: vi.fn(),
  updateSyncTarget: vi.fn(),
  deleteSyncTarget: vi.fn(),
  validateSyncPath: vi.fn(),
}));

// Mock stores
const mockFetchTargets = vi.fn();
const mockAddTarget = vi.fn();
const mockUpdateTarget = vi.fn();
const mockRemoveTarget = vi.fn();

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    targets: [],
    targetsLoading: false,
    fetchTargets: mockFetchTargets,
    addTarget: mockAddTarget,
    updateTarget: mockUpdateTarget,
    removeTarget: mockRemoveTarget,
  })),
}));

import SyncTargetManager from "../../../../src/components/sync/SyncTargetManager";
import { useSyncStore } from "../../../../src/stores/sync-store";

describe("SyncTargetManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("无同步目标时显示空状态引导", () => {
      render(<SyncTargetManager />);

      expect(screen.getByText("尚未配置同步目标")).toBeInTheDocument();
      expect(screen.getByText("添加第一个同步目标")).toBeInTheDocument();
    });

    it("加载中时显示加载状态", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [],
        targetsLoading: true,
        fetchTargets: mockFetchTargets,
        addTarget: mockAddTarget,
        updateTarget: mockUpdateTarget,
        removeTarget: mockRemoveTarget,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncTargetManager />);
      expect(screen.getByText("加载中...")).toBeInTheDocument();
    });

    it("有同步目标时渲染列表", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [
          {
            id: "t1",
            name: "CodeBuddy 项目",
            path: "/tmp/project",
            enabled: true,
          },
        ],
        targetsLoading: false,
        fetchTargets: mockFetchTargets,
        addTarget: mockAddTarget,
        updateTarget: mockUpdateTarget,
        removeTarget: mockRemoveTarget,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncTargetManager />);

      expect(screen.getByText("CodeBuddy 项目")).toBeInTheDocument();
      expect(screen.getByText("/tmp/project")).toBeInTheDocument();
      expect(screen.getByText("同步目标 (1)")).toBeInTheDocument();
    });

    it("禁用的目标显示禁用标签", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [
          { id: "t1", name: "禁用目标", path: "/tmp/disabled", enabled: false },
        ],
        targetsLoading: false,
        fetchTargets: mockFetchTargets,
        addTarget: mockAddTarget,
        updateTarget: mockUpdateTarget,
        removeTarget: mockRemoveTarget,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncTargetManager />);
      expect(screen.getByText("禁用")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击添加按钮显示添加表单", async () => {
      const user = userEvent.setup();
      render(<SyncTargetManager />);

      // 空状态下使用顶部的"添加目标"按钮
      await user.click(screen.getByRole("button", { name: /添加目标/ }));

      expect(screen.getByLabelText("同步目标名称")).toBeInTheDocument();
      expect(screen.getByLabelText("同步目标路径")).toBeInTheDocument();
    });
    it("点击删除按钮弹出确认对话框", async () => {
      const user = userEvent.setup();
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [
          { id: "t1", name: "测试目标", path: "/tmp/test", enabled: true },
        ],
        targetsLoading: false,
        fetchTargets: mockFetchTargets,
        addTarget: mockAddTarget,
        updateTarget: mockUpdateTarget,
        removeTarget: mockRemoveTarget,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncTargetManager />);

      const deleteBtn = screen.getByLabelText("删除 测试目标");
      await user.click(deleteBtn);

      expect(screen.getByText("确认删除同步目标")).toBeInTheDocument();
    });

    it("点击编辑按钮进入编辑模式", async () => {
      const user = userEvent.setup();
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [
          { id: "t1", name: "测试目标", path: "/tmp/test", enabled: true },
        ],
        targetsLoading: false,
        fetchTargets: mockFetchTargets,
        addTarget: mockAddTarget,
        updateTarget: mockUpdateTarget,
        removeTarget: mockRemoveTarget,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncTargetManager />);

      const editBtn = screen.getByLabelText("编辑 测试目标");
      await user.click(editBtn);

      expect(screen.getByLabelText("编辑目标名称")).toBeInTheDocument();
      expect(screen.getByLabelText("编辑目标路径")).toBeInTheDocument();
    });

    it("组件挂载时调用 fetchTargets", () => {
      render(<SyncTargetManager />);
      expect(mockFetchTargets).toHaveBeenCalledOnce();
    });
  });
});

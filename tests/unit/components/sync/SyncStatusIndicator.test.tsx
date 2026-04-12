// ============================================================
// tests/unit/components/sync/SyncStatusIndicator.test.tsx
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sync store
const mockSyncStoreState = {
  syncStatus: "idle" as "idle" | "syncing" | "done" | "error",
  targets: [] as Array<{
    id: string;
    name: string;
    path: string;
    enabled: boolean;
  }>,
  lastSyncTime: null as string | null,
  lastSyncError: null as string | null,
};

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => mockSyncStoreState),
}));

import SyncStatusIndicator from "../../../../src/components/sync/SyncStatusIndicator";

describe("SyncStatusIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncStoreState.syncStatus = "idle";
    mockSyncStoreState.targets = [];
    mockSyncStoreState.lastSyncTime = null;
    mockSyncStoreState.lastSyncError = null;
  });

  describe("idle 状态", () => {
    it("无同步目标时显示「未配置」", () => {
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText("未配置")).toBeInTheDocument();
    });

    it("有同步目标时显示「待同步」", () => {
      mockSyncStoreState.targets = [
        { id: "t1", name: "Test", path: "/tmp/test", enabled: true },
      ];
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText("待同步")).toBeInTheDocument();
    });
  });

  describe("syncing 状态", () => {
    it("显示「同步中...」和 loading 动画", () => {
      mockSyncStoreState.syncStatus = "syncing";
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText("同步中...")).toBeInTheDocument();
      // 验证 loading 图标存在（animate-spin class）
      const button = screen.getByRole("button");
      expect(button.querySelector(".animate-spin")).toBeTruthy();
    });
  });

  describe("done 状态", () => {
    it("显示「已同步」和相对时间", () => {
      mockSyncStoreState.syncStatus = "done";
      mockSyncStoreState.lastSyncTime = new Date().toISOString();
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText(/已同步/)).toBeInTheDocument();
      expect(screen.getByText(/刚刚/)).toBeInTheDocument();
    });

    it("显示分钟级相对时间", () => {
      mockSyncStoreState.syncStatus = "done";
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      mockSyncStoreState.lastSyncTime = fiveMinAgo;
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText(/5 min ago/)).toBeInTheDocument();
    });
  });

  describe("error 状态", () => {
    it("显示「同步失败」红色警告", () => {
      mockSyncStoreState.syncStatus = "error";
      mockSyncStoreState.lastSyncError = "网络错误";
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      expect(screen.getByText("同步失败")).toBeInTheDocument();
      const button = screen.getByRole("button");
      expect(button.getAttribute("title")).toBe("网络错误");
    });
  });

  describe("交互", () => {
    it("无同步目标时点击跳转到 /sync?action=add-target", async () => {
      const user = userEvent.setup();
      // targets 为空（默认）
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      await user.click(screen.getByRole("button"));
      expect(mockNavigate).toHaveBeenCalledWith("/sync?action=add-target");
    });

    it("有同步目标时点击跳转到 /sync", async () => {
      const user = userEvent.setup();
      mockSyncStoreState.targets = [
        { id: "t1", name: "Test", path: "/tmp/test", enabled: true },
      ];
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      await user.click(screen.getByRole("button"));
      expect(mockNavigate).toHaveBeenCalledWith("/sync");
    });

    it("syncing 状态下点击也能跳转（有目标）", async () => {
      const user = userEvent.setup();
      mockSyncStoreState.syncStatus = "syncing";
      mockSyncStoreState.targets = [
        { id: "t1", name: "Test", path: "/tmp/test", enabled: true },
      ];
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      await user.click(screen.getByRole("button"));
      expect(mockNavigate).toHaveBeenCalledWith("/sync");
    });

    it("error 状态下点击也能跳转（有目标）", async () => {
      const user = userEvent.setup();
      mockSyncStoreState.syncStatus = "error";
      mockSyncStoreState.targets = [
        { id: "t1", name: "Test", path: "/tmp/test", enabled: true },
      ];
      render(
        <MemoryRouter>
          <SyncStatusIndicator />
        </MemoryRouter>,
      );
      await user.click(screen.getByRole("button"));
      expect(mockNavigate).toHaveBeenCalledWith("/sync");
    });
  });
});

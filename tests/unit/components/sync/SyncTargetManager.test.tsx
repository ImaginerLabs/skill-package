// ============================================================
// tests/unit/components/sync/SyncTargetManager.test.tsx — 同步目标管理组件测试
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
vi.mock("@/lib/api", () => ({
  fetchSyncTargets: vi.fn().mockResolvedValue([]),
  fetchPathPresets: vi.fn().mockResolvedValue([]),
  addSyncTarget: vi.fn(),
  updateSyncTarget: vi.fn(),
  deleteSyncTarget: vi.fn(),
  validateSyncPath: vi.fn(),
}));

// Mock sync store
vi.mock("@/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    targets: [],
    targetsLoading: false,
    fetchTargets: vi.fn().mockResolvedValue(undefined),
    addTarget: vi.fn(),
    updateTarget: vi.fn(),
    removeTarget: vi.fn(),
  })),
}));

// Mock toast
vi.mock("@/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import SyncTargetManager from "@/components/sync/SyncTargetManager";

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/sync" element={<SyncTargetManager />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SyncTargetManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("无同步目标时显示分步引导卡片", async () => {
    renderWithRoute("/sync");

    await waitFor(() => {
      expect(screen.getByText("开始使用同步功能")).toBeInTheDocument();
    });

    // 引导按钮存在
    expect(screen.getByTestId("guide-add-target-btn")).toBeInTheDocument();
    // 步骤文字存在
    expect(screen.getByText("选择 Skill")).toBeInTheDocument();
    expect(screen.getByText("开始同步")).toBeInTheDocument();
  });

  it("URL 参数 action=add-target 时自动展开添加表单", async () => {
    renderWithRoute("/sync?action=add-target");

    await waitFor(() => {
      // 添加表单展开后，应显示名称输入框
      expect(
        screen.getByPlaceholderText("目标名称（如：CodeBuddy 项目）"),
      ).toBeInTheDocument();
    });
  });

  it("展开添加表单后引导卡片消失", async () => {
    renderWithRoute("/sync?action=add-target");

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("目标名称（如：CodeBuddy 项目）"),
      ).toBeInTheDocument();
    });

    // 引导卡片不应显示
    expect(screen.queryByText("开始使用同步功能")).not.toBeInTheDocument();
  });
});

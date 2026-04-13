import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next（使用 zh 翻译资源）
vi.mock("react-i18next", async () => {
  const { zh } = await import("../../../../src/i18n/locales/zh");
  function resolve(key: string, obj: Record<string, unknown>): string {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur)
        cur = (cur as Record<string, unknown>)[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  }
  return {
    useTranslation: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        let text = resolve(key, zh as unknown as Record<string, unknown>);
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
          }
        }
        return text;
      },
      i18n: { language: "zh", changeLanguage: vi.fn() },
    }),
  };
});

// Mock stores
const mockExecutePush = vi.fn();
const mockSetSyncStatus = vi.fn();
const mockSetSyncResult = vi.fn();

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    targets: [{ id: "t1", name: "项目A", path: "/tmp/a", enabled: true }],
    selectedSkillIds: ["s1", "s2"],
    syncStatus: "idle",
    syncResult: null,
    executePush: mockExecutePush,
    setSyncStatus: mockSetSyncStatus,
    setSyncResult: mockSetSyncResult,
  })),
}));

vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import SyncExecutor from "../../../../src/components/sync/SyncExecutor";
import { useSyncStore } from "../../../../src/stores/sync-store";

describe("SyncExecutor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染同步按钮和信息摘要", () => {
      render(<SyncExecutor />);

      expect(screen.getByText("开始同步")).toBeInTheDocument();
      expect(screen.getByText("2 Skill → 1 targets")).toBeInTheDocument();
    });

    it("无选中 Skill 时显示提示", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: [],
        syncStatus: "idle",
        syncResult: null,
        executePush: mockExecutePush,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      expect(screen.getByText("请先选择要同步的 Skill")).toBeInTheDocument();
      expect(screen.getByText("开始同步")).toBeDisabled();
    });

    it("无启用目标时显示提示", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: false }],
        selectedSkillIds: ["s1"],
        syncStatus: "idle",
        syncResult: null,
        executePush: mockExecutePush,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      expect(screen.getByText("请先添加并启用同步目标")).toBeInTheDocument();
      expect(screen.getByText("开始同步")).toBeDisabled();
    });

    it("同步中显示 loading 状态", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: ["s1"],
        syncStatus: "syncing",
        syncResult: null,
        executePush: mockExecutePush,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      expect(screen.getByText("同步中...")).toBeInTheDocument();
      expect(screen.getByText("同步中...")).toBeDisabled();
    });
  });

  describe("结果展示", () => {
    it("显示同步结果摘要和详情", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: ["s1"],
        syncStatus: "done",
        syncResult: {
          total: 3,
          success: 1,
          overwritten: 1,
          failed: 1,
          details: [
            {
              skillId: "s1",
              skillName: "Skill A",
              targetPath: "/tmp/skill-a.md",
              status: "success",
            },
            {
              skillId: "s2",
              skillName: "Skill B",
              targetPath: "/tmp/skill-b.md",
              status: "overwritten",
            },
            {
              skillId: "s3",
              skillName: "Skill C",
              targetPath: "/tmp/skill-c.md",
              status: "failed",
              error: "权限不足",
            },
          ],
        },
        executePush: mockExecutePush,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      // 摘要
      expect(screen.getByText("同步完成")).toBeInTheDocument();
      expect(screen.getByText("成功 1")).toBeInTheDocument();
      expect(screen.getByText("覆盖 1")).toBeInTheDocument();
      expect(screen.getByText("失败 1")).toBeInTheDocument();

      // 详情
      expect(screen.getByText("Skill A")).toBeInTheDocument();
      expect(screen.getByText("Skill B")).toBeInTheDocument();
      expect(screen.getByText("Skill C")).toBeInTheDocument();
      expect(screen.getByText("权限不足")).toBeInTheDocument();

      // 清除结果按钮
      expect(screen.getByText("清除结果")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击同步按钮调用 executePush", async () => {
      const user = userEvent.setup();
      mockExecutePush.mockResolvedValue({
        total: 1,
        success: 1,
        overwritten: 0,
        failed: 0,
        details: [],
      });

      render(<SyncExecutor />);

      await user.click(screen.getByText("开始同步"));

      expect(mockExecutePush).toHaveBeenCalledOnce();
    });

    it("点击清除结果调用 setSyncStatus 和 setSyncResult", async () => {
      const user = userEvent.setup();
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: ["s1"],
        syncStatus: "done",
        syncResult: {
          total: 1,
          success: 1,
          overwritten: 0,
          failed: 0,
          details: [
            {
              skillId: "s1",
              skillName: "Skill A",
              targetPath: "/tmp/a.md",
              status: "success",
            },
          ],
        },
        executePush: mockExecutePush,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      await user.click(screen.getByText("清除结果"));

      expect(mockSetSyncStatus).toHaveBeenCalledWith("idle");
      expect(mockSetSyncResult).toHaveBeenCalledWith(null);
    });
  });
});

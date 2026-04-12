import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StatusBar from "../../../src/components/layout/StatusBar";

// 使用 vi.hoisted 避免 mock factory 提升问题
const { mockUseSkillStore, mockUseSyncStore } = vi.hoisted(() => ({
  mockUseSkillStore: vi.fn(() => ({
    skills: [{ id: "1" }, { id: "2" }, { id: "3" }],
  })),
  mockUseSyncStore: vi.fn(() => ({
    lastSyncTime: null,
  })),
}));

vi.mock("../../../src/stores/skill-store", () => ({
  useSkillStore: mockUseSkillStore,
}));

vi.mock("../../../src/stores/sync-store", () => ({
  useSyncStore: mockUseSyncStore,
}));

describe("StatusBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillStore.mockReturnValue({
      skills: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });
    mockUseSyncStore.mockReturnValue({ lastSyncTime: null });
  });

  it("渲染版本号", () => {
    render(<StatusBar />);
    expect(screen.getByText("v0.1.0")).toBeInTheDocument();
  });

  it("渲染 Skill 总数", () => {
    render(<StatusBar />);
    expect(screen.getByText("3 Skills")).toBeInTheDocument();
  });

  it("lastSyncTime 为 null 时显示占位符", () => {
    render(<StatusBar />);
    expect(screen.getByText("最后同步: —")).toBeInTheDocument();
  });

  it("lastSyncTime 有值时显示格式化时间", () => {
    // 使用固定时间戳，避免时区问题
    const isoTime = "2024-06-15T14:30:00.000Z";
    mockUseSyncStore.mockReturnValue({ lastSyncTime: isoTime });

    render(<StatusBar />);

    // 格式化后应包含 "最后同步:" 前缀，且不是占位符
    const syncText = screen.getByText(/最后同步:/);
    expect(syncText).toBeInTheDocument();
    expect(syncText.textContent).not.toBe("最后同步: —");
  });

  it("lastSyncTime 格式化为 HH:MM 格式", () => {
    // 构造一个确定的本地时间
    const date = new Date(2024, 5, 15, 9, 5, 0); // 2024-06-15 09:05:00 本地时间
    mockUseSyncStore.mockReturnValue({ lastSyncTime: date.toISOString() });

    render(<StatusBar />);

    const syncText = screen.getByText(/最后同步:/);
    // 应包含两位小时和两位分钟，格式如 "09:05"
    expect(syncText.textContent).toMatch(/最后同步: \d{2}:\d{2}/);
  });

  it("Skill 数量为 0 时显示 0 Skills", () => {
    mockUseSkillStore.mockReturnValue({ skills: [] });

    render(<StatusBar />);
    expect(screen.getByText("0 Skills")).toBeInTheDocument();
  });

  it("状态栏固定高度 28px (h-7)", () => {
    render(<StatusBar />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("h-7");
  });

  it("包含暗色主题样式", () => {
    render(<StatusBar />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("border-t");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../../../src/components/layout/Header";

// Mock react-i18next
vi.mock("react-i18next", () => {
  const zh = {
    "header.searchPlaceholder": "⌘K 搜索 Skill...",
    "header.searchAriaLabel": "全局搜索",
    "header.toggleTheme": "切换主题",
    "header.switchLanguage": "切换语言",
    "header.langZh": "中",
    "header.langEn": "EN",
  };
  return {
    useTranslation: () => ({
      t: (key: string) => (zh as Record<string, string>)[key] ?? key,
      i18n: { language: "zh", changeLanguage: vi.fn() },
    }),
  };
});

// Mock stores
const mockSetCommandPaletteOpen = vi.fn();
vi.mock("../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    setCommandPaletteOpen: mockSetCommandPaletteOpen,
    theme: "dark",
    toggleTheme: vi.fn(),
  })),
}));

// Mock SyncStatusIndicator 组件
vi.mock("../../../src/components/sync/SyncStatusIndicator", () => ({
  default: () => <span data-testid="sync-status-indicator">已同步</span>,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("渲染 Logo 文字", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("Skill Manager")).toBeInTheDocument();
  });

  it("渲染搜索入口", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("⌘K 搜索 Skill...")).toBeInTheDocument();
  });

  it("点击搜索入口打开 Command Palette", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    await user.click(screen.getByText("⌘K 搜索 Skill..."));
    expect(mockSetCommandPaletteOpen).toHaveBeenCalledWith(true);
  });

  it("渲染 SyncStatusIndicator 组件", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("sync-status-indicator")).toBeInTheDocument();
  });

  it("顶部栏固定高度 48px (h-12)", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const header = screen.getByRole("banner");
    expect(header.className).toContain("h-12");
  });
});

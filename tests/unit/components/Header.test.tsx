import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../../../src/components/layout/Header";

// Mock stores
const mockSetCommandPaletteOpen = vi.fn();
vi.mock("../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    setCommandPaletteOpen: mockSetCommandPaletteOpen,
  })),
}));

vi.mock("../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: [{ id: "1", name: "test" }],
  })),
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

  it("有 Skill 时显示已同步状态", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("已同步")).toBeInTheDocument();
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

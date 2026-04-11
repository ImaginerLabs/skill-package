import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StatusBar from "../../../src/components/layout/StatusBar";

vi.mock("../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: [{ id: "1" }, { id: "2" }, { id: "3" }],
  })),
}));

describe("StatusBar", () => {
  it("渲染版本号", () => {
    render(<StatusBar />);
    expect(screen.getByText("v0.1.0")).toBeInTheDocument();
  });

  it("渲染 Skill 总数", () => {
    render(<StatusBar />);
    expect(screen.getByText("3 Skills")).toBeInTheDocument();
  });

  it("渲染最后同步时间占位", () => {
    render(<StatusBar />);
    expect(screen.getByText("最后同步: —")).toBeInTheDocument();
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

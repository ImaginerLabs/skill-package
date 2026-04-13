// ============================================================
// tests/unit/components/stats/StatsPanel.test.tsx
// Story 7.2: Sidebar 系统状态面板
// 验收标准 AC-1/2/3: 统计数字正确计算和展示
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StatsPanel from "../../../../src/components/stats/StatsPanel";
import { useSkillStore } from "../../../../src/stores/skill-store";

// ─────────────────────────────────────────────
// Mock skill-store
// ─────────────────────────────────────────────
const mockSkills = [
  { id: "1", name: "skill1", type: undefined },
  { id: "2", name: "skill2", type: "coding" },
  { id: "3", name: "wf1", type: "workflow" },
  { id: "4", name: "wf2", type: "workflow" },
];

const mockCategories = [
  { name: "coding", displayName: "编程", skillCount: 2 },
  { name: "writing", displayName: "写作", skillCount: 1 },
  { name: "devops", displayName: "DevOps", skillCount: 0 },
];

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn((selector: any) => {
    const state = {
      skills: mockSkills,
      categories: mockCategories,
    };
    return selector ? selector(state) : state;
  }),
}));

describe("StatsPanel — Story 7.2", () => {
  beforeEach(() => {
    vi.mocked(useSkillStore).mockImplementation((selector: any) => {
      const state = { skills: mockSkills, categories: mockCategories };
      return selector ? selector(state) : state;
    });
  });
  // ─────────────────────────────────────────────
  // AC-1: 展示三项统计数据
  // ─────────────────────────────────────────────
  it("渲染统计面板", () => {
    render(<StatsPanel />);
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-1/3: 统计数字计算正确
  // ─────────────────────────────────────────────
  it("正确计算 Skill 总数（排除 workflow 类型）", () => {
    render(<StatsPanel />);
    // mockSkills 中 type !== 'workflow' 的有 2 个（id:1, id:2）
    expect(screen.getByTestId("stats-count-Skills").textContent).toBe("2");
  });

  it("正确计算工作流总数", () => {
    render(<StatsPanel />);
    // mockSkills 中 type === 'workflow' 的有 2 个（id:3, id:4）
    expect(screen.getByTestId("stats-count-工作流").textContent).toBe("2");
  });

  it("正确计算分类总数", () => {
    render(<StatsPanel />);
    // mockCategories 有 3 个
    expect(screen.getByTestId("stats-count-分类").textContent).toBe("3");
  });

  // ─────────────────────────────────────────────
  // AC-2: 标签文字正确
  // ─────────────────────────────────────────────
  it("展示三个统计标签", () => {
    render(<StatsPanel />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("工作流")).toBeInTheDocument();
    expect(screen.getByText("分类")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // 边界情况：空数据
  // ─────────────────────────────────────────────
  it("空 skills 和 categories 时显示 0", () => {
    vi.mocked(useSkillStore).mockImplementation((selector: any) => {
      const state = { skills: [], categories: [] };
      return selector ? selector(state) : state;
    });

    render(<StatsPanel />);
    expect(screen.getByTestId("stats-count-Skills").textContent).toBe("0");
    expect(screen.getByTestId("stats-count-工作流").textContent).toBe("0");
    expect(screen.getByTestId("stats-count-分类").textContent).toBe("0");
  });
});

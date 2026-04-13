// ============================================================
// tests/unit/components/stats/ActivityHeatmap.test.tsx
// Story 7.2: 活跃度热力图
// 验收标准 AC-4/5/6/8/9/10
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActivityHeatmap, {
  getHeatColor,
} from "../../../../src/components/stats/ActivityHeatmap";

// ─────────────────────────────────────────────
// Mock api.fetchActivityStats
// ─────────────────────────────────────────────
const mockFetchActivityStats = vi.fn();

vi.mock("../../../../src/lib/api", () => ({
  fetchActivityStats: (...args: any[]) => mockFetchActivityStats(...args),
}));

// 生成 84 天的测试数据
function generateDays(count: number, baseCount = 0) {
  const days = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: baseCount });
  }
  return days;
}

describe("ActivityHeatmap — Story 7.2", () => {
  // ─────────────────────────────────────────────
  // getHeatColor 颜色映射单元测试 (AC-5)
  // ─────────────────────────────────────────────
  describe("getHeatColor 颜色映射", () => {
    it("0 次 → muted 颜色", () => {
      expect(getHeatColor(0)).toBe("hsl(var(--muted))");
    });

    it("1 次 → primary 30% 透明度", () => {
      expect(getHeatColor(1)).toBe("hsl(var(--primary) / 0.3)");
    });

    it("2 次 → primary 30% 透明度", () => {
      expect(getHeatColor(2)).toBe("hsl(var(--primary) / 0.3)");
    });

    it("3 次 → primary 60% 透明度", () => {
      expect(getHeatColor(3)).toBe("hsl(var(--primary) / 0.6)");
    });

    it("5 次 → primary 60% 透明度", () => {
      expect(getHeatColor(5)).toBe("hsl(var(--primary) / 0.6)");
    });

    it("6 次 → primary 完整颜色", () => {
      expect(getHeatColor(6)).toBe("hsl(var(--primary))");
    });

    it("10 次 → primary 完整颜色", () => {
      expect(getHeatColor(10)).toBe("hsl(var(--primary))");
    });
  });

  // ─────────────────────────────────────────────
  // AC-4: 热力图渲染 84 个豆点
  // ─────────────────────────────────────────────
  it("加载完成后渲染热力图", async () => {
    const days = generateDays(84);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);

    // 等待加载完成
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-10: aria-label 无障碍
  // ─────────────────────────────────────────────
  it("热力图有正确的 aria-label", async () => {
    const days = generateDays(84);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toHaveAttribute("aria-label", "近 12 周 Skill 修改活跃度");
  });

  // ─────────────────────────────────────────────
  // AC-6: Tooltip 内容格式
  // ─────────────────────────────────────────────
  it("豆点 title 格式为 YYYY-MM-DD · N 次修改", async () => {
    const days = generateDays(84, 3);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    await screen.findByTestId("activity-heatmap");

    // 检查第一个豆点的 title
    const firstDot = screen.getByTestId(`heatmap-dot-${days[0].date}`);
    expect(firstDot).toHaveAttribute("title", `${days[0].date} · 3 次修改`);
  });

  // ─────────────────────────────────────────────
  // 加载状态
  // ─────────────────────────────────────────────
  it("加载中显示 loading 状态", () => {
    // 永不 resolve 的 promise
    mockFetchActivityStats.mockReturnValue(new Promise(() => {}));

    render(<ActivityHeatmap />);
    expect(screen.getByTestId("activity-heatmap-loading")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // API 失败时优雅降级
  // ─────────────────────────────────────────────
  it("API 失败时渲染空热力图（无豆点）", async () => {
    mockFetchActivityStats.mockRejectedValue(new Error("Network error"));

    render(<ActivityHeatmap />);
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toBeInTheDocument();
    // 无数据时无豆点
    expect(screen.queryAllByTestId(/^heatmap-dot-/)).toHaveLength(0);
  });
});

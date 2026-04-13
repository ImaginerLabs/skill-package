// ============================================================
// tests/unit/components/layout/StatusBar.version.test.tsx
// Story 2.4: 版本号与 package.json 同步
// 验收标准：
//   - 页面显示的版本号来自 __APP_VERSION__ 全局常量（Vite define 注入）
//   - 测试环境中 __APP_VERSION__ 由 vitest.config.ts define 注入为 "test"
//   - 版本号格式为 "v{version}"
//   - 不是硬编码的静态字符串
// ============================================================

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StatusBar from "../../../../src/components/layout/StatusBar";

// Mock stores
const { mockUseSkillStore, mockUseSyncStore } = vi.hoisted(() => ({
  mockUseSkillStore: vi.fn(() => ({ skills: [] })),
  mockUseSyncStore: vi.fn(() => ({ lastSyncTime: null })),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: mockUseSkillStore,
}));

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: mockUseSyncStore,
}));

describe("StatusBar — 版本号注入 (Story 2.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillStore.mockReturnValue({ skills: [] });
    mockUseSyncStore.mockReturnValue({ lastSyncTime: null });
  });

  // ─────────────────────────────────────────────
  // 版本号渲染
  // ─────────────────────────────────────────────
  describe("版本号渲染", () => {
    it("渲染版本号，格式为 v{version}", () => {
      render(<StatusBar />);
      // vitest.config.ts 中 define: { __APP_VERSION__: JSON.stringify("test") }
      // 所以测试环境版本号为 "vtest"
      expect(screen.getByText("vtest")).toBeInTheDocument();
    });

    it("版本号使用 __APP_VERSION__ 全局常量（非硬编码）", () => {
      render(<StatusBar />);
      // 验证：版本号文本与 __APP_VERSION__ 全局常量一致
      // 在测试环境中 __APP_VERSION__ === "test"
      expect(screen.getByText(`v${__APP_VERSION__}`)).toBeInTheDocument();
    });

    it("版本号元素使用等宽字体样式", () => {
      render(<StatusBar />);
      const versionEl = screen.getByText("vtest");
      expect(versionEl.className).toContain("font-[var(--font-code)]");
    });

    it("版本号位于状态栏左侧", () => {
      render(<StatusBar />);
      const footer = screen.getByRole("contentinfo");
      const versionEl = screen.getByText("vtest");
      // 版本号应是 footer 的第一个子元素（左侧）
      expect(footer.firstElementChild?.textContent).toBe("vtest");
    });
  });

  // ─────────────────────────────────────────────
  // 全局常量可访问性验证
  // ─────────────────────────────────────────────
  describe("__APP_VERSION__ 全局常量", () => {
    it("__APP_VERSION__ 在测试环境中为字符串类型", () => {
      expect(typeof __APP_VERSION__).toBe("string");
    });

    it("__APP_VERSION__ 在测试环境中由 vitest.config.ts 注入为 'test'", () => {
      // 这个测试验证 vitest.config.ts 中的 define 配置正确生效
      // 如果此测试失败，说明 vitest.config.ts 的 define 配置缺失
      expect(__APP_VERSION__).toBe("test");
    });

    it("__APP_VERSION__ 不是空字符串", () => {
      expect(__APP_VERSION__).not.toBe("");
    });
  });
});

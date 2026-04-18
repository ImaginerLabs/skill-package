import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSourceDisplay } from "../../../src/hooks/useSourceDisplay";

describe("useSourceDisplay", () => {
  const { result } = renderHook(() => useSourceDisplay());

  describe("getIcon", () => {
    it("返回 anthropic-official 的图标", () => {
      expect(result.current.getIcon("anthropic-official")).toBe("🏢");
    });

    it("返回 awesome-copilot 的图标", () => {
      expect(result.current.getIcon("awesome-copilot")).toBe("🌟");
    });

    it("空字符串返回默认图标", () => {
      expect(result.current.getIcon("")).toBe("👤");
    });

    it("未知来源返回默认图标", () => {
      expect(result.current.getIcon("unknown-source")).toBe("📦");
    });
  });

  describe("getDisplayName", () => {
    it("返回 anthropic-official 的显示名", () => {
      expect(result.current.getDisplayName("anthropic-official")).toBe(
        "Anthropic",
      );
    });

    it("返回 awesome-copilot 的显示名", () => {
      expect(result.current.getDisplayName("awesome-copilot")).toBe("Awesome");
    });

    it("空字符串返回我的 Skill", () => {
      expect(result.current.getDisplayName("")).toBe("我的 Skill");
    });

    it("未知来源返回来源本身作为显示名", () => {
      expect(result.current.getDisplayName("custom-repo")).toBe("custom-repo");
    });
  });
});

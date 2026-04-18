// ============================================================
// hooks/useSourceDisplay.ts — 统一的来源显示映射
// ============================================================

/** 来源映射配置 */
const SOURCE_MAP: Record<string, { icon: string; displayName: string }> = {
  "": { icon: "👤", displayName: "" },
  "anthropic-official": { icon: "🏢", displayName: "Anthropic" },
  "awesome-copilot": { icon: "🌟", displayName: "Awesome" },
};

const DEFAULT_ICON = "📦";
const DEFAULT_DISPLAY = "我的 Skill";

/**
 * useSourceDisplay — 来源显示映射 hook
 *
 * @example
 * const { getIcon, getDisplayName } = useSourceDisplay();
 * getIcon("anthropic-official") // "🏢"
 * getDisplayName("") // "我的 Skill"
 */
export function useSourceDisplay() {
  const getIcon = (source: string): string => {
    return SOURCE_MAP[source]?.icon || DEFAULT_ICON;
  };

  const getDisplayName = (source: string): string => {
    if (source === "") {
      return DEFAULT_DISPLAY;
    }
    return SOURCE_MAP[source]?.displayName || source || DEFAULT_DISPLAY;
  };

  return {
    getIcon,
    getDisplayName,
  };
}

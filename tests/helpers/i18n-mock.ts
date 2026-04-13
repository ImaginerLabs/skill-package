// ============================================================
// tests/helpers/i18n-mock.ts — 通用 react-i18next mock
// 导入 zh 翻译资源，让 t() 返回真实中文文本
// ============================================================

import { vi } from "vitest";
import { zh } from "../../src/i18n/locales/zh";

/**
 * 根据嵌套 key（如 "sync.startSync"）从翻译对象中取值
 */
function resolve(key: string, obj: Record<string, unknown>): string {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key; // 找不到则返回 key 本身
    }
  }
  return typeof current === "string" ? current : key;
}

/**
 * 模拟 t() 函数：解析嵌套 key，支持 {{var}} 插值
 */
export function mockT(key: string, params?: Record<string, unknown>): string {
  let text = resolve(key, zh as unknown as Record<string, unknown>);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    }
  }
  return text;
}

/**
 * 创建 react-i18next mock 对象，可直接用于 vi.mock 的工厂函数返回值
 */
export function createI18nMock() {
  return {
    useTranslation: () => ({
      t: mockT,
      i18n: {
        language: "zh",
        changeLanguage: vi.fn(),
      },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: { type: "3rdParty", init: vi.fn() },
  };
}

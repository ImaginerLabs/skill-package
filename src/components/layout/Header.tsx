import { Moon, Search, Sun, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUIStore } from "../../stores/ui-store";
import SyncStatusIndicator from "../sync/SyncStatusIndicator";

/**
 * 顶部栏 — Logo + 全局搜索入口 + 主题切换 + 同步状态
 * 固定高度 48px，固定在页面顶部
 */
export default function Header() {
  const { setCommandPaletteOpen, theme, toggleTheme } = useUIStore();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith("zh") ? "zh" : "en";

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "zh" ? "en" : "zh");
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      {/* 左侧：Logo */}
      <div className="flex items-center gap-2">
        <Zap size={20} className="text-[hsl(var(--primary))]" />
        <span className="text-[hsl(var(--primary))] font-bold font-[var(--font-code)] text-base">
          Skill Manager
        </span>
      </div>

      {/* 中间：全局搜索入口 */}
      <button
        type="button"
        aria-label={t("header.searchAriaLabel")}
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--muted))] transition-colors duration-200 min-w-[280px]"
      >
        <Search size={14} />
        <span className="flex-1 text-left">
          {t("header.searchPlaceholder")}
        </span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface-elevated))] font-[var(--font-code)]">
          ⌘K
        </kbd>
      </button>

      {/* 右侧：主题切换 + 语言切换 + 同步状态指示器 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t("header.toggleTheme")}
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors duration-200"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {/* 语言切换按钮 */}
        <button
          type="button"
          data-testid="lang-toggle"
          aria-label={t("header.switchLanguage")}
          onClick={toggleLanguage}
          className="flex items-center gap-1 h-8 px-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors duration-200 text-xs font-[var(--font-code)] font-medium"
        >
          <span>{currentLang === "zh" ? "🇨🇳" : "🇺🇸"}</span>
          <span>
            {currentLang === "zh" ? t("header.langZh") : t("header.langEn")}
          </span>
        </button>
        <SyncStatusIndicator />
      </div>
    </header>
  );
}

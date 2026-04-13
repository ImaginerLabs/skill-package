// ============================================================
// ide-icons/ide-matcher.ts — 路径匹配 → IDE 配置
// 使用 @lobehub/icons 官方图标（CompoundedIcon 结构）
// ============================================================

import {
  Amp,
  Claude,
  ClaudeCode,
  Cline,
  CodeGeeX,
  Codex,
  Cursor,
  GeminiCLI,
  GithubCopilot,
  Goose,
  Junie,
  KiloCode,
  Kwaipilot,
  Lovable,
  OpenCode,
  OpenHands,
  Replit,
  RooCode,
  Trae,
  V0,
  Windsurf,
  Zencoder,
} from "./index";

// 每个图标来自不同模块，各自的 CompoundedIcon 类型不兼容，用 any 统一
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = any;

export interface IDEConfig {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  label: string;
  /** @lobehub/icons CompoundedIcon 实例（含 .Mono、.Avatar、.colorPrimary） */
  Icon: AnyIcon;
  /** 路径关键词（全部转小写后匹配） */
  keywords: string[];
}

/** IDE 配置表，按优先级排列（越靠前越优先匹配） */
export const IDE_CONFIGS: IDEConfig[] = [
  // ── 主流 AI IDE ──────────────────────────────────────────────────────────
  {
    id: "cursor",
    label: "Cursor",
    Icon: Cursor,
    keywords: ["cursor", ".cursor", "cursor.app", "cursor.exe"],
  },
  {
    id: "claude-code",
    label: "Claude Code",
    Icon: ClaudeCode,
    keywords: ["claude-code", "claude_code", "claudecode", ".claude"],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    Icon: Windsurf,
    keywords: ["windsurf", "codeium"],
  },
  {
    id: "trae",
    label: "Trae",
    Icon: Trae,
    keywords: ["trae", "trae.ai"],
  },
  {
    id: "opencode",
    label: "OpenCode",
    Icon: OpenCode,
    keywords: ["opencode", "open-code"],
  },
  {
    id: "codex",
    label: "Codex",
    Icon: Codex,
    keywords: ["codex", "openai-codex", "openai/codex"],
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    Icon: GithubCopilot,
    keywords: ["copilot", "github-copilot", "github.copilot"],
  },
  {
    id: "cline",
    label: "Cline",
    Icon: Cline,
    keywords: ["cline", ".cline"],
  },
  // ── VS Code 扩展 / 插件类 ─────────────────────────────────────────────────
  {
    id: "kilocode",
    label: "Kilo Code",
    Icon: KiloCode,
    keywords: ["kilocode", "kilo-code", "kilo_code"],
  },
  {
    id: "roocode",
    label: "Roo Code",
    Icon: RooCode,
    keywords: ["roocode", "roo-code", "roo_code", ".roo"],
  },
  {
    id: "zencoder",
    label: "Zencoder",
    Icon: Zencoder,
    keywords: ["zencoder", "zen-coder"],
  },
  // ── 国内 AI 编码工具 ──────────────────────────────────────────────────────
  {
    // CodeBuddy（腾讯云）底层使用 CodeGeeX 技术，lobehub 暂无 CodeBuddy 专属图标
    id: "codebuddy",
    label: "CodeBuddy",
    Icon: CodeGeeX,
    keywords: [
      "codebuddy",
      "code-buddy",
      "code_buddy",
      "codegeex",
      "code-geex",
    ],
  },
  {
    id: "kwaipilot",
    label: "Kwaipilot",
    Icon: Kwaipilot,
    keywords: ["kwaipilot", "kwai-pilot", "kwai_pilot"],
  },
  // ── AI 编码代理 / 在线 IDE ────────────────────────────────────────────────
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    Icon: GeminiCLI,
    keywords: ["gemini-cli", "geminicli", "gemini_cli"],
  },
  {
    id: "goose",
    label: "Goose",
    Icon: Goose,
    keywords: ["goose", ".goose", "block-goose"],
  },
  {
    id: "junie",
    label: "Junie",
    Icon: Junie,
    keywords: ["junie", "jetbrains-junie"],
  },
  {
    id: "replit",
    label: "Replit",
    Icon: Replit,
    keywords: ["replit", "repl.it", ".replit"],
  },
  {
    id: "openhands",
    label: "OpenHands",
    Icon: OpenHands,
    keywords: ["openhands", "open-hands", "all-hands", "allhands"],
  },
  {
    id: "lovable",
    label: "Lovable",
    Icon: Lovable,
    keywords: ["lovable", "lovable.dev"],
  },
  {
    id: "v0",
    label: "v0",
    Icon: V0,
    keywords: ["v0", "v0.dev", "vercel-v0"],
  },
  {
    id: "amp",
    label: "Amp",
    Icon: Amp,
    keywords: ["amp", "sourcegraph-amp", "ampcode"],
  },
  // ── Claude（通用，优先级低于 claude-code）────────────────────────────────
  {
    id: "claude",
    label: "Claude",
    Icon: Claude,
    keywords: ["claude", "anthropic"],
  },
];

/**
 * 根据路径字符串匹配对应的 IDE 配置
 * @param path 用户输入的路径
 * @returns 匹配到的 IDEConfig，未匹配返回 null
 */
export function matchIDEByPath(path: string): IDEConfig | null {
  if (!path || !path.trim()) return null;
  // 统一转小写 + 将反斜杠转为正斜杠（兼容 Windows 路径）
  const normalized = path.toLowerCase().replace(/\\/g, "/");
  return (
    IDE_CONFIGS.find((cfg) =>
      cfg.keywords.some((kw) => normalized.includes(kw)),
    ) ?? null
  );
}

// ============================================================
// shared/types.ts — 前后端共享核心类型定义
// ============================================================

// ---- Skill 相关类型 ----

/** Skill 元数据（从 Frontmatter 解析） */
export interface SkillMeta {
  /** slug 化文件名（不含扩展名） */
  id: string;
  /** Frontmatter: name */
  name: string;
  /** Frontmatter: description */
  description: string;
  /** Frontmatter: category */
  category: string;
  /** Frontmatter: tags */
  tags: string[];
  /** Frontmatter: type — 仅工作流 Skill 有此字段 */
  type?: "workflow";
  /** Frontmatter: author */
  author?: string;
  /** Frontmatter: version */
  version?: string;
  /** 相对于 skills/ 的路径 */
  filePath: string;
  /** 文件大小（bytes） */
  fileSize: number;
  /** ISO 8601 时间戳 */
  lastModified: string;
}

/** 完整 Skill（含 Markdown 正文） */
export interface SkillFull extends SkillMeta {
  /** Markdown 正文（不含 Frontmatter） */
  content: string;
  /** 原始文件内容（含 Frontmatter） */
  rawContent: string;
}

// ---- 工作流相关类型 ----

/** 工作流步骤 */
export interface WorkflowStep {
  order: number;
  skillId: string;
  skillName: string;
  description: string;
}

/** 工作流 */
export interface Workflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

// ---- 同步相关类型 ----

/** 同步目标 */
export interface SyncTarget {
  id: string;
  /** 例如 "CodeBuddy" */
  name: string;
  /** 绝对路径 */
  path: string;
  enabled: boolean;
}

/** 同步详情 */
export interface SyncDetail {
  skillId: string;
  skillName: string;
  targetPath: string;
  status: "success" | "overwritten" | "failed";
  error?: string;
}

/** 同步结果 */
export interface SyncResult {
  total: number;
  success: number;
  overwritten: number;
  failed: number;
  details: SyncDetail[];
}

// ---- 分类与配置类型 ----

/** 分类 */
export interface Category {
  name: string;
  displayName: string;
  description?: string;
  skillCount: number;
}

/** 应用配置 */
export interface AppConfig {
  version: string;
  sync: {
    targets: SyncTarget[];
  };
  categories: Category[];
  ui: {
    defaultView: "grid" | "list";
    sidebarWidth: number;
  };
}

// ---- API 响应类型 ----

/** 成功响应 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** 错误响应 */
export interface ApiErrorResponse {
  success: false;
  error: {
    /** 错误码，例如 "SKILL_NOT_FOUND"、"PARSE_ERROR" */
    code: string;
    /** 用户可读的错误信息 */
    message: string;
    /** 可选的详细信息（开发模式下可能包含 stack trace） */
    details?: unknown;
  };
}

/** 统一 API 响应类型 */
export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

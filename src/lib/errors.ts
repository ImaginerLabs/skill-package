// ============================================================
// src/lib/errors.ts — 前端错误类定义
// ============================================================

/**
 * API 客户端错误 — 前端 API 调用失败时抛出
 */
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;

    // 确保 instanceof 正确工作
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

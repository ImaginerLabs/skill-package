// ============================================================
// src/lib/apiClient.ts — 前端 API 调用工具
// ============================================================

import type { ApiResponse } from "../../shared/types";
import { ApiClientError } from "./errors";

/**
 * 通用 API 请求函数
 * 自动解析 ApiResponse<T> 格式，成功时返回 data，失败时抛出 ApiClientError
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (err) {
    // 网络错误
    throw new ApiClientError(
      "NETWORK_ERROR",
      err instanceof Error ? err.message : "网络请求失败",
    );
  }

  // 尝试解析 JSON 响应
  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError(
      "PARSE_ERROR",
      `服务器返回了非 JSON 响应（HTTP ${res.status}）`,
    );
  }

  // 检查 API 响应格式
  if (!json.success) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      json.error.details,
    );
  }

  return json.data;
}

/**
 * GET 请求
 */
export async function apiGet<T>(url: string): Promise<T> {
  return request<T>(url, { method: "GET" });
}

/**
 * POST 请求
 */
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function apiDel<T>(url: string): Promise<T> {
  return request<T>(url, { method: "DELETE" });
}

// ============================================================
// server/services/importService.ts — 文件导入服务
// ============================================================

import fs from "fs-extra";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ImportRequest,
  ImportResult,
  ImportResultItem,
} from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { safeWrite } from "../utils/fileUtils.js";
import { isSubPath, normalizePath } from "../utils/pathUtils.js";
import { getDefaultScanPath } from "./scanService.js";
import { refreshSkillCache } from "./skillService.js";

// 项目根目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");

/**
 * 导入文件到 skills 目录
 *
 * 流程：
 * 1. 读取源文件内容
 * 2. 解析 Frontmatter
 * 3. 补充缺失字段（category, name, description）
 * 4. 重新序列化为 Frontmatter + content
 * 5. 使用 safeWrite 写入到 skills/{category}/{filename}
 * 6. 刷新 Skill 缓存
 */
/** 合法分类名正则：只允许小写字母、数字、连字符 */
const VALID_CATEGORY_RE = /^[a-z0-9-]+$/;

export async function importFiles(
  request: ImportRequest,
): Promise<ImportResult> {
  const { items, category } = request;
  const details: ImportResultItem[] = [];
  let successCount = 0;
  let failedCount = 0;

  // P2-fix: 校验 category 合法性，防止路径注入，使用语义正确的 validationError
  if (!VALID_CATEGORY_RE.test(category)) {
    throw AppError.validationError(
      `非法分类名 "${category}"，只允许小写字母、数字和连字符`,
    );
  }

  // P1-fix: 优先使用调用方传入的 scanRoot，fallback 到默认 CodeBuddy 扫描路径
  const allowedScanRoot = request.scanRoot
    ? normalizePath(path.resolve(request.scanRoot))
    : getDefaultScanPath();

  for (const item of items) {
    try {
      // P2: 校验 absolutePath 必须在允许的扫描目录内
      const resolvedSrc = normalizePath(path.resolve(item.absolutePath));
      if (!isSubPath(resolvedSrc, allowedScanRoot)) {
        throw AppError.pathTraversal(
          `源文件路径超出允许范围: ${item.absolutePath}`,
        );
      }

      // 1. 读取源文件
      const rawContent = await fs.readFile(item.absolutePath, "utf-8");
      const fileName = path.basename(item.absolutePath);

      // 2. 解析 Frontmatter
      // P4: 解析失败时保留原始内容，不调用 matter.stringify 避免重复 Frontmatter
      let data: Record<string, unknown>;
      let content: string;
      let parseFailed = false;
      try {
        const parsed = matter(rawContent);
        data = parsed.data as Record<string, unknown>;
        content = parsed.content;
      } catch {
        // Frontmatter 解析失败，直接使用原始内容，跳过 Frontmatter 补充
        data = {};
        content = rawContent;
        parseFailed = true;
      }

      // 3. 补充缺失字段（仅在解析成功时执行）
      let newContent: string;
      if (parseFailed) {
        // 解析失败：直接写入原始内容，不添加 Frontmatter
        newContent = rawContent;
      } else {
        if (!data.category) {
          data.category = category;
        }
        if (!data.name) {
          data.name = path.basename(fileName, ".md");
        }
        if (data.description === undefined || data.description === null) {
          data.description = "";
        }

        // 4. 重新序列化
        newContent = matter.stringify(content, data);
      }

      // 5. 写入到 skills/{category}/{filename}
      const targetDir = path.join(SKILLS_ROOT, category);
      const targetPath = path.join(targetDir, fileName);
      await safeWrite(targetPath, newContent);

      details.push({ name: item.name, status: "success" });
      successCount++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      details.push({
        name: item.name,
        status: "failed",
        error: errorMsg,
      });
      failedCount++;
    }
  }

  // 6. 刷新 Skill 缓存
  try {
    await refreshSkillCache();
  } catch {
    // 缓存刷新失败不影响导入结果
    console.error("[importService] 刷新缓存失败");
  }

  return {
    total: items.length,
    success: successCount,
    failed: failedCount,
    details,
  };
}

/**
 * 获取 skills 根目录路径（用于测试）
 */
export function getSkillsRoot(): string {
  return normalizePath(SKILLS_ROOT);
}

/**
 * 清理源文件（导入后删除原始文件）
 *
 * P1: 每个路径必须在允许的扫描目录内，防止任意文件删除
 *
 * @param filePaths - 要删除的文件绝对路径列表
 * @param allowedRoot - 允许删除的根目录（默认为 CodeBuddy 扫描路径）
 * @returns 清理结果
 */
export async function cleanupFiles(
  filePaths: string[],
  allowedRoot?: string,
): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const root = allowedRoot ?? getDefaultScanPath();
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const filePath of filePaths) {
    try {
      // P1: 校验路径必须在允许的根目录内
      const resolved = normalizePath(path.resolve(filePath));
      if (!isSubPath(resolved, root)) {
        // 路径安全拒绝计入 failed，不中断其他文件的清理
        failedCount++;
        errors.push(`${path.basename(filePath)}: 路径超出允许范围，拒绝删除`);
        continue;
      }
      await fs.remove(filePath);
      successCount++;
    } catch (err) {
      failedCount++;
      errors.push(
        `${path.basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return {
    total: filePaths.length,
    success: successCount,
    failed: failedCount,
    errors,
  };
}

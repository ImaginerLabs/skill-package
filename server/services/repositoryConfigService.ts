// ============================================================
// server/services/repositoryConfigService.ts — 外部仓库配置读取服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import { RepositoriesConfigSchema } from "../../shared/schemas.js";
import type { RepositoriesConfig } from "../../shared/types.js";
import { readYaml } from "../utils/yamlUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const REPOSITORIES_PATH = path.join(
  PROJECT_ROOT,
  "config",
  "repositories.yaml",
);

/**
 * 加载外部仓库注册配置
 *
 * - 文件不存在 → 返回 { repositories: [] }（FR-EH-05）
 * - 文件格式错误（YAML 语法错误或 Schema 校验失败）→ 记录错误日志，返回 { repositories: [] }，不阻塞启动（FR-EH-06）
 * - 文件正常 → 返回解析后的 RepositoriesConfig 对象
 */
export async function loadRepositoriesConfig(): Promise<RepositoriesConfig> {
  const empty: RepositoriesConfig = { repositories: [] };

  let raw: unknown;
  try {
    raw = await readYaml<unknown>(REPOSITORIES_PATH);
  } catch (err) {
    // YAML 语法错误（readYaml 会抛出 AppError.parseError）
    console.error(
      "[repositoryConfigService] repositories.yaml 解析失败，使用空配置:",
      err,
    );
    return empty;
  }

  // 文件不存在
  if (raw === null || raw === undefined) {
    return empty;
  }

  // Zod Schema 校验
  const result = RepositoriesConfigSchema.safeParse(raw);
  if (!result.success) {
    console.error(
      "[repositoryConfigService] repositories.yaml Schema 校验失败，使用空配置:",
      result.error.issues,
    );
    return empty;
  }

  return result.data;
}

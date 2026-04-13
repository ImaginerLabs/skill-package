// ============================================================
// server/services/bundleService.ts — 套件 CRUD 服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApplyBundleResult,
  PathPreset,
  SkillBundle,
  SkillBundleCreate,
  SkillBundleUpdate,
  SkillBundleWithStatus,
  SyncTarget,
} from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";
import { getCategories } from "./categoryService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");

/** 套件数量上限 */
const BUNDLE_LIMIT = 50;

/** 套件名称校验正则 */
const VALID_BUNDLE_NAME_RE = /^[a-z0-9-]+$/;

// ---- 内部工具函数 ----

interface SettingsData {
  version?: string;
  sync?: { targets?: SyncTarget[] };
  pathPresets?: PathPreset[];
  skillBundles?: SkillBundle[];
  activeCategories?: string[];
  ui?: { defaultView?: string; sidebarWidth?: number };
}

async function readSettings(): Promise<SettingsData> {
  const data = await readYaml<SettingsData>(SETTINGS_PATH);
  return (
    data ?? {
      version: "0.1.0",
      sync: { targets: [] },
      pathPresets: [],
      skillBundles: [],
      activeCategories: [],
      ui: {},
    }
  );
}

async function writeSettings(data: SettingsData): Promise<void> {
  await writeYaml(SETTINGS_PATH, data);
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `bundle-${ts}-${rand}`;
}

// ---- 公开 API ----

/**
 * 获取所有套件（含损坏引用信息注入）
 */
export async function getBundles(): Promise<SkillBundleWithStatus[]> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  // 获取当前有效分类列表，用于计算 brokenCategoryNames
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return bundles.map((bundle) => ({
    ...bundle,
    brokenCategoryNames: bundle.categoryNames.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  }));
}

/**
 * 添加套件
 */
export async function addBundle(
  data: SkillBundleCreate,
): Promise<SkillBundleWithStatus> {
  // 名称格式校验
  if (!VALID_BUNDLE_NAME_RE.test(data.name)) {
    throw AppError.validationError("套件名称只能包含小写字母、数字和连字符");
  }

  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  // 数量上限校验
  if (bundles.length >= BUNDLE_LIMIT) {
    throw AppError.bundleLimitExceeded();
  }

  // 名称唯一性校验（大小写不敏感）
  const nameLower = data.name.toLowerCase();
  const duplicate = bundles.find((b) => b.name.toLowerCase() === nameLower);
  if (duplicate) {
    throw AppError.bundleNameDuplicate(data.name);
  }

  // 分类存在性校验
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );
  const invalidCategories = data.categoryNames.filter(
    (name) => !validCategoryNames.has(name.toLowerCase()),
  );
  if (invalidCategories.length > 0) {
    throw AppError.validationError(
      `以下分类不存在：${invalidCategories.join(", ")}`,
    );
  }

  const now = new Date().toISOString();
  const newBundle: SkillBundle = {
    id: generateId(),
    name: data.name,
    displayName: data.displayName,
    ...(data.description?.trim()
      ? { description: data.description.trim() }
      : {}),
    categoryNames: data.categoryNames,
    createdAt: now,
    updatedAt: now,
  };

  bundles.push(newBundle);
  settings.skillBundles = bundles;
  await writeSettings(settings);

  return {
    ...newBundle,
    brokenCategoryNames: [],
  };
}

/**
 * 更新套件
 */
export async function updateBundle(
  id: string,
  updates: SkillBundleUpdate,
): Promise<SkillBundleWithStatus> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  // 如果更新了 categoryNames，校验分类存在性
  if (updates.categoryNames !== undefined) {
    const categories = await getCategories();
    const validCategoryNames = new Set(
      categories.map((c) => c.name.toLowerCase()),
    );
    const invalidCategories = updates.categoryNames.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    );
    if (invalidCategories.length > 0) {
      throw AppError.validationError(
        `以下分类不存在：${invalidCategories.join(", ")}`,
      );
    }
  }

  const updated: SkillBundle = {
    ...bundles[index],
    ...(updates.displayName !== undefined && {
      displayName: updates.displayName,
    }),
    ...(updates.description !== undefined && {
      description: updates.description.trim() || undefined,
    }),
    ...(updates.categoryNames !== undefined && {
      categoryNames: updates.categoryNames,
    }),
    updatedAt: new Date().toISOString(),
  };

  bundles[index] = updated;
  settings.skillBundles = bundles;
  await writeSettings(settings);

  // 计算 brokenCategoryNames
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return {
    ...updated,
    brokenCategoryNames: updated.categoryNames.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  };
}

/**
 * 删除套件
 */
export async function removeBundle(id: string): Promise<void> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  bundles.splice(index, 1);
  settings.skillBundles = bundles;
  await writeSettings(settings);
}

/**
 * 一键激活套件（覆盖写入 activeCategories，跳过已删除分类）
 */
export async function applyBundle(id: string): Promise<ApplyBundleResult> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const bundle = bundles.find((b) => b.id === id);
  if (!bundle) {
    throw AppError.bundleNotFound(id);
  }

  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  const applied = bundle.categoryNames.filter((name) =>
    validCategoryNames.has(name.toLowerCase()),
  );
  const skipped = bundle.categoryNames.filter(
    (name) => !validCategoryNames.has(name.toLowerCase()),
  );

  // 覆盖写入（不叠加）
  settings.activeCategories = applied;
  await writeSettings(settings);

  return { applied, skipped };
}

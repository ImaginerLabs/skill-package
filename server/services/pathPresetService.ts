// ============================================================
// server/services/pathPresetService.ts — 路径预设 CRUD 服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PathPreset } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");

// ---- 内部工具函数 ----

interface SettingsData {
  version?: string;
  sync?: { targets?: unknown[] };
  pathPresets?: PathPreset[];
  ui?: { defaultView?: string; sidebarWidth?: number };
}

async function readSettings(): Promise<SettingsData> {
  const data = await readYaml<SettingsData>(SETTINGS_PATH);
  return (
    data ?? { version: "0.1.0", sync: { targets: [] }, pathPresets: [], ui: {} }
  );
}

async function writeSettings(data: SettingsData): Promise<void> {
  await writeYaml(SETTINGS_PATH, data);
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `preset-${ts}-${rand}`;
}

// ---- 公开 API ----

/**
 * 获取所有路径预设
 */
export async function getPathPresets(): Promise<PathPreset[]> {
  const settings = await readSettings();
  return settings.pathPresets ?? [];
}

/**
 * 添加路径预设
 */
export async function addPathPreset(
  data: Omit<PathPreset, "id">,
): Promise<PathPreset> {
  if (!data.path.trim()) {
    throw AppError.validationError("路径不能为空");
  }
  if (!path.isAbsolute(data.path)) {
    throw AppError.validationError("路径必须是绝对路径");
  }

  const settings = await readSettings();
  const presets = settings.pathPresets ?? [];

  // 检查路径是否已存在
  const normalized = path.normalize(data.path);
  const duplicate = presets.find((p) => path.normalize(p.path) === normalized);
  if (duplicate) {
    throw AppError.validationError("路径已存在");
  }

  const newPreset: PathPreset = {
    id: generateId(),
    path: path.normalize(data.path.trim()),
    ...(data.label?.trim() ? { label: data.label.trim() } : {}),
  };

  presets.push(newPreset);
  settings.pathPresets = presets;
  await writeSettings(settings);

  return newPreset;
}

/**
 * 更新路径预设
 */
export async function updatePathPreset(
  id: string,
  updates: Partial<Omit<PathPreset, "id">>,
): Promise<PathPreset> {
  const settings = await readSettings();
  const presets = settings.pathPresets ?? [];

  const index = presets.findIndex((p) => p.id === id);
  if (index === -1) {
    throw AppError.pathPresetNotFound(id);
  }

  if (updates.path !== undefined) {
    if (!updates.path.trim()) {
      throw AppError.validationError("路径不能为空");
    }
    if (!path.isAbsolute(updates.path)) {
      throw AppError.validationError("路径必须是绝对路径");
    }
    const normalized = path.normalize(updates.path);
    const duplicate = presets.find(
      (p, i) => i !== index && path.normalize(p.path) === normalized,
    );
    if (duplicate) {
      throw AppError.validationError("路径已存在");
    }
  }

  const updated: PathPreset = {
    ...presets[index],
    ...(updates.path !== undefined && {
      path: path.normalize(updates.path.trim()),
    }),
    ...(updates.label !== undefined && {
      label: updates.label.trim() || undefined,
    }),
  };

  presets[index] = updated;
  settings.pathPresets = presets;
  await writeSettings(settings);

  return updated;
}

/**
 * 删除路径预设
 */
export async function removePathPreset(id: string): Promise<void> {
  const settings = await readSettings();
  const presets = settings.pathPresets ?? [];

  const index = presets.findIndex((p) => p.id === id);
  if (index === -1) {
    throw AppError.pathPresetNotFound(id);
  }

  presets.splice(index, 1);
  settings.pathPresets = presets;
  await writeSettings(settings);
}

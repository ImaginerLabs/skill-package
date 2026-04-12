// ============================================================
// server/routes/pathPresetRoutes.ts — 路径预设 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  PathPresetCreateSchema,
  PathPresetUpdateSchema,
} from "../../shared/schemas.js";
import {
  addPathPreset,
  getPathPresets,
  removePathPreset,
  updatePathPreset,
} from "../services/pathPresetService.js";

export const pathPresetRoutes = Router();

/**
 * GET /api/path-presets — 获取所有路径预设
 */
pathPresetRoutes.get(
  "/path-presets",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const presets = await getPathPresets();
      res.json({ success: true, data: presets });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/path-presets — 添加路径预设
 */
pathPresetRoutes.post(
  "/path-presets",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = PathPresetCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
        return;
      }
      const preset = await addPathPreset(parsed.data);
      res.status(201).json({ success: true, data: preset });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/path-presets/:id — 更新路径预设
 */
pathPresetRoutes.put(
  "/path-presets/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = PathPresetUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
        return;
      }
      const preset = await updatePathPreset(id, parsed.data);
      res.json({ success: true, data: preset });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/path-presets/:id — 删除路径预设
 */
pathPresetRoutes.delete(
  "/path-presets/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await removePathPreset(id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);

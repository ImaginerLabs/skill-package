// ============================================================
// server/routes/bundleRoutes.ts — 套件 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  SkillBundleCreateSchema,
  SkillBundleUpdateSchema,
} from "../../shared/schemas.js";
import {
  addBundle,
  applyBundle,
  getBundles,
  removeBundle,
  updateBundle,
} from "../services/bundleService.js";

export const bundleRoutes = Router();

/**
 * GET /api/skill-bundles — 获取所有套件（含 brokenCategoryNames 注入）
 */
bundleRoutes.get(
  "/skill-bundles",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const bundles = await getBundles();
      res.json({ success: true, data: bundles });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/skill-bundles — 创建套件
 */
bundleRoutes.post(
  "/skill-bundles",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SkillBundleCreateSchema.safeParse(req.body);
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
      const bundle = await addBundle(parsed.data);
      res.status(201).json({ success: true, data: bundle });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/skill-bundles/export — 501 占位（未来导出功能）
 * ⚠️ 必须在 GET /api/skill-bundles/:id 之前注册，防止 "export" 被当作 :id 处理
 */
bundleRoutes.get("/skill-bundles/export", (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "套件导出功能暂未实现" },
  });
});

/**
 * POST /api/skill-bundles/import — 501 占位（未来导入功能）
 */
bundleRoutes.post("/skill-bundles/import", (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "套件导入功能暂未实现" },
  });
});

/**
 * PUT /api/skill-bundles/:id — 更新套件
 */
bundleRoutes.put(
  "/skill-bundles/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = SkillBundleUpdateSchema.safeParse(req.body);
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
      const bundle = await updateBundle(id, parsed.data);
      res.json({ success: true, data: bundle });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/skill-bundles/:id — 删除套件
 */
bundleRoutes.delete(
  "/skill-bundles/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await removeBundle(id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/skill-bundles/:id/apply — 一键激活套件
 */
bundleRoutes.put(
  "/skill-bundles/:id/apply",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await applyBundle(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

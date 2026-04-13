// ============================================================
// server/routes/statsRoutes.ts — 统计数据路由
// 提供 GET /api/stats/activity — 近 N 周 Skill 文件修改活跃度
// ============================================================

import { Router } from "express";
import fs from "fs-extra";
import path from "node:path";
import { getSkillsRoot } from "../services/skillService.js";

const statsRoutes = Router();

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  files: string[]; // 当日修改的文件名列表（不含路径和 .md 后缀）
}

/**
 * 递归扫描目录下所有 .md 文件
 */
async function scanMdFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const exists = await fs.pathExists(dir);
  if (!exists) return results;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      results.push(...(await scanMdFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * GET /api/stats/activity?weeks=12
 * 返回过去 N 周每日 Skill 文件修改次数
 */
statsRoutes.get("/stats/activity", async (req, res, next) => {
  try {
    const weeks = Math.max(
      1,
      Math.min(52, parseInt(String(req.query.weeks ?? "12"), 10) || 12),
    );
    const skillsRoot = getSkillsRoot();
    const files = await scanMdFiles(skillsRoot);

    // 计算日期范围起点
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - weeks * 7);
    startDate.setHours(0, 0, 0, 0);

    // 聚合每日修改次数和文件名
    const countMap = new Map<string, number>();
    const filesMap = new Map<string, Set<string>>();
    for (const file of files) {
      try {
        const stat = await fs.stat(file);
        const mtime = stat.mtime;
        if (mtime >= startDate) {
          const dateStr = mtime.toISOString().slice(0, 10); // YYYY-MM-DD
          countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
          // 记录文件名（去 .md 后缀，只取 basename），防止泄露服务器路径
          const fileName = path.basename(file, ".md");
          const existing = filesMap.get(dateStr) ?? new Set<string>();
          existing.add(fileName);
          filesMap.set(dateStr, existing);
        }
      } catch {
        // 单个文件 stat 失败不影响整体
      }
    }

    // 生成完整日期序列（含 0 次的日期），从最早到最新
    const result: ActivityDay[] = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
        files: [...(filesMap.get(dateStr) ?? [])].sort(),
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export { statsRoutes };

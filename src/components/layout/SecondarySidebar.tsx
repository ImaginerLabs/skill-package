// ============================================================
// components/layout/SecondarySidebar.tsx — 二级侧边栏（分类目录）
// 仅在 Skill 库页面（路由 /）时由 AppLayout 条件渲染
// ============================================================

import { Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import CategoryTree from "../skills/CategoryTree";

/**
 * 二级侧边栏 — 分类目录树 + 管理分类入口
 *
 * 职责：
 *   - 展示分类目录树（只读筛选导航，不提供编辑能力）
 *   - 底部提供「管理分类」快捷入口，跳转到 /settings
 *
 * 显示条件：由 AppLayout 在 pathname === "/" 时条件渲染
 */
export default function SecondarySidebar() {
  return (
    <aside
      data-testid="secondary-sidebar"
      className="flex flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0"
      style={{ width: "180px" }}
    >
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          分类
        </span>
      </div>

      {/* 分类目录树 */}
      <div className="flex-1 overflow-auto">
        <CategoryTree />
      </div>

      {/* 底部管理分类入口 */}
      <div className="border-t border-[hsl(var(--border))] p-2">
        <NavLink
          to="/settings"
          data-testid="secondary-sidebar-manage-link"
          className={({ isActive }) =>
            `flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200 ${
              isActive
                ? "text-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
            }`
          }
        >
          <Settings size={12} />
          管理分类
        </NavLink>
      </div>
    </aside>
  );
}

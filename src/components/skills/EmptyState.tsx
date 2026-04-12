// ============================================================
// components/skills/EmptyState.tsx — 空状态引导组件
// ============================================================

import { Download, FolderOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface EmptyStateProps {
  /** 是否已有 Skill（用于区分"无搜索结果"和"完全无 Skill"） */
  hasSkills: boolean;
}

/**
 * 空状态引导 — 无 Skill 时提示从 IDE 导入，搜索无结果时提示调整条件
 */
export default function EmptyState({ hasSkills }: EmptyStateProps) {
  if (hasSkills) {
    // 有 Skill 但筛选/搜索无结果
    return (
      <div
        data-testid="empty-state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Search
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-4 opacity-40"
        />
        <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          未找到匹配的 Skill
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
          尝试调整搜索关键词或切换分类筛选条件
        </p>
      </div>
    );
  }

  // 完全无 Skill
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <FolderOpen
        size={48}
        className="text-[hsl(var(--primary))] mb-4 opacity-60"
      />
      <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
        还没有 Skill
      </h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-4">
        从 CodeBuddy IDE 导入你的 Skill 文件，或在 skills/ 目录中手动添加 .md
        文件
      </p>
      <Button asChild>
        <Link to="/import" className="gap-2">
          <Download size={16} />
          开始导入
        </Link>
      </Button>
    </div>
  );
}

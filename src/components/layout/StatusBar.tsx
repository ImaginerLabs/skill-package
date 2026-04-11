import { useSkillStore } from "../../stores/skill-store";

/**
 * 状态栏 — 版本号 + Skill 统计 + 最后操作时间
 * 固定高度 28px，固定在页面底部
 */
export default function StatusBar() {
  const { skills } = useSkillStore();

  return (
    <footer className="flex items-center justify-between h-7 px-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--muted-foreground))] shrink-0">
      {/* 左侧：版本号 */}
      <span className="font-[var(--font-code)]">v0.1.0</span>

      {/* 中间：Skill 总数 */}
      <span>{skills.length} Skills</span>

      {/* 右侧：最后操作时间 */}
      <span>最后同步: —</span>
    </footer>
  );
}

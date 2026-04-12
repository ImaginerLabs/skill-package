import PathPresetManager from "../components/settings/PathPresetManager";

/**
 * 路径配置页 — 管理预设路径（供同步和导入快捷选择）
 */
export default function PathsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-2">
        路径配置
      </h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
        预先配置常用目录路径，在同步和导入时可快速选择，无需重复输入。
      </p>
      <PathPresetManager />
    </div>
  );
}

// ============================================================
// components/settings/PathPresetManager.tsx — 路径预设管理组件
// ============================================================

import { Check, FolderOpen, Pencil, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PathPreset } from "../../../shared/types";
import {
  addPathPreset as apiAddPathPreset,
  deletePathPreset as apiDeletePathPreset,
  updatePathPreset as apiUpdatePathPreset,
  fetchPathPresets,
} from "../../lib/api";
import { toast } from "../shared/toast-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { matchIDEByPath } from "./ide-icons/ide-matcher";

// ─── IDE Icon 展示组件 ────────────────────────────────────────────────────────

interface IDEIconBadgeProps {
  path: string;
  size?: number;
}

/** 根据路径渲染对应 IDE icon，未匹配时显示通用文件夹 */
function IDEIconBadge({ path, size = 20 }: IDEIconBadgeProps) {
  const ide = useMemo(() => matchIDEByPath(path), [path]);

  if (!ide) {
    return (
      <span
        className="flex items-center justify-center shrink-0 text-[hsl(var(--muted-foreground))]"
        style={{ width: size, height: size }}
      >
        <FolderOpen size={size} />
      </span>
    );
  }

  const { Icon, label } = ide;
  const color = Icon.colorPrimary;
  return (
    <span
      title={label}
      className="flex items-center justify-center shrink-0"
      style={{ width: size, height: size, color }}
    >
      {/* Icon 本身就是 Mono 组件 */}
      <Icon width={size} height={size} />
    </span>
  );
}

// ─── 输入框内联 IDE 预览 ──────────────────────────────────────────────────────

interface IDEPreviewProps {
  path: string;
}

/** 输入框右侧实时显示匹配的 IDE 名称 + icon */
function IDEPreview({ path }: IDEPreviewProps) {
  const ide = useMemo(() => matchIDEByPath(path), [path]);
  if (!ide) return null;
  const { Icon, label } = ide;
  const color = Icon.colorPrimary;
  return (
    <span className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-200">
      {/* Icon 本身就是 Mono 组件，直接渲染 */}
      <Icon width={16} height={16} style={{ color }} />
      <span className="text-xs font-medium" style={{ color }}>
        {label}
      </span>
    </span>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

/**
 * 路径预设管理 — 添加、修改、删除预设路径（含可选备注）
 * 支持根据路径自动识别 IDE 并展示对应图标
 */
export default function PathPresetManager() {
  const [presets, setPresets] = useState<PathPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新建表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPath, setEditPath] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const data = await fetchPathPresets();
      setPresets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载路径预设失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    setAdding(true);
    try {
      const preset = await apiAddPathPreset({
        path: newPath.trim(),
        label: newLabel.trim() || undefined,
      });
      setPresets((prev) => [...prev, preset]);
      setNewPath("");
      setNewLabel("");
      setShowAddForm(false);
      toast.success("路径预设已添加");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (preset: PathPreset) => {
    setEditingId(preset.id);
    setEditPath(preset.path);
    setEditLabel(preset.label ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editPath.trim()) return;
    setSaving(true);
    try {
      const updated = await apiUpdatePathPreset(editingId, {
        path: editPath.trim(),
        label: editLabel.trim() || undefined,
      });
      setPresets((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      setEditingId(null);
      toast.success("路径预设已更新");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPath("");
    setEditLabel("");
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeletePathPreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success("路径预设已删除");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  // ── 加载 / 错误状态 ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── 页头 ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">路径预设</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            管理常用的 IDE 工作目录，系统将自动识别对应工具
          </p>
        </div>
        {!showAddForm && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shrink-0"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            添加路径
          </Button>
        )}
      </div>

      {/* ── 新建表单 ──────────────────────────────────────────────────────── */}
      {showAddForm && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3 shadow-sm">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            新增路径
          </p>

          {/* 路径输入 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">
              路径 <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <div className="relative flex items-center gap-2">
              <Input
                className="flex-1 font-mono text-sm pr-3"
                placeholder="/Users/alex/.cursor"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              {/* 实时 IDE 识别预览 */}
              {newPath && (
                <div className="shrink-0">
                  <IDEPreview path={newPath} />
                </div>
              )}
            </div>
          </div>

          {/* 备注输入 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">
              备注
              <span className="ml-1 text-[hsl(var(--muted-foreground)/0.6)]">
                （可选）
              </span>
            </label>
            <Input
              placeholder="例如：我的主力开发目录"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={adding || !newPath.trim()}
            >
              {adding ? "添加中..." : "确认添加"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewPath("");
                setNewLabel("");
              }}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* ── 空状态 ────────────────────────────────────────────────────────── */}
      {presets.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.4)] py-12 px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <FolderOpen
              size={24}
              className="text-[hsl(var(--muted-foreground))]"
            />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            还没有路径预设
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] max-w-xs">
            添加本地 IDE 的工作目录，系统将自动识别并关联对应工具图标
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            添加第一个路径
          </Button>
        </div>
      )}

      {/* ── 预设列表 ──────────────────────────────────────────────────────── */}
      {presets.length > 0 && (
        <div className="space-y-2">
          {presets.map((preset) =>
            editingId === preset.id ? (
              // ── 内联编辑行 ────────────────────────────────────────────────
              <div
                key={preset.id}
                className="rounded-xl border border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--card))] p-3 space-y-2 shadow-sm"
              >
                <div className="relative flex items-center gap-2">
                  <Input
                    className="flex-1 font-mono text-sm"
                    value={editPath}
                    onChange={(e) => setEditPath(e.target.value)}
                    placeholder="/absolute/path"
                  />
                  {editPath && (
                    <div className="shrink-0">
                      <IDEPreview path={editPath} />
                    </div>
                  )}
                </div>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="备注（可选）"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={saving || !editPath.trim()}
                  >
                    <Check size={13} className="mr-1" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X size={13} className="mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              // ── 展示行 ────────────────────────────────────────────────────
              <div
                key={preset.id}
                className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-all duration-150 hover:border-[hsl(var(--border)/0.8)] hover:bg-[hsl(var(--accent)/0.4)] hover:shadow-sm"
              >
                {/* IDE icon */}
                <IDEIconBadge path={preset.path} size={22} />

                {/* 路径信息 */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono truncate leading-snug">
                    {preset.path}
                  </p>
                  {preset.label ? (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                      {preset.label}
                    </p>
                  ) : (
                    <p className="text-xs text-[hsl(var(--muted-foreground)/0.5)] mt-0.5">
                      {matchIDEByPath(preset.path)?.label ?? "通用路径"}
                    </p>
                  )}
                </div>

                {/* 操作按钮 — hover 时渐显 */}
                <div className="flex items-center gap-0.5 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    onClick={() => handleStartEdit(preset)}
                    title="编辑"
                  >
                    <Pencil size={13} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                        title="删除"
                      >
                        <X size={13} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除路径预设</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除「{preset.label ?? preset.path}
                          」吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(preset.id)}
                          className="bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

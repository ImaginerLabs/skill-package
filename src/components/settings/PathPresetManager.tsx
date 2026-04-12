// ============================================================
// components/settings/PathPresetManager.tsx — 路径预设管理组件
// ============================================================

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
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

/**
 * 路径预设管理 — 添加、修改、删除预设路径（含可选备注）
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

  if (loading) {
    return (
      <div className="text-sm text-[hsl(var(--muted-foreground))]">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-[hsl(var(--destructive))]">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">路径预设</h2>
        {!showAddForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} className="mr-1" />
            添加路径
          </Button>
        )}
      </div>

      {/* 新建表单 */}
      {showAddForm && (
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">
              路径 <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <Input
              placeholder="/Users/alex/projects"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">
              备注（可选）
            </label>
            <Input
              placeholder="例如：我的项目目录"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="flex gap-2">
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

      {/* 预设列表 */}
      {presets.length === 0 && !showAddForm ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          暂无路径预设，点击「添加路径」开始配置
        </p>
      ) : (
        <div className="space-y-2">
          {presets.map((preset) =>
            editingId === preset.id ? (
              // 内联编辑行
              <div
                key={preset.id}
                className="rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--card))] p-3 space-y-2"
              >
                <Input
                  value={editPath}
                  onChange={(e) => setEditPath(e.target.value)}
                  placeholder="/absolute/path"
                />
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
                    <Check size={14} className="mr-1" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X size={14} className="mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              // 展示行
              <div
                key={preset.id}
                className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono truncate">{preset.path}</p>
                  {preset.label && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {preset.label}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleStartEdit(preset)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除路径预设</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除路径预设「{preset.label ?? preset.path}
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

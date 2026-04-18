// ============================================================
// components/sync/SyncTargetManager.tsx — 同步目标管理组件（重构版）
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { PathPreset, SyncTarget } from "../../../shared/types";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { deleteSkillsByPath, fetchPathPresets } from "../../lib/api";
import { useSyncStore } from "../../stores/sync-store";
import ConfirmDialog from "../shared/ConfirmDialog";
import { toast } from "../shared/toast-store";
import { Button } from "../ui/button";
import GuideSteps from "./GuideSteps";
import TargetForm from "./TargetForm";
import TargetList from "./TargetList";

// ─── 主组件 ───────────────────────────────────────────────────────────────────

/**
 * SyncTargetManager — 同步目标路径配置管理
 * 支持添加、编辑、删除、启用/禁用同步目标
 */
export default function SyncTargetManager() {
  const {
    targets,
    targetsLoading,
    fetchTargets,
    addTarget,
    updateTarget,
    removeTarget,
  } = useSyncStore();
  const { t } = useTranslation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [pathPresets, setPathPresets] = useState<PathPreset[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 删除确认对话框状态
  const {
    confirmState: deleteState,
    requestConfirm: requestDelete,
    handleConfirm: handleConfirmDelete,
    handleCancel: handleCancelDelete,
  } = useConfirmDialog<string>(async (targetId) => {
    setDeletingId(targetId);
    try {
      const target = targets.find((t) => t.id === targetId);
      await removeTarget(targetId);
      toast.success(
        t("syncTarget.deleteSuccess", { name: target?.name ?? "" }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.deleteFailed"),
      );
    } finally {
      setDeletingId(null);
    }
  });

  // 删除目录下所有 Skills 确认对话框状态
  const {
    confirmState: deleteAllState,
    requestConfirm: requestDeleteAll,
    handleConfirm: handleConfirmDeleteAll,
    handleCancel: handleCancelDeleteAll,
  } = useConfirmDialog<string>(async (targetId) => {
    try {
      const target = targets.find((t) => t.id === targetId);
      const result = await deleteSkillsByPath(target?.path ?? "");
      toast.success(
        t("syncTarget.deleteAllSkillsSuccess", {
          count: result.deleted.length,
        }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("syncTarget.deleteAllSkillsFailed"),
      );
    }
  });

  useEffect(() => {
    fetchTargets();
    fetchPathPresets()
      .then(setPathPresets)
      .catch(() => {});
  }, [fetchTargets]);

  // 仅在挂载时检测 URL 参数 action=add-target，自动展开添加表单
  useEffect(() => {
    if (searchParams.get("action") === "add-target") {
      setShowAddForm(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = useCallback(
    async (name: string, path: string) => {
      try {
        await addTarget({ name, path });
        toast.success(t("syncTarget.createSuccess", { name }));
        setShowAddForm(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("syncTarget.createFailed"),
        );
        throw err; // 让 TargetForm 处理 loading 状态
      }
    },
    [addTarget, t],
  );

  const handleSaveEdit = useCallback(
    async (id: string, name: string, path: string) => {
      try {
        await updateTarget(id, { name, path });
        toast.success(t("syncTarget.updateSuccess"));
        setEditingId(null);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("syncTarget.updateFailed"),
        );
        throw err;
      }
    },
    [updateTarget, t],
  );

  const handleStartEdit = useCallback((target: SyncTarget) => {
    setEditingId(target.id);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleToggleEnabled = useCallback(
    async (id: string, _enabled: boolean) => {
      try {
        await updateTarget(id, { enabled: _enabled });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("syncTarget.updateFailed"),
        );
      }
    },
    [updateTarget, t],
  );

  // 全部启用 / 全部禁用
  const allEnabled = targets.length > 0 && targets.every((t) => t.enabled);
  const handleToggleAll = useCallback(async () => {
    const newEnabled = !allEnabled;
    try {
      await Promise.all(
        targets.map((tgt) => updateTarget(tgt.id, { enabled: newEnabled })),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.updateFailed"),
      );
    }
  }, [allEnabled, targets, updateTarget, t]);

  if (targetsLoading && targets.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 全部启用/禁用按钮 */}
      {targets.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleToggleAll}
          >
            {allEnabled
              ? t("syncTarget.disableAll")
              : t("syncTarget.enableAll")}
          </Button>
        </div>
      )}

      {/* 添加表单 */}
      {showAddForm && (
        <TargetForm
          pathPresets={pathPresets}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 目标列表或空状态引导 */}
      {targets.length === 0 && !showAddForm ? (
        <GuideSteps onAddTarget={() => setShowAddForm(true)} />
      ) : (
        <TargetList
          targets={targets}
          editingId={editingId}
          deletingId={deletingId}
          onToggleEnabled={handleToggleEnabled}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={(id) => requestDelete(id)}
          onDeleteAll={(id) => requestDeleteAll(id)}
          onAddTarget={() => setShowAddForm(true)}
        />
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => !open && handleCancelDelete()}
        variant="danger"
        title={t("syncTarget.deleteConfirmTitle")}
        description={t("syncTarget.deleteConfirmDesc", {
          name:
            targets.find((tgt) => tgt.id === deleteState.target)?.name ?? "",
        })}
        confirmLabel={deletingId ? t("common.processing") : t("common.delete")}
        onConfirm={handleConfirmDelete}
        confirmDisabled={!!deletingId}
      />

      {/* 删除目录下所有 Skills 确认对话框 */}
      <ConfirmDialog
        open={deleteAllState.open}
        onOpenChange={(open) => !open && handleCancelDeleteAll()}
        variant="danger"
        title={t("syncTarget.deleteAllSkillsTitle")}
        description={t("syncTarget.deleteAllSkillsDesc", {
          name:
            targets.find((tgt) => tgt.id === deleteAllState.target)?.name ?? "",
        })}
        confirmLabel={t("common.delete")}
        onConfirm={handleConfirmDeleteAll}
      />
    </div>
  );
}

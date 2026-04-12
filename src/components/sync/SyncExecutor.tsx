// ============================================================
// components/sync/SyncExecutor.tsx — 同步执行与结果日志
// ============================================================

import {
  AlertCircle,
  CheckCircle2,
  FileWarning,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback } from "react";
import type { SyncDetail } from "../../../shared/types";
import { useSyncStore } from "../../stores/sync-store";
import { toast } from "../shared/toast-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

/**
 * SyncExecutor — 同步执行按钮 + 进度展示 + 结果日志
 */
export default function SyncExecutor() {
  const {
    targets,
    selectedSkillIds,
    syncStatus,
    syncResult,
    executePush,
    setSyncStatus,
    setSyncResult,
  } = useSyncStore();

  const enabledTargets = targets.filter((t) => t.enabled);
  const canSync = selectedSkillIds.length > 0 && enabledTargets.length > 0;
  const isSyncing = syncStatus === "syncing";

  const handleSync = useCallback(async () => {
    try {
      const result = await executePush();
      if (result.failed > 0) {
        toast.error(`同步完成，${result.failed} 个文件失败`, {
          details: `成功 ${result.success}，覆盖 ${result.overwritten}，失败 ${result.failed}`,
        });
      } else {
        toast.success(
          `同步完成！${result.success + result.overwritten} 个文件已同步`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "同步失败");
    }
  }, [executePush]);

  const handleReset = useCallback(() => {
    setSyncStatus("idle");
    setSyncResult(null);
  }, [setSyncStatus, setSyncResult]);

  // 结果详情中的状态图标
  const StatusIcon = ({ status }: { status: SyncDetail["status"] }) => {
    switch (status) {
      case "success":
        return (
          <CheckCircle2
            size={14}
            className="text-[hsl(var(--primary))] shrink-0"
          />
        );
      case "overwritten":
        return <FileWarning size={14} className="text-yellow-500 shrink-0" />;
      case "failed":
        return (
          <XCircle
            size={14}
            className="text-[hsl(var(--destructive))] shrink-0"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 同步按钮区域 */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={!canSync || isSyncing}
          className="gap-2"
        >
          {isSyncing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {isSyncing ? "同步中..." : "开始同步"}
        </Button>

        {/* 同步信息摘要 */}
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          {selectedSkillIds.length === 0 ? (
            "请先选择要同步的 Skill"
          ) : enabledTargets.length === 0 ? (
            "请先添加并启用同步目标"
          ) : (
            <span>
              {selectedSkillIds.length} 个 Skill → {enabledTargets.length}{" "}
              个目标
            </span>
          )}
        </div>

        {/* 重置按钮（有结果时显示） */}
        {syncResult && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 ml-auto"
          >
            <RefreshCw size={14} />
            清除结果
          </Button>
        )}
      </div>

      {/* 同步结果摘要 */}
      {syncResult && (
        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {/* 摘要统计 */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-[hsl(var(--border))]">
            {syncResult.failed > 0 ? (
              <AlertCircle
                size={18}
                className="text-[hsl(var(--destructive))] shrink-0"
              />
            ) : (
              <CheckCircle2
                size={18}
                className="text-[hsl(var(--primary))] shrink-0"
              />
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-[hsl(var(--foreground))]">
                同步完成
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                成功 {syncResult.success}
              </Badge>
              {syncResult.overwritten > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-500"
                >
                  覆盖 {syncResult.overwritten}
                </Badge>
              )}
              {syncResult.failed > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  失败 {syncResult.failed}
                </Badge>
              )}
            </div>
          </div>

          {/* 详细列表 */}
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y divide-[hsl(var(--border))]">
              {syncResult.details.map((detail, index) => (
                <div
                  key={`${detail.skillId}-${detail.targetPath}-${index}`}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <StatusIcon status={detail.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                      {detail.skillName}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                      → {detail.targetPath}
                    </p>
                    {detail.error && (
                      <p className="text-xs text-[hsl(var(--destructive))] mt-0.5">
                        {detail.error}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      detail.status === "success"
                        ? "default"
                        : detail.status === "overwritten"
                          ? "secondary"
                          : "destructive"
                    }
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      detail.status === "overwritten"
                        ? "bg-yellow-500/15 text-yellow-500"
                        : ""
                    }`}
                  >
                    {detail.status === "success"
                      ? "新建"
                      : detail.status === "overwritten"
                        ? "覆盖"
                        : "失败"}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

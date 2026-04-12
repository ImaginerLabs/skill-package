// ============================================================
// components/sync/SyncStatusIndicator.tsx — 同步状态指示器
// ============================================================

import { AlertCircle, CheckCircle2, Loader2, MinusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncStore } from "../../stores/sync-store";

/**
 * 计算相对时间文本
 */
function formatRelativeTime(isoTime: string): string {
  const diff = Date.now() - new Date(isoTime).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

/**
 * SyncStatusIndicator — 顶部栏同步状态指示器
 * 显示当前同步状态，点击跳转到同步管理页面
 */
export default function SyncStatusIndicator() {
  const { syncStatus, targets, lastSyncTime, lastSyncError } = useSyncStore();
  const navigate = useNavigate();
  const [relativeTime, setRelativeTime] = useState<string | null>(null);

  // 每 30 秒更新相对时间
  useEffect(() => {
    if (!lastSyncTime) return;
    setRelativeTime(formatRelativeTime(lastSyncTime));
    const timer = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSyncTime));
    }, 30_000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  const hasTargets = targets.length > 0;

  const handleClick = useCallback(() => {
    navigate(hasTargets ? "/sync" : "/sync?action=add-target");
  }, [navigate, hasTargets]);

  // 根据状态渲染不同的指示器
  if (syncStatus === "syncing") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] transition-colors cursor-pointer"
        aria-label="同步进行中，点击查看详情"
      >
        <Loader2 size={14} className="animate-spin" />
        <span>同步中...</span>
      </button>
    );
  }

  if (syncStatus === "error") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive)/0.8)] transition-colors cursor-pointer"
        aria-label={`同步失败${lastSyncError ? `：${lastSyncError}` : ""}，点击查看详情`}
        title={lastSyncError || "同步失败"}
      >
        <AlertCircle size={14} />
        <span>同步失败</span>
      </button>
    );
  }

  if (syncStatus === "done" && lastSyncTime) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
        aria-label={`已同步 · ${relativeTime}，点击查看详情`}
      >
        <CheckCircle2 size={14} className="text-[hsl(var(--primary))]" />
        <span>已同步 · {relativeTime}</span>
      </button>
    );
  }

  // idle 状态：根据是否有配置目标显示不同状态
  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
      aria-label={
        hasTargets ? "待同步，点击查看详情" : "未配置同步目标，点击配置"
      }
    >
      <MinusCircle size={14} className="opacity-50" />
      <span>{hasTargets ? "待同步" : "未配置"}</span>
    </button>
  );
}

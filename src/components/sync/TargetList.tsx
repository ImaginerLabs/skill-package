// ============================================================
// components/sync/TargetList.tsx — 同步目标列表组件
// ============================================================

import { FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SyncTarget } from "../../../shared/types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import TargetItem from "./TargetItem";

export interface TargetListProps {
  targets: SyncTarget[];
  editingId: string | null;
  deletingId: string | null;
  onToggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  onStartEdit: (target: SyncTarget) => void;
  onSaveEdit: (id: string, name: string, path: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: (id: string) => void;
  onAddTarget: () => void;
}

/**
 * TargetList — 同步目标列表
 */
export default function TargetList({
  targets,
  editingId,
  deletingId,
  onToggleEnabled,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDeleteAll,
  onAddTarget,
}: TargetListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
            {t("syncTarget.title")} ({targets.length})
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTarget}
          className="gap-1.5"
        >
          {t("syncTarget.addTarget")}
        </Button>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-2">
          {targets.map((target) => (
            <TargetItem
              key={target.id}
              target={target}
              isEditing={editingId === target.id}
              isDeleting={deletingId === target.id}
              onToggleEnabled={onToggleEnabled}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onDeleteAll={onDeleteAll}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

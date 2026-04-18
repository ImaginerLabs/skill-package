// ============================================================
// components/sync/GuideSteps.tsx — 同步目标空状态引导步骤
// ============================================================

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export interface GuideStepsProps {
  onAddTarget: () => void;
}

/**
 * GuideSteps — 同步目标空状态引导步骤
 */
export default function GuideSteps({ onAddTarget }: GuideStepsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        {t("syncTarget.noTargets")}
      </p>
      <div className="w-full max-w-xs space-y-2 text-left">
        {/* 步骤 1（高亮） */}
        <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.05)] px-3 py-2.5">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold mt-0.5">
            1
          </span>
          <div>
            <p className="text-xs font-medium text-[hsl(var(--primary))]">
              {t("syncTarget.addTarget")}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
              {t("syncTarget.noTargetsHint")}
            </p>
          </div>
        </div>
        {/* 步骤 2（灰色） */}
        <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--border))] px-3 py-2.5 opacity-50">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-bold mt-0.5">
            2
          </span>
          <div>
            <p className="text-xs font-medium text-[hsl(var(--foreground))]">
              {t("sync.selectSkills")}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
              {t("sync.subtitle")}
            </p>
          </div>
        </div>
        {/* 步骤 3（灰色） */}
        <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--border))] px-3 py-2.5 opacity-50">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-bold mt-0.5">
            3
          </span>
          <div>
            <p className="text-xs font-medium text-[hsl(var(--foreground))]">
              {t("sync.startSync")}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
              {t("sync.subtitle")}
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTarget}
        className="gap-1.5 mt-2"
        data-testid="guide-add-target-btn"
      >
        <Plus size={14} />
        {t("syncTarget.addTarget")}
      </Button>
    </div>
  );
}

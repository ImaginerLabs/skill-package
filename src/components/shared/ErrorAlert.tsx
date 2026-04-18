// ============================================================
// components/shared/ErrorAlert.tsx — 统一错误提示组件
// ============================================================

import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export type ErrorAlertVariant = "error" | "warning" | "info";

const ICON_MAP = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP: Record<ErrorAlertVariant, string> = {
  error:
    "border-[hsl(var(--destructive))/0.3] bg-[hsl(var(--destructive))/0.1]",
  warning: "border-[hsl(var(--warning))/0.3] bg-[hsl(var(--warning))/0.1]",
  info: "border-[hsl(var(--info))/0.3] bg-[hsl(var(--info))/0.1]",
};

const TEXT_COLOR_MAP: Record<ErrorAlertVariant, string> = {
  error: "text-[hsl(var(--destructive))]",
  warning: "text-[hsl(var(--warning))]",
  info: "text-[hsl(var(--info))]",
};

export interface ErrorAlertProps {
  /** 错误信息 */
  message: string;
  /** 详细错误信息 */
  details?: string;
  /** 变体 */
  variant?: ErrorAlertVariant;
  /** 是否可关闭 */
  dismissible?: boolean;
  /** 关闭回调 */
  onDismiss?: () => void;
  /** data-testid */
  "data-testid"?: string;
}

/**
 * ErrorAlert — 统一错误提示组件
 *
 * - variant="error"：红色系，用于错误提示
 * - variant="warning"：黄色系，用于警告提示
 * - variant="info"：蓝色系，用于信息提示
 * - 支持 details 展开/收起
 * - 支持 dismissible 关闭
 */
export default function ErrorAlert({
  message,
  details,
  variant = "error",
  dismissible = false,
  onDismiss,
  "data-testid": testId,
}: ErrorAlertProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const Icon = ICON_MAP[variant];

  return (
    <div
      data-testid={testId ?? "error-alert"}
      className={`flex items-start gap-2 p-3 rounded-md border ${COLOR_MAP[variant]}`}
      role="alert"
    >
      <Icon
        size={16}
        className={`shrink-0 mt-0.5 ${TEXT_COLOR_MAP[variant]}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[hsl(var(--foreground))]">{message}</p>
        {details && expanded && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {details}
          </p>
        )}
        {details && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs mt-1 hover:underline"
          >
            {t("common.viewDetails")}
          </button>
        )}
      </div>
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-6 w-6 shrink-0"
          aria-label={t("common.close")}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}

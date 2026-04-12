// ============================================================
// components/shared/toast-store.ts — Toast 全局状态管理
// ============================================================

// ---- Toast 类型定义 ----

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  details?: string;
  duration?: number;
  /** 可选操作按钮（如撤销） */
  action?: ToastAction;
}

// ---- 全局 Toast 状态管理 ----

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();
let nextId = 1;
/** 存储每个 toast 的自动消失定时器，用于撤销时取消 */
const timerMap = new Map<string, ReturnType<typeof setTimeout>>();

function notifyListeners() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

/** 添加 Toast 通知 */
export function toast(
  type: ToastItem["type"],
  message: string,
  options?: { details?: string; duration?: number; action?: ToastAction },
) {
  const id = String(nextId++);
  const item: ToastItem = {
    id,
    type,
    message,
    details: options?.details,
    duration: options?.duration ?? (type === "error" ? 8000 : 4000),
    action: options?.action,
  };

  // 最大堆叠 3 个
  toasts = [...toasts.slice(-2), item];
  notifyListeners();

  // 自动消失
  const timer = setTimeout(() => {
    timerMap.delete(id);
    dismissToast(id);
  }, item.duration);
  timerMap.set(id, timer);
}

/** 关闭 Toast */
export function dismissToast(id: string) {
  // 清除对应定时器
  const timer = timerMap.get(id);
  if (timer) {
    clearTimeout(timer);
    timerMap.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

/** 快捷方法 */
toast.success = (message: string, options?: { details?: string }) =>
  toast("success", message, options);
toast.error = (message: string, options?: { details?: string }) =>
  toast("error", message, options);
toast.info = (message: string, options?: { details?: string }) =>
  toast("info", message, options);

/**
 * 带撤销按钮的 Toast（5 秒倒计时）
 * @param message 提示消息
 * @param onConfirm 超时后执行的确认操作（如真正删除）
 * @param onUndo 撤销时执行的回调（如恢复 UI）
 * @param duration 倒计时时长（默认 5000ms）
 * @returns toast id
 */
toast.undoable = (
  message: string,
  onConfirm: () => void,
  onUndo?: () => void,
  duration = 5000,
): string => {
  let undone = false;
  const id = String(nextId++);

  const item: ToastItem = {
    id,
    type: "info",
    message,
    duration,
    action: {
      label: "撤销",
      onClick: () => {
        undone = true;
        onUndo?.();
        dismissToast(id);
      },
    },
  };

  // 最大堆叠 3 个
  toasts = [...toasts.slice(-2), item];
  notifyListeners();

  // 超时后执行确认操作
  const timer = setTimeout(() => {
    timerMap.delete(id);
    if (!undone) {
      onConfirm();
    }
    // 移除 toast
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, duration);
  timerMap.set(id, timer);

  return id;
};

/** 订阅 Toast 列表变化 */
export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

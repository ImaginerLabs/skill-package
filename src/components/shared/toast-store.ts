// ============================================================
// components/shared/toast-store.ts — Toast 全局状态管理
// ============================================================

// ---- Toast 类型定义 ----

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  details?: string;
  duration?: number;
}

// ---- 全局 Toast 状态管理 ----

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();
let nextId = 1;

function notifyListeners() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

/** 添加 Toast 通知 */
export function toast(
  type: ToastItem["type"],
  message: string,
  options?: { details?: string; duration?: number },
) {
  const id = String(nextId++);
  const item: ToastItem = {
    id,
    type,
    message,
    details: options?.details,
    duration: options?.duration ?? (type === "error" ? 8000 : 4000),
  };

  // 最大堆叠 3 个
  toasts = [...toasts.slice(-2), item];
  notifyListeners();

  // 自动消失
  setTimeout(() => {
    dismissToast(id);
  }, item.duration);
}

/** 关闭 Toast */
export function dismissToast(id: string) {
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

/** 订阅 Toast 列表变化 */
export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ============================================================
// src/components/shared/ErrorBoundary.tsx — React 错误边界组件
// ============================================================

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自定义 fallback 组件（可选） */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorFallback — 默认错误展示组件
 * 注意：不添加样式，Story 0-4（设计系统）负责样式
 */
function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  return (
    <div role="alert">
      <h2>出错了</h2>
      <p>应用遇到了一个意外错误，请尝试重试。</p>
      {error && (
        <details>
          <summary>错误详情</summary>
          <pre>{error.message}</pre>
        </details>
      )}
      <button type="button" onClick={onReset}>
        重试
      </button>
    </div>
  );
}

/**
 * ErrorBoundary — React 错误边界
 * 捕获子组件树中的渲染错误，显示 fallback UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息到控制台（后续可接入日志服务）
    console.error("[ErrorBoundary] 捕获到渲染错误:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

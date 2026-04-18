// ============================================================
// hooks/useExpandedState.ts — 统一的展开/折叠状态管理
// ============================================================

import { useCallback, useState } from "react";

/**
 * useExpandedState — 统一的展开/折叠状态管理 hook
 *
 * 基于 Set 的多选展开模式，支持同时展开多个项
 *
 * @example
 * const { isExpanded, toggle, expand, collapse, expandAll, collapseAll } = useExpandedState<string>();
 */
export function useExpandedState<T = string>(
  initialExpanded: Set<T> = new Set(),
) {
  const [expandedSet, setExpandedSet] = useState<Set<T>>(initialExpanded);

  const isExpanded = useCallback(
    (id: T): boolean => expandedSet.has(id),
    [expandedSet],
  );

  const toggle = useCallback((id: T) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expand = useCallback((id: T) => {
    setExpandedSet((prev) => new Set(prev).add(id));
  }, []);

  const collapse = useCallback((id: T) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const expandAll = useCallback((ids: T[]) => {
    setExpandedSet(new Set(ids));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSet(new Set());
  }, []);

  return {
    expandedSet,
    isExpanded,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
  };
}

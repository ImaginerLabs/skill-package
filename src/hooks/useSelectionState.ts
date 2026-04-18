// ============================================================
// hooks/useSelectionState.ts — 统一的选中状态管理
// ============================================================

import { useCallback, useState } from "react";

/**
 * useSelectionState — 统一的选中状态管理 hook
 *
 * 基于 Set<string> 的多选管理模式
 *
 * @example
 * const { selected, isSelected, toggle, select, deselect, selectAll, deselectAll, clear } = useSelectionState<string>();
 */
export function useSelectionState<T = string>(
  initialSelected: Set<T> = new Set(),
) {
  const [selected, setSelected] = useState<Set<T>>(initialSelected);

  const isSelected = useCallback(
    (id: T): boolean => selected.has(id),
    [selected],
  );

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const select = useCallback((id: T) => {
    setSelected((prev) => new Set(prev).add(id));
  }, []);

  const deselect = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelected(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isAllSelected = useCallback(
    (ids: T[]): boolean =>
      ids.length > 0 && ids.every((id) => selected.has(id)),
    [selected],
  );

  const getSelectedCount = useCallback((): number => selected.size, [selected]);

  return {
    selected,
    isSelected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    clear,
    isAllSelected,
    getSelectedCount,
  };
}

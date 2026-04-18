import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelectionState } from "../../../src/hooks/useSelectionState";

describe("useSelectionState", () => {
  describe("初始状态", () => {
    it("默认空 Set", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      expect(result.current.selected.size).toBe(0);
    });

    it("接受初始选中集合", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      expect(result.current.selected.size).toBe(2);
      expect(result.current.isSelected("a")).toBe(true);
      expect(result.current.isSelected("b")).toBe(true);
    });
  });

  describe("isSelected", () => {
    it("返回 false 当未选中", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      expect(result.current.isSelected("a")).toBe(false);
    });

    it("返回 true 当已选中", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a"])),
      );
      expect(result.current.isSelected("a")).toBe(true);
    });
  });

  describe("toggle", () => {
    it("选中未选中的项", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      act(() => {
        result.current.toggle("a");
      });
      expect(result.current.isSelected("a")).toBe(true);
    });

    it("取消选中已选中的项", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a"])),
      );
      act(() => {
        result.current.toggle("a");
      });
      expect(result.current.isSelected("a")).toBe(false);
    });

    it("支持多个同时选中", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      act(() => {
        result.current.toggle("a");
        result.current.toggle("b");
      });
      expect(result.current.isSelected("a")).toBe(true);
      expect(result.current.isSelected("b")).toBe(true);
    });
  });

  describe("select / deselect", () => {
    it("select 选中指定项", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      act(() => {
        result.current.select("a");
      });
      expect(result.current.isSelected("a")).toBe(true);
    });

    it("deselect 取消选中指定项", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      act(() => {
        result.current.deselect("a");
      });
      expect(result.current.isSelected("a")).toBe(false);
      expect(result.current.isSelected("b")).toBe(true);
    });
  });

  describe("selectAll / deselectAll / clear", () => {
    it("selectAll 选中所有项", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      act(() => {
        result.current.selectAll(["a", "b", "c"]);
      });
      expect(result.current.selected.size).toBe(3);
    });

    it("deselectAll 取消选中所有项", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      act(() => {
        result.current.deselectAll();
      });
      expect(result.current.selected.size).toBe(0);
    });

    it("clear 清空选中", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      act(() => {
        result.current.clear();
      });
      expect(result.current.selected.size).toBe(0);
    });
  });

  describe("isAllSelected", () => {
    it("返回 true 当所有项都被选中", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      expect(result.current.isAllSelected(["a", "b"])).toBe(true);
    });

    it("返回 false 当部分项被选中", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a"])),
      );
      expect(result.current.isAllSelected(["a", "b"])).toBe(false);
    });

    it("返回 false 当空数组", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      expect(result.current.isAllSelected([])).toBe(false);
    });
  });

  describe("getSelectedCount", () => {
    it("返回选中数量", () => {
      const { result } = renderHook(() =>
        useSelectionState<string>(new Set(["a", "b"])),
      );
      expect(result.current.getSelectedCount()).toBe(2);
    });

    it("空时返回 0", () => {
      const { result } = renderHook(() => useSelectionState<string>());
      expect(result.current.getSelectedCount()).toBe(0);
    });
  });
});

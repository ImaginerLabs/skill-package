import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExpandedState } from "../../../src/hooks/useExpandedState";

describe("useExpandedState", () => {
  describe("初始状态", () => {
    it("默认空 Set", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      expect(result.current.expandedSet.size).toBe(0);
    });

    it("接受初始展开集合", () => {
      const { result } = renderHook(() =>
        useExpandedState<string>(new Set(["a", "b"])),
      );
      expect(result.current.expandedSet.size).toBe(2);
      expect(result.current.isExpanded("a")).toBe(true);
      expect(result.current.isExpanded("b")).toBe(true);
    });
  });

  describe("isExpanded", () => {
    it("返回 false 当未展开", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      expect(result.current.isExpanded("a")).toBe(false);
    });

    it("返回 true 当已展开", () => {
      const { result } = renderHook(() =>
        useExpandedState<string>(new Set(["a"])),
      );
      expect(result.current.isExpanded("a")).toBe(true);
    });
  });

  describe("toggle", () => {
    it("展开未展开的项", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.toggle("a");
      });
      expect(result.current.isExpanded("a")).toBe(true);
    });

    it("折叠已展开的项", () => {
      const { result } = renderHook(() =>
        useExpandedState<string>(new Set(["a"])),
      );
      act(() => {
        result.current.toggle("a");
      });
      expect(result.current.isExpanded("a")).toBe(false);
    });

    it("支持多个同时展开", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.toggle("a");
        result.current.toggle("b");
      });
      expect(result.current.isExpanded("a")).toBe(true);
      expect(result.current.isExpanded("b")).toBe(true);
    });
  });

  describe("expand", () => {
    it("展开指定项", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.expand("a");
      });
      expect(result.current.isExpanded("a")).toBe(true);
    });

    it("重复展开不重复添加", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.expand("a");
        result.current.expand("a");
      });
      expect(result.current.expandedSet.size).toBe(1);
    });
  });

  describe("collapse", () => {
    it("折叠指定项", () => {
      const { result } = renderHook(() =>
        useExpandedState<string>(new Set(["a", "b"])),
      );
      act(() => {
        result.current.collapse("a");
      });
      expect(result.current.isExpanded("a")).toBe(false);
      expect(result.current.isExpanded("b")).toBe(true);
    });

    it("折叠不存在的项不报错", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.collapse("nonexistent");
      });
      expect(result.current.expandedSet.size).toBe(0);
    });
  });

  describe("expandAll / collapseAll", () => {
    it("expandAll 展开所有项", () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.expandAll(["a", "b", "c"]);
      });
      expect(result.current.expandedSet.size).toBe(3);
      expect(result.current.isExpanded("a")).toBe(true);
      expect(result.current.isExpanded("b")).toBe(true);
      expect(result.current.isExpanded("c")).toBe(true);
    });

    it("collapseAll 折叠所有项", () => {
      const { result } = renderHook(() =>
        useExpandedState<string>(new Set(["a", "b"])),
      );
      act(() => {
        result.current.collapseAll();
      });
      expect(result.current.expandedSet.size).toBe(0);
    });
  });
});

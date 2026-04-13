// ============================================================
// tests/unit/stores/workflow-store.test.ts
// Story 1.2: 工作流编排状态持久化
// 验收标准：步骤和名称在刷新后自动恢复；reset() 清除草稿
// ============================================================

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkflowStore } from "../../../src/stores/workflow-store";

const DRAFT_KEY = "workflow-draft";

// setup.ts 中 localStorage 被替换为 vi.fn() mock（getItem 默认返回 undefined）
// 这里使用真实的 Map 实现替换，以便测试实际的持久化行为
const localStorageStore = new Map<string, string>();
const realLocalStorage = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) =>
    localStorageStore.set(key, value),
  ),
  removeItem: vi.fn((key: string) => localStorageStore.delete(key)),
  clear: vi.fn(() => localStorageStore.clear()),
};

describe("workflow-store — localStorage 草稿持久化 (Story 1.2)", () => {
  beforeEach(() => {
    // 替换为真实实现
    Object.defineProperty(global, "localStorage", {
      value: realLocalStorage,
      writable: true,
      configurable: true,
    });
    localStorageStore.clear();
    vi.clearAllMocks();
    // 重置 store 状态
    useWorkflowStore.getState().reset();
    // reset 会调用 removeItem，清除后重置 mock 调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageStore.clear();
  });

  // ─────────────────────────────────────────────
  // addStep：写入 localStorage
  // ─────────────────────────────────────────────
  describe("addStep — 持久化", () => {
    it("addStep 后 localStorage 中包含新步骤", () => {
      useWorkflowStore.getState().addStep("s1", "代码审查");

      const raw = localStorageStore.get(DRAFT_KEY);
      expect(raw).toBeDefined();
      const saved = JSON.parse(raw!);
      expect(saved.steps).toHaveLength(1);
      expect(saved.steps[0].skillId).toBe("s1");
      expect(saved.steps[0].skillName).toBe("代码审查");
    });

    it("多次 addStep 后 localStorage 步骤数量正确", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().addStep("s2", "步骤二");

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps).toHaveLength(2);
    });

    it("addStep 后步骤 order 从 1 开始递增", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().addStep("s2", "步骤二");

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps[0].order).toBe(1);
      expect(saved.steps[1].order).toBe(2);
    });
  });

  // ─────────────────────────────────────────────
  // setWorkflowName：写入 localStorage
  // ─────────────────────────────────────────────
  describe("setWorkflowName — 持久化", () => {
    it("setWorkflowName 后 localStorage 中名称更新", () => {
      useWorkflowStore.getState().setWorkflowName("我的工作流");

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.workflowName).toBe("我的工作流");
    });

    it("setWorkflowName 后 store 状态同步更新", () => {
      useWorkflowStore.getState().setWorkflowName("测试工作流");
      expect(useWorkflowStore.getState().workflowName).toBe("测试工作流");
    });
  });

  // ─────────────────────────────────────────────
  // setWorkflowDescription：写入 localStorage
  // ─────────────────────────────────────────────
  describe("setWorkflowDescription — 持久化", () => {
    it("setWorkflowDescription 后 localStorage 中描述更新", () => {
      useWorkflowStore.getState().setWorkflowDescription("工作流描述");

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.workflowDescription).toBe("工作流描述");
    });
  });

  // ─────────────────────────────────────────────
  // removeStep：写入 localStorage
  // ─────────────────────────────────────────────
  describe("removeStep — 持久化", () => {
    it("removeStep 后 localStorage 步骤减少", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().addStep("s2", "步骤二");
      useWorkflowStore.getState().removeStep(0);

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps).toHaveLength(1);
      expect(saved.steps[0].skillId).toBe("s2");
    });

    it("removeStep 后剩余步骤 order 重新编号", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().addStep("s2", "步骤二");
      useWorkflowStore.getState().addStep("s3", "步骤三");
      useWorkflowStore.getState().removeStep(0);

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps[0].order).toBe(1);
      expect(saved.steps[1].order).toBe(2);
    });
  });

  // ─────────────────────────────────────────────
  // updateStepDescription：写入 localStorage
  // ─────────────────────────────────────────────
  describe("updateStepDescription — 持久化", () => {
    it("updateStepDescription 后 localStorage 中描述更新", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().updateStepDescription(0, "执行条件说明");

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps[0].description).toBe("执行条件说明");
    });
  });

  // ─────────────────────────────────────────────
  // reorderSteps：写入 localStorage
  // ─────────────────────────────────────────────
  describe("reorderSteps — 持久化", () => {
    it("reorderSteps 后 localStorage 中步骤顺序更新", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().addStep("s2", "步骤二");
      useWorkflowStore.getState().reorderSteps(0, 1);

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.steps[0].skillId).toBe("s2");
      expect(saved.steps[1].skillId).toBe("s1");
    });
  });

  // ─────────────────────────────────────────────
  // reset：清除 localStorage
  // ─────────────────────────────────────────────
  describe("reset — 清除草稿", () => {
    it("reset 后 localStorage 中草稿被清除", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().setWorkflowName("测试");

      // 确认草稿已写入
      expect(localStorageStore.has(DRAFT_KEY)).toBe(true);

      useWorkflowStore.getState().reset();

      // 草稿应被清除
      expect(localStorageStore.has(DRAFT_KEY)).toBe(false);
    });

    it("reset 后 store 状态恢复为空", () => {
      useWorkflowStore.getState().addStep("s1", "步骤一");
      useWorkflowStore.getState().setWorkflowName("测试");
      useWorkflowStore.getState().reset();

      const state = useWorkflowStore.getState();
      expect(state.steps).toEqual([]);
      expect(state.workflowName).toBe("");
      expect(state.workflowDescription).toBe("");
      expect(state.editingWorkflowId).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // loadWorkflow：写入 localStorage（编辑模式）
  // ─────────────────────────────────────────────
  describe("loadWorkflow — 编辑模式持久化", () => {
    it("loadWorkflow 后 localStorage 中包含 editingWorkflowId", () => {
      const steps = [
        { order: 1, skillId: "s1", skillName: "审查", description: "" },
      ];
      useWorkflowStore
        .getState()
        .loadWorkflow("wf-1", "工作流A", "描述A", steps);

      const saved = JSON.parse(localStorageStore.get(DRAFT_KEY)!);
      expect(saved.editingWorkflowId).toBe("wf-1");
      expect(saved.workflowName).toBe("工作流A");
      expect(saved.steps).toHaveLength(1);
    });

    it("loadWorkflow 后 store 状态同步更新", () => {
      const steps = [
        { order: 1, skillId: "s1", skillName: "审查", description: "" },
      ];
      useWorkflowStore
        .getState()
        .loadWorkflow("wf-1", "工作流A", "描述A", steps);

      const state = useWorkflowStore.getState();
      expect(state.editingWorkflowId).toBe("wf-1");
      expect(state.workflowName).toBe("工作流A");
      expect(state.steps).toHaveLength(1);
    });
  });

  // ─────────────────────────────────────────────
  // localStorage 容错
  // ─────────────────────────────────────────────
  describe("localStorage 容错", () => {
    it("localStorage.setItem 抛出异常时，addStep 不崩溃", () => {
      realLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });

      // 不应抛出异常
      expect(() => {
        useWorkflowStore.getState().addStep("s1", "步骤一");
      }).not.toThrow();
    });

    it("localStorage.removeItem 抛出异常时，reset 不崩溃", () => {
      realLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("SecurityError");
      });

      expect(() => {
        useWorkflowStore.getState().reset();
      }).not.toThrow();
    });
  });
});

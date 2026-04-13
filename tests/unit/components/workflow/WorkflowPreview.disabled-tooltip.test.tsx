// ============================================================
// tests/unit/components/workflow/WorkflowPreview.disabled-tooltip.test.tsx
// Story 1.3: 工作流按钮禁用状态提示
// 验收标准：
//   - 无名称时按钮 disabled
//   - 有名称无步骤时按钮 disabled
//   - 有名称有步骤时按钮可用
//   - 按钮被 <span> 包裹（Tooltip 代理模式，支持 disabled 元素的 hover 事件）
// ============================================================

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  previewWorkflow: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
}));

// Mock toast
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock stores
const mockReset = vi.fn();
const mockFetchSkills = vi.fn();

const defaultWorkflowStore = {
  workflowName: "",
  workflowDescription: "",
  steps: [],
  editingWorkflowId: null,
  reset: mockReset,
};

let currentWorkflowStore = { ...defaultWorkflowStore };

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => currentWorkflowStore),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({ fetchSkills: mockFetchSkills })),
}));

import WorkflowPreview from "../../../../src/components/workflow/WorkflowPreview";

const sampleSteps = [
  { order: 1, skillId: "s1", skillName: "代码审查", description: "" },
];

describe("WorkflowPreview — 禁用按钮 Tooltip 提示 (Story 1.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentWorkflowStore = { ...defaultWorkflowStore };
    mockFetchSkills.mockResolvedValue(undefined);
  });

  // ─────────────────────────────────────────────
  // 按钮禁用状态（验收标准核心）
  // ─────────────────────────────────────────────
  describe("按钮禁用状态", () => {
    it("无名称无步骤时，预览和生成按钮均为 disabled", () => {
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      const saveBtn = screen.getByText("生成工作流").closest("button")!;

      expect(previewBtn).toBeDisabled();
      expect(saveBtn).toBeDisabled();
    });

    it("有名称无步骤时，按钮仍为 disabled", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "工作流A",
      };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("有步骤无名称时，按钮仍为 disabled", () => {
      currentWorkflowStore = { ...defaultWorkflowStore, steps: sampleSteps };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("有名称且有步骤时，按钮变为可用", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "工作流A",
        steps: sampleSteps,
      };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      const saveBtn = screen.getByText("生成工作流").closest("button")!;

      expect(previewBtn).not.toBeDisabled();
      expect(saveBtn).not.toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────
  // Tooltip 代理结构验证（span 包裹 disabled 按钮）
  // 这是 AD-15 架构决策的核心：disabled 按钮必须用 <span> 包裹
  // 以便 Tooltip 能接收鼠标事件
  // ─────────────────────────────────────────────
  describe("Tooltip 代理结构 (AD-15)", () => {
    it("预览按钮被 <span> 包裹（Tooltip 代理模式）", () => {
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      // 父元素应为 span（Tooltip 代理）
      expect(previewBtn.parentElement?.tagName.toLowerCase()).toBe("span");
    });

    it("生成工作流按钮被 <span> 包裹（Tooltip 代理模式）", () => {
      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("生成工作流").closest("button")!;
      expect(saveBtn.parentElement?.tagName.toLowerCase()).toBe("span");
    });

    it("编辑模式下更新工作流按钮也被 <span> 包裹", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "工作流A",
        steps: sampleSteps,
        editingWorkflowId: "wf-1",
      };
      render(<WorkflowPreview />);

      const updateBtn = screen.getByText("更新工作流").closest("button")!;
      expect(updateBtn.parentElement?.tagName.toLowerCase()).toBe("span");
    });
  });

  // ─────────────────────────────────────────────
  // getDisabledReason 逻辑验证（通过渲染状态间接验证）
  // Radix Tooltip 在 jsdom 中不通过 hover 触发 portal 渲染，
  // 因此通过验证 disabledReason 影响的按钮状态来间接验证逻辑
  // ─────────────────────────────────────────────
  describe("getDisabledReason 逻辑", () => {
    it("名称为空字符串时，按钮禁用（对应 reason: 请先填写工作流名称）", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "",
        steps: sampleSteps,
      };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("名称为纯空格时，按钮禁用（trim 后为空）", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "   ",
        steps: sampleSteps,
      };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("名称有效但步骤为空时，按钮禁用（对应 reason: 请至少添加一个 Skill 步骤）", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "有效名称",
        steps: [],
      };
      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("生成工作流").closest("button")!;
      expect(saveBtn).toBeDisabled();
    });

    it("名称有效且步骤非空时，disabledReason 为 null，按钮可用", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "有效名称",
        steps: sampleSteps,
      };
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      const saveBtn = screen.getByText("生成工作流").closest("button")!;

      expect(previewBtn).not.toBeDisabled();
      expect(saveBtn).not.toBeDisabled();
    });
  });
});

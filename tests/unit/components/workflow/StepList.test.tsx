import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock @dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn(() => "") } },
}));

// Mock store
const mockRemoveStep = vi.fn();
const mockReorderSteps = vi.fn();
const mockUpdateStepDescription = vi.fn();
const mockAddCustomStep = vi.fn();

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    steps: [],
    removeStep: mockRemoveStep,
    reorderSteps: mockReorderSteps,
    updateStepDescription: mockUpdateStepDescription,
    addCustomStep: mockAddCustomStep,
  })),
}));

import StepList from "../../../../src/components/workflow/StepList";
import { useWorkflowStore } from "../../../../src/stores/workflow-store";

describe("StepList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("空状态", () => {
    it("无步骤时显示空状态引导", () => {
      render(<StepList />);

      expect(screen.getByText("开始编排工作流")).toBeInTheDocument();
      expect(
        screen.getByText(
          "从左侧选择 Skill 添加到工作流中，或添加自定义步骤，组合为一个自动化工作流",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("步骤展示", () => {
    it("渲染步骤列表", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          {
            order: 1,
            skillId: "skill-1",
            skillName: "代码审查",
            description: "执行全面审查",
            type: "skill",
          },
          {
            order: 2,
            skillId: "skill-2",
            skillName: "测试覆盖",
            description: "",
            type: "skill",
          },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
        addCustomStep: mockAddCustomStep,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(screen.getByText("代码审查")).toBeInTheDocument();
      expect(screen.getByText("测试覆盖")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("显示步骤描述输入框", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          {
            order: 1,
            skillId: "skill-1",
            skillName: "代码审查",
            description: "执行全面审查",
          },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      const descInput = screen.getByLabelText("代码审查 的描述");
      expect(descInput).toHaveValue("执行全面审查");
    });
  });

  describe("交互", () => {
    it("点击移除按钮调用 removeStep", async () => {
      const user = userEvent.setup();
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          {
            order: 1,
            skillId: "skill-1",
            skillName: "代码审查",
            description: "",
          },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      const removeButton = screen.getByLabelText("移除 代码审查");
      await user.click(removeButton);

      expect(mockRemoveStep).toHaveBeenCalledWith(0);
    });

    it("编辑描述调用 updateStepDescription", async () => {
      const user = userEvent.setup();
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          {
            order: 1,
            skillId: "skill-1",
            skillName: "代码审查",
            description: "",
          },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      const descInput = screen.getByLabelText("代码审查 的描述");
      await user.type(descInput, "测试");

      expect(mockUpdateStepDescription).toHaveBeenCalled();
    });

    it("渲染拖拽手柄", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          {
            order: 1,
            skillId: "skill-1",
            skillName: "代码审查",
            description: "",
          },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(screen.getByLabelText("拖拽排序 代码审查")).toBeInTheDocument();
    });

    it("多步骤时正确渲染所有步骤", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          { order: 1, skillId: "s1", skillName: "步骤A", description: "" },
          { order: 2, skillId: "s2", skillName: "步骤B", description: "" },
          { order: 3, skillId: "s3", skillName: "步骤C", description: "" },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(screen.getByText("步骤A")).toBeInTheDocument();
      expect(screen.getByText("步骤B")).toBeInTheDocument();
      expect(screen.getByText("步骤C")).toBeInTheDocument();
      expect(screen.getByLabelText("移除 步骤A")).toBeInTheDocument();
      expect(screen.getByLabelText("移除 步骤B")).toBeInTheDocument();
      expect(screen.getByLabelText("移除 步骤C")).toBeInTheDocument();
    });

    it("步骤列表有正确的 role 和 aria-label", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          { order: 1, skillId: "s1", skillName: "步骤A", description: "" },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(
        screen.getByRole("list", { name: "工作流步骤列表" }),
      ).toBeInTheDocument();
    });
  });

  describe("拖拽排序", () => {
    it("有步骤时不显示空状态", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          { order: 1, skillId: "s1", skillName: "步骤A", description: "" },
          { order: 2, skillId: "s2", skillName: "步骤B", description: "" },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(screen.queryByText("开始编排工作流")).not.toBeInTheDocument();
      expect(screen.getByText("步骤A")).toBeInTheDocument();
      expect(screen.getByText("步骤B")).toBeInTheDocument();
    });

    it("单步骤时第一项同时是最后项", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        steps: [
          { order: 1, skillId: "s1", skillName: "唯一步骤", description: "" },
        ],
        removeStep: mockRemoveStep,
        reorderSteps: mockReorderSteps,
        updateStepDescription: mockUpdateStepDescription,
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<StepList />);

      expect(screen.getByText("唯一步骤")).toBeInTheDocument();
      expect(screen.getByLabelText("移除 唯一步骤")).toBeInTheDocument();
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "workflow.reset": "重置工作流",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock stores
const mockSetWorkflowName = vi.fn();
const mockSetWorkflowDescription = vi.fn();
const mockReset = vi.fn();

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    workflowName: "",
    workflowDescription: "",
    steps: [],
    editingWorkflowId: null,
    setWorkflowName: mockSetWorkflowName,
    setWorkflowDescription: mockSetWorkflowDescription,
    reset: mockReset,
    removeStep: vi.fn(),
    reorderSteps: vi.fn(),
    updateStepDescription: vi.fn(),
    addCustomStep: vi.fn(),
  })),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: [],
    loading: false,
    fetchSkills: vi.fn(),
  })),
}));

// Mock SkillSelector（避免复杂依赖）
vi.mock("../../../../src/components/workflow/SkillSelector", () => ({
  default: () => <div data-testid="skill-selector">SkillSelector</div>,
}));

import WorkflowEditor from "../../../../src/components/workflow/WorkflowEditor";
import { useWorkflowStore } from "../../../../src/stores/workflow-store";

describe("WorkflowEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染工作流名称和描述输入框", () => {
      render(<WorkflowEditor />);

      expect(screen.getByLabelText("工作流名称")).toBeInTheDocument();
      expect(screen.getByLabelText("工作流描述")).toBeInTheDocument();
    });

    it("渲染 SkillSelector 组件", () => {
      render(<WorkflowEditor />);

      expect(screen.getByTestId("skill-selector")).toBeInTheDocument();
    });

    it("渲染空状态引导（StepList）", () => {
      render(<WorkflowEditor />);

      expect(screen.getByText("开始编排工作流")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("输入工作流名称", async () => {
      const user = userEvent.setup();
      render(<WorkflowEditor />);

      const nameInput = screen.getByLabelText("工作流名称");
      await user.type(nameInput, "测试工作流");

      expect(mockSetWorkflowName).toHaveBeenCalled();
    });

    it("输入工作流描述", async () => {
      const user = userEvent.setup();
      render(<WorkflowEditor />);

      const descInput = screen.getByLabelText("工作流描述");
      await user.type(descInput, "这是一个测试");

      expect(mockSetWorkflowDescription).toHaveBeenCalled();
    });

    it("有步骤时 StepList 渲染步骤列表", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        workflowName: "测试",
        workflowDescription: "",
        steps: [
          {
            order: 1,
            skillId: "s1",
            skillName: "Skill 1",
            description: "",
          },
        ],
        editingWorkflowId: null,
        setWorkflowName: mockSetWorkflowName,
        setWorkflowDescription: mockSetWorkflowDescription,
        reset: mockReset,
        removeStep: vi.fn(),
        reorderSteps: vi.fn(),
        updateStepDescription: vi.fn(),
        addCustomStep: vi.fn(),
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<WorkflowEditor />);

      // StepList 有步骤时渲染步骤列表（role="list"）
      expect(
        screen.getByRole("list", { name: "工作流步骤列表" }),
      ).toBeInTheDocument();
    });

    it("有内容时显示重置按钮", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        workflowName: "测试",
        workflowDescription: "",
        steps: [
          {
            order: 1,
            skillId: "s1",
            skillName: "Skill 1",
            description: "",
          },
        ],
        editingWorkflowId: null,
        setWorkflowName: mockSetWorkflowName,
        setWorkflowDescription: mockSetWorkflowDescription,
        reset: mockReset,
        removeStep: vi.fn(),
        reorderSteps: vi.fn(),
        updateStepDescription: vi.fn(),
        addCustomStep: vi.fn(),
      } as unknown as ReturnType<typeof useWorkflowStore>);

      render(<WorkflowEditor />);

      // 重置按钮在 WorkflowPreview 中
      expect(screen.getByLabelText("重置工作流")).toBeInTheDocument();
    });
  });
});

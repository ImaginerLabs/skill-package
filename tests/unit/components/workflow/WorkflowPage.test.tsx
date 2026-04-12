import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
vi.mock("@/lib/api", () => ({
  fetchWorkflows: vi.fn(),
  fetchWorkflowDetail: vi.fn(),
  deleteWorkflow: vi.fn(),
}));

// Mock stores
vi.mock("@/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    loadWorkflow: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock("@/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    fetchSkills: vi.fn(),
  })),
}));

// Mock WorkflowEditor
vi.mock("@/components/workflow/WorkflowEditor", () => ({
  default: ({ onSaveSuccess }: { onSaveSuccess?: () => void }) => (
    <div data-testid="workflow-editor">
      <button onClick={onSaveSuccess} data-testid="mock-save-btn">
        保存
      </button>
    </div>
  ),
}));

// Mock toast
vi.mock("@/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    undoable: vi.fn(),
  },
}));

import { fetchWorkflowDetail, fetchWorkflows } from "@/lib/api";
import WorkflowPage from "@/pages/WorkflowPage";
import { useWorkflowStore } from "@/stores/workflow-store";

const mockWorkflows = [
  { id: "wf-1", name: "工作流 A", description: "描述 A", filePath: "wf-a.md" },
  { id: "wf-2", name: "工作流 B", description: "描述 B", filePath: "wf-b.md" },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkflowPage />
    </MemoryRouter>,
  );
}

describe("WorkflowPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchWorkflows).mockResolvedValue(mockWorkflows as any);
  });

  it("有工作流时默认显示「已有工作流」Tab", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("tab-list")).toBeInTheDocument();
    });

    // 列表 Tab 应处于激活状态（包含 primary 颜色类）
    const listTab = screen.getByTestId("tab-list");
    expect(listTab.className).toContain("border-[hsl(var(--primary))]");
  });

  it("无工作流时默认显示「新建工作流」Tab（编辑器模式）", async () => {
    vi.mocked(fetchWorkflows).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("workflow-editor")).toBeInTheDocument();
    });
  });

  it("点击「新建工作流」Tab 切换到编辑器模式", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("tab-list")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("tab-editor"));

    expect(screen.getByTestId("workflow-editor")).toBeInTheDocument();
  });

  it("点击工作流「编辑」按钮后切换到编辑器模式", async () => {
    const mockLoadWorkflow = vi.fn();
    vi.mocked(useWorkflowStore).mockReturnValue({
      loadWorkflow: mockLoadWorkflow,
      reset: vi.fn(),
    } as any);

    vi.mocked(fetchWorkflowDetail).mockResolvedValue({
      id: "wf-1",
      name: "工作流 A",
      description: "描述 A",
      steps: [],
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("edit-workflow-wf-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("edit-workflow-wf-1"));

    await waitFor(() => {
      expect(screen.getByTestId("workflow-editor")).toBeInTheDocument();
    });

    expect(mockLoadWorkflow).toHaveBeenCalledWith(
      "wf-1",
      "工作流 A",
      "描述 A",
      [],
    );
  });

  it("保存成功后切换回列表模式", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("tab-editor")).toBeInTheDocument();
    });

    // 切换到编辑器
    fireEvent.click(screen.getByTestId("tab-editor"));
    expect(screen.getByTestId("workflow-editor")).toBeInTheDocument();

    // 触发保存成功回调
    fireEvent.click(screen.getByTestId("mock-save-btn"));

    await waitFor(() => {
      // 切换回列表模式（编辑器消失）
      expect(screen.queryByTestId("workflow-editor")).not.toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 使用 vi.hoisted 确保 mock 变量在 vi.mock factory 中可访问
const { mockUseSortable } = vi.hoisted(() => ({
  mockUseSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: mockUseSortable,
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn(() => "") } },
}));

import StepItem from "../../../../src/components/workflow/StepItem";

const mockOnRemove = vi.fn();
const mockOnUpdateDescription = vi.fn();
const mockOnMoveUp = vi.fn();
const mockOnMoveDown = vi.fn();

const defaultProps = {
  step: {
    order: 1,
    skillId: "skill-1",
    skillName: "代码审查",
    description: "执行全面审查",
  },
  index: 0,
  onRemove: mockOnRemove,
  onUpdateDescription: mockOnUpdateDescription,
  onMoveUp: mockOnMoveUp,
  onMoveDown: mockOnMoveDown,
  isFirst: true,
  isLast: false,
};

describe("StepItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染步骤名称和序号", () => {
      render(<StepItem {...defaultProps} />);

      expect(screen.getByText("代码审查")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("渲染描述输入框", () => {
      render(<StepItem {...defaultProps} />);

      const input = screen.getByLabelText("代码审查 的描述");
      expect(input).toHaveValue("执行全面审查");
    });

    it("渲染拖拽手柄", () => {
      render(<StepItem {...defaultProps} />);

      expect(screen.getByLabelText("拖拽排序 代码审查")).toBeInTheDocument();
    });

    it("渲染移除按钮", () => {
      render(<StepItem {...defaultProps} />);

      expect(screen.getByLabelText("移除 代码审查")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("编辑描述调用 onUpdateDescription", async () => {
      const user = userEvent.setup();
      render(<StepItem {...defaultProps} />);

      const input = screen.getByLabelText("代码审查 的描述");
      await user.clear(input);
      await user.type(input, "新描述");

      expect(mockOnUpdateDescription).toHaveBeenCalled();
    });

    it("点击移除按钮调用 onRemove", async () => {
      const user = userEvent.setup();
      render(<StepItem {...defaultProps} />);

      const removeBtn = screen.getByLabelText("移除 代码审查");
      await user.click(removeBtn);

      expect(mockOnRemove).toHaveBeenCalledWith(0);
    });
  });

  describe("键盘排序", () => {
    it("Alt+ArrowUp 且非第一项时调用 onMoveUp", () => {
      render(
        <StepItem {...defaultProps} isFirst={false} isLast={false} index={1} />,
      );

      const item = screen.getByLabelText("步骤 1: 代码审查");
      fireEvent.keyDown(item, { key: "ArrowUp", altKey: true });

      expect(mockOnMoveUp).toHaveBeenCalledWith(1);
    });

    it("Alt+ArrowDown 且非最后项时调用 onMoveDown", () => {
      render(
        <StepItem {...defaultProps} isFirst={false} isLast={false} index={1} />,
      );

      const item = screen.getByLabelText("步骤 1: 代码审查");
      fireEvent.keyDown(item, { key: "ArrowDown", altKey: true });

      expect(mockOnMoveDown).toHaveBeenCalledWith(1);
    });

    it("isFirst=true 时 Alt+ArrowUp 不触发 onMoveUp", () => {
      render(<StepItem {...defaultProps} isFirst={true} index={0} />);

      const item = screen.getByLabelText("步骤 1: 代码审查");
      fireEvent.keyDown(item, { key: "ArrowUp", altKey: true });

      expect(mockOnMoveUp).not.toHaveBeenCalled();
    });

    it("isLast=true 时 Alt+ArrowDown 不触发 onMoveDown", () => {
      render(<StepItem {...defaultProps} isLast={true} index={0} />);

      const item = screen.getByLabelText("步骤 1: 代码审查");
      fireEvent.keyDown(item, { key: "ArrowDown", altKey: true });

      expect(mockOnMoveDown).not.toHaveBeenCalled();
    });
  });

  describe("拖拽状态", () => {
    it("isDragging=true 时应用拖拽样式", () => {
      mockUseSortable.mockReturnValueOnce({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 0, y: 10, scaleX: 1, scaleY: 1 },
        transition: "transform 200ms",
        isDragging: true,
      });

      render(<StepItem {...defaultProps} />);

      const item = screen.getByLabelText("步骤 1: 代码审查");
      expect(item.className).toContain("opacity-50");
    });
  });
  describe("可访问性", () => {
    it("步骤项有正确的 aria-label", () => {
      render(<StepItem {...defaultProps} />);

      expect(screen.getByLabelText("步骤 1: 代码审查")).toBeInTheDocument();
    });

    it("步骤序号为 2 时 aria-label 正确", () => {
      render(
        <StepItem
          {...defaultProps}
          step={{ ...defaultProps.step, order: 2, skillName: "测试覆盖" }}
        />,
      );

      expect(screen.getByLabelText("步骤 2: 测试覆盖")).toBeInTheDocument();
    });
  });
});

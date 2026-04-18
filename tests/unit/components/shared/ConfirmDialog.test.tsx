import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "../../../../src/components/shared/ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "确认删除",
    description: "确定要删除吗？",
    confirmLabel: "删除",
    cancelLabel: "取消",
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("open=true 时渲染对话框", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("open=false 时不渲染", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("显示正确的标题和描述", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("确认删除")).toBeInTheDocument();
    expect(screen.getByText("确定要删除吗？")).toBeInTheDocument();
  });

  it("显示确认和取消按钮", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("删除")).toBeInTheDocument();
    expect(screen.getByText("取消")).toBeInTheDocument();
  });

  it("点击确认按钮调用 onConfirm", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("删除"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("点击取消按钮调用 onOpenChange(false)", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("取消"));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("confirmDisabled=true 时确认按钮禁用", () => {
    render(<ConfirmDialog {...defaultProps} confirmDisabled={true} />);
    const confirmBtn = screen.getByText("删除");
    expect(confirmBtn).toBeDisabled();
  });

  it("confirmDisabled=false 时确认按钮可用", () => {
    render(<ConfirmDialog {...defaultProps} confirmDisabled={false} />);
    const confirmBtn = screen.getByText("删除");
    expect(confirmBtn).not.toBeDisabled();
  });

  it("variant=default 时无危险样式", () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    const confirmBtn = screen.getByText("删除");
    // default variant 不添加 destructive 类
    expect(confirmBtn.className).not.toContain("bg-[hsl(var(--destructive))]");
  });

  it("variant=danger 时确认按钮有 destructive 样式", () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    const confirmBtn = screen.getByText("删除");
    expect(confirmBtn.className).toContain("bg-[hsl(var(--destructive))]");
  });

  it("支持 ReactNode 作为 description", () => {
    const desc = (
      <div>
        <p>第一段描述</p>
        <p>第二段描述</p>
      </div>
    );
    render(<ConfirmDialog {...defaultProps} description={desc} />);
    expect(screen.getByText("第一段描述")).toBeInTheDocument();
    expect(screen.getByText("第二段描述")).toBeInTheDocument();
  });

  it("使用默认 i18n 文本当未传入 props", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={defaultProps.onOpenChange}
        onConfirm={defaultProps.onConfirm}
      />,
    );
    // 默认 cancelLabel 使用 i18n key "common.cancel"
    expect(screen.getByText("common.cancel")).toBeInTheDocument();
  });

  it("点击确认按钮触发 onConfirm 但不自动关闭（由父组件控制）", () => {
    // Radix AlertDialog 点击确认按钮不会自动关闭
    // ConfirmDialog 组件不自动调用 onOpenChange
    render(<ConfirmDialog {...defaultProps} open={true} />);
    fireEvent.click(screen.getByText("删除"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    // 组件仍然渲染在 DOM 中
    expect(screen.queryByRole("alertdialog")).toBeInTheDocument();
  });

  it("ESC 键触发 onOpenChange(false)", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole("alertdialog"), {
      key: "Escape",
    });
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("默认聚焦取消按钮（defaultFocus=cancel）", () => {
    render(<ConfirmDialog {...defaultProps} defaultFocus="cancel" />);
    // 取消按钮应该是默认聚焦的
    const cancelBtn = screen.getByText("取消");
    expect(cancelBtn).toHaveFocus();
  });
});

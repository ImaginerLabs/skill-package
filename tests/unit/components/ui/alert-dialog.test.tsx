import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../src/components/ui/alert-dialog";

describe("AlertDialog", () => {
  const renderAlertDialog = () =>
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button>删除</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

  it("渲染 trigger 按钮", () => {
    renderAlertDialog();
    expect(screen.getByText("删除")).toBeInTheDocument();
  });

  it("初始状态下不显示对话框内容", () => {
    renderAlertDialog();
    expect(screen.queryByText("确认删除？")).not.toBeInTheDocument();
  });

  it("点击 trigger 后显示对话框", async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByText("删除"));
    expect(screen.getByText("确认删除？")).toBeInTheDocument();
    expect(screen.getByText("此操作不可撤销。")).toBeInTheDocument();
    expect(screen.getByText("取消")).toBeInTheDocument();
    expect(screen.getByText("确认")).toBeInTheDocument();
  });

  it("点击取消关闭对话框", async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByText("删除"));
    expect(screen.getByText("确认删除？")).toBeInTheDocument();
    await user.click(screen.getByText("取消"));
    expect(screen.queryByText("确认删除？")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../src/components/ui/dialog";

// Mock react-i18next（t() 返回中文，模拟 zh 语言环境）
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.close": "关闭",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

describe("Dialog", () => {
  const renderDialog = () =>
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>打开</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑信息</DialogTitle>
            <DialogDescription>修改你的个人信息。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button>保存</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

  it("渲染 trigger 按钮", () => {
    renderDialog();
    expect(screen.getByText("打开")).toBeInTheDocument();
  });

  it("初始状态下不显示对话框内容", () => {
    renderDialog();
    expect(screen.queryByText("编辑信息")).not.toBeInTheDocument();
  });

  it("点击 trigger 后显示对话框", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("打开"));
    expect(screen.getByText("编辑信息")).toBeInTheDocument();
    expect(screen.getByText("修改你的个人信息。")).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
  });

  it("对话框包含关闭按钮", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("打开"));
    expect(screen.getByText("关闭")).toBeInTheDocument();
  });

  it("点击关闭按钮关闭对话框", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("打开"));
    expect(screen.getByText("编辑信息")).toBeInTheDocument();
    const closeBtn = screen.getByText("关闭").closest("button")!;
    await user.click(closeBtn);
    expect(screen.queryByText("编辑信息")).not.toBeInTheDocument();
  });
});

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorAlert from "../../../../src/components/shared/ErrorAlert";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.viewDetails": "查看详情",
        "common.close": "关闭",
      };
      return translations[key] || key;
    },
  })),
}));

describe("ErrorAlert", () => {
  describe("渲染", () => {
    it("默认 variant=error 渲染错误提示", () => {
      render(<ErrorAlert message="发生错误" />);
      expect(screen.getByText("发生错误")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("variant=warning 渲染警告提示", () => {
      render(<ErrorAlert message="警告信息" variant="warning" />);
      expect(screen.getByText("警告信息")).toBeInTheDocument();
    });

    it("variant=info 渲染信息提示", () => {
      render(<ErrorAlert message="提示信息" variant="info" />);
      expect(screen.getByText("提示信息")).toBeInTheDocument();
    });
  });

  describe("details 展开/收起", () => {
    it("有 details 时显示查看详情按钮", () => {
      render(<ErrorAlert message="错误" details="详细信息" />);
      expect(screen.getByText("查看详情")).toBeInTheDocument();
    });

    it("点击查看详情展开 details", () => {
      render(<ErrorAlert message="错误" details="详细信息内容" />);
      fireEvent.click(screen.getByText("查看详情"));
      expect(screen.getByText("详细信息内容")).toBeInTheDocument();
    });
  });

  describe("dismissible", () => {
    it("dismissible=true 时显示关闭按钮", () => {
      const onDismiss = vi.fn();
      render(
        <ErrorAlert message="错误" dismissible={true} onDismiss={onDismiss} />,
      );
      const closeBtn = screen.getByRole("button", { name: "关闭" });
      expect(closeBtn).toBeInTheDocument();
    });

    it("点击关闭按钮调用 onDismiss", () => {
      const onDismiss = vi.fn();
      render(
        <ErrorAlert message="错误" dismissible={true} onDismiss={onDismiss} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "关闭" }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("data-testid", () => {
    it("使用自定义 data-testid", () => {
      render(<ErrorAlert message="错误" data-testid="my-error" />);
      expect(screen.getByTestId("my-error")).toBeInTheDocument();
    });

    it("默认使用 error-alert", () => {
      render(<ErrorAlert message="错误" />);
      expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    });
  });
});

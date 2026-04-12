// ============================================================
// tests/unit/components/import/ScanPathInput.test.tsx — 扫描路径输入组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PathPreset } from "../../../../shared/types";
import { ScanPathInput } from "../../../../src/pages/import/ScanPathInput";

const mockPresets: PathPreset[] = [
  { id: "p1", path: "/Users/alex/projects", label: "我的项目" },
  { id: "p2", path: "/Users/alex/backup" },
];

const defaultProps = {
  scanPath: "",
  scanState: { status: "idle" as const },
  pathPresets: [],
  onScanPathChange: vi.fn(),
  onScan: vi.fn(),
};

describe("ScanPathInput", () => {
  // ----------------------------------------------------------------
  // 渲染
  // ----------------------------------------------------------------
  describe("渲染", () => {
    it("渲染路径输入框和扫描按钮", () => {
      render(<ScanPathInput {...defaultProps} />);

      expect(screen.getByLabelText("扫描路径")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /扫描/ })).toBeInTheDocument();
    });

    it("无预设时不渲染「从预设选择」下拉", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={[]} />);

      expect(screen.queryByTitle("从预设选择")).not.toBeInTheDocument();
    });

    it("有预设时渲染「从预设选择」下拉", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={mockPresets} />);

      expect(screen.getByTitle("从预设选择")).toBeInTheDocument();
    });

    it("预设下拉包含所有预设选项", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={mockPresets} />);

      // 有备注的预设显示 "备注 (路径)" 格式
      expect(
        screen.getByText("我的项目 (/Users/alex/projects)"),
      ).toBeInTheDocument();
      // 无备注的预设直接显示路径
      expect(screen.getByText("/Users/alex/backup")).toBeInTheDocument();
    });

    it("显示当前 scanPath 值", () => {
      render(<ScanPathInput {...defaultProps} scanPath="/current/path" />);

      expect(screen.getByDisplayValue("/current/path")).toBeInTheDocument();
    });

    it("扫描中时按钮显示「扫描中...」并禁用", () => {
      render(
        <ScanPathInput {...defaultProps} scanState={{ status: "loading" }} />,
      );

      expect(screen.getByText("扫描中...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /扫描中/ })).toBeDisabled();
    });

    it("非扫描中时按钮显示「扫描」且可点击", () => {
      render(<ScanPathInput {...defaultProps} />);

      const btn = screen.getByRole("button", { name: /^扫描$/ });
      expect(btn).not.toBeDisabled();
    });
  });

  // ----------------------------------------------------------------
  // 交互
  // ----------------------------------------------------------------
  describe("交互", () => {
    it("修改路径输入框时调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput {...defaultProps} onScanPathChange={onScanPathChange} />,
      );

      await user.type(screen.getByLabelText("扫描路径"), "/new/path");

      expect(onScanPathChange).toHaveBeenCalled();
    });

    it("点击扫描按钮调用 onScan", async () => {
      const user = userEvent.setup();
      const onScan = vi.fn();

      render(<ScanPathInput {...defaultProps} onScan={onScan} />);

      await user.click(screen.getByRole("button", { name: /^扫描$/ }));

      expect(onScan).toHaveBeenCalledOnce();
    });

    it("从预设下拉选择路径后调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          pathPresets={mockPresets}
          onScanPathChange={onScanPathChange}
        />,
      );

      const select = screen.getByTitle("从预设选择");
      await user.selectOptions(select, "/Users/alex/projects");

      expect(onScanPathChange).toHaveBeenCalledWith("/Users/alex/projects");
    });

    it("选择无备注的预设路径后调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          pathPresets={mockPresets}
          onScanPathChange={onScanPathChange}
        />,
      );

      const select = screen.getByTitle("从预设选择");
      await user.selectOptions(select, "/Users/alex/backup");

      expect(onScanPathChange).toHaveBeenCalledWith("/Users/alex/backup");
    });

    it("扫描中时点击扫描按钮不触发 onScan（按钮禁用）", async () => {
      const user = userEvent.setup();
      const onScan = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          scanState={{ status: "loading" }}
          onScan={onScan}
        />,
      );

      const btn = screen.getByRole("button", { name: /扫描中/ });
      await user.click(btn);

      expect(onScan).not.toHaveBeenCalled();
    });
  });
});

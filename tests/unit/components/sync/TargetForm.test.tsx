import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PathPreset } from "../../../../../shared/types";
import TargetForm from "../../../../src/components/sync/TargetForm";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "syncTarget.namePlaceholder": "目标名称",
        "syncTarget.pathPlaceholder": "目标路径",
        "syncTarget.nameLabel": "名称",
        "syncTarget.pathLabel": "路径",
        "common.processing": "处理中...",
        "common.confirm": "确认",
        "common.cancel": "取消",
        "syncTarget.validating": "验证中...",
        "syncTarget.pathValid": "路径有效",
        "syncTarget.pathInvalid": "路径无效",
      };
      return translations[key] || key;
    },
  })),
}));

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  validateSyncPath: vi.fn(),
}));

const mockPresets: PathPreset[] = [
  { id: "preset-1", label: "VS Code", path: "/Users/alex/.vscode/extensions" },
];

describe("TargetForm", () => {
  const defaultProps = {
    pathPresets: mockPresets,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("渲染表单", () => {
    render(<TargetForm {...defaultProps} />);
    expect(screen.getByPlaceholderText("目标名称")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("目标路径")).toBeInTheDocument();
  });

  it("填写表单并提交", async () => {
    render(<TargetForm {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("目标名称"), {
      target: { value: "Test Target" },
    });
    fireEvent.change(screen.getByPlaceholderText("目标路径"), {
      target: { value: "/test/path" },
    });
    fireEvent.click(screen.getByText("确认"));
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        "Test Target",
        "/test/path",
      );
    });
  });

  it("点击取消触发 onCancel", () => {
    render(<TargetForm {...defaultProps} />);
    fireEvent.click(screen.getByText("取消"));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("初始名称和路径为空时不提交", () => {
    render(<TargetForm {...defaultProps} />);
    const submitBtn = screen.getByText("确认") as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();
  });

  it("submitting=true 时禁用提交按钮", () => {
    render(<TargetForm {...defaultProps} submitting={true} />);
    const submitBtn = screen.getByText("处理中...") as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();
  });

  it("显示初始值当提供 initialName 和 initialPath", () => {
    render(
      <TargetForm
        {...defaultProps}
        initialName="Initial Name"
        initialPath="/initial/path"
      />,
    );
    expect(
      (screen.getByPlaceholderText("目标名称") as HTMLInputElement).value,
    ).toBe("Initial Name");
    expect(
      (screen.getByPlaceholderText("目标路径") as HTMLInputElement).value,
    ).toBe("/initial/path");
  });
});

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SyncTarget } from "../../../../../shared/types";
import TargetItem from "../../../../src/components/sync/TargetItem";

const mockTarget: SyncTarget = {
  id: "target-1",
  name: "VS Code",
  path: "/Users/alex/.vscode/extensions",
  enabled: true,
};

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "syncTarget.nameLabel": "名称",
        "syncTarget.pathLabel": "路径",
        "common.save": "保存",
        "common.cancel": "取消",
        "syncTarget.deleteAllSkillsTitle": "清空 Skills",
        "common.edit": "编辑",
        "common.delete": "删除",
        "common.close": "关闭",
        "syncTarget.enabledLabel": "已启用",
      };
      return translations[key] || key;
    },
  })),
}));

describe("TargetItem", () => {
  const defaultProps = {
    target: mockTarget,
    onToggleEnabled: vi.fn(),
    onStartEdit: vi.fn(),
    onSaveEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onDelete: vi.fn(),
    onDeleteAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("显示模式", () => {
    it("显示目标名称和路径", () => {
      render(<TargetItem {...defaultProps} />);
      expect(screen.getByText("VS Code")).toBeInTheDocument();
      expect(
        screen.getByText("/Users/alex/.vscode/extensions"),
      ).toBeInTheDocument();
    });

    it("enabled=true 显示默认 Badge", () => {
      render(<TargetItem {...defaultProps} />);
      expect(screen.getByText("已启用")).toBeInTheDocument();
    });

    it("enabled=false 显示关闭 Badge", () => {
      render(
        <TargetItem
          {...defaultProps}
          target={{ ...mockTarget, enabled: false }}
        />,
      );
      expect(screen.getByText("关闭")).toBeInTheDocument();
    });

    it("点击编辑按钮触发 onStartEdit", () => {
      render(<TargetItem {...defaultProps} />);
      const editBtn = screen.getByRole("button", { name: /编辑 VS Code/i });
      fireEvent.click(editBtn);
      expect(defaultProps.onStartEdit).toHaveBeenCalledWith(mockTarget);
    });

    it("点击删除按钮触发 onDelete", () => {
      render(<TargetItem {...defaultProps} />);
      const deleteBtn = screen.getByRole("button", { name: /删除 VS Code/i });
      fireEvent.click(deleteBtn);
      expect(defaultProps.onDelete).toHaveBeenCalledWith("target-1");
    });

    it("点击清空按钮触发 onDeleteAll", () => {
      render(<TargetItem {...defaultProps} />);
      const eraseBtn = screen.getByRole("button", {
        name: /清空 Skills VS Code/i,
      });
      fireEvent.click(eraseBtn);
      expect(defaultProps.onDeleteAll).toHaveBeenCalledWith("target-1");
    });

    it("点击整行触发 onToggleEnabled", () => {
      render(<TargetItem {...defaultProps} />);
      fireEvent.click(screen.getByText("VS Code"));
      expect(defaultProps.onToggleEnabled).toHaveBeenCalledWith(
        "target-1",
        true,
      );
    });
  });

  describe("编辑模式", () => {
    it("isEditing=true 显示编辑表单", () => {
      render(<TargetItem {...defaultProps} isEditing={true} />);
      expect(screen.getByPlaceholderText("名称")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("路径")).toBeInTheDocument();
    });

    it("编辑表单初始值为目标数据", () => {
      render(<TargetItem {...defaultProps} isEditing={true} />);
      expect(
        (screen.getByPlaceholderText("名称") as HTMLInputElement).value,
      ).toBe("VS Code");
      expect(
        (screen.getByPlaceholderText("路径") as HTMLInputElement).value,
      ).toBe("/Users/alex/.vscode/extensions");
    });

    it("点击保存按钮触发 onSaveEdit", () => {
      render(<TargetItem {...defaultProps} isEditing={true} />);
      const saveBtn = screen.getByRole("button", { name: /保存/i });
      fireEvent.click(saveBtn);
      expect(defaultProps.onSaveEdit).toHaveBeenCalledWith(
        "target-1",
        "VS Code",
        "/Users/alex/.vscode/extensions",
      );
    });

    it("点击取消按钮触发 onCancelEdit", () => {
      render(<TargetItem {...defaultProps} isEditing={true} />);
      const cancelBtn = screen.getByRole("button", { name: /取消/i });
      fireEvent.click(cancelBtn);
      expect(defaultProps.onCancelEdit).toHaveBeenCalled();
    });
  });
});

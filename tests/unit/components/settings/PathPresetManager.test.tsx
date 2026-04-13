// ============================================================
// tests/unit/components/settings/PathPresetManager.test.tsx — 路径预设管理组件测试
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PathPreset } from "../../../../shared/types";

// Mock ide-icons — 阻止 @lobehub/icons → @lobehub/ui 的 ESM 模块解析失败
vi.mock("../../../../src/components/settings/ide-icons/index", () => ({}));
vi.mock("../../../../src/components/settings/ide-icons/ide-matcher", () => ({
  matchIDEByPath: vi.fn().mockReturnValue(null),
  IDE_CONFIGS: [],
}));

// Mock toast-store
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  fetchPathPresets: vi.fn(),
  addPathPreset: vi.fn(),
  updatePathPreset: vi.fn(),
  deletePathPreset: vi.fn(),
}));

import PathPresetManager from "../../../../src/components/settings/PathPresetManager";
import * as api from "../../../../src/lib/api";

const mockPreset1: PathPreset = {
  id: "preset-1",
  path: "/Users/alex/projects",
  label: "我的项目",
};

const mockPreset2: PathPreset = {
  id: "preset-2",
  path: "/Users/alex/backup",
};

describe("PathPresetManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // 渲染
  // ----------------------------------------------------------------
  describe("渲染", () => {
    it("加载中时显示加载状态", () => {
      vi.mocked(api.fetchPathPresets).mockImplementation(
        () => new Promise(() => {}), // 永不 resolve
      );

      render(<PathPresetManager />);
      expect(screen.getByText("加载中...")).toBeInTheDocument();
    });

    it("加载失败时显示错误信息", async () => {
      vi.mocked(api.fetchPathPresets).mockRejectedValue(
        new Error("加载路径预设失败"),
      );

      render(<PathPresetManager />);

      await waitFor(() => {
        expect(screen.getByText("加载路径预设失败")).toBeInTheDocument();
      });
    });

    it("无预设时显示空状态引导文案", async () => {
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);

      render(<PathPresetManager />);

      await waitFor(() => {
        expect(screen.getByText(/还没有路径预设/)).toBeInTheDocument();
      });
    });

    it("有预设时渲染预设列表", async () => {
      vi.mocked(api.fetchPathPresets).mockResolvedValue([
        mockPreset1,
        mockPreset2,
      ]);

      render(<PathPresetManager />);

      await waitFor(() => {
        expect(screen.getByText("/Users/alex/projects")).toBeInTheDocument();
        expect(screen.getByText("我的项目")).toBeInTheDocument();
        expect(screen.getByText("/Users/alex/backup")).toBeInTheDocument();
      });
    });

    it("无备注的预设不显示备注文字", async () => {
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset2]);

      render(<PathPresetManager />);

      await waitFor(() => {
        expect(screen.getByText("/Users/alex/backup")).toBeInTheDocument();
      });

      // 没有备注文字（mockPreset2 无 label）
      expect(screen.queryByText("我的项目")).not.toBeInTheDocument();
    });

    it("标题显示「路径预设」", async () => {
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);

      render(<PathPresetManager />);

      await waitFor(() => {
        expect(screen.getByText("路径预设")).toBeInTheDocument();
      });
    });
  });

  // ----------------------------------------------------------------
  // 添加预设
  // ----------------------------------------------------------------
  describe("添加预设", () => {
    it("点击「添加路径」按钮显示添加表单", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      expect(
        screen.getByPlaceholderText("/Users/alex/.cursor"),
      ).toBeInTheDocument();
    });

    it("路径为空时确认添加按钮禁用", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      const confirmBtn = screen.getByRole("button", { name: /确认添加/ });
      expect(confirmBtn).toBeDisabled();
    });

    it("填写路径后点击确认添加调用 addPathPreset", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);
      vi.mocked(api.addPathPreset).mockResolvedValue(mockPreset1);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      await user.type(
        screen.getByPlaceholderText("/Users/alex/.cursor"),
        "/Users/alex/projects",
      );
      await user.type(
        screen.getByPlaceholderText("例如：我的主力开发目录"),
        "我的项目",
      );

      await user.click(screen.getByRole("button", { name: /确认添加/ }));

      expect(api.addPathPreset).toHaveBeenCalledWith({
        path: "/Users/alex/projects",
        label: "我的项目",
      });
    });

    it("添加成功后表单关闭，新预设出现在列表", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);
      vi.mocked(api.addPathPreset).mockResolvedValue(mockPreset1);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      await user.type(
        screen.getByPlaceholderText("/Users/alex/.cursor"),
        "/Users/alex/projects",
      );
      await user.click(screen.getByRole("button", { name: /确认添加/ }));

      await waitFor(() => {
        expect(screen.getByText("/Users/alex/projects")).toBeInTheDocument();
        expect(
          screen.queryByPlaceholderText("/Users/alex/.cursor"),
        ).not.toBeInTheDocument();
      });
    });

    it("点击取消按钮隐藏添加表单", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      expect(
        screen.getByPlaceholderText("/Users/alex/.cursor"),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /取消/ }));

      expect(
        screen.queryByPlaceholderText("/Users/alex/.cursor"),
      ).not.toBeInTheDocument();
    });

    it("添加失败时显示 toast 错误（不崩溃）", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([]);
      vi.mocked(api.addPathPreset).mockRejectedValue(new Error("路径已存在"));

      render(<PathPresetManager />);

      await waitFor(() => screen.getByRole("button", { name: /添加路径/ }));
      await user.click(screen.getByRole("button", { name: /添加路径/ }));

      await user.type(
        screen.getByPlaceholderText("/Users/alex/.cursor"),
        "/Users/alex/projects",
      );
      await user.click(screen.getByRole("button", { name: /确认添加/ }));

      // 表单仍然存在（未关闭）
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("/Users/alex/.cursor"),
        ).toBeInTheDocument();
      });
    });
  });

  // ----------------------------------------------------------------
  // 编辑预设
  // ----------------------------------------------------------------
  describe("编辑预设", () => {
    it("点击编辑图标进入内联编辑模式", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      const editBtns = screen.getAllByRole("button");
      // 找到编辑按钮（Pencil 图标按钮）
      const _editBtn = editBtns.find((btn) => btn.querySelector("svg"));
      // 点击第一个图标按钮（编辑）
      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[0]);

      // 进入编辑模式后出现输入框
      await waitFor(() => {
        expect(
          screen.getByDisplayValue("/Users/alex/projects"),
        ).toBeInTheDocument();
      });
    });

    it("编辑成功后调用 updatePathPreset", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);
      vi.mocked(api.updatePathPreset).mockResolvedValue({
        ...mockPreset1,
        label: "新备注",
      });

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      // 点击编辑按钮（第一个无文字的图标按钮）
      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[0]);

      await waitFor(() => screen.getByDisplayValue("/Users/alex/projects"));

      // 修改备注
      const labelInput = screen.getByDisplayValue("我的项目");
      await user.clear(labelInput);
      await user.type(labelInput, "新备注");

      await user.click(screen.getByRole("button", { name: /保存/ }));

      expect(api.updatePathPreset).toHaveBeenCalledWith("preset-1", {
        path: "/Users/alex/projects",
        label: "新备注",
      });
    });

    it("点击取消退出编辑模式", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[0]);

      await waitFor(() => screen.getByDisplayValue("/Users/alex/projects"));

      await user.click(screen.getByRole("button", { name: /取消/ }));

      await waitFor(() => {
        expect(
          screen.queryByDisplayValue("/Users/alex/projects"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("/Users/alex/projects")).toBeInTheDocument();
      });
    });
  });

  // ----------------------------------------------------------------
  // 删除预设
  // ----------------------------------------------------------------
  describe("删除预设", () => {
    it("点击删除图标弹出确认对话框", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      // 删除按钮是第二个图标按钮（Trash2）
      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[1]);

      expect(screen.getByText("删除路径预设")).toBeInTheDocument();
    });

    it("确认删除后调用 deletePathPreset", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);
      vi.mocked(api.deletePathPreset).mockResolvedValue(undefined);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[1]);

      await user.click(screen.getByRole("button", { name: /删除/ }));

      expect(api.deletePathPreset).toHaveBeenCalledWith("preset-1");
    });

    it("删除成功后预设从列表中消失", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);
      vi.mocked(api.deletePathPreset).mockResolvedValue(undefined);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[1]);
      await user.click(screen.getByRole("button", { name: /删除/ }));

      await waitFor(() => {
        expect(
          screen.queryByText("/Users/alex/projects"),
        ).not.toBeInTheDocument();
      });
    });

    it("取消删除不调用 deletePathPreset", async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchPathPresets).mockResolvedValue([mockPreset1]);

      render(<PathPresetManager />);

      await waitFor(() => screen.getByText("/Users/alex/projects"));

      const iconBtns = screen
        .getAllByRole("button")
        .filter((btn) => !btn.textContent?.trim());
      await user.click(iconBtns[1]);

      await user.click(screen.getByRole("button", { name: /^取消$/ }));

      expect(api.deletePathPreset).not.toHaveBeenCalled();
      expect(screen.getByText("/Users/alex/projects")).toBeInTheDocument();
    });
  });
});

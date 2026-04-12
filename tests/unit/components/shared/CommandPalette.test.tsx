import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock scrollIntoView（jsdom 不支持）
Element.prototype.scrollIntoView = vi.fn();

// Mock stores
const mockUIState = {
  commandPaletteOpen: true,
  setCommandPaletteOpen: vi.fn(),
};

vi.mock("@/stores/ui-store", () => ({
  useUIStore: vi.fn(() => mockUIState),
}));

const mockSkillState = {
  skills: [] as any[],
  selectSkill: vi.fn(),
};

vi.mock("@/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => mockSkillState),
}));

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import CommandPalette from "@/components/shared/CommandPalette";

const mockSkills = [
  {
    id: "s1",
    name: "代码审查助手",
    // 超过 60 字符的描述（65 个字符）
    description:
      "This skill helps with code review checking quality standards and best practices",
    category: "coding",
    tags: [],
    type: undefined,
    filePath: "coding/s1.md",
    fileSize: 100,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "s2",
    name: "短描述 Skill",
    description: "简短描述",
    category: "writing",
    tags: [],
    type: undefined,
    filePath: "writing/s2.md",
    fileSize: 100,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "s3",
    name: "无描述 Skill",
    description: "",
    category: "devops",
    tags: [],
    type: undefined,
    filePath: "devops/s3.md",
    fileSize: 100,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "wf1",
    name: "代码提交前检查",
    description: "提交前自动检查代码质量",
    category: "workflows",
    tags: [],
    type: "workflow" as const,
    filePath: "workflows/wf1.md",
    fileSize: 100,
    lastModified: "2024-01-01T00:00:00Z",
  },
];

function renderPalette() {
  return render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>,
  );
}

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUIState.commandPaletteOpen = true;
    mockSkillState.skills = mockSkills;
  });

  it("描述超过 60 字符时截断并追加 ...", () => {
    renderPalette();

    // 「代码审查助手」的描述超过 60 字符，应被截断
    const longDesc = mockSkills[0].description;
    const truncated = longDesc.slice(0, 60) + "...";
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it("描述不超过 60 字符时完整显示", () => {
    renderPalette();

    expect(screen.getByText("简短描述")).toBeInTheDocument();
  });

  it("描述为空时不渲染摘要行", () => {
    renderPalette();

    // 「无描述 Skill」不应有描述摘要
    const skillItem = screen.getByText("无描述 Skill").closest("[data-value]");
    // 确认该条目下没有描述文本（通过检查 p 标签）
    expect(skillItem?.querySelector("p")).toBeNull();
  });

  it("type === workflow 的 Skill 出现在「工作流」分组", () => {
    renderPalette();

    // 工作流 Skill 名称存在
    expect(screen.getByText("代码提交前检查")).toBeInTheDocument();
    // 工作流分组 heading（cmdk 渲染为 aria-hidden 的 div）
    const headings = document.querySelectorAll("[cmdk-group-heading]");
    const headingTexts = Array.from(headings).map((h) => h.textContent);
    expect(headingTexts).toContain("工作流");
  });

  it("无工作流 Skill 时「工作流」分组不渲染", () => {
    mockSkillState.skills = mockSkills.filter((s) => s.type !== "workflow");

    renderPalette();

    // 工作流分组 heading 不存在
    const headings = document.querySelectorAll("[cmdk-group-heading]");
    const headingTexts = Array.from(headings).map((h) => h.textContent);
    expect(headingTexts).not.toContain("工作流");
  });

  it("普通 Skill 出现在「Skills」分组", () => {
    renderPalette();

    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("代码审查助手")).toBeInTheDocument();
  });
});

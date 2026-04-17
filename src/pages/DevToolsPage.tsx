import { GitBranch, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// 开发工具配置
const DEV_TOOLS = [
  {
    id: "branch-generator",
    titleKey: "devTools.branchGenerator.title",
    descKey: "devTools.branchGenerator.desc",
    icon: GitBranch,
    path: "/tools/branch-generator",
    color: "text-[hsl(var(--primary))]",
    bgColor: "bg-[hsl(var(--primary)/0.1)]",
  },
] as const;

/**
 * 开发工具列表页 — 展示所有开发小工具入口
 */
export default function DevToolsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Wrench size={24} className="text-[hsl(var(--primary))]" />
        <h1 className="text-xl font-bold font-[var(--font-code)] text-[hsl(var(--foreground))]">
          {t("devTools.title")}
        </h1>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {t("devTools.toolCount", { count: DEV_TOOLS.length })}
        </span>
      </div>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
        {t("devTools.subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEV_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className="cursor-pointer transition-all duration-200 hover:border-[hsl(var(--primary)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)] hover:-translate-y-0.5 group"
              onClick={() => navigate(tool.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${tool.bgColor} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon size={20} className={tool.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-[var(--font-code)]">
                      {t(tool.titleKey)}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-2">
                      {t(tool.descKey)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

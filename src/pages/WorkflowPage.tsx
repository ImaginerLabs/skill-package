import { GitBranch } from "lucide-react";
import { Badge } from "../components/ui/badge";

export default function WorkflowPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <GitBranch
        size={48}
        className="text-[hsl(var(--primary))] mb-4 opacity-60"
      />
      <h2 className="text-xl font-semibold font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
        工作流编排
      </h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-4">
        组合多个 Skill 创建自动化工作流，即将推出
      </p>
      <Badge variant="secondary" className="text-xs">
        Coming Soon
      </Badge>
    </div>
  );
}

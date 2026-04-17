// ============================================================
// pages/BranchGeneratorPage.tsx — Git 智能分支名生成器页面
// ============================================================

import {
  ArrowLeft,
  Check,
  Copy,
  GitBranch,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/shared/toast-store";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  formatDescription,
  generateBranch,
} from "../tools/branch-generator/generator";
import {
  addHistory,
  clearHistory,
  loadHistory,
} from "../tools/branch-generator/history";
import {
  INTENT_CONFIGS,
  TARGET_BRANCHES,
} from "../tools/branch-generator/intent-config";
import type {
  BranchInput,
  BranchResult,
  HistoryEntry,
  IntentId,
} from "../tools/branch-generator/types";

/**
 * Git 智能分支名生成器页面
 * 基于 PRD：中文描述智能转英文分支名
 */
export default function BranchGeneratorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ---- 表单状态 ----
  const [targetBranch, setTargetBranch] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [intent, setIntent] = useState<IntentId>("feature");
  const [description, setDescription] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [includeDate, setIncludeDate] = useState(false);
  const [author, setAuthor] = useState("");

  // ---- 结果与历史 ----
  const [result, setResult] = useState<BranchResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 加载历史记录
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // ---- 实时预览 ----
  const resolvedTarget = isCustomTarget
    ? customTarget.trim()
    : targetBranch.trim();
  const preview = useMemo(() => {
    const input: BranchInput = {
      targetBranch: resolvedTarget || undefined,
      intent,
      description,
      ticketNumber: ticketNumber || undefined,
      includeDate,
      author: author || undefined,
    };
    return generateBranch(input);
  }, [resolvedTarget, intent, description, ticketNumber, includeDate, author]);

  // ---- 目标分支选择 ----
  const handleTargetSelect = (name: string) => {
    setTargetBranch(name);
    setIsCustomTarget(false);
    setCustomTarget("");
  };

  const handleTargetDeselect = () => {
    setTargetBranch("");
    setIsCustomTarget(false);
    setCustomTarget("");
  };

  const handleCustomTargetChange = (value: string) => {
    setCustomTarget(value);
    setIsCustomTarget(!!value);
  };

  // ---- 生成 ----
  const handleGenerate = useCallback(() => {
    if (!description.trim()) {
      toast.error(t("branchGenerator.error.noDescription"));
      return;
    }
    const target =
      (isCustomTarget ? customTarget.trim() : targetBranch.trim()) || undefined;
    const input: BranchInput = {
      targetBranch: target,
      intent,
      description,
      ticketNumber: ticketNumber || undefined,
      includeDate,
      author: author || undefined,
    };
    const res = generateBranch(input);
    setResult(res);

    if (res.isValid) {
      const newHistory = addHistory(res.branchName);
      setHistory(newHistory);
      toast.success(t("branchGenerator.success.generated"));
    } else {
      toast.error(t("branchGenerator.error.validationFailed"), {
        details: res.errors.join("; "),
      });
    }
  }, [
    targetBranch,
    customTarget,
    isCustomTarget,
    intent,
    description,
    ticketNumber,
    includeDate,
    author,
    t,
  ]);

  // ---- 复制 ----
  const copyToClipboard = useCallback(
    async (text: string, field: string) => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        } else {
          // 降级方案
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopiedField(field);
        toast.success(t("branchGenerator.copied"));
        setTimeout(() => setCopiedField(null), 2000);
      } catch {
        toast.error(t("branchGenerator.error.copyFailed"));
      }
    },
    [t],
  );

  // ---- 清空 ----
  const handleReset = useCallback(() => {
    setTargetBranch("");
    setCustomTarget("");
    setIsCustomTarget(false);
    setIntent("feature");
    setDescription("");
    setTicketNumber("");
    setIncludeDate(false);
    setAuthor("");
    setResult(null);
  }, []);

  // ---- 清空历史 ----
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    toast.success(t("branchGenerator.historyCleared"));
  }, [t]);

  // ---- 格式化描述预览 ----
  const formattedDesc = useMemo(
    () => formatDescription(description),
    [description],
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[hsl(var(--border))]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/tools")}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft size={16} />
        </Button>
        <GitBranch size={20} className="text-[hsl(var(--primary))]" />
        <h1 className="text-lg font-bold font-[var(--font-code)] text-[hsl(var(--foreground))]">
          {t("branchGenerator.title")}
        </h1>
      </div>

      {/* 主体内容 — 左右分栏 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* 左侧 — 输入表单 (3列宽) */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* ① 目标分支选择（选填） */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                ① {t("branchGenerator.targetBranch")}{" "}
                <span className="text-[hsl(var(--muted-foreground)/0.6)] text-xs">
                  ({t("branchGenerator.optional")})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {TARGET_BRANCHES.map((tb) => {
                  const isSelected =
                    !isCustomTarget && targetBranch === tb.name;
                  return (
                    <button
                      key={tb.name}
                      onClick={() =>
                        isSelected
                          ? handleTargetDeselect()
                          : handleTargetSelect(tb.name)
                      }
                      className={`px-3 py-1.5 rounded-lg border text-sm font-[var(--font-code)] transition-all duration-200 ${
                        isSelected
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                      }`}
                    >
                      {tb.icon} {tb.name}
                    </button>
                  );
                })}
              </div>
              <Input
                placeholder={t("branchGenerator.customTarget")}
                value={customTarget}
                onChange={(e) => handleCustomTargetChange(e.target.value)}
                className="font-[var(--font-code)] text-sm"
              />
            </CardContent>
          </Card>

          {/* ② 分支意图选择 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                ② {t("branchGenerator.intentLabel")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {INTENT_CONFIGS.map((ic) => (
                  <button
                    key={ic.id}
                    onClick={() => setIntent(ic.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all duration-200 ${
                      intent === ic.id
                        ? `${ic.borderClass} ${ic.bgClass} ${ic.colorClass}`
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                    }`}
                  >
                    <span className="text-base">{ic.icon}</span>
                    <span className="font-[var(--font-code)] font-medium">
                      {t(ic.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ③ 描述输入与可选元数据 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                ③ {t("branchGenerator.descriptionLabel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <Input
                  placeholder={t("branchGenerator.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="font-[var(--font-code)]"
                />
                {description && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-[var(--font-code)]">
                    → {formattedDesc || t("branchGenerator.noMappingHint")}
                  </p>
                )}
              </div>

              {/* 关联单号 */}
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-[var(--font-code)]">
                  {t("branchGenerator.ticketNumber")}
                </label>
                <Input
                  placeholder={t("branchGenerator.ticketPlaceholder")}
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="font-[var(--font-code)] text-sm"
                />
              </div>

              {/* 日期标记 */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                  {t("branchGenerator.dateTag")}
                </label>
                <button
                  onClick={() => setIncludeDate(!includeDate)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    includeDate
                      ? "bg-[hsl(var(--primary))]"
                      : "bg-[hsl(var(--muted))]"
                  }`}
                  role="switch"
                  aria-checked={includeDate}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      includeDate ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                {includeDate && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                    {new Date().toISOString().slice(0, 10).replace(/-/g, "")}
                  </span>
                )}
              </div>

              {/* 作者标识 */}
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-[var(--font-code)]">
                  {t("branchGenerator.author")}
                </label>
                <Input
                  placeholder={t("branchGenerator.authorPlaceholder")}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="font-[var(--font-code)] text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              className="flex-1 font-[var(--font-code)]"
            >
              ✨ {t("branchGenerator.generate")}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="font-[var(--font-code)]"
            >
              <RotateCcw size={14} className="mr-1" />
              {t("branchGenerator.reset")}
            </Button>
          </div>
        </div>

        {/* 右侧 — 结果与说明 (2列宽) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
          {/* 实时预览 / 生成结果 */}
          <Card className="border-[hsl(var(--primary)/0.3)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--primary))]">
                  📟 {t("branchGenerator.result")}
                </CardTitle>
                {result?.isValid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.branchName, "branch")}
                    className="h-7 px-2"
                  >
                    {copiedField === "branch" ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* 分支名预览/结果 */}
              <div className="bg-[hsl(var(--background))] rounded-lg p-3 mb-3 border border-[hsl(var(--border))]">
                <code className="text-sm font-[var(--font-code)] text-[hsl(var(--primary))] break-all">
                  {preview.branchName}
                </code>
              </div>

              {/* 校验错误 */}
              {preview.errors.length > 0 && (
                <div className="text-xs text-[hsl(var(--destructive))] mb-3 space-y-1">
                  {preview.errors.map((err, i) => (
                    <p key={i}>⚠️ {err}</p>
                  ))}
                </div>
              )}

              {/* Git 命令 */}
              {preview.gitCommand && (
                <div className="bg-[hsl(var(--background))] rounded-lg p-3 border border-[hsl(var(--border))] flex items-center justify-between gap-2">
                  <code className="text-xs font-[var(--font-code)] text-[hsl(var(--foreground))] break-all flex-1">
                    {preview.gitCommand}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(preview.gitCommand, "command")
                    }
                    className="shrink-0 h-7 px-2"
                  >
                    {copiedField === "command" ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 历史记录 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                  🕐 {t("branchGenerator.history")}
                </CardTitle>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-7 px-2 text-[hsl(var(--destructive))]"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t("branchGenerator.noHistory")}
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-xs group"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="font-[var(--font-code)] text-[hsl(var(--foreground))] break-all">
                          {h.branchName}
                        </code>
                        <p className="text-[hsl(var(--muted-foreground))] text-[10px]">
                          {h.time}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(h.branchName, `hist-${i}`)
                        }
                        className="shrink-0 h-6 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedField === `hist-${i}` ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 命名规范速查 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                ℹ️ {t("branchGenerator.convention")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 text-xs">
                {INTENT_CONFIGS.map((ic) => (
                  <div key={ic.id} className="flex items-center gap-2">
                    <span>{ic.icon}</span>
                    <code
                      className={`${ic.colorClass} font-[var(--font-code)]`}
                    >
                      {ic.prefix}
                    </code>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {t(ic.descKey)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 分支流程图 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                📊 {t("branchGenerator.flowChart")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-[var(--font-code)]">
                {[
                  {
                    step: "①",
                    icon: "👑",
                    label: "main/master",
                    desc: t("branchGenerator.flow.main"),
                  },
                  {
                    step: "②",
                    icon: "💻",
                    label: "develop",
                    desc: t("branchGenerator.flow.develop"),
                  },
                  {
                    step: "③",
                    icon: "➕🐛",
                    label: "feature / bugfix",
                    desc: t("branchGenerator.flow.featureBugfix"),
                  },
                  {
                    step: "④",
                    icon: "🚀",
                    label: "release",
                    desc: t("branchGenerator.flow.release"),
                  },
                  {
                    step: "⑤",
                    icon: "🔥",
                    label: "hotfix",
                    desc: t("branchGenerator.flow.hotfix"),
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {item.step}
                    </span>
                    <span>{item.icon}</span>
                    <code className="text-[hsl(var(--primary))]">
                      {item.label}
                    </code>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      — {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

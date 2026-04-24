import {
  ChevronDown,
  ChevronUp,
  Columns2,
  Copy,
  PanelRightOpen
} from "lucide-react";
import type { Platform } from "../config/platforms";

type ComposerDockProps = {
  compareEnabled: boolean;
  expanded: boolean;
  platforms: Platform[];
  prompt: string;
  primaryPlatformId: string;
  secondaryPlatformId: string | null;
  onChangeExpanded: (expanded: boolean) => void;
  onChangePrompt: (prompt: string) => void;
  onCopyAndOpen: (platformId: string) => void;
  onSelectSecondary: (platformId: string) => void;
  onToggleCompare: () => void;
};

export function ComposerDock({
  compareEnabled,
  expanded,
  platforms,
  prompt,
  primaryPlatformId,
  secondaryPlatformId,
  onChangeExpanded,
  onChangePrompt,
  onCopyAndOpen,
  onSelectSecondary,
  onToggleCompare
}: ComposerDockProps) {
  const primaryPlatform = platforms.find((platform) => platform.id === primaryPlatformId);

  return (
    <section
      className={`quick-copy-dock${expanded ? " is-expanded" : ""}`}
      aria-label="Quick Copy 工具"
    >
      <div className="dock-controls">
        <button
          className={`dock-button${compareEnabled ? " is-on" : ""}`}
          onClick={onToggleCompare}
          title={compareEnabled ? "退出双栏对比" : "开启双栏对比"}
          type="button"
        >
          <Columns2 size={17} strokeWidth={1.9} />
        </button>
        {compareEnabled ? (
          <label className="secondary-select">
            <PanelRightOpen size={15} strokeWidth={1.8} />
            <select
              value={secondaryPlatformId ?? ""}
              onChange={(event) => onSelectSecondary(event.target.value)}
              aria-label="右栏平台"
            >
              {platforms
                .filter((platform) => platform.id !== primaryPlatformId)
                .map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="quick-copy-summary">
        <p>Quick Copy</p>
        <span>
          {prompt.trim()
            ? `${prompt.trim().length} chars ready`
            : `当前平台：${primaryPlatform?.name ?? "AI"}`}
        </span>
      </div>

      <div className="dock-actions">
        <button
          className="dock-button"
          onClick={() => onChangeExpanded(!expanded)}
          title={expanded ? "收起复制工具" : "展开复制工具"}
          type="button"
        >
          {expanded ? (
            <ChevronDown size={17} strokeWidth={1.9} />
          ) : (
            <ChevronUp size={17} strokeWidth={1.9} />
          )}
        </button>
        {!expanded && primaryPlatform ? (
          <button
            className="platform-action is-primary"
            onClick={() => onCopyAndOpen(primaryPlatform.id)}
            style={{ ["--platform-accent" as string]: primaryPlatform.accent }}
            title={`复制并打开 ${primaryPlatform.name}`}
            type="button"
          >
            <Copy size={14} strokeWidth={1.9} />
            <span>复制到 {primaryPlatform.name}</span>
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="quick-copy-expanded">
          <div className="prompt-input-wrap">
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(event) => onChangePrompt(event.target.value)}
              placeholder="可选：输入要复制的 Prompt。AI Desk 不会自动粘贴或发送。"
            />
            {prompt ? <span>{prompt.length} chars</span> : null}
          </div>

          <div className="platform-action-strip" aria-label="复制并打开平台">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                className="platform-action"
                onClick={() => onCopyAndOpen(platform.id)}
                style={{ ["--platform-accent" as string]: platform.accent }}
                title={`复制并打开 ${platform.name}`}
                type="button"
              >
                <Copy size={14} strokeWidth={1.9} />
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

import {
  BookmarkPlus,
  Columns2,
  Copy,
  PanelRightOpen
} from "lucide-react";
import type { Platform } from "../config/platforms";

type ComposerDockProps = {
  compareEnabled: boolean;
  platforms: Platform[];
  prompt: string;
  primaryPlatformId: string;
  secondaryPlatformId: string | null;
  onChangePrompt: (prompt: string) => void;
  onCopyAndOpen: (platformId: string) => void;
  onSaveFavorite: () => void;
  onSelectSecondary: (platformId: string) => void;
  onToggleCompare: () => void;
};

export function ComposerDock({
  compareEnabled,
  platforms,
  prompt,
  primaryPlatformId,
  secondaryPlatformId,
  onChangePrompt,
  onCopyAndOpen,
  onSaveFavorite,
  onSelectSecondary,
  onToggleCompare
}: ComposerDockProps) {
  return (
    <section className="composer-dock" aria-label="统一 Prompt">
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

      <textarea
        className="prompt-input"
        value={prompt}
        onChange={(event) => onChangePrompt(event.target.value)}
        placeholder="输入 Prompt，复制到目标平台后手动粘贴发送"
      />

      <div className="dock-actions">
        <button
          className="dock-button"
          onClick={onSaveFavorite}
          title="保存当前 Prompt"
          type="button"
        >
          <BookmarkPlus size={17} strokeWidth={1.9} />
        </button>
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
    </section>
  );
}

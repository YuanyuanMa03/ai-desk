import {
  BookmarkPlus,
  Columns2,
  Copy,
  ExternalLink,
  Library,
  MousePointerClick,
  PanelRightOpen,
  Sparkles,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Browser } from "@capacitor/browser";
import { ensureSecondaryPlatform, createNextPaneState } from "./lib/app-state";
import {
  buildFavoriteTitle,
  createFavorite,
  loadFavorites,
  saveFavorites,
  type PromptFavorite
} from "./lib/favorites";
import { platformMap, platforms, type Platform } from "./config/platforms";

function PlatformView({
  platform,
  title,
  isElectron
}: {
  platform: Platform;
  title: string;
  isElectron: boolean;
}) {
  return (
    <section className="platform-view">
      <header className="platform-view__header">
        <div className="platform-view__title">
          <span
            className="platform-view__indicator"
            style={{ ["--platform-accent" as string]: platform.accent }}
          />
          <div>
            <p>{title}</p>
            <h2>{platform.name}</h2>
          </div>
        </div>
        <a
          className="icon-link"
          href={platform.url}
          target="_blank"
          rel="noreferrer"
          title={`在浏览器打开 ${platform.name}`}
          aria-label={`在浏览器打开 ${platform.name}`}
        >
          <ExternalLink size={16} strokeWidth={1.8} />
        </a>
      </header>
      {isElectron ? (
        <webview
          className="platform-view__webview"
          src={platform.url}
          partition={platform.partition}
        />
      ) : (
        <div className="mobile-platform-card">
          <ExternalLink size={30} strokeWidth={1.6} />
          <h3>{platform.name}</h3>
          <p>{platform.url.replace(/^https?:\/\//, "")}</p>
          <button
            className="material-button"
            onClick={() => Browser.open({ url: platform.url })}
            type="button"
          >
            <ExternalLink size={16} strokeWidth={1.9} />
            打开官方页面
          </button>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const isElectron = Boolean(window.electronAPI);
  const [prompt, setPrompt] = useState("");
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const [favorites, setFavorites] = useState<PromptFavorite[]>([]);
  const [paneState, setPaneState] = useState({
    primaryPlatformId: platforms[0].id,
    compareEnabled: false,
    secondaryPlatformId: null as string | null
  });
  const [statusMessage, setStatusMessage] = useState(
    isElectron
      ? "登录态仅保存在本机 Electron WebView session。"
      : "移动端保留 Prompt 与收藏，官方页面通过系统浏览器打开。"
  );

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (!paneState.compareEnabled) {
      return;
    }

    const ensuredSecondary = ensureSecondaryPlatform(
      paneState,
      platforms.map((platform) => platform.id)
    );

    if (ensuredSecondary !== paneState.secondaryPlatformId) {
      setPaneState((current) => ({
        ...current,
        secondaryPlatformId: ensuredSecondary
      }));
    }
  }, [paneState]);

  const primaryPlatform = platformMap[paneState.primaryPlatformId];
  const secondaryPlatform = paneState.secondaryPlatformId
    ? platformMap[paneState.secondaryPlatformId]
    : null;

  const favoriteCountLabel = useMemo(() => {
    return favorites.length === 1
      ? "1 saved prompt"
      : `${favorites.length} saved prompts`;
  }, [favorites]);

  const copyPrompt = async (text: string) => {
    if (window.electronAPI) {
      window.electronAPI.writeClipboard(text);
      return;
    }

    await navigator.clipboard.writeText(text);
  };

  const openPlatform = async (platform: Platform) => {
    if (isElectron) {
      return;
    }

    await Browser.open({ url: platform.url });
  };

  const handleCopyAndOpen = async (platformId: string) => {
    const text = prompt.trim();
    const platform = platformMap[platformId];

    if (!text) {
      setStatusMessage("先输入 Prompt，再执行复制并打开。");
      return;
    }

    await copyPrompt(text);
    setPaneState((current) =>
      createNextPaneState(
        {
          ...current,
          secondaryPlatformId: ensureSecondaryPlatform(
            current,
            platforms.map((platform) => platform.id)
          )
        },
        platformId
      )
    );
    await openPlatform(platform);
    setStatusMessage(
      isElectron
        ? `已复制到剪贴板，并切换到 ${platform.name}。`
        : `已复制到剪贴板，并打开 ${platform.name} 官方页面。`
    );
  };

  const handleToggleCompare = () => {
    setPaneState((current) => {
      const compareEnabled = !current.compareEnabled;
      const nextState = {
        ...current,
        compareEnabled
      };

      return {
        ...nextState,
        secondaryPlatformId: ensureSecondaryPlatform(
          nextState,
          platforms.map((platform) => platform.id)
        )
      };
    });
  };

  const handleSaveFavorite = () => {
    const text = prompt.trim();

    if (!text) {
      setStatusMessage("空 Prompt 不会被保存。");
      return;
    }

    const favorite = createFavorite(text);
    const normalizedTitle = favoriteTitle.trim();
    const finalFavorite = {
      ...favorite,
      title: normalizedTitle || buildFavoriteTitle(text)
    };

    setFavorites((current) => [finalFavorite, ...current]);
    setFavoriteTitle("");
    setStatusMessage(`已保存 Prompt：${finalFavorite.title}`);
  };

  const handleUseFavorite = (favorite: PromptFavorite) => {
    setPrompt(favorite.content);
    setFavoriteTitle(favorite.title);
    setStatusMessage(`已载入收藏：${favorite.title}`);
  };

  const handleDeleteFavorite = (favoriteId: string) => {
    setFavorites((current) =>
      current.filter((favorite) => favorite.id !== favoriteId)
    );
    setStatusMessage("已删除收藏 Prompt。");
  };

  return (
    <div className="app-shell">
      <div className="ambient-layer" />

      <aside className="platform-rail" aria-label="AI 平台">
        <div className="brand-mark" title="AI Desk">
          <Sparkles size={20} strokeWidth={1.8} />
        </div>

        <nav className="platform-nav">
          {platforms.map((platform) => {
            const active = platform.id === paneState.primaryPlatformId;

            return (
              <button
                key={platform.id}
                className={`platform-nav__item${active ? " is-active" : ""}`}
                onClick={() =>
                  setPaneState((current) => ({
                    ...current,
                    primaryPlatformId: platform.id
                  }))
                }
                style={{ ["--platform-accent" as string]: platform.accent }}
                title={platform.name}
                type="button"
              >
                <span className="platform-nav__glyph">
                  {platform.name.slice(0, 1)}
                </span>
                <span className="platform-nav__name">{platform.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="workspace" aria-label="AI Desk 工作区">
        <header className="workspace-titlebar">
          <div>
            <p>AI Desk</p>
            <h1>{primaryPlatform.name}</h1>
          </div>
          <div className="workspace-titlebar__meta">
            <span>{paneState.compareEnabled ? "双栏对比" : "单栏工作区"}</span>
            <span>{statusMessage}</span>
          </div>
        </header>

        <section
          className={`view-grid${paneState.compareEnabled ? " is-compare" : ""}`}
        >
          <PlatformView
            platform={primaryPlatform}
            title="主平台"
            isElectron={isElectron}
          />
          {paneState.compareEnabled && secondaryPlatform ? (
            <PlatformView
              platform={secondaryPlatform}
              title="对比平台"
              isElectron={isElectron}
            />
          ) : null}
        </section>
      </main>

      <aside className="favorites-panel" aria-label="Prompt 收藏夹">
        <div className="favorites-panel__header">
          <div className="panel-title">
            <Library size={18} strokeWidth={1.8} />
            <div>
              <p>Favorites</p>
              <h2>Prompt 收藏夹</h2>
            </div>
          </div>
          <span>{favoriteCountLabel}</span>
        </div>

        <label className="favorites-panel__field">
          <span>标题</span>
          <input
            type="text"
            value={favoriteTitle}
            onChange={(event) => setFavoriteTitle(event.target.value)}
            placeholder="默认使用 Prompt 摘要"
          />
        </label>

        <button
          className="material-button save-button"
          onClick={handleSaveFavorite}
          type="button"
        >
          <BookmarkPlus size={16} strokeWidth={1.9} />
          保存当前 Prompt
        </button>

        <div className="favorites-list">
          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <Library size={18} strokeWidth={1.7} />
              <p>还没有收藏 Prompt。</p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <article className="favorite-card" key={favorite.id}>
                <div className="favorite-card__header">
                  <h3>{favorite.title}</h3>
                  <time dateTime={favorite.createdAt}>
                    {new Date(favorite.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p>{favorite.content}</p>
                <div className="favorite-card__actions">
                  <button
                    className="icon-button"
                    onClick={() => handleUseFavorite(favorite)}
                    title="使用 Prompt"
                    type="button"
                  >
                    <MousePointerClick size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    className="icon-button danger-button"
                    onClick={() => handleDeleteFavorite(favorite.id)}
                    title="删除"
                    type="button"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>

      <section className="composer-dock" aria-label="统一 Prompt">
        <div className="dock-controls">
          <button
            className={`dock-button${paneState.compareEnabled ? " is-on" : ""}`}
            onClick={handleToggleCompare}
            title={paneState.compareEnabled ? "退出双栏对比" : "开启双栏对比"}
            type="button"
          >
            <Columns2 size={17} strokeWidth={1.9} />
          </button>
          {paneState.compareEnabled ? (
            <label className="secondary-select">
              <PanelRightOpen size={15} strokeWidth={1.8} />
              <select
                value={secondaryPlatform?.id ?? ""}
                onChange={(event) =>
                  setPaneState((current) => ({
                    ...current,
                    secondaryPlatformId: event.target.value
                  }))
                }
                aria-label="右栏平台"
              >
                {platforms
                  .filter(
                    (platform) => platform.id !== paneState.primaryPlatformId
                  )
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
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="输入 Prompt，复制到目标平台后手动粘贴发送"
        />

        <div className="dock-actions">
          <button
            className="dock-button"
            onClick={handleSaveFavorite}
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
                onClick={() => handleCopyAndOpen(platform.id)}
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
    </div>
  );
}

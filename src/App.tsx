import { useEffect, useMemo, useState } from "react";
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
  title
}: {
  platform: Platform;
  title: string;
}) {
  return (
    <section className="platform-view">
      <header className="platform-view__header">
        <div>
          <p className="platform-view__eyebrow">{title}</p>
          <h2>{platform.name}</h2>
        </div>
        <a
          className="platform-view__link"
          href={platform.url}
          target="_blank"
          rel="noreferrer"
        >
          在浏览器打开
        </a>
      </header>
      <webview
        className="platform-view__webview"
        src={platform.url}
        partition={platform.partition}
      />
    </section>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const [favorites, setFavorites] = useState<PromptFavorite[]>([]);
  const [paneState, setPaneState] = useState({
    primaryPlatformId: platforms[0].id,
    compareEnabled: false,
    secondaryPlatformId: null as string | null
  });
  const [statusMessage, setStatusMessage] = useState(
    "登录态仅保存在本机 Electron WebView session。"
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
    return favorites.length === 1 ? "1 saved prompt" : `${favorites.length} saved prompts`;
  }, [favorites]);

  const handleCopyAndOpen = (platformId: string) => {
    const text = prompt.trim();

    if (!text) {
      setStatusMessage("先输入 Prompt，再执行复制并打开。");
      return;
    }

    window.electronAPI.writeClipboard(text);
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
    setStatusMessage(`已复制到剪贴板，并切换到 ${platformMap[platformId].name}。`);
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
        secondaryPlatformId: ensureSecondaryPlatform(nextState, platforms.map((platform) => platform.id))
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
      <aside className="sidebar">
        <div className="brand-card">
          <p className="brand-card__eyebrow">AI Desk</p>
          <h1>桌面 AI 聚合工作台</h1>
          <p className="brand-card__copy">
            聚合官方网页版，不接 API，不托管账号，不越过登录。
          </p>
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
                type="button"
              >
                <span>{platform.name}</span>
                <small>{platform.url.replace(/^https?:\/\//, "")}</small>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="workspace">
        <section className="prompt-bar">
          <div className="prompt-bar__header">
            <div>
              <p className="section-eyebrow">Unified Prompt</p>
              <h2>复制后跳转到目标平台，由用户手动粘贴发送</h2>
            </div>
            <div className="prompt-bar__toggles">
              <button
                className={`ghost-button${paneState.compareEnabled ? " is-on" : ""}`}
                onClick={handleToggleCompare}
                type="button"
              >
                {paneState.compareEnabled ? "退出双栏" : "开启双栏对比"}
              </button>
              {paneState.compareEnabled ? (
                <label className="secondary-select">
                  <span>右栏平台</span>
                  <select
                    value={secondaryPlatform?.id ?? ""}
                    onChange={(event) =>
                      setPaneState((current) => ({
                        ...current,
                        secondaryPlatformId: event.target.value
                      }))
                    }
                  >
                    {platforms
                      .filter(
                        (platform) =>
                          platform.id !== paneState.primaryPlatformId
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
          </div>

          <textarea
            className="prompt-input"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="在这里编写统一 Prompt，点击目标平台按钮后会复制到系统剪贴板。"
          />

          <div className="prompt-actions">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                className="prompt-actions__button"
                onClick={() => handleCopyAndOpen(platform.id)}
                style={{ ["--platform-accent" as string]: platform.accent }}
                type="button"
              >
                复制并打开 {platform.name}
              </button>
            ))}
          </div>

          <p className="status-banner">{statusMessage}</p>
        </section>

        <section
          className={`view-grid${paneState.compareEnabled ? " is-compare" : ""}`}
        >
          <PlatformView platform={primaryPlatform} title="左栏 / 主平台" />
          {paneState.compareEnabled && secondaryPlatform ? (
            <PlatformView platform={secondaryPlatform} title="右栏 / 对比平台" />
          ) : null}
        </section>
      </main>

      <aside className="favorites-panel">
        <div className="favorites-panel__header">
          <div>
            <p className="section-eyebrow">Favorites</p>
            <h2>Prompt 收藏夹</h2>
          </div>
          <span>{favoriteCountLabel}</span>
        </div>

        <label className="favorites-panel__field">
          <span>标题</span>
          <input
            type="text"
            value={favoriteTitle}
            onChange={(event) => setFavoriteTitle(event.target.value)}
            placeholder="默认自动截取 Prompt 前缀"
          />
        </label>

        <button className="save-button" onClick={handleSaveFavorite} type="button">
          保存当前 Prompt
        </button>

        <div className="favorites-list">
          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <p>还没有收藏 Prompt。</p>
              <p>保存后会只存到当前设备的 localStorage。</p>
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
                    className="ghost-button"
                    onClick={() => handleUseFavorite(favorite)}
                    type="button"
                  >
                    使用 Prompt
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteFavorite(favorite.id)}
                    type="button"
                  >
                    删除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

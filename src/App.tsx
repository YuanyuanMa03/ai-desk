import { Browser } from "@capacitor/browser";
import { useEffect, useMemo, useState } from "react";
import { ComposerDock } from "./components/ComposerDock";
import { FavoritesPanel } from "./components/FavoritesPanel";
import { PlatformRail } from "./components/PlatformRail";
import { PlatformView } from "./components/PlatformView";
import { platformMap, platforms, type Platform } from "./config/platforms";
import { ensureSecondaryPlatform, createNextPaneState } from "./lib/app-state";
import {
  buildFavoriteTitle,
  createFavorite,
  loadFavorites,
  saveFavorites,
  type PromptFavorite
} from "./lib/favorites";

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

      <PlatformRail
        activePlatformId={paneState.primaryPlatformId}
        platforms={platforms}
        onSelectPlatform={(platformId) =>
          setPaneState((current) => ({
            ...current,
            primaryPlatformId: platformId
          }))
        }
      />

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

      <FavoritesPanel
        favoriteCountLabel={favoriteCountLabel}
        favoriteTitle={favoriteTitle}
        favorites={favorites}
        onChangeTitle={setFavoriteTitle}
        onDeleteFavorite={handleDeleteFavorite}
        onSaveFavorite={handleSaveFavorite}
        onUseFavorite={handleUseFavorite}
      />

      <ComposerDock
        compareEnabled={paneState.compareEnabled}
        platforms={platforms}
        prompt={prompt}
        primaryPlatformId={paneState.primaryPlatformId}
        secondaryPlatformId={secondaryPlatform?.id ?? null}
        onChangePrompt={setPrompt}
        onCopyAndOpen={handleCopyAndOpen}
        onSaveFavorite={handleSaveFavorite}
        onSelectSecondary={(platformId) =>
          setPaneState((current) => ({
            ...current,
            secondaryPlatformId: platformId
          }))
        }
        onToggleCompare={handleToggleCompare}
      />
    </div>
  );
}

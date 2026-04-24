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
  createGroup,
  createFavorite,
  createTag,
  loadFavorites,
  loadGroups,
  loadTags,
  saveFavorites,
  saveGroups,
  saveTags,
  updateFavorite,
  type PromptFavorite,
  type PromptGroup,
  type PromptTag
} from "./lib/favorites";

export default function App() {
  const isElectron = Boolean(window.electronAPI);
  const [prompt, setPrompt] = useState("");
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const [favorites, setFavorites] = useState<PromptFavorite[]>([]);
  const [groups, setGroups] = useState<PromptGroup[]>([]);
  const [tags, setTags] = useState<PromptTag[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [lastCopiedAt, setLastCopiedAt] = useState<number | null>(null);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
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
    setGroups(loadGroups());
    setTags(loadTags());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveFavorites(favorites);
  }, [favorites, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveGroups(groups);
  }, [groups, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveTags(tags);
  }, [storageReady, tags]);

  useEffect(() => {
    if (!copyToastVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyToastVisible(false), 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copyToastVisible]);

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
    setLastCopiedAt(Date.now());
    setCopyToastVisible(true);
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

    const favorite = createFavorite(text, selectedGroupId, selectedTagIds);
    const normalizedTitle = favoriteTitle.trim();
    const finalFavorite = {
      ...favorite,
      title: normalizedTitle || buildFavoriteTitle(text)
    };

    setFavorites((current) => [finalFavorite, ...current]);
    setFavoriteTitle("");
    setSelectedTagIds([]);
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

  const handleCreateGroup = (name: string) => {
    if (!name.trim()) {
      return;
    }

    const group = createGroup(name, groups);
    setGroups((current) => [...current, group]);
    setSelectedGroupId(group.id);
    setStatusMessage(`已创建分组：${group.name}`);
  };

  const handleCreateTag = (name: string) => {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      return;
    }

    const existing = tags.find(
      (tag) => tag.name.toLowerCase() === normalized.toLowerCase()
    );

    if (existing) {
      setSelectedTagIds((current) =>
        current.includes(existing.id) ? current : [...current, existing.id]
      );
      return;
    }

    const tag = createTag(normalized, tags);
    setTags((current) => [...current, tag]);
    setSelectedTagIds((current) => [...current, tag.id]);
    setStatusMessage(`已创建标签：${tag.name}`);
  };

  const handleManageGroup = (
    groupId: string,
    action: "rename" | "delete" | "color",
    value?: string
  ) => {
    if (action === "delete") {
      setGroups((current) => current.filter((group) => group.id !== groupId));
      setFavorites((current) =>
        current.map((favorite) =>
          favorite.groupId === groupId
            ? updateFavorite(favorite, { groupId: null })
            : favorite
        )
      );
      setSelectedGroupId((current) => (current === groupId ? null : current));
      setStatusMessage("已删除分组，相关 Prompt 已移到 Ungrouped。");
      return;
    }

    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              ...(action === "rename" && value?.trim()
                ? { name: value.trim() }
                : {}),
              ...(action === "color" && value?.trim()
                ? { color: value.trim() }
                : {})
            }
          : group
      )
    );
  };

  const handleMoveFavorite = (favoriteId: string, groupId: string | null) => {
    setFavorites((current) =>
      current.map((favorite) =>
        favorite.id === favoriteId
          ? updateFavorite(favorite, { groupId })
          : favorite
      )
    );
  };

  const handleEditFavorite = (favoriteId: string, title: string) => {
    setFavorites((current) =>
      current.map((favorite) =>
        favorite.id === favoriteId
          ? updateFavorite(favorite, { title: title.trim() })
          : favorite
      )
    );
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
            lastCopiedAt={lastCopiedAt}
          />
          {paneState.compareEnabled && secondaryPlatform ? (
            <PlatformView
              platform={secondaryPlatform}
              title="对比平台"
              isElectron={isElectron}
              lastCopiedAt={lastCopiedAt}
            />
          ) : null}
        </section>
      </main>

      <FavoritesPanel
        favoriteCountLabel={favoriteCountLabel}
        favoriteTitle={favoriteTitle}
        favorites={favorites}
        groups={groups}
        tags={tags}
        selectedGroupId={selectedGroupId}
        selectedTagIds={selectedTagIds}
        onChangeTitle={setFavoriteTitle}
        onChangeSelectedGroup={setSelectedGroupId}
        onChangeSelectedTags={setSelectedTagIds}
        onCreateGroup={handleCreateGroup}
        onCreateTag={handleCreateTag}
        onDeleteFavorite={handleDeleteFavorite}
        onEditFavorite={handleEditFavorite}
        onManageGroup={handleManageGroup}
        onMoveFavorite={handleMoveFavorite}
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

      {copyToastVisible ? (
        <div className="copy-toast" role="status">
          <span>✓</span>
          Prompt copied to clipboard
        </div>
      ) : null}
    </div>
  );
}

import { Browser } from "@capacitor/browser";
import { useEffect, useMemo, useState } from "react";
import { ComposerDock } from "./components/ComposerDock";
import { KnowledgePanel } from "./components/KnowledgePanel";
import { PlatformRail } from "./components/PlatformRail";
import { PlatformView } from "./components/PlatformView";
import { platformMap, platforms, type Platform } from "./config/platforms";
import { ensureSecondaryPlatform, createNextPaneState } from "./lib/app-state";
import {
  DEFAULT_KNOWLEDGE_SPACES,
  createKnowledgeItem,
  exportKnowledgeAsMarkdown,
  loadKnowledgeItems,
  saveKnowledgeItems,
  type KnowledgeDraft,
  type KnowledgeItem
} from "./lib/knowledge";

export default function App() {
  const isElectron = Boolean(window.electronAPI);
  const [prompt, setPrompt] = useState("");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [quickCopyExpanded, setQuickCopyExpanded] = useState(false);
  const [lastCopiedAt, setLastCopiedAt] = useState<number | null>(null);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [copyToastMessage, setCopyToastMessage] = useState("已复制到剪贴板");
  const [paneState, setPaneState] = useState({
    primaryPlatformId: platforms[0].id,
    compareEnabled: false,
    secondaryPlatformId: null as string | null
  });
  const [statusMessage, setStatusMessage] = useState(
    isElectron
      ? "登录态仅保存在本机 Electron WebView session，知识库仅保存在 localStorage。"
      : "移动端保留本地知识库，官方页面通过系统浏览器打开。"
  );

  useEffect(() => {
    setKnowledgeItems(loadKnowledgeItems());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveKnowledgeItems(knowledgeItems);
  }, [knowledgeItems, storageReady]);

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

  const knowledgeCountLabel = useMemo(() => {
    return knowledgeItems.length === 1
      ? "1 local note"
      : `${knowledgeItems.length} local notes`;
  }, [knowledgeItems]);

  const copyText = async (text: string) => {
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

  const activatePlatform = async (platformId: string) => {
    const platform = platformMap[platformId];

    setPaneState((current) => {
      const nextState = createNextPaneState(current, platformId);

      return {
        ...nextState,
        secondaryPlatformId: ensureSecondaryPlatform(
          nextState,
          platforms.map((candidate) => candidate.id)
        )
      };
    });
    await openPlatform(platform);
    setStatusMessage(
      isElectron
        ? `已切换到 ${platform.name}，请在官方页面内继续操作。`
        : `已打开 ${platform.name} 官方页面。`
    );
  };

  const handleCopyAndOpen = async (platformId: string) => {
    const text = prompt.trim();
    const platform = platformMap[platformId];

    if (!text) {
      setStatusMessage("先输入 Prompt，再执行复制并打开。");
      return;
    }

    await copyText(text);
    setLastCopiedAt(Date.now());
    setCopyToastMessage("Prompt 已复制到剪贴板");
    setCopyToastVisible(true);
    setPaneState((current) => {
      const nextState = createNextPaneState(current, platformId);

      return {
        ...nextState,
        secondaryPlatformId: ensureSecondaryPlatform(
          nextState,
          platforms.map((platform) => platform.id)
        )
      };
    });
    await openPlatform(platform);
    setStatusMessage(
      isElectron
        ? `已复制到剪贴板，并切换到 ${platform.name}。`
        : `已复制到剪贴板，并打开 ${platform.name} 官方页面。`
    );
  };

  const handleCreateKnowledgeItem = (draft: KnowledgeDraft) => {
    const item = createKnowledgeItem(draft);

    if (!item.content && !item.title) {
      return;
    }

    setKnowledgeItems((current) => [item, ...current]);
    setStatusMessage(`已保存知识：${item.title}`);
  };

  const handleDeleteKnowledgeItem = (itemId: string) => {
    setKnowledgeItems((current) => current.filter((item) => item.id !== itemId));
    setStatusMessage("已删除本地知识。");
  };

  const handleCopyKnowledgeItem = async (item: KnowledgeItem) => {
    await copyText(item.content || item.title);
    setCopyToastMessage("知识已复制到剪贴板");
    setCopyToastVisible(true);
    setLastCopiedAt(Date.now());
    setStatusMessage(`已复制知识：${item.title}`);
  };

  const handleUseKnowledgeText = (text: string) => {
    setPrompt(text);
    setQuickCopyExpanded(true);
    setStatusMessage("已放入 Quick Copy，可选择平台复制并打开。");
  };

  const handleExportKnowledgeMarkdown = () => {
    const platformNames = Object.fromEntries(
      platforms.map((platform) => [platform.id, platform.name])
    );
    const markdown = exportKnowledgeAsMarkdown(knowledgeItems, {
      platformNames,
      spaces: DEFAULT_KNOWLEDGE_SPACES
    });
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ai-desk-knowledge-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatusMessage("已导出本地知识库 Markdown。");
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

  return (
    <div className="app-shell">
      <div className="ambient-layer" />

      <PlatformRail
        activePlatformId={paneState.primaryPlatformId}
        platforms={platforms}
        onSelectPlatform={(platformId) => {
          setPaneState((current) => {
            const nextState = {
              ...current,
              primaryPlatformId: platformId
            };

            return {
              ...nextState,
              secondaryPlatformId: ensureSecondaryPlatform(
                nextState,
                platforms.map((platform) => platform.id)
              )
            };
          });
        }}
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

      <KnowledgePanel
        activePlatformId={paneState.primaryPlatformId}
        countLabel={knowledgeCountLabel}
        items={knowledgeItems}
        platforms={platforms}
        spaces={DEFAULT_KNOWLEDGE_SPACES}
        onCopyItem={handleCopyKnowledgeItem}
        onCreateItem={handleCreateKnowledgeItem}
        onDeleteItem={handleDeleteKnowledgeItem}
        onExportMarkdown={handleExportKnowledgeMarkdown}
        onOpenPlatform={activatePlatform}
        onUseText={handleUseKnowledgeText}
      />

      <ComposerDock
        compareEnabled={paneState.compareEnabled}
        expanded={quickCopyExpanded}
        platforms={platforms}
        prompt={prompt}
        primaryPlatformId={paneState.primaryPlatformId}
        secondaryPlatformId={secondaryPlatform?.id ?? null}
        onChangeExpanded={setQuickCopyExpanded}
        onChangePrompt={setPrompt}
        onCopyAndOpen={handleCopyAndOpen}
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
          {copyToastMessage}
        </div>
      ) : null}
    </div>
  );
}

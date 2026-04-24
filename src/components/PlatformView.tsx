import { Browser } from "@capacitor/browser";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Loader2,
  RotateCw
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Platform } from "../config/platforms";

type WebviewElement = HTMLElement & {
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
};

type PlatformViewProps = {
  isElectron: boolean;
  platform: Platform;
  title: string;
};

export function PlatformView({
  isElectron,
  platform,
  title
}: PlatformViewProps) {
  const webviewRef = useRef<WebviewElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isElectron);

  useEffect(() => {
    setCanGoBack(false);
    setCanGoForward(false);
    setLoadError(null);
    setLoading(isElectron);
  }, [isElectron, platform.id]);

  useEffect(() => {
    const webview = webviewRef.current;

    if (!webview || !isElectron) {
      return;
    }

    const updateNavigation = () => {
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };
    const handleStart = () => {
      setLoading(true);
      setLoadError(null);
      updateNavigation();
    };
    const handleStop = () => {
      setLoading(false);
      updateNavigation();
    };
    const handleFail = (event: Event) => {
      const detail = event as Event & {
        errorCode?: number;
        errorDescription?: string;
        validatedURL?: string;
      };

      if (detail.errorCode === -3) {
        return;
      }

      setLoading(false);
      setLoadError(detail.errorDescription || "页面加载失败");
      updateNavigation();
    };

    webview.addEventListener("did-start-loading", handleStart);
    webview.addEventListener("did-stop-loading", handleStop);
    webview.addEventListener("did-fail-load", handleFail);
    webview.addEventListener("dom-ready", updateNavigation);
    webview.addEventListener("did-navigate", updateNavigation);
    webview.addEventListener("did-navigate-in-page", updateNavigation);

    return () => {
      webview.removeEventListener("did-start-loading", handleStart);
      webview.removeEventListener("did-stop-loading", handleStop);
      webview.removeEventListener("did-fail-load", handleFail);
      webview.removeEventListener("dom-ready", updateNavigation);
      webview.removeEventListener("did-navigate", updateNavigation);
      webview.removeEventListener("did-navigate-in-page", updateNavigation);
    };
  }, [isElectron, platform.id]);

  const reload = () => {
    setLoadError(null);
    webviewRef.current?.reload();
  };

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
        <div className="platform-view__controls">
          {isElectron ? (
            <>
              <button
                className="icon-button"
                disabled={!canGoBack}
                onClick={() => webviewRef.current?.goBack()}
                title="后退"
                type="button"
              >
                <ArrowLeft size={16} strokeWidth={1.8} />
              </button>
              <button
                className="icon-button"
                disabled={!canGoForward}
                onClick={() => webviewRef.current?.goForward()}
                title="前进"
                type="button"
              >
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              <button
                className="icon-button"
                onClick={reload}
                title="刷新"
                type="button"
              >
                <RotateCw size={16} strokeWidth={1.8} />
              </button>
            </>
          ) : null}
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
        </div>
      </header>
      {isElectron ? (
        <div className="platform-view__body">
          <webview
            ref={webviewRef}
            className="platform-view__webview"
            src={platform.url}
            partition={platform.partition}
          />
          {loading ? (
            <div className="platform-view__state">
              <Loader2 size={22} strokeWidth={1.8} />
              <span>正在加载 {platform.name}</span>
            </div>
          ) : null}
          {loadError ? (
            <div className="platform-view__state is-error">
              <AlertCircle size={22} strokeWidth={1.8} />
              <span>{loadError}</span>
              <button className="material-button" onClick={reload} type="button">
                重新加载
              </button>
            </div>
          ) : null}
        </div>
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

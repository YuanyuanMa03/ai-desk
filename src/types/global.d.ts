import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  interface Window {
    electronAPI?: {
      writeClipboard: (text: string) => void;
      getVersion: () => string;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        allowpopups?: "true" | "false";
        partition?: string;
        src?: string;
        useragent?: string;
      };
    }
  }
}

export {};

import { describe, expect, it } from "vitest";
import {
  createNextPaneState,
  ensureSecondaryPlatform,
  type PaneState
} from "../src/lib/app-state";

describe("pane state helpers", () => {
  it("switches the primary platform when the action targets a platform", () => {
    const state = createNextPaneState(
      {
        primaryPlatformId: "chatgpt",
        compareEnabled: true,
        secondaryPlatformId: "gemini"
      },
      "deepseek"
    );

    expect(state.primaryPlatformId).toBe("deepseek");
    expect(state.secondaryPlatformId).toBe("gemini");
  });

  it("disables the secondary pane when compare mode is off", () => {
    const state = createNextPaneState(
      {
        primaryPlatformId: "chatgpt",
        compareEnabled: false,
        secondaryPlatformId: "gemini"
      },
      "kimi"
    );

    expect(state.secondaryPlatformId).toBeNull();
  });

  it("picks a distinct secondary platform when compare mode is enabled", () => {
    const state: PaneState = {
      primaryPlatformId: "chatgpt",
      compareEnabled: true,
      secondaryPlatformId: null
    };

    expect(
      ensureSecondaryPlatform(state, ["chatgpt", "gemini", "deepseek"])
    ).toBe("gemini");
  });
});

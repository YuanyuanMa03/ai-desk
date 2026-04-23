export type PaneState = {
  primaryPlatformId: string;
  compareEnabled: boolean;
  secondaryPlatformId: string | null;
};

export function createNextPaneState(
  current: PaneState,
  targetPlatformId: string
): PaneState {
  return {
    ...current,
    primaryPlatformId: targetPlatformId,
    secondaryPlatformId: current.compareEnabled
      ? current.secondaryPlatformId
      : null
  };
}

export function ensureSecondaryPlatform(
  state: PaneState,
  platformIds: string[]
): string | null {
  if (!state.compareEnabled) {
    return null;
  }

  if (
    state.secondaryPlatformId &&
    state.secondaryPlatformId !== state.primaryPlatformId
  ) {
    return state.secondaryPlatformId;
  }

  return (
    platformIds.find((platformId) => platformId !== state.primaryPlatformId) ??
    null
  );
}

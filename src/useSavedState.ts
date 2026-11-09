import { useCallback, useMemo, useSyncExternalStore } from "react";
import { BOOKMARK_KEY, readStore } from "./bookmark";
import { UI_PREFS_KEY, readUiPrefs } from "./uiPrefs";
import { hasUnsavedChanges, readStorage, subscribeStorage } from "./storage";

const emptySnapshot = () => null;
const savedSnapshot = () => false;

function useStoredValue(key: string) {
  const snapshot = useCallback(() => readStorage(key), [key]);
  return useSyncExternalStore(subscribeStorage, snapshot, emptySnapshot);
}

export function useUiPrefs() {
  const raw = useStoredValue(UI_PREFS_KEY);
  return useMemo(() => readUiPrefs(raw), [raw]);
}

export function useBookmarkStore() {
  const raw = useStoredValue(BOOKMARK_KEY);
  return useMemo(() => readStore(raw), [raw]);
}

export function useSessionOnly() {
  return useSyncExternalStore(subscribeStorage, hasUnsavedChanges, savedSnapshot);
}

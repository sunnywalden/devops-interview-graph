/** Keep the current session usable when browser storage is blocked or full. */
const pending = new Map<string, string>();
const cached = new Map<string, string>();
const listeners = new Set<() => void>();

export function readStorage(key: string): string | null {
  if (pending.has(key)) return pending.get(key)!;
  try {
    const value = localStorage.getItem(key);
    if (value === null) cached.delete(key);
    else cached.set(key, value);
    return value;
  } catch {
    return cached.get(key) ?? null;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

export function writeStorage(key: string, value: string): boolean {
  cached.set(key, value);
  try {
    localStorage.setItem(key, value);
    pending.delete(key);
  } catch {
    pending.set(key, value);
  }
  notify();
  return !pending.has(key);
}

function onStorage(event: StorageEvent) {
  if (event.key === null || event.key.startsWith("devops-kg-")) notify();
}

export function subscribeStorage(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function hasUnsavedChanges(): boolean {
  return pending.size > 0;
}

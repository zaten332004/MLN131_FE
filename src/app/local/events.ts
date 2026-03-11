const PREFIX = "mln131:";

export type LocalEventName = "users-updated" | "auth-changed" | "chat-updated" | "pageview";
export type LocalEventName = "users-updated" | "auth-changed" | "chat-updated" | "pageview" | "presence-updated";

export function emitLocalEvent(name: LocalEventName) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`${PREFIX}${name}`));
}

export function onLocalEvent(name: LocalEventName, handler: () => void) {
  if (typeof window === "undefined") return () => {};
  const key = `${PREFIX}${name}`;
  window.addEventListener(key, handler);
  return () => window.removeEventListener(key, handler);
}

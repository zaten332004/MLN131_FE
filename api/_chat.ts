import type { ChatMessage } from "./_models";
import { kvCommand } from "./_kv";

function key(userId: string) {
  return `chat:${userId}`;
}

export async function appendChatMessage(userId: string, message: ChatMessage) {
  await kvCommand("RPUSH", key(userId), JSON.stringify(message));
  // Keep last 1000 messages per user.
  await kvCommand("LTRIM", key(userId), -1000, -1);
}

export async function getChatMessagesNewestFirst(userId: string, page: number, pageSize: number) {
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedSize = Math.max(1, Math.min(200, Math.floor(pageSize)));

  const total = await kvCommand<number>("LLEN", key(userId));
  if (!total) {
    return { page: normalizedPage, pageSize: normalizedSize, total: 0, items: [] as ChatMessage[] };
  }

  const stop = total - (normalizedPage - 1) * normalizedSize - 1;
  const start = Math.max(0, total - normalizedPage * normalizedSize);
  if (stop < 0 || start > stop) {
    return { page: normalizedPage, pageSize: normalizedSize, total, items: [] as ChatMessage[] };
  }

  const raws = await kvCommand<string[]>("LRANGE", key(userId), start, stop);
  const parsed: ChatMessage[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      const msg = JSON.parse(raw) as ChatMessage;
      if (msg && typeof msg.id === "string" && typeof msg.content === "string" && typeof msg.createdAt === "string") {
        parsed.push(msg);
      }
    } catch {
      // ignore
    }
  }

  // Return newest first to match existing FE contract.
  parsed.reverse();
  return { page: normalizedPage, pageSize: normalizedSize, total, items: parsed };
}


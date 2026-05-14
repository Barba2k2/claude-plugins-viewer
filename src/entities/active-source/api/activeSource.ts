import { cookies } from 'next/headers';
import { getSources, CLAUDE_SOURCE_ID, type AiSource } from '@/entities/ai-source';

const COOKIE_NAME = 'cpv-active-source';

export async function getActiveSourceId(): Promise<string> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? CLAUDE_SOURCE_ID;
}

export async function getActiveSource(): Promise<AiSource> {
  const id = await getActiveSourceId();
  const sources = await getSources();
  const found = sources.find((s) => s.id === id);
  if (found) return found;
  const claude = sources.find((s) => s.id === CLAUDE_SOURCE_ID);
  if (claude) return claude;
  return sources[0];
}

export async function isClaudeActive(): Promise<boolean> {
  const id = await getActiveSourceId();
  return id === CLAUDE_SOURCE_ID;
}

export const ACTIVE_SOURCE_COOKIE = COOKIE_NAME;

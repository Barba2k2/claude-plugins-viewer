'use server';

import { revalidatePath } from 'next/cache';
import {
  setSkillEnabled,
  setAgentEnabled,
  setCommandEnabled,
  parseResourceId,
} from '@/lib/resourceToggle';
import { enableHook, disableHook, parseHookId } from '@/lib/hookToggle';

export type ActionResult = { success: true } | { success: false; error: string };

type Kind = 'skill' | 'agent' | 'command';

async function applyToggle(kind: Kind, id: string, enabled: boolean): Promise<ActionResult> {
  const parsed = parseResourceId(id);
  if (!parsed) return { success: false, error: `invalid id: ${id}` };
  try {
    if (kind === 'skill') {
      await setSkillEnabled(parsed.pluginId, parsed.resourceName, enabled);
    } else if (kind === 'agent') {
      await setAgentEnabled(parsed.pluginId, parsed.resourceName, enabled);
    } else {
      await setCommandEnabled(parsed.pluginId, parsed.resourceName, enabled);
    }
    revalidatePath(`/${kind}s`);
    revalidatePath(`/${kind}s/[id]`, 'page');
    revalidatePath('/');
    revalidatePath('/plugins/[id]', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function toggleSkill(id: string, enabled: boolean): Promise<ActionResult> {
  return applyToggle('skill', id, enabled);
}

export async function toggleAgent(id: string, enabled: boolean): Promise<ActionResult> {
  return applyToggle('agent', id, enabled);
}

export async function toggleCommand(id: string, enabled: boolean): Promise<ActionResult> {
  return applyToggle('command', id, enabled);
}

export async function toggleHook(id: string, enabled: boolean): Promise<ActionResult> {
  const parsed = parseHookId(id);
  if (!parsed) return { success: false, error: `invalid id: ${id}` };
  try {
    if (enabled) await enableHook(parsed.pluginId, id);
    else await disableHook(parsed.pluginId, id);
    revalidatePath('/hooks');
    revalidatePath('/hooks/[id]', 'page');
    revalidatePath('/');
    revalidatePath('/plugins/[id]', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

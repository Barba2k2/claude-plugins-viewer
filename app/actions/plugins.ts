'use server';

import { revalidatePath } from 'next/cache';
import { setPluginEnabled } from '@/lib/settings';
import { installPlugin, uninstallPlugin, updatePlugin } from '@/lib/cli';

export type ActionResult = { success: true } | { success: false; error: string };

function revalidatePluginPaths() {
  revalidatePath('/');
  revalidatePath('/plugins/[id]', 'page');
  revalidatePath('/skills');
  revalidatePath('/agents');
  revalidatePath('/commands');
  revalidatePath('/hooks');
  revalidatePath('/mcps');
}

export async function togglePlugin(id: string, enabled: boolean): Promise<ActionResult> {
  try {
    await setPluginEnabled(id, enabled);
    revalidatePath('/');
    revalidatePath('/plugins/[id]', 'page');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return { success: false, error: message };
  }
}

export async function uninstall(id: string): Promise<ActionResult> {
  const result = await uninstallPlugin(id);
  if (!result.success) return result;
  revalidatePluginPaths();
  return { success: true };
}

export async function install(spec: string): Promise<ActionResult> {
  const result = await installPlugin(spec);
  if (!result.success) return result;
  revalidatePluginPaths();
  return { success: true };
}

export async function update(spec: string): Promise<ActionResult> {
  const result = await updatePlugin(spec);
  if (!result.success) return result;
  revalidatePluginPaths();
  return { success: true };
}

'use server';

import { revalidatePath } from 'next/cache';
import { setMcpEnabled } from '@/shared/lib/settings';

export type ToggleResult = { success: true } | { success: false; error: string };

export async function toggleMcp(name: string, enabled: boolean): Promise<ToggleResult> {
  try {
    await setMcpEnabled(name, enabled);
    revalidatePath('/mcps');
    revalidatePath('/mcps/[id]', 'page');
    revalidatePath('/plugins/[id]', 'page');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return { success: false, error: message };
  }
}

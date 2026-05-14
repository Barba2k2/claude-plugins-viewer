'use server';

import { revalidatePath } from 'next/cache';
import {
  readMemoryFile,
  writeMemoryFile,
  deleteMemoryFile,
  createMemoryFile,
  getProjectMemories,
  type CreateScope,
  type MemoryFile,
} from '@/entities/memory';

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };

function revalidate() {
  revalidatePath('/memory');
  revalidatePath('/memory/projects/[id]', 'page');
}

export async function readMemoryAction(absPath: string): Promise<ActionResult<string>> {
  try {
    const content = await readMemoryFile(absPath);
    return { success: true, data: content };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function saveMemoryAction(absPath: string, content: string): Promise<ActionResult> {
  try {
    await writeMemoryFile(absPath, content);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function deleteMemoryAction(absPath: string): Promise<ActionResult> {
  try {
    await deleteMemoryFile(absPath);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function loadProjectMemoriesAction(
  projectId: string,
): Promise<ActionResult<MemoryFile[]>> {
  try {
    const files = await getProjectMemories(projectId);
    return { success: true, data: files };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function createMemoryAction(
  scope: CreateScope,
  filename: string,
): Promise<ActionResult<string>> {
  try {
    const target = await createMemoryFile(scope, filename);
    revalidate();
    return { success: true, data: target };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

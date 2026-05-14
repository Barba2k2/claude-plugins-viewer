'use server';

import { revalidatePath } from 'next/cache';
import { readAiFile, writeAiFile, deleteAiFile, createAiFile } from '@/entities/ai-source';
import {
  addCustomSource,
  removeCustomSource,
  renameCustomSource,
  setDefaultDisabled,
  setDefaultName,
  setCliOverride,
  setPreferWsl,
} from '@/entities/ai-source';
import {
  rescanCli,
  validateCliPath,
  getAllCliStatuses,
  type CliStatus,
} from '@/shared/lib/platform';

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };

function revalidate() {
  revalidatePath('/ai-sources');
  revalidatePath('/ai-sources/[id]', 'page');
  revalidatePath('/ai-sources/settings');
}

export async function readAiFileAction(
  sourceId: string,
  absPath: string,
): Promise<ActionResult<string>> {
  try {
    const content = await readAiFile(sourceId, absPath);
    return { success: true, data: content };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function saveAiFileAction(
  sourceId: string,
  absPath: string,
  content: string,
): Promise<ActionResult> {
  try {
    await writeAiFile(sourceId, absPath, content);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function deleteAiFileAction(sourceId: string, absPath: string): Promise<ActionResult> {
  try {
    await deleteAiFile(sourceId, absPath);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function createAiFileAction(
  sourceId: string,
  relativePath: string,
): Promise<ActionResult<string>> {
  try {
    const target = await createAiFile(sourceId, relativePath);
    revalidate();
    return { success: true, data: target };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function addCustomSourceAction(
  name: string,
  pathInput: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await addCustomSource({ name, path: pathInput });
    revalidate();
    return { success: true, data: { id: created.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function removeCustomSourceAction(id: string): Promise<ActionResult> {
  try {
    await removeCustomSource(id);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function renameCustomSourceAction(id: string, name: string): Promise<ActionResult> {
  try {
    await renameCustomSource(id, name);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function setDefaultDisabledAction(
  id: string,
  disabled: boolean,
): Promise<ActionResult> {
  try {
    await setDefaultDisabled(id, disabled);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function setDefaultNameAction(id: string, name: string | null): Promise<ActionResult> {
  try {
    await setDefaultName(id, name);
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function setCliOverrideAction(
  toolId: string,
  pathInput: string,
  useWsl: boolean,
): Promise<ActionResult<{ version: string }>> {
  try {
    const validation = await validateCliPath(toolId, pathInput, useWsl);
    if (!validation.ok) return { success: false, error: validation.error };
    await setCliOverride(toolId, { path: pathInput.trim(), useWsl });
    rescanCli();
    revalidate();
    return { success: true, data: { version: validation.version } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function clearCliOverrideAction(toolId: string): Promise<ActionResult> {
  try {
    await setCliOverride(toolId, null);
    rescanCli();
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function setPreferWslAction(value: boolean): Promise<ActionResult> {
  try {
    await setPreferWsl(value);
    rescanCli();
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function rescanCliAction(): Promise<ActionResult<CliStatus[]>> {
  try {
    rescanCli();
    const statuses = await getAllCliStatuses();
    revalidate();
    return { success: true, data: statuses };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

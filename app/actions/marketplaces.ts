'use server';

import { revalidatePath } from 'next/cache';
import {
  addMarketplace,
  removeMarketplace,
  updateMarketplace,
  listMarketplaces,
  type MarketplaceEntry,
} from '@/lib/cli';

export type ActionResult = { success: true } | { success: false; error: string };

function revalidate() {
  revalidatePath('/marketplaces');
  revalidatePath('/');
}

export async function getMarketplaces(): Promise<MarketplaceEntry[]> {
  return listMarketplaces();
}

export async function addMarketplaceAction(source: string): Promise<ActionResult> {
  const result = await addMarketplace(source);
  if (!result.success) return result;
  revalidate();
  return { success: true };
}

export async function removeMarketplaceAction(name: string): Promise<ActionResult> {
  const result = await removeMarketplace(name);
  if (!result.success) return result;
  revalidate();
  return { success: true };
}

export async function updateMarketplaceAction(name?: string): Promise<ActionResult> {
  const result = await updateMarketplace(name);
  if (!result.success) return result;
  revalidate();
  return { success: true };
}

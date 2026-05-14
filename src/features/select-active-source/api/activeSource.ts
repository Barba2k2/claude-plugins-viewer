'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ACTIVE_SOURCE_COOKIE } from '@/entities/active-source';

export async function setActiveSourceAction(id: string): Promise<void> {
  const store = await cookies();
  store.set(ACTIVE_SOURCE_COOKIE, id, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}

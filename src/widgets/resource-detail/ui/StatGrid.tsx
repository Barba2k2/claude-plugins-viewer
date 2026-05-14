import type { ReactNode } from 'react';

type Props = { children: ReactNode; cols?: 2 | 3 | 4 };

export function StatGrid({ children, cols = 4 }: Props) {
  const grid = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
  return <section className={`mb-6 grid gap-3 ${grid}`}>{children}</section>;
}

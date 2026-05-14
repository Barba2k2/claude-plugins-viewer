import * as React from 'react';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/cn';

type Props = React.ComponentProps<'div'> & { asChild?: boolean };

export function Card({ className, asChild = false, ...props }: Props) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

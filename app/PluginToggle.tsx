'use client';

import { useTransition } from 'react';
import { togglePlugin } from './actions/plugins';
import { useToggleStore } from '@/lib/toggleStore';

type Props = {
  id: string;
  enabled: boolean;
  size?: 'sm' | 'md';
};

export function PluginToggle({ id, enabled, size = 'sm' }: Props) {
  const key = `plugin:${id}`;
  const optimisticMap = useToggleStore((s) => s.optimistic);
  const pendingMap = useToggleStore((s) => s.pending);
  const errorMap = useToggleStore((s) => s.errors);
  const setOptimistic = useToggleStore((s) => s.setOptimistic);
  const setPending = useToggleStore((s) => s.setPending);
  const setError = useToggleStore((s) => s.setError);

  const optimistic = optimisticMap[key] ?? enabled;
  const pending = pendingMap[key] ?? false;
  const error = errorMap[key] ?? null;
  const [, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !optimistic;
    setOptimistic(key, next);
    setError(key, null);
    setPending(key, true);
    startTransition(async () => {
      const result = await togglePlugin(id, next);
      if (!result.success) {
        setOptimistic(key, !next);
        setError(key, result.error);
      }
      setPending(key, false);
    });
  };

  const trackW = size === 'md' ? 'w-10' : 'w-8';
  const trackH = size === 'md' ? 'h-5' : 'h-4';
  const knob = size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  const knobShift = size === 'md' ? 'translate-x-5' : 'translate-x-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title={error ?? (optimistic ? 'Disable plugin' : 'Enable plugin')}
      className={`relative inline-flex ${trackW} ${trackH} flex-shrink-0 items-center rounded-full border border-border transition ${
        optimistic ? 'bg-accent/30' : 'bg-bg'
      } ${pending ? 'opacity-50' : ''}`}
      aria-label={optimistic ? 'Disable plugin' : 'Enable plugin'}
      aria-pressed={optimistic}
    >
      <span
        className={`inline-block ${knob} transform rounded-full bg-white transition ${
          optimistic ? knobShift : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

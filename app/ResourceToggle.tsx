'use client';

import { useTransition } from 'react';
import { toggleSkill, toggleAgent, toggleCommand, toggleHook } from './actions/resources';
import { useToggleStore } from '@/lib/toggleStore';

type Kind = 'skill' | 'agent' | 'command' | 'hook';

type Props = {
  kind: Kind;
  id: string;
  enabled: boolean;
  size?: 'sm' | 'md';
};

const TOGGLERS: Record<Kind, (id: string, enabled: boolean) => Promise<{ success: true } | { success: false; error: string }>> = {
  skill: toggleSkill,
  agent: toggleAgent,
  command: toggleCommand,
  hook: toggleHook,
};

export function ResourceToggle({ kind, id, enabled, size = 'sm' }: Props) {
  const key = `${kind}:${id}`;
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
      const result = await TOGGLERS[kind](id, next);
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
      title={error ?? (optimistic ? `Disable ${kind}` : `Enable ${kind}`)}
      className={`relative inline-flex ${trackW} ${trackH} flex-shrink-0 items-center rounded-full border border-border transition ${
        optimistic ? 'bg-accent/30' : 'bg-bg'
      } ${pending ? 'opacity-50' : ''}`}
      aria-label={optimistic ? `Disable ${kind}` : `Enable ${kind}`}
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

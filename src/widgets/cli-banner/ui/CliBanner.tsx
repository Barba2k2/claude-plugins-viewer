import Link from 'next/link';
import { getCliStatus } from '@/entities/ai-source';

const PRIMARY_TOOL_ID = 'claude';
const PRIMARY_TOOL_NAME = 'Claude';

export async function CliBanner() {
  const status = await getCliStatus(PRIMARY_TOOL_ID);
  if (status.found) return null;
  return (
    <div className="sticky top-14 z-30 border-b border-red-500/40 bg-red-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[13px] text-red-100">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-red-400" />
          <span className="truncate">
            <strong className="font-semibold">{PRIMARY_TOOL_NAME} CLI not found.</strong> Plugin
            install, update and uninstall are disabled until the CLI is configured.
          </span>
        </div>
        <Link
          href="/ai-sources/settings"
          className="rounded-md border border-red-300/40 px-2.5 py-1 text-[12px] font-medium text-red-50 transition hover:bg-red-500/20"
        >
          Configure path
        </Link>
      </div>
    </div>
  );
}

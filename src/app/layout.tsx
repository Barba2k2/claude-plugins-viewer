import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/widgets/nav/ui/Nav';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { CliBanner } from '@/widgets/cli-banner/ui/CliBanner';
import { getSources } from '@/entities/ai-source';
import { getActiveSourceId } from '@/entities/active-source';
import { getPlatformInfo } from '@/shared/lib/platform';
import { TooltipProvider } from '@/design_system/overlay';

export const metadata: Metadata = {
  title: 'Claude Plugins Viewer',
  description: 'Visualize the Claude Code plugins installed on your machine',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [sources, activeId, platform] = await Promise.all([
    getSources(),
    getActiveSourceId(),
    getPlatformInfo(),
  ]);
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <TooltipProvider delayDuration={200}>
          <Nav />
          <CliBanner />
          <div className="flex min-h-[calc(100vh-57px)]">
            <Sidebar
              sources={sources}
              activeId={activeId}
              platform={{
                prettyOs: platform.prettyOs,
                shell: platform.shell,
                arch: platform.arch,
              }}
            />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}

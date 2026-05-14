import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/widgets/nav/ui/Nav';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { getSources } from '@/entities/ai-source';
import { getActiveSourceId } from '@/entities/active-source';

export const metadata: Metadata = {
  title: 'Claude Plugins Viewer',
  description: 'Visualize the Claude Code plugins installed on your machine',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [sources, activeId] = await Promise.all([getSources(), getActiveSourceId()]);
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Nav />
        <div className="flex min-h-[calc(100vh-57px)]">
          <Sidebar sources={sources} activeId={activeId} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

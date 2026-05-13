import type { Metadata } from 'next';
import './globals.css';
import { Nav } from './Nav';

export const metadata: Metadata = {
  title: 'Claude Plugins Viewer',
  description: 'Visualize the Claude Code plugins installed on your machine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Nav />
        {children}
      </body>
    </html>
  );
}

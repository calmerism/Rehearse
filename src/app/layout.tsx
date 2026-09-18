import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rehearse',
  description:
    'Focused interview rehearsal environment demonstrating Azure AI Speech, Microsoft Foundry, and autonomous interview agent capabilities.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-[#171717] text-[#171717] dark:text-white antialiased selection:bg-[#D05236]/20 selection:text-[#D05236]">
        {children}
      </body>
    </html>
  );
}

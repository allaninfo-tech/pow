import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'ProofStack — Global Engineering Competition Platform',
  description: 'Replace static resumes with verified project execution history. Build real-world projects, compete in engineering challenges, and get ranked by AI.',
  keywords: ['engineering platform', 'proof of work', 'developer ranking', 'coding challenges', 'software engineering'],
  authors: [{ name: 'ProofStack' }],
  openGraph: {
    title: 'ProofStack — Global Engineering Competition Platform',
    description: 'Dynamic Skill Validation Engine for modern engineers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


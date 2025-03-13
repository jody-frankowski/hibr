import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const description = 'Anonymously check if your passwords have been leaked in the 2009 RockYou leak';
export const metadata: Metadata = {
  title: 'Have I Been Rocked?',
  icons: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20100%20100%22%3E%3Ctext%20y=%22.9em%22%20font-size=%2290%22%3E🪨%3C/text%3E%3C/svg%3E',
  description: description,
  openGraph: {
    description: description,
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body>
    <Providers>
      {children}
    </Providers>
    </body>
    </html>
  );
}

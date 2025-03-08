import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Have I Been Rocked?',
  icons: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20100%20100%22%3E%3Ctext%20y=%22.9em%22%20font-size=%2290%22%3E🪨%3C/text%3E%3C/svg%3E',
  openGraph: {
    description: 'Anonymously check if your passwords have been leaked in the 2009 RockYou leak',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

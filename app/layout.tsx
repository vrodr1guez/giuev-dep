import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AXIOM Genesis | $164.5B Patent Portfolio',
  description: 'AXIOM Genesis: Revolutionary patent portfolio worth $164.5 billion. 41 foundational patents for post-digital industry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
} 
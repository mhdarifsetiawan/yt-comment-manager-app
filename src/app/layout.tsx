// src/app/layout.tsx
import './globals.css'; // Sesuaikan jika path ini tidak tepat
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // Import Providers yang baru dibuat

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YT Comment Manager',
  description: 'Manage your YouTube comments easily.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus children dengan Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
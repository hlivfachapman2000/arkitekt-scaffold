// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arkitekt Command Center',
  description: 'React Flow-based control center for the Arkitekt swarm system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={`en`} className={`dark`}>
      <body className={`bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
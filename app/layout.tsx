import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daily Time-In Report',
  description: 'Track your work hours and overtime',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#0f1724] to-[#071026] text-[#e6eef8] p-5 min-h-screen flex justify-center items-start">
        {children}
      </body>
    </html>
  );
}

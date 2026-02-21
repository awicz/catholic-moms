import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SessionWrapper from '@/components/layout/SessionWrapper';

export const metadata: Metadata = {
  title: 'Catholic Moms — Book Resources',
  description: 'Book recommendations from our Catholic moms group, organized by topic.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <SessionWrapper>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}

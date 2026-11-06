import type { Metadata } from 'next';
import './globals.css';
import { DemoProvider } from '@/lib/context/demo-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export const metadata: Metadata = {
  title: 'ParcelEase — Your parcels. Your time.',
  description: 'Apartment parcel-management and scheduled-delivery platform for gated societies in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <DemoProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <MobileBottomNav />
          <Footer />
        </DemoProvider>
      </body>
    </html>
  );
}

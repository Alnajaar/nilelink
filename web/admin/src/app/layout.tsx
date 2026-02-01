import { ReactNode } from 'react';
import { SafeClientProviders } from './providers/SafeClientProviders';
import { AdminLayout } from '@/components/layout/AdminLayout';
import '../../../shared/globals.shared.css';
import './globals.css';

export const metadata = {
  title: 'NileLink Admin Dashboard',
  description: 'Protocol Governance & Administration',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SafeClientProviders>
          <AdminLayout>
            {children}
          </AdminLayout>
        </SafeClientProviders>
      </body>
    </html>
  );
}

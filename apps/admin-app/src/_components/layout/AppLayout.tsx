'use client';

import { SidebarInset, SidebarProvider } from '@acme/ui/sidebar';
import { RequireWallet } from '../../_guards/RequireWallet';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireWallet message="Please connect your wallet to access the application.">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="border overflow-x-auto">
          <AppHeader />
          {children}
          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </RequireWallet>
  );
}

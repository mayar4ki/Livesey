'use client';

import { SidebarInset, SidebarProvider } from '@acme/ui/sidebar';
import { DashboardFooter } from './_components/layout/DashboardFooter';
import { DashboardHeader } from './_components/layout/DashboardHeader';
import { DashboardSidebar } from './_components/layout/DashboardSidebar';
import { RequireWallet } from './_guards/RequireWallet';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireWallet message="Please connect your wallet to access the dashboard.">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          {children}
          <DashboardFooter />
        </SidebarInset>
      </SidebarProvider>
    </RequireWallet>
  );
}

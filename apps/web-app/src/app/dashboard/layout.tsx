import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardFooter } from './_components/layout/DashboardFooter';
import { DashboardHeader } from './_components/layout/DashboardHeader';
import { DashboardSidebar } from './_components/layout/DashboardSidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

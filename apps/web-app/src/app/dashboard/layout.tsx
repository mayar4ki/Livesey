import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardFooter } from './components/layout/DashboardFooter';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { DashboardSidebar } from './components/layout/DashboardSidebar';

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

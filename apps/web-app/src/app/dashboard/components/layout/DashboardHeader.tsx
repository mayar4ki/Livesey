import { ChainsMenu } from '@/app/dashboard/components/common/ChainsMenu';
import { ConnectWallet } from '@/app/dashboard/components/common/ConnectWallet';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const DashboardHeader = () => {
  return (
    <section className="py-2 sticky top-0 bg-blur-3xl backdrop-blur-md border-b border-foreground/20 border-dashed z-50  ">
      <div className="flex items-center justify-between gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb className="  flex-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ChainsMenu />
        <ConnectWallet />
      </div>
    </section>
  );
};

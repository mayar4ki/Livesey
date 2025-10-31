'use client';

import { ArrowRightLeft, BookOpen, Calendar, ChartArea, Compass, FilePlus, Handshake, HelpCircle, Landmark, Settings } from 'lucide-react';
import * as React from 'react';

import { AppLogo } from '@/components/common/AppBrand';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { siteName } from '@/white-label';
import Link from 'next/link';

// This is sample data.
const items = [
  {
    title: 'Discover',
    url: '/dashboard',
    icon: Compass,
    isActive: true,
  },
  {
    title: 'New Token',
    url: '/dashboard/token/create',
    icon: FilePlus,
  },
  {
    title: 'Fund Campaign',
    url: '/dashboard/fund',
    icon: Calendar,
  },
  {
    title: 'Public Limit Orders',
    url: '/dashboard/orders/public',
    icon: ArrowRightLeft,
  },
  {
    title: 'My Assets',
    url: '/dashboard/my-assets',
    icon: ChartArea,
  },
  {
    title: 'Private Limit Orders',
    url: '/dashboard/orders/private',
    icon: Handshake,
  },
  {
    title: 'Governance',
    url: '/dashboard/governance',
    icon: Landmark,
  },

  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Learn',
    url: '/',
    icon: BookOpen,
  },
  {
    title: 'Support',
    url: '/',
    icon: HelpCircle,
  },
];

export const SidebarMenuItem2 = ({ item }: { item: (typeof items)[number] }) => {
  return (
    <SidebarMenuItem>
      <Link href={item.url}>
        <SidebarMenuButton tooltip={item.title}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/dashboard" className="min-w-0 overflow-hidden relative transition-all duration-300 shadow-xs">
              <span
                className="absolute  opacity-3  hover:opacity-5 transition-all duration-300  scale-[13] rotate-5 
                -translate-x-3 z-1 
      bg-linear-to-r from-primary via-foreground to-primary text-transparent bg-clip-text "
              >
                {siteName}
              </span>
              <div className={cn(' fill-primary flex size-8 items-center justify-center ', { ' px-0.5 ': !open })}>
                <AppLogo />
              </div>
              <span className=" text-primary font-semibold tracking-tighter">{siteName}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.slice(0, 3).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {items.slice(3, 6).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {items.slice(6).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

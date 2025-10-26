'use client';

import { ArrowRightLeft, BookOpen, Calendar, ChartArea, Compass, Handshake, HelpCircle, Landmark } from 'lucide-react';
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
} from '@/components/ui/sidebar';
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
      <SidebarMenuButton tooltip={item.title}>
        {item.icon && <item.icon />}
        <Link href={item.url}>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className=" fill-primary flex aspect-square size-8 items-center justify-center rounded-lg  ">
                  <AppLogo />
                </div>
                <div className="flex flex-col gap-0.5 leading-none text-primary">
                  <span className="font-semibold tracking-tighter">{siteName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
            {items.slice(-2).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

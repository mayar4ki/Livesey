'use client';

import { ArrowRightLeft, BookOpen, Calendar, ChartArea, Compass, HelpCircle, Landmark, Settings } from 'lucide-react';
import * as React from 'react';

import { cn } from '@acme/ui';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@acme/ui/sidebar';
import { siteName } from '@acme/white-label/web-app';
import Link from 'next/link';
import { AppLogo } from '~/_components/common/AppBrand';

const navGroups = [
  {
    label: 'Home',
    items: [
      {
        title: 'Discover',
        url: '/dashboard',
        icon: Compass,
      },
      {
        title: 'Fund Campaign',
        url: '/dashboard/fund',
        icon: Calendar,
      },
    ],
  },
  {
    label: 'Tokens',
    items: [
      {
        title: 'My Assets',
        url: '/dashboard/my-assets',
        icon: ChartArea,
      },
      {
        title: 'Governance',
        url: '/dashboard/governance',
        icon: Landmark,
      },

      {
        title: 'Limit Orders',
        url: '/dashboard/orders/public',
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    label: '',
    items: [
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
        url: '/dashboard/support',
        icon: HelpCircle,
      },
    ],
  },
];

export const SidebarMenuItem2 = ({ item }: { item: (typeof navGroups)[number]['items'][number] }) => {
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
        {navGroups.map((group, index) => (
          <SidebarGroup key={index}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem2 key={item.title} item={item} />
              ))}
            </SidebarMenu>
            {index < navGroups.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

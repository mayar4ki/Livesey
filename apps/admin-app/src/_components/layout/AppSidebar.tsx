'use client';

import { FilePlus, HelpCircle, History, Settings } from 'lucide-react';
import * as React from 'react';

import { cn } from '@acme/ui';
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
} from '@acme/ui/sidebar';
import { siteName } from '@acme/white-label/admin-app';
import Link from 'next/link';
import { AppLogo } from '~/_components/common/AppBrand';

// This is sample data.
const items = [
  {
    title: 'New Token',
    url: '/token/create',
    icon: FilePlus,
  },
  {
    title: 'Token History',
    url: '/token/history',
    icon: History,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/" className="min-w-0 overflow-hidden relative transition-all duration-300 shadow-xs">
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
            {items.slice(0, 2).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {items.slice(2, 3).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {items.slice(3).map((item) => (
              <SidebarMenuItem2 key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

'use client';

import { Coins, Database, FilePlus, HelpCircle, LayoutDashboard, Settings, UserPlus, Users } from 'lucide-react';
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
import { siteName } from '@acme/white-label/admin-app';
import Link from 'next/link';
import { AppLogo } from '~/_components/common/AppBrand';

const navGroups = [
  {
    label: 'Home',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Operators',
    items: [
      {
        title: 'Operators List',
        url: '/operator',
        icon: Users,
      },
      {
        title: 'New Operators',
        url: '/operator/create',
        icon: UserPlus,
      },
    ],
  },
  {
    label: 'Tokens',
    items: [
      {
        title: 'Tokens List',
        url: '/token',
        icon: Coins,
      },
      {
        title: 'New Token',
        url: '/token/create',
        icon: FilePlus,
      },
    ],
  },
  {
    label: 'Advance',
    items: [
      {
        title: 'DB Sync',
        url: '/db-sync',
        icon: Database,
      },
    ],
  },
  {
    label: '',
    items: [
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
      },
      {
        title: 'Support',
        url: '/support',
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

'use client';

import { ArrowRightLeft, BookOpen, ChartArea, Coins, Compass, HelpCircle, Search, Settings, User } from 'lucide-react';
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
import { useAccount } from 'wagmi';
import { AppLogo } from '~/_components/common/AppBrand';

const useNavGroups = () => {

  const { address } = useAccount();
  const navGroups = [
    {
      label: 'Home',
      items: [
        {
          title: 'Discover',
          url: '/dashboard',
          icon: Compass,
        },
        // {
        //   title: 'Fund Campaign',
        //   url: '/dashboard/fund',
        //   icon: Calendar,
        // },
      ],
    },
    {
      label: 'Orders',
      items: [
        {
          title: 'Limit Orders List',
          url: '/dashboard/limit-order',
          icon: ArrowRightLeft,
        },
        {
          title: 'My Limit Orders',
          url: `/dashboard/lookup/${address}?tab=orders`,
          icon: ChartArea,
        },
      ],
    },
    {
      label: 'Tokens',
      items: [
        {
          title: 'Tokens List',
          url: '/dashboard/token',
          icon: Coins,
        },
        {
          title: 'My Assets',
          url: `/dashboard/lookup/${address}?tab=assets`,
          icon: ChartArea,
        },

        // {
        //   title: 'Governance',
        //   url: '/dashboard/governance',
        //   icon: Landmark,
        // },

        // {
        //   title: 'Limit Orders',
        //   url: '/dashboard/orders/public',
        //   icon: ArrowRightLeft,
        // },
      ],
    },
    {
      label: 'Profile',
      items: [
        {
          title: 'My Profile',
          url: `/dashboard/lookup/${address}`,
          icon: User,
        },
        {
          title: 'Lookup Profile',
          url: '/dashboard/lookup',
          icon: Search,
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

  return { navGroups };
}

type NavGroups = ReturnType<typeof useNavGroups>['navGroups']

export const SidebarMenuItem2 = ({ item }: { item: NavGroups[number]['items'][number] }) => {
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

  const { navGroups } = useNavGroups();

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

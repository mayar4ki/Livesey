'use client';

import {
  ArrowRightLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Coins,
  Compass,
  HelpCircle,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
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
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AppLogo } from '~/_components/common/AppBrand';
import { Collapsible } from '../common/collapsible';

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
        {
          title: 'Fund Campaign',
          url: '/dashboard/fund',
          icon: Calendar,
        },
      ],
    },
    {
      label: 'Dashboard',
      items: [
        {
          title: 'Tokens',
          url: '/dashboard/token',
          icon: Coins,
        },
        {
          title: 'Limit Orders',
          url: '/dashboard/limit-order',
          icon: ArrowRightLeft,
        },
        {
          title: 'Operators',
          url: `/dashboard/operator`,
          icon: Users,
        },
      ],
    },
    {
      label: 'Profile',
      items: [
        {
          title: 'My Profile',
          url: `/dashboard/profile/${address}`,
          icon: User,
        },
      ],
    },
    {
      label: 'Lookup',
      items: [
        {
          title: 'Address Lookup ',
          url: `/dashboard/lookup`,
          icon: Search,
        },
      ],
    },
    {
      label: '',
      collapsed: false,
      collapsible: false,
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
};

type NavGroups = ReturnType<typeof useNavGroups>['navGroups'];

const CollapsibleSidebarGroup = ({
  group,
  separator = true,
}: {
  group: NavGroups[number];
  separator?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(!!group.collapsed);

  const toggleCollapse = () => {
    setIsOpen((prev) => !prev);
  };

  const isCollapsible = !!group.collapsible;

  return (
    <SidebarGroup className=" py-1 ">
      {isCollapsible ? (
        <SidebarMenuButton tooltip={group.label} onClick={toggleCollapse} className="justify-between">
          <span>{group.label}</span>
          <ChevronRight className={cn('transition-all duration-150', { '  rotate-90 ': !isOpen })} />
        </SidebarMenuButton>
      ) : group.label ? (
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      ) : null}

      <Collapsible open={!isOpen}>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              className={cn({
                'ml-4': isCollapsible,
              })}
            >
              <Link href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn({
                    'font-normal': isCollapsible,
                  })}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {separator && <SidebarSeparator />}
        </SidebarMenu>
      </Collapsible>
    </SidebarGroup>
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
            <Link
              href="/dashboard"
              className="min-w-0 overflow-hidden relative transition-all duration-300 shadow-xs"
            >
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
          <CollapsibleSidebarGroup key={index} group={group} separator={index < navGroups.length - 1} />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

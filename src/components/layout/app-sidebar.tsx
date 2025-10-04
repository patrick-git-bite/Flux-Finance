'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  CandlestickChart,
  LayoutDashboard,
  ArrowRightLeft,
  Lightbulb,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';

const baseMenuItems = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowRightLeft },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/market', label: 'Mercado', icon: LineChart },
];

const adminMenuItem = {
  href: '/admin',
  label: 'Painel Admin',
  icon: ShieldCheck,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = React.useState(baseMenuItems);

  React.useEffect(() => {
    if (!user) {
      setMenuItems(baseMenuItems);
      return;
    }

    user.getIdTokenResult().then((idTokenResult) => {
      const isAdmin = !!idTokenResult.claims.admin;
      const currentMenuItems = [...baseMenuItems];
      if (isAdmin) {
        currentMenuItems.push(adminMenuItem);
      }
      setMenuItems(currentMenuItems);
    });
  }, [user]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CandlestickChart className="size-5" />
          </div>
          <span className="font-headline text-lg font-semibold">Flux Finance</span>
          <div className="ml-auto">
            <SidebarTrigger className="md:hidden" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}

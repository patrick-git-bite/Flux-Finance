import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

type AppLayoutProps = {
  children: React.ReactNode;
  title: string;
};

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

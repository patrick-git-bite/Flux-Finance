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

/**
 * Provides the main layout structure for all pages in the application.
 * It includes the sidebar, a main content area with a header, and a theme toggle.
 * @param children The main content to be rendered inside the layout.
 * @param title The title to be displayed in the header of the page.
 */
export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      {/* The main navigation sidebar */}
      <AppSidebar />
      {/* The main content area, indented to the right of the sidebar */}
      <SidebarInset className="p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          {/* Page Title */}
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {/* Right-aligned header content */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

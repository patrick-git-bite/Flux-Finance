
import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger, // Import the trigger
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu } from 'lucide-react'; // Import the hamburger icon

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
      {/* The main navigation sidebar. It will likely hide automatically on smaller screens */}
      <AppSidebar />
      {/* The main content area, indented to the right of the sidebar */}
      <SidebarInset className="p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
             {/* Hamburger Menu Button - Only shows on smaller screens to open the sidebar */}
            <SidebarTrigger className="lg:hidden"> {/* Corrected: hidden on large screens and up */}
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            {/* Page Title */}
            <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>
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

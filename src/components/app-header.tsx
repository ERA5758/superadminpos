"use client";

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { PanelLeft } from 'lucide-react';

const getPageTitle = (pathname: string) => {
  const normalizedPath = pathname.toLowerCase();
  if (normalizedPath.startsWith('/dashboard')) return 'Gambaran Platform';
  if (normalizedPath.startsWith('/top-up-requests')) return 'Manajemen Permintaan Isi Ulang';
  if (normalizedPath.startsWith('/stores')) return 'Manajemen Toko (Penyewa)';
  if (normalizedPath.startsWith('/settings')) return 'Pengaturan Platform Global';
  return 'Admin Chika POS';
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { isMobile } = useSidebar();

  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4"
        )}>
        {isMobile && <SidebarTrigger />}
      <h1 className="text-xl sm:text-2xl font-headline font-semibold text-foreground">{title}</h1>
    </header>
  );
}

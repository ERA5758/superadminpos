import type { ReactNode } from "react";
import { Coins } from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppHeader } from "@/components/app-header";
import { SidebarNav } from "@/components/sidebar-nav";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function AppLayout({ children }: { children: ReactNode }) {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-2">
            <Button variant="ghost" asChild className="flex items-center gap-2 justify-center h-12 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12">
                <Link href="/dashboard">
                    <div className="p-2 rounded-lg bg-primary group-data-[collapsible=icon]:p-2 transition-all duration-300">
                        <Coins className="text-primary-foreground size-6" />
                    </div>
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <h1 className="text-lg font-headline font-bold text-sidebar-foreground">Chika POS</h1>
                        <p className="text-xs text-sidebar-foreground/70">Konsol Admin</p>
                    </div>
                </Link>
            </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-left p-2 h-auto group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                    {userAvatar && (
                        <Avatar className="h-8 w-8 mr-2 group-data-[collapsible=icon]:mr-0">
                            <AvatarImage src={userAvatar.imageUrl} alt="Admin" data-ai-hint={userAvatar.imageHint} />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-medium text-sm text-sidebar-foreground">Super Admin</span>
                        <span className="text-xs text-sidebar-foreground/70">admin@chika.pos</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 pt-0">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

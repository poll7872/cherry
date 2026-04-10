"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings, 
  User 
} from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40 transition-all duration-300">
      <div className="flex h-20 items-center justify-between px-10">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-sm font-semibold tracking-wide lowercase">
            <span className="text-secondary/50">Dashboard</span>
            <span className="text-secondary/20 font-light">/</span>
            <span className="text-primary">Mis Proyectos</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-10 w-10 rounded-2xl outline-none transition-all hover:scale-105 active:scale-95 group">
                <Avatar className="h-10 w-10 shadow-sm transition-shadow group-hover:shadow-md">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black uppercase tracking-tighter">JD</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-4 rounded-2xl border-none shadow-2xl p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

"use client";

import {
  Search,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";

export function DashboardNav() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50">
      <div className="glass-panel px-6 py-3 flex items-center justify-between rounded-2xl! border-white/5 shadow-2xl">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="h-6 w-auto" />
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Workspace <span className="text-primary italic">Beta</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
            <Link 
              href="/dashboard" 
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-white/10 text-white shadow-sm"
            >
              Proyectos
            </Link>
            <Link 
              href="/dashboard/archive" 
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg text-muted-foreground hover:text-white transition-colors"
            >
              Archivo
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white/3 border border-white/5 rounded-xl px-3 py-1.5 gap-3 focus-within:border-primary/30 transition-all">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar proyectos..." 
              className="bg-transparent border-none outline-none text-xs font-sans text-white placeholder:text-muted-foreground/40 w-32 md:w-48"
            />
            <span className="text-[9px] font-mono text-muted-foreground/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 rounded-xl transition-all hover:bg-white/5 group">
                <Avatar className="h-8 w-8 border border-white/10 shadow-sm">
                  <AvatarFallback className="bg-primary text-white font-bold text-[10px]">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start pr-2">
                  <span className="text-xs font-bold text-white leading-none">John Doe</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono mt-1">Investigador</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-4 rounded-2xl border border-white/10 shadow-2xl p-2 bg-card/95 backdrop-blur-xl" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-white">John Doe</p>
                  <p className="text-xs text-muted-foreground italic truncate">john.doe@cherry.ai</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                <User className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                <Settings className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ajustes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2.5 rounded-xl transition-colors">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

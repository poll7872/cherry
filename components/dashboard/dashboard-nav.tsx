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

import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/actions/auth";

export function DashboardNav() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    getUser().then((data) => {
      if (data) setUser(data);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50">
      <div className="glass-panel px-6 py-3 flex items-center justify-between rounded-2xl! border-border shadow-2xl transition-colors duration-500">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="h-6 w-auto" />
            <div className="h-4 w-px bg-border mx-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Workspace <span className="text-primary italic">Beta</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-border">
            <Link 
              href="/dashboard" 
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-background text-foreground shadow-sm"
            >
              Proyectos
            </Link>
            <Link 
              href="/dashboard/archive" 
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              Archivo
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-1.5 gap-3 focus-within:border-primary/30 transition-all">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar proyectos..." 
              className="bg-transparent border-none outline-none text-xs font-sans text-foreground placeholder:text-muted-foreground/40 w-32 md:w-48"
            />
            <span className="text-[9px] font-mono text-muted-foreground/30 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-border">
              ⌘K
            </span>
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 group">
                <Avatar className="h-8 w-8 border border-border shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start pr-2">
                  <span className="text-xs font-bold text-foreground leading-none">{user?.name || "John Doe"}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono mt-1">Investigador</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-4 rounded-2xl border border-border shadow-2xl p-2 bg-card/95 backdrop-blur-xl" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-foreground">{user?.name || "John Doe"}</p>
                  <p className="text-xs text-muted-foreground italic truncate">{user?.email || "john.doe@cherry.ai"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                <User className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                <Settings className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ajustes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2.5 rounded-xl transition-colors"
              >
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

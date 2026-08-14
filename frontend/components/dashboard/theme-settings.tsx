"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { updateTheme } from "@/actions/settings";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSettings({
  defaultValue,
}: {
  defaultValue: string | null | undefined;
}) {
  const { setTheme } = useTheme();
  const [saving, setSaving] = useState<string | null>(null);

  const options: { value: "light" | "dark"; label: string; icon: typeof Sun }[] =
    [
      { value: "light", label: "Claro", icon: Sun },
      { value: "dark", label: "Oscuro", icon: Moon },
    ];

  const handleSelect = async (value: "light" | "dark") => {
    setTheme(value);
    setSaving(value);
    await updateTheme(value);
    setSaving(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map(({ value, label, icon: Icon }) => {
        const active = (defaultValue || "light") === value;
        const isSaving = saving === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            disabled={saving !== null}
            className={cn(
              "group flex flex-col items-start gap-4 p-6 rounded-2xl border transition-all text-left",
              "bg-black/5 dark:bg-white/5 border-border cursor-pointer hover:border-primary/30",
              "active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait",
              active && "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10",
            )}
          >
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center border border-border bg-card shadow-inner transition-all",
                active && "text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-foreground uppercase tracking-wider">
                {label}
              </span>
              <span className="text-xs text-muted-foreground font-sans">
                {value === "light"
                  ? "Interfaz clara para entornos iluminados"
                  : "Interfaz oscura para sesiones prolongadas"}
              </span>
            </div>
            {isSaving && (
              <span className="text-[10px] font-mono text-muted-foreground animate-pulse">
                Guardando...
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

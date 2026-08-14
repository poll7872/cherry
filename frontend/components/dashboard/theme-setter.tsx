"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function ThemeSetter({ theme }: { theme: string | null | undefined }) {
  const { setTheme } = useTheme();
  const applied = useRef(false);

  useEffect(() => {
    if (theme && !applied.current) {
      applied.current = true;
      setTheme(theme);
    }
  }, [theme, setTheme]);

  return null;
}

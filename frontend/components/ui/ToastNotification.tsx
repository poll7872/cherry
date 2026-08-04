"use client";

import { Toaster } from "sileo";
import { useTheme } from "next-themes";

export const ToastNotification = () => {
  const { resolvedTheme } = useTheme();
  // Sileo invierte los temas: "dark" = toast claro, "light" = toast oscuro
  const isDark = resolvedTheme === "dark";

  return <Toaster position="top-center" theme={isDark ? "light" : "dark"} />;
};

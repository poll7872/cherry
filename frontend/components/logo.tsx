import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <>
      <Image
        src="/logo_bg_white.svg"
        alt="Cherry"
        width={30}
        height={30}
        className={cn("dark:hidden", className)}
        priority
      />
      <Image
        src="/logo_bg_black.svg"
        alt="Cherry"
        width={30}
        height={30}
        className={cn("hidden dark:block", className)}
        priority
      />
    </>
  );
}

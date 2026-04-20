import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/logo_bg_white.svg"
      alt="Cherry"
      width={20}
      height={20}
      className={cn("w-32 h-auto", className)}
      priority
    />
  );
}

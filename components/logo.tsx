import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo_bg_white.svg"
      alt="Cherry"
      width={20}
      height={20}
      className="w-36 h-auto"
      priority
    />
  );
}

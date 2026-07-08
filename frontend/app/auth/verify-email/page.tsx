"use client";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Logo } from "@/components/logo";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  console.log("desde verify-email token: ", token);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center justify-center self-center">
          <Logo />
        </a>
        <VerifyEmailForm token={token || ""} />
      </div>
    </div>
  );
}


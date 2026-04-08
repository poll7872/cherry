"use client"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center justify-center self-center">
          <Logo />
        </a>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
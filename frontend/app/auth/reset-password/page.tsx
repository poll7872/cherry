import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Logo } from "@/components/logo"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center justify-center self-center">
          <Logo />
        </a>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}
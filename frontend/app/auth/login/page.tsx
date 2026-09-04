import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-start overflow-y-auto p-6 py-10 md:p-10 animate-slide-up">
      <div className="w-full max-w-[440px] my-auto">
        <LoginForm />
      </div>

      <footer className="mt-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-primary/30" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
            Cherry &bull; Escritura Científica de Vanguardia
          </p>
        </div>
      </footer>
    </main>
  )
}
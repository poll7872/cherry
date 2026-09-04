import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { SignupForm } from "@/components/auth/signup-form"

export default async function SignupPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-start overflow-y-auto p-6 py-10 md:p-10 animate-slide-up">
      <div className="w-full max-w-[440px] my-auto">
        <SignupForm />
      </div>

      <footer className="mt-10">
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
            Unirse a la Vanguardia Científica
          </p>
          <div className="h-px w-6 bg-primary/30" />
        </div>
      </footer>
    </main>
  )
}
"use client"

import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-10 animate-slide-up">
      <div className="w-full max-w-[440px]">
        <SignupForm />
      </div>
      
      <footer className="absolute bottom-10 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0">
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
"use client"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-10 animate-slide-up">
      <div className="w-full max-w-[440px]">
        <LoginForm />
      </div>
      
      <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
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
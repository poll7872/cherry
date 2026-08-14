import { getUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, UserRound, Fingerprint } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function PerfilPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-16">
      <section className="border-b border-border pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
              Identidad del Investigador
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter leading-none italic">
              Tu <span className="text-primary not-italic">Perfil</span>
            </h1>
            <p className="text-lg text-muted-foreground font-sans max-w-xl leading-relaxed opacity-70">
              Gestiona tu identidad, credenciales y datos personales de tu
              entorno de investigación.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border">
              <Avatar className="h-10 w-10 border border-border shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none">
                  {user.name}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono mt-1">
                  Investigador
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-black/5 dark:bg-white/5 text-primary border border-border font-mono px-3 py-1 rounded-lg text-[10px] uppercase tracking-tighter"
            >
              Cuenta verificada
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        <Card className="glass-panel border-border shadow-xl rounded-[2rem] p-8 overflow-hidden">
          <CardHeader className="px-0 pb-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 p-3 text-primary border border-border shadow-inner">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter">
                  Información personal
                </CardTitle>
                <CardDescription className="text-xs font-sans">
                  Actualiza los datos visibles de tu identidad.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 space-y-8">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Email (no editable)
                </span>
                <span className="text-sm font-bold text-foreground">{user.email}</span>
              </div>
            </div>
            <ProfileForm defaultValue={user.name} />
          </CardContent>
        </Card>

        <Card className="glass-panel border-border shadow-xl rounded-[2rem] p-8 overflow-hidden">
          <CardHeader className="px-0 pb-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 p-3 text-primary border border-border shadow-inner">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter">
                  Seguridad
                </CardTitle>
                <CardDescription className="text-xs font-sans">
                  Mantén tu cuenta protegida con una contraseña robusta.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex items-start gap-4 px-5 py-4 mb-8 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
              <Fingerprint className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                La contraseña debe tener al menos 8 caracteres. Cambiarla
                invalidará los accesos con tu contraseña anterior.
              </p>
            </div>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

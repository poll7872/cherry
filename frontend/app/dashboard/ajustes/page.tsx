import { getUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { DangerZone } from "@/components/dashboard/danger-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, TriangleAlert } from "lucide-react";

export default async function AjustesPage() {
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
              Preferencias del Workspace
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter leading-none italic">
              Configura tu <span className="text-primary not-italic">Workspace</span>
            </h1>
            <p className="text-lg text-muted-foreground font-sans max-w-xl leading-relaxed opacity-70">
              Personaliza la experiencia visual y gestiona los aspectos
              sensibles de tu cuenta.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8 pb-20">
        <Card className="glass-panel border-border shadow-xl rounded-[2rem] p-8 overflow-hidden">
          <CardHeader className="px-0 pb-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 p-3 text-primary border border-border shadow-inner">
                <Palette className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter">
                  Apariencia
                </CardTitle>
                <CardDescription className="text-xs font-sans">
                  El tema seleccionado se sincroniza con tu cuenta y se
                  aplica en todos tus dispositivos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <ThemeSettings defaultValue={user.theme} />
          </CardContent>
        </Card>

        <Card className="glass-panel border-border shadow-xl rounded-[2rem] p-8 overflow-hidden">
          <CardHeader className="px-0 pb-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-destructive/10 p-3 text-destructive border border-destructive/10 shadow-inner">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter">
                  Zona de peligro
                </CardTitle>
                <CardDescription className="text-xs font-sans">
                  Acciones irreversibles que afectan a tu cuenta y a todos
                  tus datos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-5 py-5 rounded-2xl border border-destructive/20 bg-destructive/5">
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-wider">
                  Eliminar cuenta
                </p>
                <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                  Se borrarán permanentemente tu cuenta, proyectos,
                  documentos, conversaciones y sandboxes asociados.
                </p>
              </div>
              <div className="shrink-0">
                <DangerZone />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

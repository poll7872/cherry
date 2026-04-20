import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import {  Terminal, Activity, BookOpen } from "lucide-react";
import { getProjects } from "@/actions/projects";

export default async function DashboardPage() {
  const projects = await getProjects();
  const hasProjects = projects.length > 0;

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-16">
      {/* CONSOLE HERO SECTION */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
              Escritura Científica de Vanguardia
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
              Biblioteca de <span className="text-primary not-italic">Proyectos</span>
            </h1>
            <p className="text-lg text-muted-foreground font-sans max-w-xl leading-relaxed opacity-70">
              Gestión centralizada de manuscritos, papers y producción científica técnica.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground">
              <Activity className="h-3 w-3 text-primary" />
              {projects.length} PROYECTOS ACTIVOS
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground uppercase">
              <Terminal className="h-3 w-3 text-primary" />
              Sincronización: Activa
            </div>
          </div>
        </div>

        <div className="shrink-0 pb-2">
          <CreateProjectDialog />
        </div>
      </section>

      {/* PROJECTS GRID */}
      {hasProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-white/5 rounded-[2.5rem] bg-white/2 backdrop-blur-md relative overflow-hidden group">
          {/* Subtle flare behind empty state */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="text-center space-y-8 p-12 max-w-md relative z-10">
            <div className="mx-auto w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-primary mb-4 border border-white/10 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-700 shadow-2xl">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white tracking-tight leading-tight italic">Inicia tu próximo Proyecto</h3>
              <p className="text-muted-foreground font-sans leading-relaxed text-sm">
                Transforma ideas complejas en manuscritos de alto impacto. Tu producción científica de vanguardia comienza aquí.
              </p>
            </div>
            <div className="pt-6">
              <CreateProjectDialog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


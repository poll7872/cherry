import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { Plus } from "lucide-react";
import { getProjects } from "@/actions/projects";

export default async function DashboardPage() {
  const projects = await getProjects();
  const hasProjects = projects.length > 0;

  return (
    <div className="p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-[#111827]">
            Mis Proyectos
          </h1>
          <p className="text-[#4B5563] font-semibold text-lg max-w-2xl leading-relaxed">
            Bienvenido de nuevo. Aquí tienes tus investigaciones y documentos LaTeX.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {hasProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed rounded-[2.5rem] border-neutral bg-white shadow-inner">
          <div className="text-center space-y-6 p-12">
            <div className="mx-auto w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Plus className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-[#111827]">Empieza tu primer proyecto</h3>
            <p className="text-[#6B7280] font-medium max-w-md mx-auto leading-relaxed text-lg">
              Cherry está listo para ayudarte a escribir documentos científicos impecables.
            </p>
            <div className="pt-6">
              <CreateProjectDialog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Project } from "@/lib/types";
import { useState } from "react";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="group relative flex flex-col h-full glass-panel transition-all duration-700 hover:border-primary/20 p-1 overflow-hidden">
      <div className="flex flex-col h-full p-8 gap-8 relative z-10">
        <div className="flex items-start justify-between">
          <div className="shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 border border-border shadow-inner">
            <FileText className="h-5 w-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl opacity-40 hover:opacity-100 transition-all"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl shadow-2xl border border-border p-2 min-w-48 bg-card/95 backdrop-blur-xl"
            >
              <DropdownMenuItem
                onClick={() => setShowEditDialog(true)}
                className="cursor-pointer gap-3 rounded-xl py-2.5 focus:bg-primary/10 focus:text-primary transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-3 rounded-xl py-2.5 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-foreground tracking-tighter leading-[1.1] line-clamp-2">
            {project.name}
          </h3>
          <p className="text-base font-sans text-muted-foreground/60 leading-relaxed line-clamp-2 italic">
            {project.description || "Sin descripción adicional registrada."}
          </p>
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2 text-xs font-mono tracking-widest text-muted-foreground/40 font-bold uppercase">
              <Calendar className="h-5 w-5" />
              <span>{formattedDate}</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-black/5 dark:bg-white/5 text-primary border border-border font-mono px-3 py-1 rounded-lg text-[9px] uppercase tracking-tighter"
            >
              PROYECTO
            </Badge>
          </div>

          <Button
            asChild
            className="w-full h-11 bg-primary text-white hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] transition-all rounded-xl text-[11px] font-black uppercase tracking-[0.2em]"
          >
            <Link href={`/dashboard/projects/${project.id}`}>
              Abrir
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative hover light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />

      <EditProjectDialog
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteProjectDialog
        project={project}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}

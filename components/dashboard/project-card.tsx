"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Pencil, Trash2, Calendar, ArrowRight } from "lucide-react";
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
  
  const formattedDate = new Date(project.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="group relative border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />
        
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 h-20">
          <div className="flex items-start gap-4 pr-6">
            <div className="mt-1 shrink-0 rounded-xl bg-primary/5 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground leading-tight line-clamp-2">
              {project.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-2xl border-none p-1 min-w-[160px]">
              <DropdownMenuItem 
                onClick={() => setShowEditDialog(true)}
                className="cursor-pointer gap-2 rounded-lg py-2 focus:bg-primary/5 focus:text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
                <span className="font-semibold">Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 rounded-lg py-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="font-semibold">Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

      <CardContent className="grow pt-0 pb-6">
        <p className="text-sm font-medium text-[#4B5563] leading-relaxed line-clamp-3">
          {project.description || "Sin descripción adicional proporcionada para este proyecto."}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-muted/50 pt-4 bg-muted/5">
        <div className="flex items-center justify-between w-full text-[12px]">
          <div className="flex items-center gap-1.5 text-[#6B7280] font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
          <Badge variant="secondary" className="bg-neutral text-primary font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            LaTeX
          </Badge>
        </div>
        
        <Button asChild className="w-full bg-primary/5 text-primary hover:bg-primary hover:text-white border-none shadow-none group/btn transition-all duration-300 rounded-xl font-bold py-5">
          <Link href={`/dashboard/projects/${project.id}`}>
            Continuar Editando
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>

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
    </Card>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, MoreVertical, Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams } from "next/navigation";

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    updatedAt: string;
  };
}

export function DocumentCard({ document }: DocumentCardProps) {
  const params = useParams();
  const projectId = params.id as string;
  
  const formattedDate = new Date(document.updatedAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="group border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <FileText className="h-6 w-6" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1">
              <DropdownMenuItem className="gap-2 cursor-pointer font-semibold rounded-lg">
                <Pencil className="h-4 w-4" />
                Renombrar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer font-semibold text-destructive focus:text-destructive rounded-lg">
                <FileText className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#111827] truncate">
            {document.title}
          </h3>
          <div className="flex items-center gap-2 text-[#6B7280] text-sm font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="mt-8">
          <Link href={`/dashboard/projects/${projectId}/editor/${document.id}`}>
            <Button className="w-full rounded-2xl font-bold h-12 bg-primary/5 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all duration-300">
              Abrir Editor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

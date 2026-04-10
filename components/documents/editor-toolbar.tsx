"use client";

import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  Type, 
  Image as ImageIcon, 
  Table, 
  FunctionSquare, 
  Save,
  Share2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function EditorToolbar() {
  const tools = [
    { icon: Bold, label: "Negrita" },
    { icon: Italic, label: "Cursiva" },
    { icon: Type, label: "Encabezado" },
    { icon: List, label: "Lista" },
  ];

  const advanced = [
    { icon: FunctionSquare, label: "Ecuación" },
    { icon: ImageIcon, label: "Imagen" },
    { icon: Table, label: "Tabla" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-muted bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {tools.map((tool) => (
          <Button key={tool.label} variant="ghost" size="icon" className="h-10 w-10 text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
        <Separator orientation="vertical" className="h-6 mx-2" />
        {advanced.map((tool) => (
          <Button key={tool.label} variant="ghost" size="icon" className="h-10 w-10 text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Sincronizado</span>
        </div>
        <Button variant="ghost" className="rounded-xl font-bold h-10 gap-2">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        <Button className="rounded-xl font-black h-10 px-6 gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95">
          <Save className="h-4 w-4" />
          Guardar
        </Button>
      </div>
    </div>
  );
}

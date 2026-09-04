export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* GLOBAL BACKGROUND BRAND MARK */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden">
        <h1 className="text-[25vw] font-black leading-none tracking-tighter text-white/[0.015] uppercase italic">
          Cherry
        </h1>
      </div>

      {/* Decorative Accents (Global for Auth) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[30%] left-[-5%] w-[40%] h-[1px] bg-primary/10 -rotate-6 blur-[0.5px]" />
        <div className="absolute bottom-[30%] right-[-5%] w-[40%] h-[1px] bg-primary/10 rotate-6 blur-[0.5px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

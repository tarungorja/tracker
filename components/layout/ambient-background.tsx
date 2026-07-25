export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      <div className="absolute right-[-10%] top-1/4 h-[28rem] w-[28rem] rounded-full bg-health-violet/15 blur-3xl dark:bg-health-violet/10" />
      <div className="absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-health-blue/15 blur-3xl dark:bg-health-blue/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent,hsl(var(--background))_70%)]" />
    </div>
  );
}

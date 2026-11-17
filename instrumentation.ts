// Runs once when the Next.js server starts. Compiled for both the Node and Edge runtimes,
// so everything that needs Node (mongoose, firebase-admin) lives in instrumentation-node.ts
// and is only imported inside this exact check, which Next evaluates at build time.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}

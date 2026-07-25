/** Decorative, fixed gradient blobs that sit behind all content. */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -left-32 -top-40 size-[32rem] rounded-full blur-3xl"
        style={{ background: "var(--blob-a)" }}
      />
      <div
        className="absolute -right-40 top-1/3 size-[36rem] rounded-full blur-3xl"
        style={{ background: "var(--blob-b)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 size-[28rem] rounded-full blur-3xl"
        style={{ background: "var(--blob-c)" }}
      />
    </div>
  );
}

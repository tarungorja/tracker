import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <p className="text-5xl font-semibold tracking-tight">404</p>
      <h2 className="mt-3 text-lg font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-5`}>
        <Home className="size-4" />
        Back to dashboard
      </Link>
    </Card>
  );
}

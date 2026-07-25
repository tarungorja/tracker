import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <span className="text-5xl font-bold text-primary">404</span>
          <div>
            <h2 className="text-lg font-bold">Page not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

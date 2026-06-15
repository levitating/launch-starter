import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Launch Starter</h1>
        <p className="text-zinc-600 mb-8">
          Sign up to get access to AI-powered features.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

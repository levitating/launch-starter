export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/entitlements";
import { redirect } from "next/navigation";
import { Paywall } from "@/components/Paywall";
import { AiDemo } from "@/components/AiDemo";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const entitled = await hasActiveSubscription(user.id);

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold">Launch Starter</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{user.email}</span>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-12 px-4">
        {entitled ? (
          <AiDemo userId={user.id} />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">You're in!</h2>
              <p className="text-zinc-500">Unlock the AI features with a subscription.</p>
            </div>
            <Paywall
              userId={user.id}
              priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID}
            />
          </div>
        )}
      </main>
    </div>
  );
}

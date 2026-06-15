export const dynamic = "force-dynamic";

import { createCheckoutSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { captureServer } from "@/lib/posthog-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await request.json();
  const origin = new URL(request.url).origin;

  const session = await createCheckoutSession({
    userId: user.id,
    email: user.email!,
    priceId: priceId ?? process.env.STRIPE_PRICE_ID!,
    successUrl: `${origin}/dashboard?checkout=success`,
    cancelUrl: `${origin}/dashboard`,
  });

  await captureServer("checkout_started", user.id, { price_id: priceId });

  return NextResponse.json({ url: session.url });
}

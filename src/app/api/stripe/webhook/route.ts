export const dynamic = "force-dynamic";

import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { captureServer } from "@/lib/posthog-server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Uses the service-role key — bypasses RLS to write from webhook
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function upsertSubscription(sub: Stripe.Subscription, userId: string) {
  const supabase = getSupabaseAdmin();
  // current_period_end moved to items in the basil API version
  const item = sub.items.data[0] as Stripe.SubscriptionItem & { current_period_end?: number };
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  await supabase.from("subscriptions").upsert({
    id: sub.id,
    user_id: userId,
    status: sub.status,
    price_id: item?.price?.id ?? null,
    current_period_end: periodEnd,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const sub = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const userId = sub.metadata?.userId;
      if (userId) {
        await upsertSubscription(sub, userId);
        if (event.type === "customer.subscription.created") {
          await captureServer("subscription_activated", userId);
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const userId = sub.metadata?.userId;
      if (userId) {
        await upsertSubscription(sub, userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";

import { complete } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/entitlements";
import { captureServer } from "@/lib/posthog-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entitled = await hasActiveSubscription(user.id);
  if (!entitled) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { prompt } = await request.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const result = await complete({
    system: "You are a helpful assistant. Be concise.",
    prompt,
    maxTokens: 512,
  });

  await captureServer("ai_feature_used", user.id);

  return NextResponse.json({ result });
}

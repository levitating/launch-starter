"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { posthog } from "@/lib/posthog";

interface PaywallProps {
  userId: string;
  priceId?: string;
  title?: string;
  description?: string;
  price?: string;
  features?: string[];
}

export function Paywall({
  userId,
  priceId,
  title = "Unlock Full Access",
  description = "Get access to all AI features with a subscription.",
  price = "$9/mo",
  features = ["Unlimited AI requests", "Priority support", "All future features"],
}: PaywallProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    posthog.capture("checkout_started", { distinct_id: userId, price_id: priceId });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error("Checkout failed:", err);
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto border-2">
      <CardHeader className="text-center">
        <Badge className="w-fit mx-auto mb-2">Premium</Badge>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-center mb-6">{price}</p>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Redirecting…" : `Subscribe — ${price}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

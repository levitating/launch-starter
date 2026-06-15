"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    capture_pageview: true,
  });
  initialized = true;
}

// Named events — extend as needed per app
export const events = {
  signedUp: (userId: string) =>
    posthog.capture("signed_up", { distinct_id: userId }),

  paywallViewed: (userId: string) =>
    posthog.capture("paywall_viewed", { distinct_id: userId }),

  checkoutStarted: (userId: string, priceId: string) =>
    posthog.capture("checkout_started", { distinct_id: userId, price_id: priceId }),

  subscriptionActivated: (userId: string) =>
    posthog.capture("subscription_activated", { distinct_id: userId }),

  aiFeatureUsed: (userId: string) =>
    posthog.capture("ai_feature_used", { distinct_id: userId }),
};

export { posthog };

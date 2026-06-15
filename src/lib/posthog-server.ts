import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHogServer(): PostHog {
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export async function captureServer(
  event: string,
  userId: string,
  props?: Record<string, unknown>
) {
  const ph = getPostHogServer();
  ph.capture({ distinctId: userId, event, properties: props });
  await ph.flush();
}

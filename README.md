# Launch Starter

Clone → rename → ship. A production-ready Next.js template with auth, paywall, AI, and analytics pre-wired.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind, shadcn/ui)
- **Supabase** — auth (email + Google OAuth) + Postgres
- **Stripe** — subscription checkout + webhook entitlement
- **Claude** (Anthropic) — server-side AI wrapper
- **PostHog** — activation + conversion analytics

## Ship Checklist

### 1. Clone & install

```bash
git clone https://github.com/levitating/launch-starter my-app
cd my-app
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` into `.env.local`
3. Run the migration: paste `supabase/migrations/001_initial.sql` into the Supabase SQL editor
4. Enable Google OAuth: **Authentication → Providers → Google** (add client ID + secret)
5. Set redirect URL: `https://your-domain.com/auth/callback`

### 3. Stripe

1. Create a product + recurring price in [Stripe dashboard](https://dashboard.stripe.com)
2. Copy `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` into `.env.local`
3. Wire the webhook: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

### 4. Anthropic

Get an API key from [console.anthropic.com](https://console.anthropic.com) → paste into `ANTHROPIC_API_KEY`.

### 5. PostHog

Get a project key from [posthog.com](https://posthog.com) → paste into `NEXT_PUBLIC_POSTHOG_KEY`.

### 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` → sign up → hit paywall → Stripe test checkout → AI feature unlocked.

### 7. Deploy to Vercel

```bash
vercel --prod
```

Add all env vars in the Vercel dashboard, set the Stripe webhook to your production URL.

## End-to-End Flow

1. User visits `/` → redirected to `/login`
2. Signs up (email or Google) → lands on `/dashboard`
3. No subscription → `<Paywall>` component shown → Stripe checkout
4. Stripe webhook fires → `subscriptions` table updated
5. Next visit to `/dashboard` → entitlement check passes → `<AiDemo>` shown
6. AI prompt sent to `/api/ai/demo` → Claude responds
7. All steps tracked in PostHog (`signed_up`, `paywall_viewed`, `checkout_started`, `subscription_activated`, `ai_feature_used`)

## Customization

- **Rename** the app: update `metadata` in `src/app/layout.tsx`
- **Swap AI model**: change `model` default in `src/lib/claude.ts`
- **Add features**: extend `<AiDemo>` or add new protected routes under `/dashboard`
- **Multi-tier pricing**: pass different `priceId` props to `<Paywall>`

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/claude.ts` | Claude API wrapper |
| `src/lib/stripe.ts` | Stripe helper + checkout session factory |
| `src/lib/entitlements.ts` | Server-side entitlement check |
| `src/lib/posthog.ts` | Client analytics + named events |
| `src/components/Paywall.tsx` | Drop-in paywall component |
| `src/app/api/stripe/webhook/route.ts` | Stripe → Supabase sync |
| `supabase/migrations/001_initial.sql` | Initial schema |

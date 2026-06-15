"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { posthog } from "@/lib/posthog";

export function AiDemo({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    posthog.capture("ai_feature_used", { distinct_id: userId });

    try {
      const res = await fetch("/api/ai/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Feature</CardTitle>
        <CardDescription>Ask Claude anything. Your subscription is active.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            rows={3}
            placeholder="Ask anything…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Thinking…" : "Ask Claude"}
          </Button>
        </form>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>
        )}

        {result && (
          <div className="bg-zinc-50 rounded p-4 text-sm whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UnderwritingRead } from "@/lib/api/types";

export function StartCaseButton({ zpid }: { zpid: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/underwritings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zpid }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : "Could not start this case");
      }
      const underwriting = data as UnderwritingRead;
      router.push(`/underwritings/${underwriting.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start this case");
      setPending(false);
    }
  }

  return (
    <div>
      <Button type="button" size="lg" disabled={pending} onClick={handleStart} className="min-w-44 bg-slate-900 hover:bg-slate-700">
        {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <>Start underwriting <ArrowRight aria-hidden="true" /></>}
      </Button>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RequestButton({ listingId, ownerId }: { listingId: string; ownerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function request() {
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/exchange/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Request failed");
      setIsError(true);
      return;
    }
    setMessage("Request sent! One exchange per week.");
    setIsError(false);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={request}
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        {loading ? "Requesting…" : "Request this item"}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${isError ? "text-toss-rust" : "text-toss-green"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

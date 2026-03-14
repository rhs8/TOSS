"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostItemForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description") || undefined,
        category: fd.get("category") || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-toss-earth mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full px-3 py-2 border border-toss-mint/60 rounded-lg focus:ring-2 focus:ring-toss-green/40 focus:border-toss-green"
          placeholder="e.g. Electric sander"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-toss-earth mb-1">
          Category
        </label>
        <input
          id="category"
          name="category"
          className="w-full px-3 py-2 border border-toss-mint/60 rounded-lg focus:ring-2 focus:ring-toss-green/40 focus:border-toss-green"
          placeholder="e.g. tools, kitchen, furniture"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-toss-earth mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-3 py-2 border border-toss-mint/60 rounded-lg focus:ring-2 focus:ring-toss-green/40 focus:border-toss-green"
          placeholder="Condition, how to use, etc."
        />
      </div>
      {error && <p className="text-sm text-toss-rust">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Posting…" : "Post item"}
      </button>
    </form>
  );
}

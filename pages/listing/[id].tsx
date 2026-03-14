import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { prisma } from "@/lib/db";
import { Package } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  if (!id) return { notFound: true };
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });
  if (!listing || !listing.isActive) return { notFound: true };
  return { props: { listing } };
};

export default function ListingPage({ listing }: { listing: { id: string; title: string; description: string | null; category: string | null; owner: { name: string | null } | null; ownerId: string } }) {
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
      body: JSON.stringify({ listingId: listing.id }),
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
    router.reload();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        <div className="aspect-video bg-toss-mint/20 rounded-lg flex items-center justify-center mb-4">
          <Package className="w-16 h-16 text-toss-green/50" />
        </div>
        <h1 className="text-2xl text-toss-green mb-1 font-semibold">{listing.title}</h1>
        {listing.category && (
          <span className="text-sm text-toss-earth/60 uppercase tracking-wide">{listing.category}</span>
        )}
        {listing.description && <p className="mt-3 text-toss-earth/90">{listing.description}</p>}
        {listing.owner?.name && (
          <p className="mt-3 text-sm text-toss-earth/70">Listed by {listing.owner.name}</p>
        )}
        <div className="mt-6 pt-4 border-t border-toss-mint/40">
          <button
            type="button"
            onClick={request}
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? "Requesting…" : "Request this item"}
          </button>
          {message && (
            <p className={`mt-2 text-sm ${isError ? "text-toss-rust" : "text-toss-green"}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

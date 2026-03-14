import Link from "next/link";
import { Package } from "lucide-react";

type ListingCardProps = {
  listing: { id: string; title: string; category?: string | null; imageUrl?: string | null; owner?: { name: string | null } | null };
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <li>
      <Link
        href={`/listing/${listing.id}`}
        className="card block hover:shadow-lg transition"
      >
        <div className="aspect-video bg-toss-mint/20 rounded-lg flex items-center justify-center mb-3">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="w-12 h-12 text-toss-green/50" />
          )}
        </div>
        <h2 className="font-semibold text-toss-green truncate">{listing.title}</h2>
        {listing.category && (
          <span className="text-xs text-toss-earth/60 uppercase tracking-wide">
            {listing.category}
          </span>
        )}
        {listing.owner?.name && (
          <p className="text-sm text-toss-earth/70 mt-1">by {listing.owner.name}</p>
        )}
      </Link>
    </li>
  );
}

import { GetServerSideProps } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";

export const getServerSideProps: GetServerSideProps = async () => {
  const listings = await prisma.listing.findMany({
    where: { isActive: true },
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { props: { listings } };
};

type Listing = { id: string; title: string; description: string | null; category: string | null; isActive: boolean; owner: { name: string | null } | null };
export default function BrowsePage({ listings }: { listings: Listing[] }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-toss-green mb-2 font-semibold">Browse</h1>
      <p className="text-toss-earth/80 mb-6">
        Items you can request once you&apos;ve listed something. One exchange per week.
      </p>
      {listings.length === 0 ? (
        <div className="card text-center py-12 text-toss-earth/70">
          <p>No items listed yet. Be the first to post something.</p>
          <Link href="/post" className="btn-primary mt-4 inline-block">Post an item</Link>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      )}
    </div>
  );
}


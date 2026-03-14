import { GetServerSideProps } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDemoUser } from "@/lib/demo-auth";
import { isWithinCommitment } from "@/lib/rules";
import { Calendar, CreditCard, Package } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async () => {
  const user = await getDemoUser();
  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return {
    props: {
      user: {
        commitmentEnd: user.commitmentEnd.getTime(),
        cardOnFile: user.cardOnFile,
      },
      listings,
    },
  };
};

export default function ProfilePage({
  user,
  listings,
}: {
  user: { commitmentEnd: number; cardOnFile: boolean };
  listings: { id: string; title: string; isActive: boolean }[];
}) {
  const commitmentEnd = new Date(user.commitmentEnd);
  const active = user.commitmentEnd > 0 && isWithinCommitment(commitmentEnd);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-toss-green mb-2 font-semibold">My commitment</h1>
      <p className="text-toss-earth/80 mb-6">
        Your 6-month commitment and card on file keep the community trustworthy.
      </p>

      <div className="space-y-4">
        <div className="card flex items-start gap-3">
          <Calendar className="w-5 h-5 text-toss-green shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-toss-green">Commitment period</h2>
            {user.commitmentEnd === 0 ? (
              <p className="text-sm text-toss-earth/80">
                You haven&apos;t listed anything yet. Post an item to start your 6-month commitment.
              </p>
            ) : (
              <>
                <p className="text-sm text-toss-earth/80">Ends {commitmentEnd.toLocaleDateString()}.</p>
                <p className={`text-sm font-medium mt-1 ${active ? "text-toss-green" : "text-toss-rust"}`}>
                  {active ? "Active" : "Ended"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-toss-green shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-toss-green">Card on file</h2>
            <p className="text-sm text-toss-earth/80">
              {user.cardOnFile
                ? "Card on file. You'll be charged if you don't return a borrowed item."
                : "No card on file yet. Add one for reassurance—you'll only be charged if you don't return an item."}
            </p>
            <button type="button" className="mt-2 text-sm text-toss-green underline hover:no-underline">
              {user.cardOnFile ? "Update card" : "Add card (demo)"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-toss-green flex items-center gap-2 mb-2">
            <Package className="w-4 h-4" />
            My listings ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <p className="text-sm text-toss-earth/70">
              No items yet. <Link href="/post" className="text-toss-green underline">Post one</Link>.
            </p>
          ) : (
            <ul className="space-y-2">
              {listings.map((l) => (
                <li key={l.id} className="text-sm flex justify-between items-center">
                  <Link href={`/listing/${l.id}`} className="text-toss-earth hover:text-toss-green">
                    {l.title}
                  </Link>
                  <span className={`text-xs ${l.isActive ? "text-toss-green" : "text-toss-earth/60"}`}>
                    {l.isActive ? "Available" : "Lent out"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

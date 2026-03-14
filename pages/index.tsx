import Link from "next/link";
import { ArrowRight, Package, RefreshCw, Shield, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl text-toss-green mb-4 font-semibold">
          Toss
        </h1>
        <p className="text-xl text-toss-earth/90 max-w-2xl mx-auto mb-2">
          A money-free community exchange. List something, borrow something. Items keep circulating.
        </p>
        <p className="text-toss-earth/70 max-w-xl mx-auto">
          Built for students and newcomers who need tools temporarily—without buying things they can&apos;t keep.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/post" className="btn-primary inline-flex items-center gap-2">
            Post an item
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/browse" className="btn-secondary inline-flex items-center gap-2">
            <Package className="w-4 h-4" />
            Browse what&apos;s available
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-toss-mint/40">
              <RefreshCw className="w-5 h-5 text-toss-green" />
            </div>
            <div>
              <h2 className="font-semibold text-toss-green mb-1">List first, then borrow</h2>
              <p className="text-sm text-toss-earth/80">
                You can&apos;t receive anything until you&apos;ve put something up. After you post, you get access to everything on the platform.
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-toss-mint/40">
              <Calendar className="w-5 h-5 text-toss-green" />
            </div>
            <div>
              <h2 className="font-semibold text-toss-green mb-1">One exchange per week</h2>
              <p className="text-sm text-toss-earth/80">
                Exchanges happen once a week. Keeps things fair and items moving.
              </p>
            </div>
          </div>
        </div>
        <div className="card md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-toss-mint/40">
              <Shield className="w-5 h-5 text-toss-green" />
            </div>
            <div>
              <h2 className="font-semibold text-toss-green mb-1">6-month commitment & card on file</h2>
              <p className="text-sm text-toss-earth/80">
                Minimum 6-month commitment from your first listing—builds trust and cuts down on one-off buys. We keep a card on file; if someone doesn&apos;t return an item, they&apos;re charged. So the community stays reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center text-toss-earth/70 text-sm">
        <p>New to the city? Moving often? Need a sander, a drill, or a pot for a few months? Toss lets you use what you need and pass it on.</p>
      </section>
    </div>
  );
}

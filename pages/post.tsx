import { PostItemForm } from "@/components/PostItemForm";

export default function PostPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-toss-green mb-2 font-semibold">Post an item</h1>
      <p className="text-toss-earth/80 mb-6">
        List something to get access to the exchange. Items must keep circulating.
      </p>
      <PostItemForm />
    </div>
  );
}

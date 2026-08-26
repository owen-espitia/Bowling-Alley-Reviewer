import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-6 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Alley Reviews</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Browse existing bowling alley reviews, add your own, or search by author or alley.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300">
          <p className="font-medium text-zinc-900 dark:text-white">How to use it:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <Link href="/reviews" className="underline hover:text-zinc-900 dark:hover:text-white">
                All Reviews
              </Link>{" "}
              — see every submission, filter by author or alley.
            </li>
            <li>
              <Link href="/add-review" className="underline hover:text-zinc-900 dark:hover:text-white">
                Add a Review
              </Link>{" "}
              — share your opinion on a bowling alley.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

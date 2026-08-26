'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'http://localhost:3058';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      let url = `${API}/reviews`;
      if (filterType === 'author' && filterValue.trim()) {
        url = `${API}/reviews/${encodeURIComponent(filterValue.trim())}`;
      } else if (filterType === 'alley' && filterValue.trim()) {
        url = `${API}/reviews-by-alley/${encodeURIComponent(filterValue.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch reviews. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchReviews();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col gap-6 py-16 px-8">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">All Reviews</h1>

        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap items-center">
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setFilterValue(''); }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
          >
            <option value="all">All Reviews</option>
            <option value="author">By Author</option>
            <option value="alley">By Alley</option>
          </select>

          {filterType !== 'all' && (
            <input
              type="text"
              placeholder={filterType === 'author' ? 'Author name...' : 'Alley UUID...'}
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 flex-1 min-w-40"
            />
          )}

          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            Search
          </button>
        </form>

        {loading && <p className="text-zinc-500">Loading...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="text-zinc-500 text-sm">No reviews found.</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm text-left text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3">Alley</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Full Review</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, i) => (
                  <tr
                    key={r._id ?? i}
                    className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.alley_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.author_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.rating}/10</td>
                    <td className="px-4 py-3">{r.review_story}</td>
                    <td><Link href={`/single-review/${r._id}`} className="inline-block rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-black border border-black hover:bg-z">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

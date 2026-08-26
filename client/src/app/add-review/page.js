'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'http://localhost:3058';

export default function AddReviewPage() {
  const [form, setForm] = useState({ alley_id: '', rating: '', review_story: '' });
  const [alleys, setAlleys] = useState([]);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/alleys`)
      .then(res => res.json())
      .then(data => setAlleys(Array.isArray(data) ? data : []))
      .catch(() => setAlleys([]));
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/add-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ alley_id: '', rating: '', review_story: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-xl flex-col gap-6 py-16 px-8">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Add a Review</h1>

        {status === 'success' && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm dark:bg-green-950 dark:border-green-800 dark:text-green-300">
            Review submitted!{' '}
            <Link href="/reviews" className="underline font-medium">
              View all reviews
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-300">
            Failed to submit review. Make sure the API server is running and try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Alley</span>
            <select
              name="alley_id"
              value={form.alley_id}
              onChange={handleChange}
              required
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            >
              <option value="">Select a bowling alley...</option>
              {alleys.map(a => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rating (1–10)</span>
            <input
              name="rating"
              type="number"
              min="1"
              max="10"
              value={form.rating}
              onChange={handleChange}
              required
              placeholder="8"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Review</span>
            <textarea
              name="review_story"
              value={form.review_story}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Share your experience..."
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 resize-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API = 'http://localhost:3058';

export default function SingleReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchReview() {
      try {
        const response = await fetch(`${API}/single-review/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        setReview(Array.isArray(data) ? data[0] : data);
      } catch {
        setError('Failed to fetch this review.');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();
  }, [id]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (error) return <main className="p-8 text-red-500">{error}</main>;
  if (!review) return <main className="p-8">Review not found.</main>;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-8 py-16">
      <Link href="/reviews" className="underline">
        Back to reviews
      </Link>
      <h1 className="text-3xl font-semibold">{review.alley_name}</h1>
      <p><strong>Author:</strong> {review.author_name}</p>
      <p><strong>Rating:</strong> {review.rating}/10</p>
      <p>{review.review_story}</p>
    </main>
  );
}

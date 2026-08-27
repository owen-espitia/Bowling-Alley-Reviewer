'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API = 'http://localhost:3058';

export default function SingleReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [editingReview, setEditingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '', review_story: '' });
  const [reviewSaving, setReviewSaving] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditText, setCommentEditText] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);

  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          fetch(`${API}/single-review/${encodeURIComponent(id)}`),
          fetch(`${API}/comments/${encodeURIComponent(id)}`),
        ]);
        if (!reviewRes.ok) throw new Error('Request failed');
        const reviewData = await reviewRes.json();
        const commentsData = await commentsRes.json();
        const r = Array.isArray(reviewData) ? reviewData[0] : reviewData;
        setReview(r);
        setReviewForm({ rating: r.rating, review_story: r.review_story });
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch {
        setError('Failed to fetch this review.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- Review actions ---

  async function handleReviewSave(e) {
    e.preventDefault();
    setReviewSaving(true);
    try {
      const res = await fetch(`${API}/review/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: Number(reviewForm.rating), review_story: reviewForm.review_story }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReview(prev => ({ ...prev, rating: updated.rating, review_story: updated.review_story }));
        setEditingReview(false);
      }
    } finally {
      setReviewSaving(false);
    }
  }

  async function handleReviewDelete() {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    await fetch(`${API}/review/${id}`, { method: 'DELETE', credentials: 'include' });
    window.location.href = '/reviews';
  }

  // --- Comment actions ---

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch(`${API}/add-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ review: { _id: id }, comment: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, { ...data.rows[0], author_name: user }]);
        setCommentText('');
      } else {
        const data = await res.json();
        setCommentError(data.error ?? 'Failed to post comment.');
      }
    } catch {
      setCommentError('Could not reach the API server.');
    } finally {
      setSubmitting(false);
    }
  }

  function startEditComment(comment) {
    setEditingCommentId(comment._id);
    setCommentEditText(comment.content);
  }

  async function handleCommentSave(commentId) {
    setCommentSaving(true);
    try {
      const res = await fetch(`${API}/comment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: commentEditText }),
      });
      if (res.ok) {
        setComments(prev => prev.map(c =>
          c._id === commentId ? { ...c, content: commentEditText } : c
        ));
        setEditingCommentId(null);
      }
    } finally {
      setCommentSaving(false);
    }
  }

  async function handleCommentDelete(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    const res = await fetch(`${API}/comment/${commentId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setComments(prev => prev.filter(c => c._id !== commentId));
  }

  if (loading) return <main className="p-8">Loading...</main>;
  if (error) return <main className="p-8 text-red-500">{error}</main>;
  if (!review) return <main className="p-8">Review not found.</main>;

  const isReviewOwner = user === review.author_name;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 py-16">
      <Link href="/reviews" className="text-sm underline text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
        Back to reviews
      </Link>

      {/* Review */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">{review.alley_name}</h1>
          {isReviewOwner && !editingReview && (
            <div className="flex gap-3 shrink-0">
              <button onClick={() => setEditingReview(true)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline">
                Edit
              </button>
              <button onClick={handleReviewDelete} className="text-sm text-red-500 hover:text-red-700 underline">
                Delete
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          by <span className="font-medium text-zinc-700 dark:text-zinc-300">{review.author_name}</span>
          {!editingReview && <>{' · '}{review.rating}/10</>}
        </p>

        {editingReview ? (
          <form onSubmit={handleReviewSave} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rating (1–10)</span>
              <input
                type="number" min="1" max="10" required
                value={reviewForm.rating}
                onChange={e => setReviewForm(f => ({ ...f, rating: e.target.value }))}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 w-24"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Review</span>
              <textarea
                required rows={5}
                value={reviewForm.review_story}
                onChange={e => setReviewForm(f => ({ ...f, review_story: e.target.value }))}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 resize-none"
              />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={reviewSaving}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300">
                {reviewSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingReview(false)}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-zinc-700 dark:text-zinc-300">{review.review_story}</p>
        )}
      </div>

      {/* Comments */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Comments {comments.length > 0 && <span className="text-zinc-400 font-normal text-base">({comments.length})</span>}
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-zinc-500">No comments yet. Be the first!</p>
        )}

        <div className="flex flex-col gap-3">
          {comments.map((c, i) => {
            const isOwner = user === c.author_name;
            const isEditing = editingCommentId === c._id;
            return (
              <div key={c._id ?? i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{c.author_name}</span>
                  {isOwner && !isEditing && (
                    <div className="flex gap-3">
                      <button onClick={() => startEditComment(c)} className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline">
                        Edit
                      </button>
                      <button onClick={() => handleCommentDelete(c._id)} className="text-xs text-red-400 hover:text-red-600 underline">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      rows={2}
                      value={commentEditText}
                      onChange={e => setCommentEditText(e.target.value)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => handleCommentSave(c._id)} disabled={commentSaving}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
                        {commentSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingCommentId(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.content}</p>
                )}
              </div>
            );
          })}
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3 pt-2">
            {commentError && <p className="text-sm text-red-500">{commentError}</p>}
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              required rows={3}
              placeholder="Write a comment..."
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 resize-none"
            />
            <button type="submit" disabled={submitting}
              className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300">
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-zinc-500">
            <Link href="/login" className="underline text-zinc-700 dark:text-zinc-300 hover:text-zinc-900">Sign in</Link>
            {' '}to leave a comment.
          </p>
        )}
      </section>
    </main>
  );
}

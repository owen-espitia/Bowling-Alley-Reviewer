'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = 'http://localhost:3058';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', data.user);
        window.location.href = '/';
      } else {
        setError(data.error ?? 'Registration failed.');
      }
    } catch {
      setError('Could not reach the API server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-sm flex flex-col gap-6 px-8 py-16">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Create account</h1>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</span>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="choose a username"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm password</span>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="underline text-zinc-700 dark:text-zinc-300 hover:text-zinc-900">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:3058';

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(localStorage.getItem('user'));
  }, []);

  async function handleLogout() {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl items-center gap-6 px-8 py-4">
        <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-white">
          Alley Reviews
        </Link>
        <Link href="/reviews" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          All Reviews
        </Link>
        <Link href="/add-review" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          Add a Review
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Signed in as <span className="font-medium text-zinc-900 dark:text-white">{user}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

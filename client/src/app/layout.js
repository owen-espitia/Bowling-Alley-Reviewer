import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alley Reviews",
  description: "Browse and submit bowling alley reviews",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

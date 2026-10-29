import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-mono font-bold text-red-500 mb-4">404</h1>
      <p className="text-zinc-400 mb-6 font-mono text-sm">404 // TARGET COORDINATES NOT FOUND</p>
      <Link
        href="/"
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
      >
        Return to Viewfinder
      </Link>
    </div>
  );
}

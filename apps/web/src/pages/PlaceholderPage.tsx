import { Link } from 'react-router';

/** Temporary page for destinations whose story is not built yet. */
export function PlaceholderPage({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="space-y-4 rounded-xl border border-dashed border-pitch-300 p-6 dark:border-pitch-700">
        <p className="text-ink-700 dark:text-ink-200">{text}</p>
        <Link
          to="/competiciones"
          className="inline-block rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pitch-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600"
        >
          Ver competiciones
        </Link>
      </div>
    </>
  );
}

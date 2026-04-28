import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="mb-3 text-sm font-medium text-blue-600">
          MVP prospection industrielle
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Prospection SEW</h1>
        <p className="mt-3 max-w-md text-sm text-slate-600">
          Base de travail pour détecter des entreprises pouvant avoir besoin de
          moteurs, motoréducteurs et solutions d’entraînement.
        </p>

        <div className="mt-6">
          <Link
            href="/prospects"
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Ouvrir les prospects
          </Link>
        </div>
      </div>
    </main>
  );
}

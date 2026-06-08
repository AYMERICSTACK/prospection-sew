"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* 🔥 BACKGROUND GRADIENT */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-blue-100 opacity-60" />

      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl backdrop-blur">
        {/* 🔥 LOGO + BRAND */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
            <Image
              src="/adei-logo-noir.png"
              alt="ADEI"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* 🔥 TITLE */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Prospection SEW
        </h1>

        {/* 🔥 SUBTITLE */}
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Plateforme intelligente pour détecter et qualifier des entreprises
          industrielles susceptibles d’avoir besoin de{" "}
          <span className="font-medium text-slate-800">
            moteurs, motoréducteurs et solutions d’entraînement
          </span>
          .
        </p>

        {/* 🔥 CTA */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/prospects"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Ouvrir les prospects
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/accuses-reception"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Générer un accusé de réception
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="text-xs text-slate-400">
            Accès rapide aux outils commerciaux ADEI
          </p>
        </div>

        {/* 🔥 FOOT */}
        <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} ADEI — Plateforme interne
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  SURFACE_CARD,
} from "../../lib/constants";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

type Props = {
  companiesCount: number;
  activeCompaniesCount: number;
  overdueFollowUpsCount: number;
  clientsCount: number;
  message: Message;
  loadCompanies: () => void;
  handleScoreAll: () => void;
};

export default function ProspectsHeader({
  companiesCount,
  activeCompaniesCount,
  overdueFollowUpsCount,
  clientsCount,
  message,
  loadCompanies,
  handleScoreAll,
}: Props) {
  return (
    <div className={`${SURFACE_CARD} relative overflow-hidden p-7`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.07),_transparent_22%)]" />

      <div className="relative">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                Prospection industrielle
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                SEW
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Prospects SEW
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Détection, qualification et pilotage commercial d’entreprises
              potentiellement pertinentes pour des moteurs, motoréducteurs,
              variateurs et solutions d’entraînement.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                <span className="font-semibold text-slate-800">
                  {companiesCount}
                </span>{" "}
                entreprises en base
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                <span className="font-semibold text-slate-800">
                  {activeCompaniesCount}
                </span>{" "}
                prospects à traiter
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                <span className="font-semibold text-slate-800">
                  {overdueFollowUpsCount}
                </span>{" "}
                relances en retard
              </div>
            </div>
          </div>

          <Link
            href="/clients"
            className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
          >
            <span className="text-base font-bold">{clientsCount}</span>
            <span>clients</span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadCompanies}
              className={BUTTON_SECONDARY}
            >
              Rafraîchir
            </button>

            <Link href="/clients" className={BUTTON_SECONDARY}>
              Clients
            </Link>

            <button
              type="button"
              onClick={handleScoreAll}
              className={BUTTON_PRIMARY}
            >
              Scorer toutes les entreprises
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

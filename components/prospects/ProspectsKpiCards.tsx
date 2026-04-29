"use client";

import Link from "next/link";
import { LABEL_MUTED } from "../../lib/constants";

type QuickFilter = "all" | "today" | "overdue" | "active" | "closed";

type Props = {
  quickFilter: QuickFilter;
  setQuickFilter: (filter: QuickFilter) => void;
  setShowClosedCompanies: (value: boolean) => void;
  todayFollowUpsCount: number;
  overdueFollowUpsCount: number;
  activeCompaniesCount: number;
  clientsCount: number;
  closedCompaniesCount: number;
};

export default function ProspectsKpiCards({
  quickFilter,
  setQuickFilter,
  setShowClosedCompanies,
  todayFollowUpsCount,
  overdueFollowUpsCount,
  activeCompaniesCount,
  clientsCount,
  closedCompaniesCount,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <button
        type="button"
        onClick={() => setQuickFilter("today")}
        className={`group relative overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
          quickFilter === "today"
            ? "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-white"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className={LABEL_MUTED}>À relancer aujourd’hui</div>
        <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {todayFollowUpsCount}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-500">
          Prospects actifs à traiter aujourd’hui
        </div>
      </button>

      <button
        type="button"
        onClick={() => setQuickFilter("overdue")}
        className={`group relative overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
          quickFilter === "overdue"
            ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className={LABEL_MUTED}>Relances en retard</div>
        <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {overdueFollowUpsCount}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-500">
          À reprendre en priorité
        </div>
      </button>

      <button
        type="button"
        onClick={() => setQuickFilter("active")}
        className={`group relative overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
          quickFilter === "active"
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-white"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className={LABEL_MUTED}>Prospects à traiter</div>
        <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {activeCompaniesCount}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-500">
          Hors clients et hors clôturés
        </div>
      </button>

      <Link
        href="/clients"
        className="group relative overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-white p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
      >
        <div className={LABEL_MUTED}>Clients</div>

        <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {clientsCount}
        </div>

        <div className="mt-2 text-sm leading-6 text-slate-500">
          Déjà clients / portefeuille
        </div>
      </Link>

      <button
        type="button"
        onClick={() => {
          setQuickFilter("closed");
          setShowClosedCompanies(true);
        }}
        className={`group relative overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
          quickFilter === "closed"
            ? "border-slate-400 bg-gradient-to-br from-slate-100 via-white to-white"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className={LABEL_MUTED}>Perdus / inactifs</div>
        <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {closedCompaniesCount}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-500">
          Perdus, inactifs ou hors cible
        </div>
      </button>
    </div>
  );
}

"use client";

import { BUTTON_GHOST, INPUT_CLASS } from "../../lib/constants";

type QuickFilter = "all" | "today" | "overdue" | "active" | "closed";
type ViewMode = "table" | "kanban";

type Props = {
  filteredCount: number;

  quickFilter: QuickFilter;
  setQuickFilter: (filter: QuickFilter) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  filter: string;
  setFilter: (value: string) => void;

  scoreFilter: string;
  setScoreFilter: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;

  showClosedCompanies: boolean;
  setShowClosedCompanies: (value: boolean) => void;
};

export default function ProspectsFilters({
  filteredCount,
  quickFilter,
  setQuickFilter,
  viewMode,
  setViewMode,
  filter,
  setFilter,
  scoreFilter,
  setScoreFilter,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  showClosedCompanies,
  setShowClosedCompanies,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Base prospects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredCount} entreprise(s) affichée(s)
            </p>
          </div>

          {quickFilter !== "all" && (
            <button
              type="button"
              onClick={() => setQuickFilter("all")}
              className={BUTTON_GHOST}
            >
              Réinitialiser la vue rapide
            </button>
          )}

          <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tableau
            </button>

            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pipeline
            </button>
          </div>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-5xl xl:grid-cols-5">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher..."
            className={INPUT_CLASS}
          />

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="all">Tous les scores</option>
            <option value="high">Score élevé (≥ 50)</option>
            <option value="medium">Score moyen (30 - 49)</option>
            <option value="low">Score faible (&lt; 30)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="all">Tous statuts</option>
            <option value="NEW">Nouveau</option>
            <option value="TO_REVIEW">À analyser</option>
            <option value="QUALIFIED">Qualifié</option>
            <option value="CONTACTED">Contacté</option>
            <option value="FOLLOW_UP">Relance</option>
            <option value="WON">Gagné</option>
            <option value="CLIENT">Déjà client</option>
            <option value="LOST">Perdu</option>
            <option value="ARCHIVED">Archivé</option>
          </select>

          <input
            type="text"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            placeholder="Dépt"
            maxLength={2}
            className={INPUT_CLASS}
          />

          <label className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showClosedCompanies}
              onChange={(e) => setShowClosedCompanies(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>Afficher aussi les clôturés</span>
          </label>
        </div>
      </div>
    </div>
  );
}

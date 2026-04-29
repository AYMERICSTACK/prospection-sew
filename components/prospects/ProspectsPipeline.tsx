"use client";

import type { Company, PipelineGroup } from "../../lib/types";
import {
  ACTIVITY_RESULT_COLORS,
  ACTIVITY_RESULT_LABELS,
} from "../../lib/constants";
import { getFollowUpBadge, getPipelineStatus } from "../../lib/helpers";

type KanbanGroup = {
  key: PipelineGroup;
  label: string;
  description: string;
  className: string;
  companies: Company[];
};

type Props = {
  kanbanGroups: KanbanGroup[];
  quickActionId: string | null;
  setExpandedCompanyId: (companyId: string) => void;
  setViewMode: (mode: "table" | "kanban") => void;
  handleQuickCommercialAction: (
    companyId: string,
    result: string,
    type?: string,
  ) => void;
  handleMarkAsClient: (company: Company) => void;
};

export default function ProspectsPipeline({
  kanbanGroups,
  quickActionId,
  setExpandedCompanyId,
  setViewMode,
  handleQuickCommercialAction,
  handleMarkAsClient,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {kanbanGroups.map((column) => (
        <div
          key={column.key}
          className={`min-h-[520px] rounded-[28px] border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] ${column.className}`}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {column.label}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {column.description}
              </div>
            </div>

            <span className="rounded-full border border-white/70 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
              {column.companies.length}
            </span>
          </div>

          <div className="space-y-3">
            {column.companies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-400">
                Aucun prospect
              </div>
            ) : (
              column.companies.map((company) => {
                const score = company.prospect?.score ?? 0;
                const pipelineStatus = getPipelineStatus(company);
                const followUpBadge = getFollowUpBadge(company);

                return (
                  <div
                    key={company.id}
                    className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-950">
                          {company.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {company.city || "-"}
                          {company.region ? ` • ${company.region}` : ""}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          score >= 50
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : score >= 30
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {score}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pipelineStatus.className}`}
                      >
                        {pipelineStatus.label}
                      </span>

                      {company.lastContactResult && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            ACTIVITY_RESULT_COLORS[company.lastContactResult] ??
                            "border border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ACTIVITY_RESULT_LABELS[company.lastContactResult] ??
                            company.lastContactResult}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-700">
                          Relance :
                        </span>{" "}
                        {company.nextFollowUpAt
                          ? new Date(company.nextFollowUpAt).toLocaleDateString(
                              "fr-FR",
                            )
                          : "-"}
                      </div>

                      {followUpBadge && (
                        <div>
                          <span className={followUpBadge.className}>
                            {followUpBadge.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedCompanyId(company.id);
                          setViewMode("table");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Ouvrir
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickCommercialAction(
                            company.id,
                            "TO_CALL_BACK",
                            "FOLLOW_UP",
                          )
                        }
                        disabled={
                          quickActionId === `${company.id}-TO_CALL_BACK`
                        }
                        className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70"
                      >
                        Relancer
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkAsClient(company)}
                        disabled={quickActionId === `${company.id}-CLIENT`}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-70"
                      >
                        Client
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

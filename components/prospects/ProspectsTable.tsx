"use client";

import { Fragment } from "react";
import { STATUS_LABELS } from "../../lib/prospect-status";

import type {
  ActivityFormState,
  Company,
  WebsiteCandidatesMap,
} from "../../lib/types";

import {
  ACTIVITY_RESULT_COLORS,
  ACTIVITY_RESULT_LABELS,
  ACTIVITY_TYPE_LABELS,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  COMMERCIAL_STAGE_COLORS,
  COMMERCIAL_STAGE_LABELS,
  INPUT_CLASS,
} from "../../lib/constants";

import {
  formatDate,
  getFollowUpBadge,
  getPipelineStatus,
  getRowHighlightClass,
} from "../../lib/helpers";

type Props = {
  companies: Company[];
  loading: boolean;

  expandedCompanyId: string | null;
  toggleExpanded: (companyId: string) => void;

  websiteCandidatesByCompanyId: WebsiteCandidatesMap;

  findingWebsiteId: string | null;
  savingWebsiteId: string | null;
  enrichingContactId: string | null;
  savingActivityId: string | null;
  quickActionId: string | null;

  getActivityForm: (companyId: string) => ActivityFormState;

  updateActivityForm: (
    companyId: string,
    field: keyof ActivityFormState,
    value: string,
  ) => void;

  handleFindWebsite: (companyId: string) => void;
  handleUseWebsiteCandidate: (company: Company, candidateUrl: string) => void;
  handleEnrichContact: (companyId: string) => void;
  handleEditCompany: (company: Company) => void;
  handleDeleteCompany: (companyId: string) => void;
  handleEnrichCompany: (companyId: string) => void;
  handleCreateActivity: (companyId: string) => void;

  handleQuickCommercialAction: (
    companyId: string,
    result: string,
    type?: string,
  ) => void;

  handleMarkAsClient: (company: Company) => void;
};

export default function ProspectsTable({
  companies,
  loading,
  expandedCompanyId,
  toggleExpanded,
  websiteCandidatesByCompanyId,
  findingWebsiteId,
  savingWebsiteId,
  enrichingContactId,
  savingActivityId,
  quickActionId,
  getActivityForm,
  updateActivityForm,
  handleFindWebsite,
  handleUseWebsiteCandidate,
  handleEnrichContact,
  handleEditCompany,
  handleDeleteCompany,
  handleEnrichCompany,
  handleCreateActivity,
  handleQuickCommercialAction,
  handleMarkAsClient,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      {loading ? (
        <div className="px-6 py-10 text-sm text-slate-500">Chargement...</div>
      ) : companies.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">
          Aucun prospect trouvé.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-slate-500">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Entreprise
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Ville
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  NAF
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Contact
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Score
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Suivi commercial
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Statut
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => {
                const score = company.prospect?.score ?? 0;
                const candidates =
                  websiteCandidatesByCompanyId[company.id] ?? [];
                const isExpanded = expandedCompanyId === company.id;
                const followUpBadge = getFollowUpBadge(company);
                const rowHighlightClass = getRowHighlightClass(company);
                const pipelineStatus = getPipelineStatus(company);

                return (
                  <Fragment key={company.id}>
                    <tr
                      className={`group border-t border-slate-100 align-top transition-all hover:bg-slate-50/80 hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)] ${rowHighlightClass}`}
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(company.id)}
                          className="w-full text-left"
                        >
                          <div className="font-semibold leading-7 text-slate-950 transition group-hover:text-blue-600">
                            {company.name}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            <span>
                              {isExpanded
                                ? "Masquer les détails"
                                : "Voir les détails"}
                            </span>

                            {company.website && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                Site OK
                              </span>
                            )}

                            {company.email && (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                Email OK
                              </span>
                            )}

                            {followUpBadge && (
                              <span className={followUpBadge.className}>
                                {followUpBadge.label}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {company.city || "-"}
                      </td>

                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        <div>{company.nafCode || "-"}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {company.nafLabel || ""}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-2">
                          {company.email ? (
                            <div>
                              <div className="break-all text-sm font-medium text-slate-800">
                                {company.email}
                              </div>

                              {company.emailSource && (
                                <div className="mt-1">
                                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                    {company.emailSource === "website"
                                      ? "Trouvé sur site"
                                      : company.emailSource}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : company.website ? (
                            <div className="text-xs text-slate-500">
                              Site présent, email non trouvé
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">
                              Aucun contact
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            score >= 50
                              ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                              : score >= 30
                                ? "border-amber-200 bg-amber-100 text-amber-700"
                                : "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {score}
                        </span>

                        <div className="mt-1 text-[11px] text-slate-500">
                          {score >= 50
                            ? "Très pertinent"
                            : score >= 30
                              ? "Potentiel intéressant"
                              : "À qualifier"}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="space-y-2 rounded-xl bg-slate-50/80 p-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                COMMERCIAL_STAGE_COLORS[
                                  company.commercialStage ?? "PROSPECT"
                                ] ??
                                "border border-slate-200 bg-slate-100 text-slate-700"
                              }`}
                            >
                              {COMMERCIAL_STAGE_LABELS[
                                company.commercialStage ?? "PROSPECT"
                              ] ??
                                company.commercialStage ??
                                "Prospect"}
                            </span>

                            {company.lastContactResult && (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  ACTIVITY_RESULT_COLORS[
                                    company.lastContactResult
                                  ] ??
                                  "border border-slate-200 bg-slate-100 text-slate-700"
                                }`}
                              >
                                {ACTIVITY_RESULT_LABELS[
                                  company.lastContactResult
                                ] ?? company.lastContactResult}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] leading-5 text-slate-500">
                            <span className="font-medium text-slate-700">
                              Relance :
                            </span>{" "}
                            {company.nextFollowUpAt
                              ? new Date(
                                  company.nextFollowUpAt,
                                ).toLocaleDateString("fr-FR")
                              : "-"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${pipelineStatus.className}`}
                          >
                            {pipelineStatus.label}
                          </span>

                          <div className="text-[11px] text-slate-400">
                            {STATUS_LABELS[
                              company.commercialStage === "CLIENT"
                                ? "CLIENT"
                                : (company.prospect?.status ?? "NEW")
                            ] ??
                              company.prospect?.status ??
                              "Nouveau"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(company.id)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {isExpanded ? "Masquer" : "Détails"}
                          </button>

                          {!company.website && (
                            <button
                              type="button"
                              onClick={() => handleFindWebsite(company.id)}
                              disabled={findingWebsiteId === company.id}
                              className="rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {findingWebsiteId === company.id
                                ? "Recherche..."
                                : "Site"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEnrichContact(company.id)}
                            disabled={enrichingContactId === company.id}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {enrichingContactId === company.id
                              ? "Recherche..."
                              : "Email"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditCompany(company)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCompany(company.id)}
                            className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="group border-t border-slate-100 align-top transition-all hover:bg-slate-50/80">
                        <td colSpan={8} className="px-5 py-3">
                          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Informations
                                  </div>

                                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Région :
                                      </span>{" "}
                                      {company.region || "-"}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Site :
                                      </span>{" "}
                                      {company.website ? (
                                        <a
                                          href={company.website}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {company.website}
                                        </a>
                                      ) : (
                                        "-"
                                      )}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Email :
                                      </span>{" "}
                                      {company.email || "-"}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Effectif :
                                      </span>{" "}
                                      {company.employeeRange || "-"}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Dernier contact :
                                      </span>{" "}
                                      {formatDate(company.lastContactAt)}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Prochaine relance :
                                      </span>{" "}
                                      {formatDate(company.nextFollowUpAt)}
                                    </div>

                                    <div>
                                      <span className="font-medium text-slate-800">
                                        Dernier résultat :
                                      </span>{" "}
                                      {company.lastContactResult
                                        ? (ACTIVITY_RESULT_LABELS[
                                            company.lastContactResult
                                          ] ?? company.lastContactResult)
                                        : "-"}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Qualification
                                  </div>

                                  <div className="mt-3 space-y-3">
                                    <div>
                                      <div className="text-xs font-medium text-slate-500">
                                        Pourquoi pertinent
                                      </div>
                                      <div className="mt-1 text-sm text-slate-700">
                                        {company.prospect?.whyRelevant || "-"}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs font-medium text-slate-500">
                                        Angle d’approche
                                      </div>
                                      <div className="mt-1 text-sm font-medium text-blue-600">
                                        {company.prospect?.pitchAngle || "-"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {candidates.length > 0 && (
                                <div className="space-y-4 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                      Sites candidats
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {candidates.length} résultat(s)
                                    </div>
                                  </div>

                                  <div className="grid gap-3 md:grid-cols-2">
                                    {candidates.map((candidate, index) => (
                                      <div
                                        key={candidate.url}
                                        className={`rounded-2xl border p-4 ${
                                          index === 0
                                            ? "border-emerald-300 bg-emerald-50/40"
                                            : "border-slate-200 bg-white"
                                        }`}
                                      >
                                        <div className="text-sm font-semibold text-blue-600">
                                          {candidate.hostname}
                                        </div>

                                        <div className="text-xs text-slate-500 break-all">
                                          {candidate.url}
                                        </div>

                                        <div className="mt-2 text-xs text-slate-500">
                                          {candidate.reason}
                                        </div>

                                        <button
                                          onClick={() =>
                                            handleUseWebsiteCandidate(
                                              company,
                                              candidate.url,
                                            )
                                          }
                                          disabled={
                                            savingWebsiteId === company.id
                                          }
                                          className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                                        >
                                          {savingWebsiteId === company.id
                                            ? "..."
                                            : "Utiliser"}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-4 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Historique commercial
                                </div>

                                {!company.activities?.length ? (
                                  <div className="text-sm text-slate-500">
                                    Aucune action commerciale
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {company.activities.map((activity) => (
                                      <div
                                        key={activity.id}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                      >
                                        <div className="text-xs text-slate-500">
                                          {formatDate(activity.actionDate)}
                                        </div>

                                        <div className="text-sm font-medium">
                                          {ACTIVITY_TYPE_LABELS[
                                            activity.type
                                          ] ?? activity.type}
                                        </div>

                                        {activity.result && (
                                          <span className="text-xs">
                                            {
                                              ACTIVITY_RESULT_LABELS[
                                                activity.result
                                              ]
                                            }
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ACTIONS RAPIDES */}
                            <div className="space-y-4">
                              <button
                                onClick={() =>
                                  handleQuickCommercialAction(
                                    company.id,
                                    "TO_CALL_BACK",
                                  )
                                }
                                className="w-full bg-amber-100 p-3 rounded-xl text-sm"
                              >
                                Relancer
                              </button>

                              <button
                                onClick={() =>
                                  handleQuickCommercialAction(
                                    company.id,
                                    "NOT_INTERESTED",
                                  )
                                }
                                className="w-full bg-red-100 p-3 rounded-xl text-sm"
                              >
                                Pas intéressé
                              </button>

                              <button
                                onClick={() => handleMarkAsClient(company)}
                                className="w-full bg-emerald-100 p-3 rounded-xl text-sm"
                              >
                                Déjà client
                              </button>

                              <button
                                onClick={() => handleEnrichCompany(company.id)}
                                className={BUTTON_SECONDARY}
                              >
                                Enrichir
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import type { Company, PipelineGroup } from "./types";
import { CLOSED_RESULTS } from "./constants";

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
}

export function isClosedCompany(company: Company) {
  const lastResult = company.lastContactResult ?? null;
  const commercialStage = company.commercialStage ?? "PROSPECT";
  const status =
    company.commercialStage === "CLIENT"
      ? "CLIENT"
      : (company.prospect?.status ?? "NEW");

  const isClosedByResult = lastResult
    ? CLOSED_RESULTS.includes(lastResult)
    : false;

  const isClosedByStatus = status === "LOST" || status === "ARCHIVED";
  const isClosedByStage = commercialStage === "INACTIVE";

  return isClosedByResult || isClosedByStatus || isClosedByStage;
}

export function getFollowUpBucket(company: Company) {
  if (!company.nextFollowUpAt) return "none";

  const now = new Date();
  const followUpDate = new Date(company.nextFollowUpAt);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (followUpDate < today) return "overdue";
  if (followUpDate >= today && followUpDate < tomorrow) return "today";

  return "future";
}

export function getRowHighlightClass(company: Company) {
  const bucket = getFollowUpBucket(company);

  if (bucket === "overdue") {
    return "bg-red-50/70 hover:bg-red-50";
  }

  if (bucket === "today") {
    return "bg-amber-50/70 hover:bg-amber-50";
  }

  return "hover:bg-slate-50/70";
}

export function getFollowUpBadge(company: Company) {
  const bucket = getFollowUpBucket(company);

  if (bucket === "overdue") {
    return {
      label: "Relance en retard",
      className:
        "rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700",
    };
  }

  if (bucket === "today") {
    return {
      label: "À relancer aujourd’hui",
      className:
        "rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700",
    };
  }

  return null;
}

export function getPipelineStatus(company: Company) {
  const status =
    company.commercialStage === "CLIENT"
      ? "CLIENT"
      : (company.prospect?.status ?? "NEW");

  const lastResult = company.lastContactResult ?? null;

  if (company.commercialStage === "CLIENT") {
    return {
      label: "Déjà client",
      className: "border border-emerald-300 bg-emerald-100 text-emerald-800",
    };
  }

  if (
    company.commercialStage === "INACTIVE" ||
    status === "LOST" ||
    status === "ARCHIVED" ||
    (lastResult && CLOSED_RESULTS.includes(lastResult))
  ) {
    return {
      label: "Perdu / hors cible",
      className: "border border-red-200 bg-red-50 text-red-700",
    };
  }

  if (
    company.commercialStage === "TARGET" ||
    status === "CONTACTED" ||
    status === "FOLLOW_UP" ||
    status === "WON"
  ) {
    return {
      label: "En discussion",
      className: "border border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  return {
    label: "Prospect",
    className: "border border-slate-200 bg-slate-100 text-slate-700",
  };
}

export function getPipelineGroup(company: Company): PipelineGroup {
  const status =
    company.commercialStage === "CLIENT"
      ? "CLIENT"
      : (company.prospect?.status ?? "NEW");

  const lastResult = company.lastContactResult ?? null;

  if (company.commercialStage === "CLIENT") return "client";

  if (
    company.commercialStage === "INACTIVE" ||
    status === "LOST" ||
    status === "ARCHIVED" ||
    (lastResult && CLOSED_RESULTS.includes(lastResult))
  ) {
    return "lost";
  }

  if (
    company.commercialStage === "TARGET" ||
    status === "CONTACTED" ||
    status === "FOLLOW_UP" ||
    status === "WON"
  ) {
    return "discussion";
  }

  return "prospect";
}

export async function readJsonSafely(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

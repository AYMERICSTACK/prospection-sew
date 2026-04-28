"use client";

import { Fragment, useEffect, useState } from "react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/prospect-status";

type Company = {
  id: string;
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  siren?: string | null;
  nafCode?: string | null;
  nafLabel?: string | null;
  city?: string | null;
  region?: string | null;
  website?: string | null;
  email?: string | null;
  emailStatus?: string | null;
  emailSource?: string | null;
  employeeRange?: string | null;
  postalCode?: string | null;
  commercialStage?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  lastContactResult?: string | null;
  activities?: CompanyActivity[];
  prospect?: {
    score: number;
    whyRelevant?: string | null;
    pitchAngle?: string | null;
    status?: string | null;
    websiteScan?: string | null;
    websiteScore?: number | null;
  } | null;
};

type CompaniesResponse = {
  success: boolean;
  count: number;
  data: Company[];
};

type WebsiteCandidate = {
  url: string;
  hostname: string;
  source: "domain-guess" | "serpapi";
  score: number;
  searchScore?: number;
  validationScore?: number;
  reason: string;
  title?: string;
  snippet?: string;
  query?: string;
};

type WebsiteCandidatesMap = Record<string, WebsiteCandidate[]>;

type CompanyActivity = {
  id: string;
  type: string;
  result?: string | null;
  notes?: string | null;
  actionDate: string;
  nextFollowUpAt?: string | null;
};

type ActivityFormState = {
  type: string;
  result: string;
  notes: string;
  actionDate: string;
  nextFollowUpAt: string;
};

const INITIAL_FORM = {
  name: "",
  tradeName: "",
  businessKeywords: "",
  siren: "",
  nafCode: "",
  nafLabel: "",
  city: "",
  region: "",
  website: "",
  employeeRange: "",
  commercialStage: "PROSPECT",
};

const INITIAL_IMPORT_FORM = {
  query: "",
  department: "",
  nafCode: "",
  perPage: "10",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: "Appel",
  EMAIL: "Email",
  VISIT: "Visite",
  FLYER: "Flyer / prospectus",
  FOLLOW_UP: "Relance",
  NOTE: "Note",
};

const ACTIVITY_RESULT_LABELS: Record<string, string> = {
  NO_ANSWER: "Pas de réponse",
  NOT_INTERESTED: "Pas intéressé",
  TO_CALL_BACK: "À recontacter",
  INTERESTED: "Intéressé",
  APPOINTMENT_TO_SCHEDULE: "RDV à planifier",
  APPOINTMENT_BOOKED: "RDV pris",
  QUOTE_REQUESTED: "Devis demandé",
  ALREADY_EQUIPPED: "Déjà équipé",
  WRONG_CONTACT: "Mauvais contact",
  INFORMATION_SENT: "Infos envoyées",
  OTHER: "Autre",
};

const COMMERCIAL_STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  TARGET: "Compte cible",
  CLIENT: "Client",
  INACTIVE: "Inactif",
};

const COMMERCIAL_STAGE_COLORS: Record<string, string> = {
  PROSPECT: "border border-slate-200 bg-slate-100 text-slate-700",
  TARGET: "border border-blue-200 bg-blue-100 text-blue-700",
  CLIENT: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  INACTIVE: "border border-slate-300 bg-slate-200 text-slate-600",
};

const ACTIVITY_RESULT_COLORS: Record<string, string> = {
  NO_ANSWER: "border border-slate-200 bg-slate-100 text-slate-700",
  NOT_INTERESTED: "border border-red-200 bg-red-100 text-red-700",
  TO_CALL_BACK: "border border-amber-200 bg-amber-100 text-amber-700",
  INTERESTED: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  APPOINTMENT_TO_SCHEDULE: "border border-blue-200 bg-blue-100 text-blue-700",
  APPOINTMENT_BOOKED: "border border-violet-200 bg-violet-100 text-violet-700",
  QUOTE_REQUESTED: "border border-cyan-200 bg-cyan-100 text-cyan-700",
  ALREADY_EQUIPPED: "border border-slate-300 bg-slate-200 text-slate-700",
  WRONG_CONTACT: "border border-orange-200 bg-orange-100 text-orange-700",
  INFORMATION_SENT: "border border-indigo-200 bg-indigo-100 text-indigo-700",
  OTHER: "border border-slate-200 bg-slate-100 text-slate-700",
};

const CLOSED_RESULTS = ["NOT_INTERESTED", "ALREADY_EQUIPPED", "WRONG_CONTACT"];

const SURFACE_CARD =
  "rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

const SURFACE_CARD_SOFT =
  "rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.05)]";

const INPUT_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const BUTTON_PRIMARY =
  "inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70";

const BUTTON_SECONDARY =
  "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm";

const BUTTON_GHOST =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50";

const LABEL_MUTED =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
}

function isClosedCompany(company: Company) {
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
  const isClosedByStage =
    commercialStage === "INACTIVE" || commercialStage === "CLIENT";

  return isClosedByResult || isClosedByStatus || isClosedByStage;
}

function getFollowUpBucket(company: Company) {
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

function getRowHighlightClass(company: Company) {
  const bucket = getFollowUpBucket(company);

  if (bucket === "overdue") {
    return "bg-red-50/70 hover:bg-red-50";
  }

  if (bucket === "today") {
    return "bg-amber-50/70 hover:bg-amber-50";
  }

  return "hover:bg-slate-50/70";
}

function getFollowUpBadge(company: Company) {
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

function getPipelineStatus(company: Company) {
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

type PipelineGroup = "prospect" | "discussion" | "client" | "lost";

function getPipelineGroup(company: Company): PipelineGroup {
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

const PIPELINE_COLUMNS: {
  key: PipelineGroup;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    key: "prospect",
    label: "Prospect",
    description: "À qualifier",
    className: "border-slate-200 bg-slate-50",
  },
  {
    key: "discussion",
    label: "En discussion",
    description: "Contact, relance, RDV",
    className: "border-blue-200 bg-blue-50/70",
  },
  {
    key: "client",
    label: "Déjà client",
    description: "À sortir de la prospection",
    className: "border-emerald-200 bg-emerald-50/70",
  },
  {
    key: "lost",
    label: "Perdu / hors cible",
    description: "Pas intéressé ou inactif",
    className: "border-red-200 bg-red-50/70",
  },
];

const INITIAL_ACTIVITY_FORM: ActivityFormState = {
  type: "CALL",
  result: "TO_CALL_BACK",
  notes: "",
  actionDate: new Date().toISOString().slice(0, 16),
  nextFollowUpAt: "",
};

async function readJsonSafely(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function ProspectsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [filter, setFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [importForm, setImportForm] = useState(INITIAL_IMPORT_FORM);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [websiteCandidatesByCompanyId, setWebsiteCandidatesByCompanyId] =
    useState<WebsiteCandidatesMap>({});
  const [findingWebsiteId, setFindingWebsiteId] = useState<string | null>(null);
  const [savingWebsiteId, setSavingWebsiteId] = useState<string | null>(null);
  const [enrichingContactId, setEnrichingContactId] = useState<string | null>(
    null,
  );
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
    null,
  );
  const [activityFormByCompanyId, setActivityFormByCompanyId] = useState<
    Record<string, ActivityFormState>
  >({});
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null);
  const [showClosedCompanies, setShowClosedCompanies] = useState(false);
  const [quickFilter, setQuickFilter] = useState<
    "all" | "today" | "overdue" | "active" | "closed"
  >("all");
  const [quickActionId, setQuickActionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  async function loadCompanies() {
    try {
      setLoading(true);

      const res = await fetch("/api/companies", {
        cache: "no-store",
      });

      const data: CompaniesResponse = await res.json();
      setCompanies(data.data ?? []);
    } catch (error) {
      console.error("Erreur technique loadCompanies:", error);
      setMessage({
        type: "error",
        text: "Impossible de récupérer les entreprises.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function handleEditCompany(company: Company) {
    setEditingCompanyId(company.id);
    setForm({
      name: company.name ?? "",
      tradeName: company.tradeName ?? "",
      businessKeywords: company.businessKeywords ?? "",
      siren: company.siren ?? "",
      nafCode: company.nafCode ?? "",
      nafLabel: company.nafLabel ?? "",
      city: company.city ?? "",
      region: company.region ?? "",
      website: company.website ?? "",
      employeeRange: company.employeeRange ?? "",
      commercialStage: company.commercialStage ?? "PROSPECT",
    });

    setMessage(null);
  }

  function resetForm() {
    setEditingCompanyId(null);
    setForm(INITIAL_FORM);
  }

  function toggleExpanded(companyId: string) {
    setExpandedCompanyId((prev) => (prev === companyId ? null : companyId));
  }

  function getActivityForm(companyId: string) {
    return activityFormByCompanyId[companyId] ?? INITIAL_ACTIVITY_FORM;
  }

  function updateActivityForm(
    companyId: string,
    field: keyof ActivityFormState,
    value: string,
  ) {
    setActivityFormByCompanyId((prev) => ({
      ...prev,
      [companyId]: {
        ...(prev[companyId] ?? INITIAL_ACTIVITY_FORM),
        [field]: value,
      },
    }));
  }

  async function handleCreateCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage(null);

      const isEditing = Boolean(editingCompanyId);

      const res = await fetch(
        isEditing ? `/api/companies/${editingCompanyId}` : "/api/companies",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            data?.message || "Erreur lors de l’enregistrement de l’entreprise.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: isEditing
          ? "Entreprise modifiée avec succès ✅"
          : "Entreprise ajoutée avec succès ✅",
      });

      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleCreateCompany:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’enregistrement de l’entreprise.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImportCompanies(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch("/api/import-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: importForm.query,
          department: importForm.department,
          nafCode: importForm.nafCode,
          perPage: Number(importForm.perPage),
        }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            [data?.message, data?.details].filter(Boolean).join(" — ") ||
            "Erreur lors de l’import automatique.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `${data.count} entreprise(s) importée(s) automatiquement ✅`,
      });

      setImportForm(INITIAL_IMPORT_FORM);
      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleImportCompanies:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’import automatique.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnrichCompany(companyId: string) {
    try {
      setMessage(null);

      const res = await fetch("/api/enrich-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            [data?.message, data?.details].filter(Boolean).join(" — ") ||
            "Erreur lors de l’enrichissement.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Enrichissement du site effectué ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleEnrichCompany:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’enrichissement du site.",
      });
    }
  }

  async function handleFindWebsite(companyId: string) {
    try {
      setMessage(null);
      setFindingWebsiteId(companyId);

      const res = await fetch("/api/find-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setWebsiteCandidatesByCompanyId((prev) => ({
          ...prev,
          [companyId]: [],
        }));

        setMessage({
          type: "error",
          text:
            [data?.message, data?.details].filter(Boolean).join(" — ") ||
            "Erreur lors de la détection du site.",
        });
        return;
      }

      const candidates: WebsiteCandidate[] = data?.data?.candidates ?? [];

      setWebsiteCandidatesByCompanyId((prev) => ({
        ...prev,
        [companyId]: candidates,
      }));

      setExpandedCompanyId(companyId);

      setMessage({
        type: "success",
        text:
          data?.message ||
          `${candidates.length} site(s) candidat(s) trouvé(s) ✅`,
      });
    } catch (error) {
      console.error("Erreur technique handleFindWebsite:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de la détection automatique du site.",
      });
    } finally {
      setFindingWebsiteId(null);
    }
  }

  async function handleUseWebsiteCandidate(
    company: Company,
    candidateUrl: string,
  ) {
    try {
      setMessage(null);
      setSavingWebsiteId(company.id);

      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: company.name ?? "",
          tradeName: company.tradeName ?? "",
          businessKeywords: company.businessKeywords ?? "",
          siren: company.siren ?? "",
          nafCode: company.nafCode ?? "",
          nafLabel: company.nafLabel ?? "",
          city: company.city ?? "",
          region: company.region ?? "",
          website: candidateUrl,
          email: company.email ?? "",
          emailStatus: company.emailStatus ?? "",
          emailSource: company.emailSource ?? "",
          employeeRange: company.employeeRange ?? "",
          commercialStage: company.commercialStage ?? "PROSPECT",
        }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.message || "Erreur lors de l’enregistrement du site.",
        });
        return;
      }

      setWebsiteCandidatesByCompanyId((prev) => {
        const next = { ...prev };
        delete next[company.id];
        return next;
      });

      setMessage({
        type: "success",
        text: "Site web enregistré avec succès ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleUseWebsiteCandidate:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’enregistrement du site.",
      });
    } finally {
      setSavingWebsiteId(null);
    }
  }

  async function handleEnrichContact(companyId: string) {
    try {
      setMessage(null);
      setEnrichingContactId(companyId);

      const res = await fetch("/api/enrich-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            [data?.message, data?.details].filter(Boolean).join(" — ") ||
            "Erreur lors de la recherche de l’email.",
        });
        await loadCompanies();
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Email trouvé avec succès ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleEnrichContact:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de la recherche de l’email.",
      });
    } finally {
      setEnrichingContactId(null);
    }
  }

  async function handleCreateActivity(companyId: string) {
    try {
      const form = getActivityForm(companyId);

      setMessage(null);
      setSavingActivityId(companyId);

      const res = await fetch("/api/company-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          type: form.type,
          result: form.result,
          notes: form.notes,
          actionDate: form.actionDate,
          nextFollowUpAt: form.nextFollowUpAt || null,
        }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            data?.message ||
            "Erreur lors de l’enregistrement de l’action commerciale.",
        });
        return;
      }

      setActivityFormByCompanyId((prev) => ({
        ...prev,
        [companyId]: {
          ...INITIAL_ACTIVITY_FORM,
          actionDate: new Date().toISOString().slice(0, 16),
        },
      }));

      setMessage({
        type: "success",
        text: data?.message || "Action commerciale enregistrée ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleCreateActivity:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’enregistrement de l’action.",
      });
    } finally {
      setSavingActivityId(null);
    }
  }

  async function handleQuickCommercialAction(
    companyId: string,
    result: string,
    type: string = "FOLLOW_UP",
  ) {
    try {
      setMessage(null);
      setQuickActionId(`${companyId}-${result}`);

      const now = new Date();
      const nextFollowUp = new Date(now);

      if (result === "TO_CALL_BACK") {
        nextFollowUp.setDate(nextFollowUp.getDate() + 2);
      }

      if (result === "APPOINTMENT_BOOKED") {
        nextFollowUp.setDate(nextFollowUp.getDate() + 7);
      }

      const shouldSetFollowUp =
        result === "TO_CALL_BACK" || result === "APPOINTMENT_BOOKED";

      const res = await fetch("/api/company-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          type,
          result,
          notes: "",
          actionDate: now.toISOString(),
          nextFollowUpAt: shouldSetFollowUp ? nextFollowUp.toISOString() : null,
        }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text:
            data?.message ||
            "Erreur lors de l’enregistrement de l’action rapide.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Action rapide enregistrée ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleQuickCommercialAction:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de l’action rapide.",
      });
    } finally {
      setQuickActionId(null);
    }
  }

  async function handleMarkAsClient(company: Company) {
    try {
      setMessage(null);
      setQuickActionId(`${company.id}-CLIENT`);

      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: company.name ?? "",
          tradeName: company.tradeName ?? "",
          businessKeywords: company.businessKeywords ?? "",
          siren: company.siren ?? "",
          nafCode: company.nafCode ?? "",
          nafLabel: company.nafLabel ?? "",
          city: company.city ?? "",
          region: company.region ?? "",
          website: company.website ?? "",
          email: company.email ?? "",
          emailStatus: company.emailStatus ?? "",
          emailSource: company.emailSource ?? "",
          employeeRange: company.employeeRange ?? "",
          commercialStage: "CLIENT",
        }),
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.message || "Erreur lors du passage en client.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Entreprise passée en client ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleMarkAsClient:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors du passage en client.",
      });
    } finally {
      setQuickActionId(null);
    }
  }

  async function handleDeleteCompany(companyId: string) {
    const confirmed = window.confirm(
      "Tu veux vraiment supprimer cette entreprise de la base prospects ?",
    );

    if (!confirmed) return;

    try {
      setMessage(null);

      const res = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.message || "Erreur lors de la suppression.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Entreprise supprimée avec succès ✅",
      });

      if (editingCompanyId === companyId) {
        resetForm();
      }

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleDeleteCompany:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors de la suppression.",
      });
    }
  }

  async function handleScoreAll() {
    try {
      setMessage(null);

      const res = await fetch("/api/score-all", {
        cache: "no-store",
      });

      const data = await readJsonSafely(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.message || "Erreur lors du scoring global.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Scoring global effectué ✅",
      });

      await loadCompanies();
    } catch (error) {
      console.error("Erreur technique handleScoreAll:", error);
      setMessage({
        type: "error",
        text: "Erreur technique lors du scoring global.",
      });
    }
  }

  const todayFollowUpsCount = companies.filter(
    (company) =>
      !isClosedCompany(company) && getFollowUpBucket(company) === "today",
  ).length;

  const overdueFollowUpsCount = companies.filter(
    (company) =>
      !isClosedCompany(company) && getFollowUpBucket(company) === "overdue",
  ).length;

  const activeCompaniesCount = companies.filter(
    (company) => !isClosedCompany(company),
  ).length;

  const closedCompaniesCount = companies.filter((company) =>
    isClosedCompany(company),
  ).length;

  const filteredCompanies = companies.filter((company) => {
    const search = filter.toLowerCase();
    const score = company.prospect?.score ?? 0;
    const status =
      company.commercialStage === "CLIENT"
        ? "CLIENT"
        : (company.prospect?.status ?? "NEW");
    const postalCode = company.postalCode ?? "";
    const department = postalCode ? postalCode.slice(0, 2) : "";
    const lastResult = company.lastContactResult ?? null;
    const commercialStage = company.commercialStage ?? "PROSPECT";

    const matchesSearch =
      company.name.toLowerCase().includes(search) ||
      (company.city ?? "").toLowerCase().includes(search) ||
      (company.region ?? "").toLowerCase().includes(search) ||
      (company.nafCode ?? "").toLowerCase().includes(search) ||
      (company.nafLabel ?? "").toLowerCase().includes(search) ||
      (company.tradeName ?? "").toLowerCase().includes(search) ||
      (company.businessKeywords ?? "").toLowerCase().includes(search) ||
      (company.email ?? "").toLowerCase().includes(search);

    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && score >= 50) ||
      (scoreFilter === "medium" && score >= 30 && score < 50) ||
      (scoreFilter === "low" && score < 30);

    const matchesStatus = statusFilter === "all" || status === statusFilter;

    const matchesDepartment =
      !departmentFilter || department === departmentFilter;

    const isClosedByResult = lastResult
      ? CLOSED_RESULTS.includes(lastResult)
      : false;
    const isClosedByStatus = status === "LOST" || status === "ARCHIVED";
    const isClosedByStage =
      commercialStage === "INACTIVE" || commercialStage === "CLIENT";

    const isClosed = isClosedByResult || isClosedByStatus || isClosedByStage;

    const followUpBucket = getFollowUpBucket(company);

    const matchesClosedFilter = showClosedCompanies ? true : !isClosed;

    const matchesQuickFilter =
      quickFilter === "all" ||
      (quickFilter === "today" && !isClosed && followUpBucket === "today") ||
      (quickFilter === "overdue" &&
        !isClosed &&
        followUpBucket === "overdue") ||
      (quickFilter === "active" && !isClosed) ||
      (quickFilter === "closed" && isClosed);

    return (
      matchesSearch &&
      matchesScore &&
      matchesStatus &&
      matchesDepartment &&
      matchesClosedFilter &&
      matchesQuickFilter
    );
  });

  const kanbanGroups = PIPELINE_COLUMNS.map((column) => ({
    ...column,
    companies: filteredCompanies.filter(
      (company) => getPipelineGroup(company) === column.key,
    ),
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.05),_transparent_20%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
                      {companies.length}
                    </span>{" "}
                    entreprises en base
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {activeCompaniesCount}
                    </span>{" "}
                    actives
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {overdueFollowUpsCount}
                    </span>{" "}
                    relances en retard
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={loadCompanies}
                  className={BUTTON_SECONDARY}
                >
                  Rafraîchir
                </button>

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

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className={`${SURFACE_CARD} p-6`}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Import automatique
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Recherche et import direct d’entreprises françaises depuis une
                  source publique.
                </p>
              </div>

              <form onSubmit={handleImportCompanies} className="space-y-4">
                <Field
                  label="Recherche"
                  value={importForm.query}
                  onChange={(value) =>
                    setImportForm((prev) => ({ ...prev, query: value }))
                  }
                  placeholder="convoyeur, maintenance industrielle, machines spéciales..."
                />

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  <Field
                    label="Département"
                    value={importForm.department}
                    onChange={(value) =>
                      setImportForm((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                    placeholder="01 / 69 / 42..."
                  />

                  <Field
                    label="Code NAF"
                    value={importForm.nafCode}
                    onChange={(value) =>
                      setImportForm((prev) => ({ ...prev, nafCode: value }))
                    }
                    placeholder="2822Z"
                  />

                  <Field
                    label="Nombre"
                    value={importForm.perPage}
                    onChange={(value) =>
                      setImportForm((prev) => ({ ...prev, perPage: value }))
                    }
                    placeholder="10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${BUTTON_PRIMARY}`}
                >
                  {submitting
                    ? "Import en cours..."
                    : "Importer automatiquement"}
                </button>
              </form>
            </div>

            <div className={`${SURFACE_CARD} p-6`}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  {editingCompanyId
                    ? "Modifier l’entreprise"
                    : "Ajouter une entreprise"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {editingCompanyId
                    ? "Mets à jour les informations de l’entreprise sélectionnée."
                    : "Ajout manuel pour enrichir rapidement la base prospects."}
                </p>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <Field
                  label="Nom de l’entreprise *"
                  value={form.name}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, name: value }))
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    label="SIREN"
                    value={form.siren}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, siren: value }))
                    }
                  />
                  <Field
                    label="Code NAF"
                    value={form.nafCode}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, nafCode: value }))
                    }
                  />
                </div>

                <Field
                  label="Libellé NAF"
                  value={form.nafLabel}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, nafLabel: value }))
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    label="Ville"
                    value={form.city}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, city: value }))
                    }
                  />
                  <Field
                    label="Région"
                    value={form.region}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, region: value }))
                    }
                  />
                </div>

                <Field
                  label="Site web"
                  value={form.website}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, website: value }))
                  }
                  placeholder="https://..."
                />

                <Field
                  label="Tranche d’effectif"
                  value={form.employeeRange}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, employeeRange: value }))
                  }
                  placeholder="10-19 / 20-49 / 50-99..."
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${BUTTON_PRIMARY}`}
                >
                  {submitting
                    ? editingCompanyId
                      ? "Modification en cours..."
                      : "Ajout en cours..."
                    : editingCompanyId
                      ? "Enregistrer les modifications"
                      : "Ajouter l’entreprise"}
                </button>

                {editingCompanyId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`w-full ${BUTTON_SECONDARY}`}
                  >
                    Annuler la modification
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                <div className={LABEL_MUTED}>Prospects actifs</div>
                <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                  {activeCompaniesCount}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-500">
                  Encore exploitables commercialement
                </div>
              </button>

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
                <div className={LABEL_MUTED}>Clôturés</div>
                <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                  {closedCompaniesCount}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-500">
                  Perdus, inactifs ou hors cible
                </div>
              </button>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Base prospects
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {filteredCompanies.length} entreprise(s) affichée(s)
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

                  {/* 🔥 AJOUT ICI */}
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
            {viewMode === "table" ? (
              <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
                {loading ? (
                  <div className="px-6 py-10 text-sm text-slate-500">
                    Chargement...
                  </div>
                ) : filteredCompanies.length === 0 ? (
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
                        {filteredCompanies.map((company) => {
                          const score = company.prospect?.score ?? 0;
                          const candidates =
                            websiteCandidatesByCompanyId[company.id] ?? [];
                          const isExpanded = expandedCompanyId === company.id;
                          const followUpBadge = getFollowUpBadge(company);
                          const rowHighlightClass =
                            getRowHighlightClass(company);
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
                                        <span
                                          className={followUpBadge.className}
                                        >
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
                                            company.commercialStage ??
                                              "PROSPECT"
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
                                        onClick={() =>
                                          handleFindWebsite(company.id)
                                        }
                                        disabled={
                                          findingWebsiteId === company.id
                                        }
                                        className="rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                                      >
                                        {findingWebsiteId === company.id
                                          ? "Recherche..."
                                          : "Site"}
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEnrichContact(company.id)
                                      }
                                      disabled={
                                        enrichingContactId === company.id
                                      }
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
                                      onClick={() =>
                                        handleDeleteCompany(company.id)
                                      }
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
                                                {formatDate(
                                                  company.lastContactAt,
                                                )}
                                              </div>
                                              <div>
                                                <span className="font-medium text-slate-800">
                                                  Prochaine relance :
                                                </span>{" "}
                                                {formatDate(
                                                  company.nextFollowUpAt,
                                                )}
                                              </div>
                                              <div>
                                                <span className="font-medium text-slate-800">
                                                  Dernier résultat :
                                                </span>{" "}
                                                {company.lastContactResult
                                                  ? (ACTIVITY_RESULT_LABELS[
                                                      company.lastContactResult
                                                    ] ??
                                                    company.lastContactResult)
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
                                                  {company.prospect
                                                    ?.whyRelevant || "-"}
                                                </div>
                                              </div>

                                              <div>
                                                <div className="text-xs font-medium text-slate-500">
                                                  Angle d’approche
                                                </div>
                                                <div className="mt-1 text-sm font-medium text-blue-600">
                                                  {company.prospect
                                                    ?.pitchAngle || "-"}
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

                                            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                              {candidates.map(
                                                (candidate, index) => (
                                                  <div
                                                    key={candidate.url}
                                                    className={`flex min-w-0 flex-col rounded-[24px] border p-4 shadow-sm transition hover:shadow-md ${
                                                      index === 0
                                                        ? "border-emerald-300 bg-emerald-50/40"
                                                        : "border-slate-200 bg-white"
                                                    }`}
                                                  >
                                                    <div className="flex items-start justify-between gap-3">
                                                      <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                          <a
                                                            href={candidate.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="block break-words text-sm font-semibold leading-5 text-blue-600 hover:underline"
                                                          >
                                                            {candidate.hostname}
                                                          </a>

                                                          {index === 0 && (
                                                            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                              Meilleur candidat
                                                            </span>
                                                          )}
                                                        </div>

                                                        <div className="mt-1 break-all text-xs leading-5 text-slate-500">
                                                          {candidate.url}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                        {candidate.source ===
                                                        "domain-guess"
                                                          ? "Domain guess"
                                                          : "SerpApi"}
                                                      </span>

                                                      <span
                                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                          candidate.score >= 24
                                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            : candidate.score >=
                                                                18
                                                              ? "border-amber-200 bg-amber-50 text-amber-700"
                                                              : "border-slate-200 bg-white text-slate-700"
                                                        }`}
                                                      >
                                                        Score {candidate.score}
                                                      </span>

                                                      {candidate.searchScore !==
                                                        undefined && (
                                                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                                          Search{" "}
                                                          {
                                                            candidate.searchScore
                                                          }
                                                        </span>
                                                      )}

                                                      {candidate.validationScore !==
                                                        undefined && (
                                                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                                          Validation{" "}
                                                          {
                                                            candidate.validationScore
                                                          }
                                                        </span>
                                                      )}
                                                    </div>

                                                    <div className="mt-4 flex-1 space-y-4">
                                                      {candidate.title && (
                                                        <div>
                                                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                            Titre détecté
                                                          </div>
                                                          <div className="line-clamp-3 text-xs font-medium leading-5 text-slate-700">
                                                            {candidate.title}
                                                          </div>
                                                        </div>
                                                      )}

                                                      {candidate.snippet && (
                                                        <div>
                                                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                            Extrait
                                                          </div>
                                                          <div className="line-clamp-4 text-xs leading-5 text-slate-500">
                                                            {candidate.snippet}
                                                          </div>
                                                        </div>
                                                      )}

                                                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                          Analyse
                                                        </div>
                                                        <div className="text-[11px] leading-5 text-slate-500">
                                                          {candidate.reason}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleUseWebsiteCandidate(
                                                            company,
                                                            candidate.url,
                                                          )
                                                        }
                                                        disabled={
                                                          savingWebsiteId ===
                                                          company.id
                                                        }
                                                        className="w-full rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                                      >
                                                        {savingWebsiteId ===
                                                        company.id
                                                          ? "Enregistrement..."
                                                          : "Utiliser ce site"}
                                                      </button>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        <div className="space-y-4 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                              Historique commercial
                                            </div>
                                            <div className="text-xs text-slate-400">
                                              {company.activities?.length ?? 0}{" "}
                                              action(s)
                                            </div>
                                          </div>

                                          {!company.activities ||
                                          company.activities.length === 0 ? (
                                            <div className="text-sm text-slate-500">
                                              Aucune action commerciale
                                              enregistrée pour le moment.
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              {company.activities.map(
                                                (activity) => (
                                                  <div
                                                    key={activity.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                  >
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                      <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                            {ACTIVITY_TYPE_LABELS[
                                                              activity.type
                                                            ] ?? activity.type}
                                                          </span>

                                                          {activity.result && (
                                                            <span
                                                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                                ACTIVITY_RESULT_COLORS[
                                                                  activity
                                                                    .result
                                                                ] ??
                                                                "border border-blue-200 bg-blue-50 text-blue-700"
                                                              }`}
                                                            >
                                                              {ACTIVITY_RESULT_LABELS[
                                                                activity.result
                                                              ] ??
                                                                activity.result}
                                                            </span>
                                                          )}
                                                        </div>

                                                        <div className="mt-2 text-xs text-slate-500">
                                                          {formatDate(
                                                            activity.actionDate,
                                                          )}
                                                        </div>
                                                      </div>

                                                      {activity.nextFollowUpAt && (
                                                        <div className="text-xs text-amber-700">
                                                          Relance :{" "}
                                                          {formatDate(
                                                            activity.nextFollowUpAt,
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>

                                                    {activity.notes && (
                                                      <div className="mt-3 text-sm leading-6 text-slate-600">
                                                        {activity.notes}
                                                      </div>
                                                    )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] backdrop-blur xl:sticky xl:top-6">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                          Actions rapides
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                          Agis rapidement sur cette entreprise
                                          sans quitter la fiche.
                                        </p>

                                        <div className="mt-4 flex flex-col gap-3">
                                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                              Actions express
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleQuickCommercialAction(
                                                    company.id,
                                                    "NOT_INTERESTED",
                                                    "CALL",
                                                  )
                                                }
                                                disabled={
                                                  quickActionId ===
                                                  `${company.id}-NOT_INTERESTED`
                                                }
                                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                                              >
                                                {quickActionId ===
                                                `${company.id}-NOT_INTERESTED`
                                                  ? "..."
                                                  : "Pas intéressé"}
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
                                                  quickActionId ===
                                                  `${company.id}-TO_CALL_BACK`
                                                }
                                                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                                              >
                                                {quickActionId ===
                                                `${company.id}-TO_CALL_BACK`
                                                  ? "..."
                                                  : "À relancer"}
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleQuickCommercialAction(
                                                    company.id,
                                                    "INTERESTED",
                                                    "CALL",
                                                  )
                                                }
                                                disabled={
                                                  quickActionId ===
                                                  `${company.id}-INTERESTED`
                                                }
                                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                                              >
                                                {quickActionId ===
                                                `${company.id}-INTERESTED`
                                                  ? "..."
                                                  : "Intéressé"}
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleQuickCommercialAction(
                                                    company.id,
                                                    "APPOINTMENT_BOOKED",
                                                    "FOLLOW_UP",
                                                  )
                                                }
                                                disabled={
                                                  quickActionId ===
                                                  `${company.id}-APPOINTMENT_BOOKED`
                                                }
                                                className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                                              >
                                                {quickActionId ===
                                                `${company.id}-APPOINTMENT_BOOKED`
                                                  ? "..."
                                                  : "RDV"}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleMarkAsClient(company)
                                                }
                                                disabled={
                                                  quickActionId ===
                                                  `${company.id}-CLIENT`
                                                }
                                                className="rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
                                              >
                                                {quickActionId ===
                                                `${company.id}-CLIENT`
                                                  ? "..."
                                                  : "Déjà client"}
                                              </button>
                                            </div>
                                          </div>

                                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                              Ajouter une action
                                            </div>

                                            <div className="mt-4 space-y-3">
                                              <select
                                                value={
                                                  getActivityForm(company.id)
                                                    .type
                                                }
                                                onChange={(e) =>
                                                  updateActivityForm(
                                                    company.id,
                                                    "type",
                                                    e.target.value,
                                                  )
                                                }
                                                className={INPUT_CLASS}
                                              >
                                                {Object.entries(
                                                  ACTIVITY_TYPE_LABELS,
                                                ).map(([value, label]) => (
                                                  <option
                                                    key={value}
                                                    value={value}
                                                  >
                                                    {label}
                                                  </option>
                                                ))}
                                              </select>

                                              <select
                                                value={
                                                  getActivityForm(company.id)
                                                    .result
                                                }
                                                onChange={(e) =>
                                                  updateActivityForm(
                                                    company.id,
                                                    "result",
                                                    e.target.value,
                                                  )
                                                }
                                                className={INPUT_CLASS}
                                              >
                                                {Object.entries(
                                                  ACTIVITY_RESULT_LABELS,
                                                ).map(([value, label]) => (
                                                  <option
                                                    key={value}
                                                    value={value}
                                                  >
                                                    {label}
                                                  </option>
                                                ))}
                                              </select>

                                              <input
                                                type="datetime-local"
                                                value={
                                                  getActivityForm(company.id)
                                                    .actionDate
                                                }
                                                onChange={(e) =>
                                                  updateActivityForm(
                                                    company.id,
                                                    "actionDate",
                                                    e.target.value,
                                                  )
                                                }
                                                className={INPUT_CLASS}
                                              />

                                              <input
                                                type="datetime-local"
                                                value={
                                                  getActivityForm(company.id)
                                                    .nextFollowUpAt
                                                }
                                                onChange={(e) =>
                                                  updateActivityForm(
                                                    company.id,
                                                    "nextFollowUpAt",
                                                    e.target.value,
                                                  )
                                                }
                                                className={INPUT_CLASS}
                                                placeholder="Date de relance"
                                              />

                                              <textarea
                                                value={
                                                  getActivityForm(company.id)
                                                    .notes
                                                }
                                                onChange={(e) =>
                                                  updateActivityForm(
                                                    company.id,
                                                    "notes",
                                                    e.target.value,
                                                  )
                                                }
                                                rows={4}
                                                placeholder="Notes commerciales, réponse du prospect, contexte de l’appel..."
                                                className={INPUT_CLASS}
                                              />

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleCreateActivity(
                                                    company.id,
                                                  )
                                                }
                                                disabled={
                                                  savingActivityId ===
                                                  company.id
                                                }
                                                className={`w-full ${BUTTON_PRIMARY}`}
                                              >
                                                {savingActivityId === company.id
                                                  ? "Enregistrement..."
                                                  : "Enregistrer l’action"}
                                              </button>
                                            </div>
                                          </div>

                                          {!company.website && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleFindWebsite(company.id)
                                              }
                                              disabled={
                                                findingWebsiteId === company.id
                                              }
                                              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                              {findingWebsiteId === company.id
                                                ? "Recherche du site..."
                                                : "Trouver le site"}
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEnrichContact(company.id)
                                            }
                                            disabled={
                                              enrichingContactId === company.id
                                            }
                                            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                                          >
                                            {enrichingContactId === company.id
                                              ? "Recherche de l’email..."
                                              : "Trouver l’email"}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEditCompany(company)
                                            }
                                            className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                          >
                                            Modifier l’entreprise
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteCompany(company.id)
                                            }
                                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                          >
                                            Supprimer l’entreprise
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEnrichCompany(company.id)
                                            }
                                            className={BUTTON_SECONDARY}
                                          >
                                            Enrichir le site
                                          </button>
                                        </div>
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
            ) : (
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
                                    {company.region
                                      ? ` • ${company.region}`
                                      : ""}
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

                              <div className="mt-3 space-y-1 text-xs text-slate-500">
                                <div>
                                  <span className="font-semibold text-slate-700">
                                    Relance :
                                  </span>{" "}
                                  {company.nextFollowUpAt
                                    ? new Date(
                                        company.nextFollowUpAt,
                                      ).toLocaleDateString("fr-FR")
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
                                    quickActionId ===
                                    `${company.id}-TO_CALL_BACK`
                                  }
                                  className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70"
                                >
                                  Relancer
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMarkAsClient(company)}
                                  disabled={
                                    quickActionId === `${company.id}-CLIENT`
                                  }
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </label>
  );
}

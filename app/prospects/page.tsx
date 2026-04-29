"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUS_LABELS } from "@/lib/prospect-status";
import ProspectsTable from "../../components/prospects/ProspectsTable";
import ProspectsPipeline from "../../components/prospects/ProspectsPipeline";
import ProspectsHeader from "../../components/prospects/ProspectsHeader";
import ProspectsKpiCards from "../../components/prospects/ProspectsKpiCards";
import ProspectsFilters from "../../components/prospects/ProspectsFilters";
import ImportCompaniesForm from "../../components/prospects/ImportCompaniesForm";
import CompanyForm from "../../components/prospects/CompanyForm";

import type {
  ActivityFormState,
  CompaniesResponse,
  Company,
  WebsiteCandidate,
  WebsiteCandidatesMap,
} from "../../lib/types";

import {
  ACTIVITY_RESULT_COLORS,
  ACTIVITY_RESULT_LABELS,
  ACTIVITY_TYPE_LABELS,
  BUTTON_GHOST,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CLOSED_RESULTS,
  COMMERCIAL_STAGE_COLORS,
  COMMERCIAL_STAGE_LABELS,
  INITIAL_ACTIVITY_FORM,
  INITIAL_FORM,
  INITIAL_IMPORT_FORM,
  INPUT_CLASS,
  LABEL_MUTED,
  PIPELINE_COLUMNS,
  SURFACE_CARD,
} from "../../lib/constants";
import {
  formatDate,
  getFollowUpBadge,
  getFollowUpBucket,
  getPipelineGroup,
  getPipelineStatus,
  getRowHighlightClass,
  isClosedCompany,
  readJsonSafely,
} from "../../lib/helpers";

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
      !isClosedCompany(company) &&
      company.commercialStage !== "CLIENT" &&
      getFollowUpBucket(company) === "today",
  ).length;

  const overdueFollowUpsCount = companies.filter(
    (company) =>
      !isClosedCompany(company) &&
      company.commercialStage !== "CLIENT" &&
      getFollowUpBucket(company) === "overdue",
  ).length;

  const activeCompaniesCount = companies.filter(
    (company) =>
      !isClosedCompany(company) && company.commercialStage !== "CLIENT",
  ).length;

  const clientsCount = companies.filter(
    (company) => company.commercialStage === "CLIENT",
  ).length;

  const closedCompaniesCount = companies.filter(
    (company) =>
      isClosedCompany(company) && company.commercialStage !== "CLIENT",
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
    const isClosedByStage = commercialStage === "INACTIVE";

    const isClosed = isClosedByResult || isClosedByStatus || isClosedByStage;

    const followUpBucket = getFollowUpBucket(company);

    const isClient = commercialStage === "CLIENT";

    const matchesClientFilter = !isClient;

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
      matchesClientFilter &&
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
        <ProspectsHeader
          companiesCount={companies.length}
          activeCompaniesCount={activeCompaniesCount}
          overdueFollowUpsCount={overdueFollowUpsCount}
          clientsCount={clientsCount}
          message={message}
          loadCompanies={loadCompanies}
          handleScoreAll={handleScoreAll}
        />
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <ImportCompaniesForm
              importForm={importForm}
              setImportForm={setImportForm}
              submitting={submitting}
              handleImportCompanies={handleImportCompanies}
            />

            <CompanyForm
              form={form}
              setForm={setForm}
              editingCompanyId={editingCompanyId}
              submitting={submitting}
              resetForm={resetForm}
              handleCreateCompany={handleCreateCompany}
            />
          </div>

          <div className="space-y-4">
            <ProspectsKpiCards
              quickFilter={quickFilter}
              setQuickFilter={setQuickFilter}
              setShowClosedCompanies={setShowClosedCompanies}
              todayFollowUpsCount={todayFollowUpsCount}
              overdueFollowUpsCount={overdueFollowUpsCount}
              activeCompaniesCount={activeCompaniesCount}
              clientsCount={clientsCount}
              closedCompaniesCount={closedCompaniesCount}
            />

            <ProspectsFilters
              filteredCount={filteredCompanies.length}
              quickFilter={quickFilter}
              setQuickFilter={setQuickFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              filter={filter}
              setFilter={setFilter}
              scoreFilter={scoreFilter}
              setScoreFilter={setScoreFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              showClosedCompanies={showClosedCompanies}
              setShowClosedCompanies={setShowClosedCompanies}
            />
            {viewMode === "table" ? (
              <ProspectsTable
                companies={filteredCompanies}
                loading={loading}
                expandedCompanyId={expandedCompanyId}
                toggleExpanded={toggleExpanded}
                websiteCandidatesByCompanyId={websiteCandidatesByCompanyId}
                findingWebsiteId={findingWebsiteId}
                savingWebsiteId={savingWebsiteId}
                enrichingContactId={enrichingContactId}
                savingActivityId={savingActivityId}
                quickActionId={quickActionId}
                getActivityForm={getActivityForm}
                updateActivityForm={updateActivityForm}
                handleFindWebsite={handleFindWebsite}
                handleUseWebsiteCandidate={handleUseWebsiteCandidate}
                handleEnrichContact={handleEnrichContact}
                handleEditCompany={handleEditCompany}
                handleDeleteCompany={handleDeleteCompany}
                handleEnrichCompany={handleEnrichCompany}
                handleCreateActivity={handleCreateActivity}
                handleQuickCommercialAction={handleQuickCommercialAction}
                handleMarkAsClient={handleMarkAsClient}
              />
            ) : (
              <ProspectsPipeline
                kanbanGroups={kanbanGroups}
                quickActionId={quickActionId}
                setExpandedCompanyId={setExpandedCompanyId}
                setViewMode={setViewMode}
                handleQuickCommercialAction={handleQuickCommercialAction}
                handleMarkAsClient={handleMarkAsClient}
              />
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

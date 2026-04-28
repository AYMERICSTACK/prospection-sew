"use client";

import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  city?: string | null;
  region?: string | null;
  website?: string | null;
  email?: string | null;
  commercialStage?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  lastContactResult?: string | null;
  prospect?: {
    score: number;
    pitchAngle?: string | null;
    whyRelevant?: string | null;
  } | null;
};

type CompaniesResponse = {
  success: boolean;
  count: number;
  data: Company[];
};

const STAGE_LABELS: Record<string, string> = {
  TARGET: "Compte cible",
  CLIENT: "Client",
  INACTIVE: "Inactif",
  PROSPECT: "Prospect",
};

const STAGE_COLORS: Record<string, string> = {
  TARGET: "bg-amber-100 text-amber-700",
  CLIENT: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  PROSPECT: "bg-blue-100 text-blue-700",
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

export default function ClientsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const res = await fetch("/api/companies", {
          cache: "no-store",
        });
        const data: CompaniesResponse = await res.json();
        setCompanies(data.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const filteredCompanies = companies
    .filter((company) =>
      ["TARGET", "CLIENT"].includes(company.commercialStage ?? "PROSPECT"),
    )
    .filter((company) => {
      const search = filter.toLowerCase();

      return (
        company.name.toLowerCase().includes(search) ||
        (company.city ?? "").toLowerCase().includes(search) ||
        (company.region ?? "").toLowerCase().includes(search) ||
        (company.email ?? "").toLowerCase().includes(search)
      );
    });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-blue-600">
            Suivi commercial
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Comptes cibles & clients
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Base dédiée aux entreprises à garder, suivre et travailler
            commercialement.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher un compte..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="text-sm text-slate-500">Chargement...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-sm text-slate-500">
              Aucun compte cible ou client pour le moment.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {company.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {company.city || "-"}
                        {company.region ? ` • ${company.region}` : ""}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        STAGE_COLORS[company.commercialStage ?? "PROSPECT"] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {STAGE_LABELS[company.commercialStage ?? "PROSPECT"] ??
                        company.commercialStage}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-800">
                        Email :
                      </span>{" "}
                      {company.email || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">Site :</span>{" "}
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Voir site
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">
                        Score :
                      </span>{" "}
                      {company.prospect?.score ?? 0}
                    </div>

                    <div>
                      <span className="font-medium text-slate-800">
                        Dernier contact :
                      </span>{" "}
                      {company.lastContactAt
                        ? new Date(company.lastContactAt).toLocaleString(
                            "fr-FR",
                          )
                        : "-"}
                    </div>

                    <div>
                      <span className="font-medium text-slate-800">
                        Prochaine relance :
                      </span>{" "}
                      {company.nextFollowUpAt
                        ? new Date(company.nextFollowUpAt).toLocaleString(
                            "fr-FR",
                          )
                        : "-"}
                    </div>

                    <div>
                      <span className="font-medium text-slate-800">
                        Dernier résultat :
                      </span>{" "}
                      {company.lastContactResult
                        ? (ACTIVITY_RESULT_LABELS[company.lastContactResult] ??
                          company.lastContactResult)
                        : "-"}
                    </div>
                  </div>

                  {company.prospect?.pitchAngle && (
                    <div className="mt-4 rounded-xl bg-white px-3 py-2 text-sm font-medium text-blue-600">
                      {company.prospect.pitchAngle}
                    </div>
                  )}

                  {company.prospect?.whyRelevant && (
                    <div className="mt-3 text-sm text-slate-500">
                      {company.prospect.whyRelevant}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

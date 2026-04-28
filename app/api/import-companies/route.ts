import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCompanyFromApi } from "@/lib/company-normalizer";
import { computeScore } from "@/lib/scoring";

type SearchApiResponse = {
  results?: Array<{
    siren?: string;
    nom_complet?: string;
    tranche_effectif_salarie?: string | null;
    activite_principale?: string | null;
    libelle_activite_principale?: string | null;
    siege?: {
      siret?: string;
      libelle_commune?: string | null;
      code_postal?: string | null;
      adresse?: string | null;
    } | null;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const query = typeof body.query === "string" ? body.query.trim() : "";
    const department =
      typeof body.department === "string" ? body.department.trim() : "";
    const nafCode = typeof body.nafCode === "string" ? body.nafCode.trim() : "";
    const perPageRaw =
      typeof body.perPage === "number"
        ? body.perPage
        : Number(body.perPage ?? 10);

    const perPage = Number.isFinite(perPageRaw)
      ? Math.max(1, Math.min(25, perPageRaw))
      : 10;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Le champ query est requis.",
        },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    params.set("q", query);
    params.set("page", "1");
    params.set("per_page", String(perPage));

    if (department) params.set("departement", department);
    if (nafCode) params.set("code_naf", nafCode);

    const url = `https://recherche-entreprises.api.gouv.fr/search?${params.toString()}`;

    const apiRes = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();

      return NextResponse.json(
        {
          success: false,
          message: "Erreur API recherche entreprises.",
          details: text,
          statusCode: apiRes.status,
          url,
        },
        { status: 502 },
      );
    }

    const data: SearchApiResponse = await apiRes.json();
    const results = data.results ?? [];

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucune entreprise trouvée pour cette recherche.",
        details:
          "Essaie une requête plus large, un autre département ou un autre code NAF.",
        count: 0,
        data: [],
        skipped: [],
        sourceUrl: url,
      });
    }

    const imported = [];
    const skipped = [];

    for (const item of results) {
      try {
        const normalized = normalizeCompanyFromApi(item);

        if (!normalized.name) {
          skipped.push({
            reason: "Nom manquant",
            raw: item,
          });
          continue;
        }

        let company = null;

        const siren = normalized.siren?.trim() || null;
        const siret = normalized.siret?.trim() || null;

        // 1) Priorité au SIREN
        if (siren) {
          company = await prisma.company.findFirst({
            where: { siren },
          });
        }

        // 2) Sinon / ou en complément : recherche par SIRET
        if (!company && siret) {
          company = await prisma.company.findFirst({
            where: { siret },
          });
        }

        // 3) Fallback souple
        if (!company) {
          company = await prisma.company.findFirst({
            where: {
              name: normalized.name,
              city: normalized.city ?? undefined,
            },
          });
        }

        if (company) {
          company = await prisma.company.update({
            where: { id: company.id },
            data: {
              name: normalized.name,
              siren: siren ?? company.siren,
              siret: siret ?? company.siret,
              nafCode: normalized.nafCode,
              nafLabel: normalized.nafLabel,
              city: normalized.city,
              postalCode: normalized.postalCode,
              address: normalized.address,
              employeeRange: normalized.employeeRange,
              source: normalized.source,
            },
          });
        } else {
          company = await prisma.company.create({
            data: {
              name: normalized.name,
              siren,
              siret,
              nafCode: normalized.nafCode,
              nafLabel: normalized.nafLabel,
              city: normalized.city,
              postalCode: normalized.postalCode,
              address: normalized.address,
              employeeRange: normalized.employeeRange,
              source: normalized.source,
            },
          });
        }

        const textToAnalyze = [company.name, company.nafLabel]
          .filter(Boolean)
          .join(" ");

        const scoreResult = computeScore({
          nafCode: company.nafCode,
          text: textToAnalyze,
          employeeRange: company.employeeRange,
        });

        const whyRelevant = scoreResult.reasons.join(" • ");
        const pitchAngle =
          scoreResult.score >= 50
            ? "Approche orientée performance, fiabilité et maintenance"
            : "Approche orientée découverte du besoin et qualification";

        const prospect = await prisma.prospect.upsert({
          where: { companyId: company.id },
          update: {
            score: scoreResult.score,
            whyRelevant,
            pitchAngle,
          },
          create: {
            companyId: company.id,
            score: scoreResult.score,
            whyRelevant,
            pitchAngle,
          },
        });

        imported.push({
          id: company.id,
          name: company.name,
          siren: company.siren,
          nafCode: company.nafCode,
          city: company.city,
          score: prospect.score,
          website: company.website ?? null,
        });
      } catch (itemError) {
        console.error("Erreur import entreprise:", itemError);

        skipped.push({
          reason:
            itemError instanceof Error
              ? itemError.message
              : "Erreur inconnue sur cette entreprise",
          raw: item,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: imported.length,
      skippedCount: skipped.length,
      data: imported,
      skipped,
      sourceUrl: url,
    });
  } catch (error) {
    console.error("POST /api/import-companies error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'import automatique.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

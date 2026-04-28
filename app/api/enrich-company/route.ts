import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring";
import { enrichWebsite } from "@/lib/website-enrichment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId as string | undefined;

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "companyId requis.",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { prospect: true },
    });

    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Entreprise introuvable.",
      });
    }

    if (!company.website) {
      return NextResponse.json({
        success: false,
        message: "Cette entreprise n'a pas de site web renseigné.",
        details: "Ajoute un site web avant de lancer l’enrichissement.",
      });
    }

    const baseText = [company.name, company.nafLabel].filter(Boolean).join(" ");
    const baseScore = computeScore({
      nafCode: company.nafCode,
      text: baseText,
      employeeRange: company.employeeRange,
    });

    const website = await enrichWebsite(company.website);

    const totalScore = Math.min(100, baseScore.score + website.score);

    const reasons = [...baseScore.reasons, website.summary].filter(Boolean);

    const pitchAngle = website.foundKeywords.includes(
      "maintenance industrielle",
    )
      ? "Approche orientée maintenance, fiabilité et réduction des arrêts"
      : website.foundKeywords.includes("convoyeur") ||
          website.foundKeywords.includes("manutention")
        ? "Approche orientée motorisation, rendement et robustesse"
        : totalScore >= 50
          ? "Approche orientée performance et continuité de service"
          : "Approche orientée découverte du besoin et qualification";

    const prospect = await prisma.prospect.upsert({
      where: { companyId: company.id },
      update: {
        score: totalScore,
        whyRelevant: reasons.join(" • "),
        pitchAngle,
        websiteScan: website.summary,
        websiteScore: website.score,
      },
      create: {
        companyId: company.id,
        score: totalScore,
        whyRelevant: reasons.join(" • "),
        pitchAngle,
        websiteScan: website.summary,
        websiteScore: website.score,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enrichissement du site effectué ✅",
      data: {
        company: company.name,
        website: company.website,
        baseScore: baseScore.score,
        websiteScore: website.score,
        totalScore,
        foundKeywords: website.foundKeywords,
        prospect,
      },
    });
  } catch (error) {
    console.error("POST /api/enrich-company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l’enrichissement du site.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

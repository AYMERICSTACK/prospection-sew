import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring";

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
      return NextResponse.json(
        {
          success: false,
          message: "Entreprise introuvable.",
        },
        { status: 404 },
      );
    }

    const textToAnalyze = [company.nafLabel, company.name]
      .filter(Boolean)
      .join(" ");

    const result = computeScore({
      nafCode: company.nafCode,
      text: textToAnalyze,
    });

    const whyRelevant = result.reasons.join(" • ");
    const pitchAngle =
      result.score >= 50
        ? "Approche orientée performance, fiabilité et maintenance"
        : "Approche orientée découverte du besoin et qualification";

    const prospect = await prisma.prospect.upsert({
      where: {
        companyId: company.id,
      },
      update: {
        score: result.score,
        whyRelevant,
        pitchAngle,
      },
      create: {
        companyId: company.id,
        score: result.score,
        whyRelevant,
        pitchAngle,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        company,
        prospect,
        scoreDetails: result,
      },
    });
  } catch (error) {
    console.error("POST /api/score error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors du calcul du score.",
      },
      { status: 500 },
    );
  }
}

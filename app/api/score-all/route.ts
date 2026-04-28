import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        prospect: true,
      },
    });

    const results = [];

    for (const company of companies) {
      const textToAnalyze = [company.name, company.nafLabel]
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

      results.push({
        company: company.name,
        score: prospect.score,
        whyRelevant: prospect.whyRelevant,
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("GET /api/score-all error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors du scoring global.",
      },
      { status: 500 },
    );
  }
}

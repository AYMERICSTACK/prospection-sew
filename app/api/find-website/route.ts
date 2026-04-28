import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findCompanyWebsiteCandidates } from "@/lib/website-finder";

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
    });

    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Entreprise introuvable.",
      });
    }

    const candidates = await findCompanyWebsiteCandidates({
      name: company.name,
      tradeName: company.tradeName,
      businessKeywords: company.businessKeywords,
      city: company.city,
      siren: company.siren,
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucun site web fiable n’a été détecté automatiquement.",
        details: "Tu peux le renseigner manuellement si besoin.",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${candidates.length} site(s) candidat(s) trouvé(s)`,
      data: {
        companyId: company.id,
        companyName: company.name,
        currentWebsite: company.website ?? null,
        candidates,
      },
    });
  } catch (error) {
    console.error("POST /api/find-website error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la recherche des sites candidats.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

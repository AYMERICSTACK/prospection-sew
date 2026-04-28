import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CommercialStage } from "@/generated/prisma/client";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_COMMERCIAL_STAGES: readonly CommercialStage[] = [
  "PROSPECT",
  "TARGET",
  "CLIENT",
  "INACTIVE",
] as const;

function normalizeCommercialStage(value: unknown): CommercialStage {
  if (typeof value !== "string") return "PROSPECT";

  const normalized = value.trim().toUpperCase() as CommercialStage;

  return ALLOWED_COMMERCIAL_STAGES.includes(normalized)
    ? normalized
    : "PROSPECT";
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const siren = typeof body.siren === "string" ? body.siren.trim() : "";
    const nafCode = typeof body.nafCode === "string" ? body.nafCode.trim() : "";
    const nafLabel =
      typeof body.nafLabel === "string" ? body.nafLabel.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const region = typeof body.region === "string" ? body.region.trim() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const emailStatus =
      typeof body.emailStatus === "string" ? body.emailStatus.trim() : "";
    const emailSource =
      typeof body.emailSource === "string" ? body.emailSource.trim() : "";
    const employeeRange =
      typeof body.employeeRange === "string" ? body.employeeRange.trim() : "";
    const tradeName =
      typeof body.tradeName === "string" ? body.tradeName.trim() : "";
    const businessKeywords =
      typeof body.businessKeywords === "string"
        ? body.businessKeywords.trim()
        : "";
    const commercialStage = normalizeCommercialStage(body.commercialStage);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom de l'entreprise est requis.",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        siren: siren || null,
        nafCode: nafCode || null,
        nafLabel: nafLabel || null,
        city: city || null,
        region: region || null,
        website: website || null,
        email: email || null,
        emailStatus: emailStatus || null,
        emailSource: emailSource || null,
        employeeRange: employeeRange || null,
        tradeName: tradeName || null,
        businessKeywords: businessKeywords || null,
        commercialStage,
      },
    });

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("PATCH /api/companies/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la modification de l'entreprise.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.prospect.deleteMany({
      where: {
        companyId: id,
      },
    });

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Entreprise supprimée avec succès.",
    });
  } catch (error) {
    console.error("DELETE /api/companies/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la suppression de l'entreprise.",
      },
      { status: 500 },
    );
  }
}

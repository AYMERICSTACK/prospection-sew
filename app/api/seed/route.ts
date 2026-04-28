import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANIES = [
  {
    name: "Convoyage Industriel Rhône",
    siren: "100000001",
    nafCode: "2822Z",
    nafLabel: "Fabrication de matériel de levage et de manutention",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    website: "https://example-convoyage.fr",
    employeeRange: "10-19",
  },
  {
    name: "Maintenance Process Ain",
    siren: "100000002",
    nafCode: "3312Z",
    nafLabel: "Réparation de machines et équipements mécaniques",
    city: "Bourg-en-Bresse",
    region: "Auvergne-Rhône-Alpes",
    website: "https://example-maintenance.fr",
    employeeRange: "20-49",
  },
  {
    name: "Agro Ligne Production Services",
    siren: "100000003",
    nafCode: "3320C",
    nafLabel: "Conception d'ensemble et assemblage sur site industriel",
    city: "Mâcon",
    region: "Bourgogne-Franche-Comté",
    website: "https://example-agro.fr",
    employeeRange: "50-99",
  },
  {
    name: "Métal Machine Automation",
    siren: "100000004",
    nafCode: "2899B",
    nafLabel: "Fabrication d'autres machines spécialisées",
    city: "Saint-Étienne",
    region: "Auvergne-Rhône-Alpes",
    website: "https://example-automation.fr",
    employeeRange: "10-19",
  },
];

export async function GET() {
  try {
    for (const company of DEMO_COMPANIES) {
      await prisma.company.upsert({
        where: {
          siren: company.siren,
        },
        update: {
          ...company,
        },
        create: {
          ...company,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Seed effectué avec succès.",
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors du seed.",
      },
      { status: 500 },
    );
  }
}

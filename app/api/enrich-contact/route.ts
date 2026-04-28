import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractEmailsFromWebsite } from "@/lib/email-extractor";

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

    if (company.email) {
      return NextResponse.json({
        success: true,
        message: "Un email est déjà renseigné pour cette entreprise.",
        data: {
          email: company.email,
          emailStatus: company.emailStatus,
          emailSource: company.emailSource,
        },
      });
    }

    if (!company.website) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          emailStatus: "not_found",
          emailSource: null,
        },
      });

      return NextResponse.json({
        success: false,
        message: "Aucun site web renseigné pour cette entreprise.",
        details: "Ajoute ou valide d’abord un site avant de chercher un email.",
      });
    }

    const emails = await extractEmailsFromWebsite(company.website);
    const selectedEmail = emails[0] ?? null;

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        email: selectedEmail,
        emailStatus: selectedEmail ? "found" : "not_found",
        emailSource: selectedEmail ? "website" : null,
      },
    });

    if (!selectedEmail) {
      return NextResponse.json({
        success: false,
        message: "Aucun email exploitable trouvé sur le site.",
        details:
          "Tu pourras enrichir cette entreprise plus tard via une API privée ou manuellement.",
        data: {
          companyId: updated.id,
          website: updated.website,
          emailsFound: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email trouvé avec succès ✅",
      data: {
        companyId: updated.id,
        website: updated.website,
        email: updated.email,
        emailStatus: updated.emailStatus,
        emailSource: updated.emailSource,
        emailsFound: emails,
      },
    });
  } catch (error) {
    console.error("POST /api/enrich-contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la recherche de l’email.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

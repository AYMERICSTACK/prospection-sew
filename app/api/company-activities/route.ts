import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  CommercialStage,
  CompanyActivityResult,
  CompanyActivityType,
  ProspectStatus,
} from "@/generated/prisma/client";

const bodySchema = z.object({
  companyId: z.string().min(1, "companyId requis"),
  type: z.nativeEnum(CompanyActivityType),
  result: z.nativeEnum(CompanyActivityResult).nullable().optional(),
  notes: z.string().trim().optional().default(""),
  actionDate: z.string().min(1, "actionDate requis"),
  nextFollowUpAt: z.string().nullable().optional(),
});

function getAutomaticUpdatesFromResult(result?: CompanyActivityResult | null): {
  prospectStatus?: ProspectStatus;
  commercialStage?: CommercialStage;
  clearNextFollowUp?: boolean;
} {
  switch (result) {
    case CompanyActivityResult.NOT_INTERESTED:
      return {
        prospectStatus: ProspectStatus.LOST,
        commercialStage: CommercialStage.INACTIVE,
        clearNextFollowUp: true,
      };

    case CompanyActivityResult.ALREADY_EQUIPPED:
      return {
        prospectStatus: ProspectStatus.LOST,
        commercialStage: CommercialStage.INACTIVE,
        clearNextFollowUp: true,
      };

    case CompanyActivityResult.WRONG_CONTACT:
      return {
        prospectStatus: ProspectStatus.TO_REVIEW,
      };

    case CompanyActivityResult.INTERESTED:
      return {
        prospectStatus: ProspectStatus.CONTACTED,
        commercialStage: CommercialStage.TARGET,
      };

    case CompanyActivityResult.TO_CALL_BACK:
      return {
        prospectStatus: ProspectStatus.FOLLOW_UP,
      };

    case CompanyActivityResult.APPOINTMENT_TO_SCHEDULE:
      return {
        prospectStatus: ProspectStatus.FOLLOW_UP,
        commercialStage: CommercialStage.TARGET,
      };

    case CompanyActivityResult.APPOINTMENT_BOOKED:
      return {
        prospectStatus: ProspectStatus.FOLLOW_UP,
        commercialStage: CommercialStage.TARGET,
      };

    case CompanyActivityResult.QUOTE_REQUESTED:
      return {
        prospectStatus: ProspectStatus.FOLLOW_UP,
        commercialStage: CommercialStage.TARGET,
      };

    case CompanyActivityResult.INFORMATION_SENT:
      return {
        prospectStatus: ProspectStatus.CONTACTED,
      };

    case CompanyActivityResult.NO_ANSWER:
      return {
        prospectStatus: ProspectStatus.FOLLOW_UP,
      };

    default:
      return {};
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Données invalides.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { companyId, type, result, notes, actionDate, nextFollowUpAt } =
      parsed.data;

    const actionDateValue = new Date(actionDate);

    if (Number.isNaN(actionDateValue.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Date d’action invalide.",
        },
        { status: 400 },
      );
    }

    let nextFollowUpAtValue: Date | null = null;

    if (nextFollowUpAt) {
      const parsedFollowUp = new Date(nextFollowUpAt);

      if (Number.isNaN(parsedFollowUp.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Date de relance invalide.",
          },
          { status: 400 },
        );
      }

      nextFollowUpAtValue = parsedFollowUp;
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

    const autoUpdates = getAutomaticUpdatesFromResult(result ?? null);

    const finalNextFollowUpAt = autoUpdates.clearNextFollowUp
      ? null
      : nextFollowUpAtValue;

    const companyUpdateData: {
      lastContactAt: Date;
      nextFollowUpAt: Date | null;
      lastContactResult?: CompanyActivityResult | null;
      commercialStage?: CommercialStage;
    } = {
      lastContactAt: actionDateValue,
      nextFollowUpAt: finalNextFollowUpAt,
      lastContactResult: result ?? null,
    };

    if (autoUpdates.commercialStage) {
      companyUpdateData.commercialStage = autoUpdates.commercialStage;
    }

    await prisma.$transaction(async (tx) => {
      await tx.companyActivity.create({
        data: {
          companyId,
          type,
          result: result ?? null,
          notes: notes || null,
          actionDate: actionDateValue,
          nextFollowUpAt: finalNextFollowUpAt,
        },
      });

      await tx.company.update({
        where: { id: companyId },
        data: companyUpdateData,
      });

      if (company.prospect) {
        const prospectUpdateData: {
          status?: ProspectStatus;
        } = {};

        if (autoUpdates.prospectStatus) {
          prospectUpdateData.status = autoUpdates.prospectStatus;
        }

        if (Object.keys(prospectUpdateData).length > 0) {
          await tx.prospect.update({
            where: { companyId },
            data: prospectUpdateData,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Action commerciale enregistrée et pipeline mis à jour ✅",
    });
  } catch (error) {
    console.error("POST /api/company-activities error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de l’enregistrement de l’action.",
      },
      { status: 500 },
    );
  }
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type OrderLine = {
  id: string;
  designation: string;
  quantity: string;
  unit: string;
};

const DEFAULT_LINE: OrderLine = {
  id: "1",
  designation:
    "Motoréducteur à engrenages cylindriques\nRZ07 CMP40M/PK/AK0H/SM1",
  quantity: "1",
  unit: "PCE",
};

const currentYear = new Date().getFullYear();

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export default function AccusesReceptionPage() {
  const [customerName, setCustomerName] = useState("DUPONT");
  const [customerReference, setCustomerReference] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([DEFAULT_LINE]);
  const [deliveryWeek, setDeliveryWeek] = useState("27");
  const [deliveryYear, setDeliveryYear] = useState(String(currentYear));
  const [deliveryNote, setDeliveryNote] = useState(
    "Sous réserve des conditions d’approvisionnement de notre fournisseur et des aléas de fabrication ou de transport.",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const documentTitle = useMemo(() => {
    const suffix = sanitizeFileName(customerName || "client");
    return `accuse-reception-${suffix}`;
  }, [customerName]);

  function updateLine(id: string, field: keyof OrderLine, value: string) {
    setLines((currentLines) =>
      currentLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line,
      ),
    );
  }

  function addLine() {
    setLines((currentLines) => [
      ...currentLines,
      {
        id: crypto.randomUUID(),
        designation: "",
        quantity: "1",
        unit: "PCE",
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((currentLines) =>
      currentLines.length === 1
        ? currentLines
        : currentLines.filter((line) => line.id !== id),
    );
  }

  async function handleDownloadPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontOblique = await pdfDoc.embedFont(
        StandardFonts.HelveticaOblique,
      );

      let brandImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
      try {
        const logoResponse = await fetch("/images/adei-brand-header.png");
        const logoBytes = await logoResponse.arrayBuffer();
        brandImage = await pdfDoc.embedPng(logoBytes);
      } catch (logoError) {
        console.warn("Logo ADEI introuvable pour le PDF", logoError);
      }

      const navy = rgb(0.06, 0.09, 0.16);
      const blue = rgb(0.02, 0.25, 0.55);
      const blueSoft = rgb(0.94, 0.97, 1);
      const border = rgb(0.8, 0.86, 0.92);
      const lineGrey = rgb(0.88, 0.91, 0.95);
      const text = rgb(0.13, 0.16, 0.23);
      const muted = rgb(0.42, 0.47, 0.55);
      const red = rgb(0.78, 0.05, 0.08);
      const white = rgb(1, 1, 1);

      const margin = 42;
      const contentX = margin;
      const contentWidth = width - margin * 2;

      const today = new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date());

      const cleanText = (value: string) =>
        (value || "")
          .replace(/[’‘]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/–/g, "-")
          .replace(/€/g, "EUR")
          .trim();

      const splitLines = (
        value: string,
        font: typeof fontRegular,
        size: number,
        maxWidth: number,
      ) => {
        const paragraphs = cleanText(value).split("\n");
        const output: string[] = [];

        paragraphs.forEach((paragraph) => {
          const words = paragraph.split(" ").filter(Boolean);
          let line = "";

          if (words.length === 0) {
            output.push("");
            return;
          }

          words.forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
              output.push(line);
              line = word;
            } else {
              line = candidate;
            }
          });

          output.push(line);
        });

        return output;
      };

      const drawText = (
        value: string,
        x: number,
        y: number,
        size: number,
        options: {
          font?: typeof fontRegular;
          color?: ReturnType<typeof rgb>;
          maxWidth?: number;
          lineHeight?: number;
        } = {},
      ) => {
        const font = options.font ?? fontRegular;
        const color = options.color ?? text;
        const lineHeight = options.lineHeight ?? size + 5;
        const linesToDraw = options.maxWidth
          ? splitLines(value, font, size, options.maxWidth)
          : cleanText(value).split("\n");
        let currentY = y;

        linesToDraw.forEach((line) => {
          page.drawText(line, { x, y: currentY, size, font, color });
          currentY -= lineHeight;
        });

        return currentY;
      };

      const drawCenteredText = (
        value: string,
        x: number,
        y: number,
        boxWidth: number,
        size: number,
        font = fontBold,
        color = text,
      ) => {
        const cleanValue = cleanText(value);
        const textWidth = font.widthOfTextAtSize(cleanValue, size);
        page.drawText(cleanValue, {
          x: x + (boxWidth - textWidth) / 2,
          y,
          size,
          font,
          color,
        });
      };

      const addPdfLink = (
        x: number,
        y: number,
        linkWidth: number,
        linkHeight: number,
        url: string,
      ) => {
        const annotation = pdfDoc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [x, y, x + linkWidth, y + linkHeight],
          Border: [0, 0, 0],
          A: {
            Type: "Action",
            S: "URI",
            URI: url,
          },
        });
        const annotationRef = pdfDoc.context.register(annotation);
        page.node.addAnnot(annotationRef);
      };

      const drawIconBox = (
        x: number,
        y: number,
        type:
          | "building"
          | "user"
          | "document"
          | "calendar"
          | "pin"
          | "phone"
          | "web",
      ) => {
        page.drawRectangle({
          x,
          y,
          width: 28,
          height: 28,
          color: blue,
          borderColor: blue,
          borderWidth: 1,
        });
        const icon = white;

        if (type === "building") {
          page.drawRectangle({
            x: x + 8,
            y: y + 6,
            width: 12,
            height: 16,
            borderColor: icon,
            borderWidth: 1.4,
          });
          page.drawLine({
            start: { x: x + 10, y: y + 16 },
            end: { x: x + 18, y: y + 16 },
            thickness: 1,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 10, y: y + 12 },
            end: { x: x + 18, y: y + 12 },
            thickness: 1,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 14, y: y + 6 },
            end: { x: x + 14, y: y + 22 },
            thickness: 1,
            color: icon,
          });
        }

        if (type === "user") {
          page.drawCircle({
            x: x + 14,
            y: y + 18,
            size: 4,
            borderColor: icon,
            borderWidth: 1.5,
          });
          page.drawEllipse({
            x: x + 14,
            y: y + 9,
            xScale: 8,
            yScale: 5,
            borderColor: icon,
            borderWidth: 1.5,
          });
        }

        if (type === "document") {
          page.drawRectangle({
            x: x + 8,
            y: y + 6,
            width: 13,
            height: 17,
            borderColor: icon,
            borderWidth: 1.4,
          });
          page.drawLine({
            start: { x: x + 11, y: y + 17 },
            end: { x: x + 18, y: y + 17 },
            thickness: 1,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 11, y: y + 13 },
            end: { x: x + 18, y: y + 13 },
            thickness: 1,
            color: icon,
          });
        }

        if (type === "calendar") {
          page.drawCircle({ x: x + 14, y: y + 14, size: 12, color: blue });
          page.drawRectangle({
            x: x + 7,
            y: y + 8,
            width: 14,
            height: 13,
            borderColor: icon,
            borderWidth: 1.3,
          });
          page.drawLine({
            start: { x: x + 7, y: y + 17 },
            end: { x: x + 21, y: y + 17 },
            thickness: 1,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 10, y: y + 23 },
            end: { x: x + 10, y: y + 19 },
            thickness: 1.2,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 18, y: y + 23 },
            end: { x: x + 18, y: y + 19 },
            thickness: 1.2,
            color: icon,
          });
        }

        if (type === "pin") {
          page.drawCircle({
            x: x + 14,
            y: y + 18,
            size: 5,
            borderColor: icon,
            borderWidth: 1.5,
          });
          page.drawLine({
            start: { x: x + 14, y: y + 4 },
            end: { x: x + 9, y: y + 14 },
            thickness: 1.2,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 14, y: y + 4 },
            end: { x: x + 19, y: y + 14 },
            thickness: 1.2,
            color: icon,
          });
        }

        if (type === "phone") {
          page.drawLine({
            start: { x: x + 9, y: y + 19 },
            end: { x: x + 13, y: y + 23 },
            thickness: 1.6,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 13, y: y + 23 },
            end: { x: x + 20, y: y + 10 },
            thickness: 1.6,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 20, y: y + 10 },
            end: { x: x + 24, y: y + 14 },
            thickness: 1.6,
            color: icon,
          });
        }

        if (type === "web") {
          page.drawCircle({
            x: x + 14,
            y: y + 14,
            size: 10,
            borderColor: icon,
            borderWidth: 1.2,
          });
          page.drawLine({
            start: { x: x + 4, y: y + 14 },
            end: { x: x + 24, y: y + 14 },
            thickness: 1,
            color: icon,
          });
          page.drawLine({
            start: { x: x + 14, y: y + 4 },
            end: { x: x + 14, y: y + 24 },
            thickness: 1,
            color: icon,
          });
        }
      };

      // Background
      page.drawRectangle({ x: 0, y: 0, width, height, color: white });
      page.drawRectangle({
        x: 0,
        y: height - 14,
        width,
        height: 14,
        color: rgb(0.2, 0.25, 0.25),
      });

      // Header
      if (brandImage) {
        const logoWidth = 205;
        const logoHeight = (brandImage.height / brandImage.width) * logoWidth;
        page.drawImage(brandImage, {
          x: contentX,
          y: height - 122,
          width: logoWidth,
          height: logoHeight,
        });
      } else {
        drawText("ADEI", contentX, height - 78, 25, {
          font: fontBold,
          color: navy,
        });
      }

      const titleX = 285;
      drawText("ACCUSÉ DE RÉCEPTION", titleX, height - 72, 19.5, {
        font: fontBold,
        color: navy,
      });
      drawText("DE COMMANDE", titleX, height - 99, 17, {
        font: fontBold,
        color: blue,
      });
      page.drawLine({
        start: { x: titleX, y: height - 110 },
        end: { x: titleX + 45, y: height - 110 },
        thickness: 1.4,
        color: blue,
      });
      drawText(`Date : ${today}`, titleX, height - 137, 9, {
        font: fontRegular,
        color: muted,
      });

      page.drawLine({
        start: { x: contentX, y: height - 169 },
        end: { x: width - margin, y: height - 169 },
        thickness: 0.8,
        color: lineGrey,
      });

      // Cards
      const cardY = height - 302;
      const cardW = (contentWidth - 22) / 2;
      const cardH = 108;

      page.drawRectangle({
        x: contentX,
        y: cardY,
        width: cardW,
        height: cardH,
        color: rgb(0.985, 0.99, 1),
        borderColor: border,
        borderWidth: 0.8,
      });
      drawIconBox(contentX + 18, cardY + 70, "building");
      drawText("ÉMETTEUR", contentX + 62, cardY + 82, 9, {
        font: fontBold,
        color: blue,
      });
      drawText("ADEI", contentX + 62, cardY + 55, 17, {
        font: fontBold,
        color: navy,
      });
      drawText(
        "6 Avenue du Docteur Schweitzer\n69330 Meyzieu - France\nsew@adei-sas.com  |  www.adei-sas.com",
        contentX + 62,
        cardY + 31,
        8.8,
        {
          font: fontRegular,
          color: text,
          lineHeight: 13,
        },
      );

      const recipientX = contentX + cardW + 22;
      page.drawRectangle({
        x: recipientX,
        y: cardY,
        width: cardW,
        height: cardH,
        color: white,
        borderColor: border,
        borderWidth: 0.8,
      });
      drawIconBox(recipientX + 18, cardY + 70, "user");
      drawText("À L'ATTENTION DE", recipientX + 62, cardY + 82, 9, {
        font: fontBold,
        color: blue,
      });
      drawText(customerName || "CLIENT", recipientX + 62, cardY + 55, 17, {
        font: fontBold,
        color: red,
        maxWidth: cardW - 82,
      });
      if (customerReference)
        drawText(
          `Réf. client : ${customerReference}`,
          recipientX + 62,
          cardY + 34,
          8.8,
          { font: fontRegular, color: muted, maxWidth: cardW - 82 },
        );
      if (orderReference)
        drawText(
          `N° commande : ${orderReference}`,
          recipientX + 62,
          cardY + 20,
          8.8,
          { font: fontRegular, color: muted, maxWidth: cardW - 82 },
        );

      // Object + intro
      const objectY = height - 358;
      drawIconBox(contentX, objectY - 4, "document");
      drawText("OBJET :", contentX + 42, objectY + 11, 10.5, {
        font: fontBold,
        color: blue,
      });
      drawText(
        "ACCUSÉ DE RÉCEPTION DE COMMANDE",
        contentX + 88,
        objectY + 11,
        10.5,
        { font: fontBold, color: navy },
      );
      page.drawLine({
        start: { x: contentX, y: objectY - 17 },
        end: { x: width - margin, y: objectY - 17 },
        thickness: 0.8,
        color: lineGrey,
      });

      drawText("Madame, Monsieur,", contentX, objectY - 52, 10.5, {
        font: fontRegular,
        color: text,
      });
      drawText(
        "Nous accusons réception de votre commande et vous remercions de votre confiance. Nous vous confirmons l'enregistrement de la fourniture suivante :",
        contentX,
        objectY - 78,
        10,
        {
          font: fontRegular,
          color: text,
          maxWidth: contentWidth,
          lineHeight: 14,
        },
      );

      // Table
      const tableTop = objectY - 132;
      const tableW = contentWidth;
      const colNo = 48;
      const colQty = 74;
      const colUnit = 70;
      const colDesignation = tableW - colNo - colQty - colUnit;
      const headerH = 32;
      const rowH = lines.length > 2 ? 58 : 74;

      page.drawRectangle({
        x: contentX,
        y: tableTop,
        width: tableW,
        height: headerH,
        color: blue,
      });
      drawCenteredText(
        "N°",
        contentX,
        tableTop + 11,
        colNo,
        9.2,
        fontBold,
        white,
      );
      drawCenteredText(
        "DÉSIGNATION",
        contentX + colNo,
        tableTop + 11,
        colDesignation,
        9.2,
        fontBold,
        white,
      );
      drawCenteredText(
        "QUANTITÉ",
        contentX + colNo + colDesignation,
        tableTop + 11,
        colQty,
        9.2,
        fontBold,
        white,
      );
      drawCenteredText(
        "UNITÉ",
        contentX + colNo + colDesignation + colQty,
        tableTop + 11,
        colUnit,
        9.2,
        fontBold,
        white,
      );

      let rowY = tableTop - rowH;
      lines.slice(0, 5).forEach((line, index) => {
        page.drawRectangle({
          x: contentX,
          y: rowY,
          width: tableW,
          height: rowH,
          color: white,
          borderColor: border,
          borderWidth: 0.8,
        });
        page.drawLine({
          start: { x: contentX + colNo, y: rowY },
          end: { x: contentX + colNo, y: rowY + rowH },
          thickness: 0.7,
          color: border,
        });
        page.drawLine({
          start: { x: contentX + colNo + colDesignation, y: rowY },
          end: { x: contentX + colNo + colDesignation, y: rowY + rowH },
          thickness: 0.7,
          color: border,
        });
        page.drawLine({
          start: { x: contentX + colNo + colDesignation + colQty, y: rowY },
          end: {
            x: contentX + colNo + colDesignation + colQty,
            y: rowY + rowH,
          },
          thickness: 0.7,
          color: border,
        });
        drawCenteredText(
          String(index + 1),
          contentX,
          rowY + rowH / 2 - 5,
          colNo,
          15,
          fontBold,
          navy,
        );
        drawText(
          line.designation || "Désignation",
          contentX + colNo + 20,
          rowY + rowH - 28,
          11.2,
          {
            font: fontBold,
            color: navy,
            maxWidth: colDesignation - 40,
            lineHeight: 14.5,
          },
        );
        drawCenteredText(
          line.quantity || "-",
          contentX + colNo + colDesignation,
          rowY + rowH / 2 - 5,
          colQty,
          14,
          fontBold,
          navy,
        );
        drawCenteredText(
          line.unit || "PCE",
          contentX + colNo + colDesignation + colQty,
          rowY + rowH / 2 - 5,
          colUnit,
          12,
          fontBold,
          navy,
        );
        rowY -= rowH;
      });

      if (lines.length > 5) {
        drawText(
          `+ ${lines.length - 5} ligne(s) supplémentaire(s) à ajouter sur une page 2.`,
          contentX,
          rowY + 28,
          8,
          { font: fontOblique, color: muted },
        );
      }

      // Delay block
      const delayH = 92;
      const delayY = Math.max(198, rowY - 32);
      page.drawRectangle({
        x: contentX,
        y: delayY,
        width: tableW,
        height: delayH,
        color: blueSoft,
        borderColor: border,
        borderWidth: 0.8,
      });
      page.drawRectangle({
        x: contentX,
        y: delayY,
        width: 9,
        height: delayH,
        color: blue,
      });
      page.drawCircle({
        x: contentX + 48,
        y: delayY + 47,
        size: 23,
        color: blue,
      });
      drawIconBox(contentX + 34, delayY + 33, "calendar");
      drawText("DÉLAI PRÉVISIONNEL", contentX + 92, delayY + 60, 9.5, {
        font: fontBold,
        color: blue,
      });
      drawText(
        `Livraison estimée : semaine ${deliveryWeek || "__"} de l'année ${deliveryYear || "____"} (env.)`,
        contentX + 92,
        delayY + 38,
        13,
        { font: fontBold, color: navy, maxWidth: tableW - 120 },
      );
      drawText(deliveryNote, contentX + 92, delayY + 17, 9, {
        font: fontRegular,
        color: muted,
        maxWidth: tableW - 120,
        lineHeight: 12,
      });

      // Closing
      const closeY = 152;
      drawText(
        "Nous restons à votre disposition pour tout renseignement complémentaire.",
        contentX,
        closeY,
        9.6,
        { font: fontRegular, color: text },
      );
      drawText("Cordialement,", contentX, closeY - 27, 9.6, {
        font: fontRegular,
        color: text,
      });
      drawText("ADEI", contentX, closeY - 55, 13, {
        font: fontBold,
        color: navy,
      });
      drawText("Service Commercial", contentX, closeY - 70, 10, {
        font: fontRegular,
        color: text,
      });

      // Footer sobre + liens PDF cliquables
      page.drawLine({
        start: { x: contentX, y: 74 },
        end: { x: width - margin, y: 74 },
        thickness: 0.8,
        color: lineGrey,
      });

      drawText("ADEI - Solutions techniques industrielles", contentX, 55, 8, {
        font: fontBold,
        color: navy,
      });
      drawText(
        "6 Avenue du Docteur Schweitzer - 69330 Meyzieu - France",
        contentX,
        42,
        7.2,
        { font: fontRegular, color: muted },
      );

      drawText("+33 (0)4 78 04 12 28", contentX + 260, 55, 7.2, {
        font: fontRegular,
        color: muted,
      });
      drawText("sew@adei-sas.com", contentX + 260, 42, 7.2, {
        font: fontRegular,
        color: blue,
      });
      addPdfLink(contentX + 260, 39, 80, 11, "mailto:sew@adei-sas.com");

      drawText("www.adei-sas.com", contentX + 390, 42, 8, {
        font: fontBold,
        color: blue,
      });
      addPdfLink(contentX + 390, 39, 82, 12, "https://www.adei-sas.com/");

      const pdfBytes = await pdfDoc.save();
      const pdfArrayBuffer = new Uint8Array(pdfBytes).buffer as ArrayBuffer;
      const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(
        "Impossible de générer le PDF. Vérifie que la dépendance pdf-lib est bien installée.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              ← Retour à l’accueil
            </Link>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
              Accusé de réception
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Génération PDF premium avec pdf-lib, sans impression navigateur.
            </p>
          </div>

          <form onSubmit={handleDownloadPdf} className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                Client
              </label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                placeholder="Ex : BERNUES"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Référence client
                </label>
                <input
                  value={customerReference}
                  onChange={(event) => setCustomerReference(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                  N° commande
                </label>
                <input
                  value={orderReference}
                  onChange={(event) => setOrderReference(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  placeholder="Optionnel"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                  Fourniture
                </h2>
                <button
                  type="button"
                  onClick={addLine}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                >
                  + Ligne
                </button>
              </div>

              <div className="space-y-4">
                {lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black text-slate-500">
                        Ligne {index + 1}
                      </p>
                      {lines.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </div>

                    <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Désignation
                    </label>
                    <textarea
                      value={line.designation}
                      onChange={(event) =>
                        updateLine(line.id, "designation", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      placeholder="Produit / référence"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Quantité
                        </label>
                        <input
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(line.id, "quantity", event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Unité
                        </label>
                        <input
                          value={line.unit}
                          onChange={(event) =>
                            updateLine(line.id, "unit", event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Semaine de livraison
                </label>
                <input
                  value={deliveryWeek}
                  onChange={(event) => setDeliveryWeek(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                  placeholder="27"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Année
                </label>
                <input
                  value={deliveryYear}
                  onChange={(event) => setDeliveryYear(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                  placeholder="2026"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                Note délai
              </label>
              <textarea
                value={deliveryNote}
                onChange={(event) => setDeliveryNote(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full rounded-xl bg-blue-900 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Génération du PDF..." : "Télécharger le PDF"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="h-3 bg-slate-700" />
            <div className="grid gap-8 p-8 md:grid-cols-[260px_1fr]">
              <div className="flex items-start">
                <Image
                  src="/images/adei-brand-header.png"
                  alt="ADEI KITO SEW"
                  width={260}
                  height={94}
                  className="h-auto w-[260px] object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  Accusé de réception
                </h2>
                <p className="mt-1 text-lg font-black text-blue-900">
                  de commande
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Commande client · {customerName || "CLIENT"}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-400">
                    À l'attention de
                  </p>
                  <p className="mt-2 text-xl font-black text-red-700">
                    {customerName || "CLIENT"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-400">
                    Commande
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    {orderReference || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Délai
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    Semaine {deliveryWeek} / {deliveryYear}
                  </p>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[60px_1fr_90px_80px] bg-blue-900 px-4 py-3 text-xs font-black uppercase text-white">
                  <span>N°</span>
                  <span>Désignation</span>
                  <span>Qté</span>
                  <span>Unité</span>
                </div>
                {lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[60px_1fr_90px_80px] border-t border-slate-200 px-4 py-4 text-sm font-bold text-slate-900"
                  >
                    <span>{index + 1}</span>
                    <span className="whitespace-pre-wrap">
                      {line.designation || "Désignation"}
                    </span>
                    <span>{line.quantity || "-"}</span>
                    <span>{line.unit || "PCE"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

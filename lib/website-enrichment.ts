import * as cheerio from "cheerio";
import {
  STRONG_KEYWORDS,
  MEDIUM_KEYWORDS,
  WEAK_KEYWORDS,
} from "./prospect-keywords";

type WebsiteEnrichmentResult = {
  score: number;
  foundKeywords: string[];
  summary: string;
  textSample: string;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function enrichWebsite(
  url: string,
): Promise<WebsiteEnrichmentResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Impossible de récupérer le site (${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, noscript").remove();

    const text = normalizeText($("body").text().replace(/\s+/g, " ").trim());

    const foundKeywords: string[] = [];
    let score = 0;

    for (const keyword of STRONG_KEYWORDS) {
      if (text.includes(normalizeText(keyword.label))) {
        foundKeywords.push(keyword.label);
        score += Math.min(keyword.weight, 10);
      }
    }

    for (const keyword of MEDIUM_KEYWORDS) {
      if (text.includes(normalizeText(keyword.label))) {
        foundKeywords.push(keyword.label);
        score += Math.min(keyword.weight, 7);
      }
    }

    for (const keyword of WEAK_KEYWORDS) {
      if (text.includes(normalizeText(keyword.label))) {
        foundKeywords.push(keyword.label);
        score += Math.min(keyword.weight, 3);
      }
    }

    const uniqueKeywords = Array.from(new Set(foundKeywords));

    if (score > 40) score = 40;

    const summary =
      uniqueKeywords.length > 0
        ? `Mots-clés détectés sur le site : ${uniqueKeywords.join(", ")}`
        : "Aucun mot-clé métier significatif détecté sur le site.";

    return {
      score,
      foundKeywords: uniqueKeywords,
      summary,
      textSample: text.slice(0, 500),
    };
  } catch (error) {
    return {
      score: 0,
      foundKeywords: [],
      summary:
        error instanceof Error
          ? `Erreur analyse site : ${error.message}`
          : "Erreur analyse site",
      textSample: "",
    };
  }
}

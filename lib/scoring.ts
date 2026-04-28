import {
  STRONG_KEYWORDS,
  MEDIUM_KEYWORDS,
  WEAK_KEYWORDS,
  NEGATIVE_KEYWORDS,
  HIGH_PRIORITY_NAF_PREFIXES,
  MEDIUM_PRIORITY_NAF_PREFIXES,
  LOW_PRIORITY_NAF_PREFIXES,
} from "./prospect-keywords";

type ComputeScoreInput = {
  nafCode?: string | null;
  text?: string | null;
  employeeRange?: string | null;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasPrefix(value: string, prefixes: string[]) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

export function computeScore({
  nafCode,
  text,
  employeeRange,
}: ComputeScoreInput) {
  let score = 0;
  const reasons: string[] = [];

  const normalizedText = normalizeText(text ?? "");
  const normalizedNaf = (nafCode ?? "").trim();

  // 1. Scoring NAF
  if (normalizedNaf) {
    if (hasPrefix(normalizedNaf, HIGH_PRIORITY_NAF_PREFIXES)) {
      score += 35;
      reasons.push(
        "Code NAF très pertinent pour manutention / machines / automatisation",
      );
    } else if (hasPrefix(normalizedNaf, MEDIUM_PRIORITY_NAF_PREFIXES)) {
      score += 22;
      reasons.push(
        "Code NAF pertinent pour machines, maintenance ou électromécanique",
      );
    } else if (hasPrefix(normalizedNaf, LOW_PRIORITY_NAF_PREFIXES)) {
      score += 8;
      reasons.push(
        "Code NAF potentiellement pertinent pour des besoins en transmission",
      );
    }
  }

  // 2. Mots-clés forts
  const matchedStrong = STRONG_KEYWORDS.filter((keyword) =>
    normalizedText.includes(normalizeText(keyword.label)),
  );

  for (const keyword of matchedStrong) {
    score += keyword.weight;
    reasons.push(`Mot-clé fort détecté : ${keyword.label}`);
  }

  // 3. Mots-clés moyens
  const matchedMedium = MEDIUM_KEYWORDS.filter((keyword) =>
    normalizedText.includes(normalizeText(keyword.label)),
  );

  for (const keyword of matchedMedium) {
    score += keyword.weight;
    reasons.push(`Mot-clé métier détecté : ${keyword.label}`);
  }

  // 4. Mots-clés faibles
  const matchedWeak = WEAK_KEYWORDS.filter((keyword) =>
    normalizedText.includes(normalizeText(keyword.label)),
  );

  for (const keyword of matchedWeak) {
    score += keyword.weight;
    reasons.push(`Mot-clé faible détecté : ${keyword.label}`);
  }

  // 5. Pénalités métiers
  const matchedNegative = NEGATIVE_KEYWORDS.filter((keyword) =>
    normalizedText.includes(normalizeText(keyword.label)),
  );

  for (const keyword of matchedNegative) {
    score += keyword.weight;
    reasons.push(`Secteur peu pertinent détecté : ${keyword.label}`);
  }

  // 6. Bonus de combinaison
  const hasStrongKeyword = matchedStrong.length > 0;
  const hasMediumKeyword = matchedMedium.length > 0;
  const hasNegativeKeyword = matchedNegative.length > 0;

  if (hasStrongKeyword && hasPrefix(normalizedNaf, ["28"])) {
    score += 12;
    reasons.push("Combinaison forte : machines + mot-clé très pertinent");
  }

  if (hasStrongKeyword && hasPrefix(normalizedNaf, ["33"])) {
    score += 8;
    reasons.push(
      "Combinaison forte : maintenance / installation + besoin potentiel",
    );
  }

  if (hasStrongKeyword && hasMediumKeyword) {
    score += 5;
    reasons.push("Cohérence métier forte détectée");
  }

  if (
    matchedStrong.some((keyword) =>
      [
        "convoyeur",
        "convoyage",
        "transporteur a bande",
        "transporteur à bande",
      ].includes(keyword.label),
    ) &&
    matchedMedium.some((keyword) =>
      ["manutention", "intralogistique", "ligne de production"].includes(
        keyword.label,
      ),
    )
  ) {
    score += 8;
    reasons.push("Signal très intéressant : convoyage / manutention détectés");
  }

  if (
    matchedStrong.some((keyword) =>
      [
        "motorisation",
        "reducteur",
        "réducteur",
        "motoreducteur",
        "motoréducteur",
        "variateur",
      ].includes(keyword.label),
    )
  ) {
    score += 6;
    reasons.push("Présence explicite d'un besoin transmission / entraînement");
  }

  // 7. Taille entreprise
  const employee = normalizeText(employeeRange ?? "");

  if (
    employee.includes("20") ||
    employee.includes("50") ||
    employee.includes("100") ||
    employee.includes("200") ||
    employee.includes("250") ||
    employee.includes("500")
  ) {
    score += 5;
    reasons.push("Taille d'entreprise potentiellement intéressante");
  }

  if (
    employee.includes("100") ||
    employee.includes("200") ||
    employee.includes("250") ||
    employee.includes("500")
  ) {
    score += 4;
    reasons.push("Structure pouvant avoir des besoins industriels récurrents");
  }

  // 8. Malus si trop peu de signaux
  if (!normalizedNaf && !hasStrongKeyword && !hasMediumKeyword) {
    score -= 10;
    reasons.push("Très peu de signaux métier détectés");
  }

  if (!hasStrongKeyword && matchedWeak.length > 0 && !hasMediumKeyword) {
    score -= 5;
    reasons.push("Activité encore trop générique à ce stade");
  }

  if (hasNegativeKeyword && !hasStrongKeyword) {
    score -= 10;
    reasons.push("Peu de cohérence avec la cible industrielle recherchée");
  }

  // 9. Bornes
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return {
    score,
    reasons: Array.from(new Set(reasons)),
  };
}

type SerpApiOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
};

type SerpApiResponse = {
  organic_results?: SerpApiOrganicResult[];
};

export type WebsiteCandidate = {
  url: string;
  hostname: string;
  source: "domain-guess" | "serpapi";
  score: number;
  searchScore?: number;
  validationScore?: number;
  reason: string;
  title?: string;
  snippet?: string;
  query?: string;
};

function normalizeForDomain(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractWords(input: string) {
  return normalizeText(input)
    .split(" ")
    .filter((w) => w.length >= 3);
}

function cleanBaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return url;
  }
}

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isBadDomain(hostname: string) {
  const blocked = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "societe.com",
    "pappers.fr",
    "verif.com",
    "manageo.fr",
    "infogreffe.fr",
    "pagesjaunes.fr",
    "annuaire-entreprises.data.gouv.fr",
    "google.com",
    "google.fr",
    "bing.com",
    "wikipedia.org",
  ];

  return blocked.some((domain) => hostname.includes(domain));
}

function generateDomains(input: {
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
}) {
  const seeds = [
    input.tradeName,
    input.name,
    input.businessKeywords,
    [input.tradeName, input.businessKeywords].filter(Boolean).join(" "),
    [input.name, input.businessKeywords].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];

  const variations = new Set<string>();

  for (const seed of seeds) {
    const words = extractWords(seed);

    if (words.length === 0) continue;

    const compact = normalizeForDomain(seed);
    if (compact) variations.add(compact);

    variations.add(words.join(""));
    variations.add(words.join("-"));

    if (words.length >= 2) {
      variations.add(`${words[0]}${words[1]}`);
      variations.add(`${words[0]}-${words[1]}`);
      variations.add(`${words[0]}${words[words.length - 1]}`);
      variations.add(`${words[0]}-${words[words.length - 1]}`);
    }

    if (words[0]) variations.add(words[0]);
  }

  const domains: string[] = [];
  for (const variation of variations) {
    if (!variation || variation.length < 3) continue;
    domains.push(`${variation}.fr`);
    domains.push(`${variation}.com`);
    domains.push(`${variation}.eu`);
  }

  return Array.from(new Set(domains));
}

async function testDomain(domain: string) {
  const urls = [`https://${domain}`, `http://${domain}`];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        redirect: "follow",
        cache: "no-store",
      });

      if (res.ok) {
        return cleanBaseUrl(res.url || url);
      }
    } catch {}
  }

  return null;
}

async function validateWebsite(input: {
  url: string;
  companyName: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  try {
    const res = await fetch(input.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      return { isValid: false, score: 0, reason: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const text = normalizeText(html);

    const tradeWords = extractWords(input.tradeName ?? "");
    const nameWords = extractWords(input.companyName);
    const keywordWords = extractWords(input.businessKeywords ?? "");
    const cityWords = extractWords(input.city ?? "");

    let identityScore = 0;
    let keywordScore = 0;

    for (const word of tradeWords) {
      if (text.includes(word)) identityScore += 4;
    }

    for (const word of nameWords) {
      if (text.includes(word)) identityScore += 3;
    }

    for (const word of keywordWords) {
      if (text.includes(word)) keywordScore += 1;
    }

    for (const word of cityWords) {
      if (text.includes(word)) keywordScore += 1;
    }

    if (input.siren && text.includes(input.siren)) identityScore += 8;
    if (text.includes("mentions legales")) keywordScore += 1;
    if (text.includes("contact")) keywordScore += 1;
    if (text.includes("a propos")) keywordScore += 1;

    const totalScore = identityScore + keywordScore;
    const isValid = identityScore >= 3;

    return {
      isValid,
      score: totalScore,
      reason: `identity=${identityScore} keyword=${keywordScore} total=${totalScore}`,
    };
  } catch (error) {
    return {
      isValid: false,
      score: 0,
      reason: error instanceof Error ? error.message : "Erreur validation site",
    };
  }
}

async function collectDomainGuessCandidates(input: {
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  const domains = generateDomains(input);
  const candidates: WebsiteCandidate[] = [];

  for (const domain of domains.slice(0, 30)) {
    const url = await testDomain(domain);
    if (!url) continue;

    const validation = await validateWebsite({
      url,
      companyName: input.name,
      tradeName: input.tradeName,
      businessKeywords: input.businessKeywords,
      city: input.city,
      siren: input.siren,
    });

    if (!validation.isValid) continue;

    candidates.push({
      url,
      hostname: hostnameFromUrl(url),
      source: "domain-guess",
      score: validation.score,
      validationScore: validation.score,
      reason: validation.reason,
    });
  }

  return candidates;
}

function scoreSearchCandidate(input: {
  hostname: string;
  title?: string;
  snippet?: string;
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  const host = normalizeText(
    input.hostname.replace(/^www\./, "").split(".")[0] ?? "",
  );
  const title = normalizeText(input.title ?? "");
  const snippet = normalizeText(input.snippet ?? "");

  const tradeWords = extractWords(input.tradeName ?? "");
  const nameWords = extractWords(input.name);
  const keywordWords = extractWords(input.businessKeywords ?? "");
  const cityWords = extractWords(input.city ?? "");

  let score = 0;

  for (const word of tradeWords) {
    if (host.includes(word)) score += 10;
    if (title.includes(word)) score += 8;
    if (snippet.includes(word)) score += 5;
  }

  for (const word of nameWords) {
    if (host.includes(word)) score += 7;
    if (title.includes(word)) score += 5;
    if (snippet.includes(word)) score += 3;
  }

  for (const word of keywordWords) {
    if (title.includes(word)) score += 1;
    if (snippet.includes(word)) score += 1;
    if (host.includes(word)) score += 0.5;
  }

  for (const word of cityWords) {
    if (title.includes(word)) score += 1;
    if (snippet.includes(word)) score += 1;
  }

  if (input.siren && snippet.includes(input.siren)) score += 10;

  const hasIdentityInHost =
    tradeWords.some((w) => host.includes(w)) ||
    nameWords.some((w) => host.includes(w));

  if (!hasIdentityInHost) {
    score -= 8;
  }

  return score;
}

async function collectSerpApiCandidates(input: {
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return [] as WebsiteCandidate[];
  }

  const queries = [
    [input.tradeName, input.businessKeywords, input.city]
      .filter(Boolean)
      .join(" "),
    [input.name, input.businessKeywords, input.city].filter(Boolean).join(" "),
    [input.tradeName, input.city, "site officiel"].filter(Boolean).join(" "),
    [input.name, input.city, "site officiel"].filter(Boolean).join(" "),
    [input.name, input.siren].filter(Boolean).join(" "),
  ].filter(Boolean);

  const rawCandidates: Array<{
    url: string;
    hostname: string;
    title?: string;
    snippet?: string;
    searchScore: number;
    query: string;
  }> = [];

  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: "google",
      google_domain: "google.fr",
      hl: "fr",
      gl: "fr",
      num: "10",
    });

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) continue;

    const data: SerpApiResponse = await res.json();
    const results = data.organic_results ?? [];

    for (const result of results) {
      if (!result.link) continue;

      try {
        const parsed = new URL(result.link);
        const hostname = parsed.hostname.replace(/^www\./, "");
        if (isBadDomain(hostname)) continue;

        const url = cleanBaseUrl(result.link);

        rawCandidates.push({
          url,
          hostname,
          title: result.title,
          snippet: result.snippet,
          searchScore: scoreSearchCandidate({
            hostname,
            title: result.title,
            snippet: result.snippet,
            name: input.name,
            tradeName: input.tradeName,
            businessKeywords: input.businessKeywords,
            city: input.city,
            siren: input.siren,
          }),
          query,
        });
      } catch {}
    }
  }

  const deduped = Array.from(
    new Map(rawCandidates.map((item) => [item.url, item])).values(),
  ).sort((a, b) => b.searchScore - a.searchScore);

  const validated: WebsiteCandidate[] = [];

  for (const candidate of deduped.slice(0, 8)) {
    const validation = await validateWebsite({
      url: candidate.url,
      companyName: input.name,
      tradeName: input.tradeName,
      businessKeywords: input.businessKeywords,
      city: input.city,
      siren: input.siren,
    });

    const finalScore = candidate.searchScore + validation.score;

    if (!validation.isValid) continue;
    if (finalScore < 8) continue;

    validated.push({
      url: candidate.url,
      hostname: candidate.hostname,
      source: "serpapi",
      score: finalScore,
      searchScore: candidate.searchScore,
      validationScore: validation.score,
      reason: validation.reason,
      title: candidate.title,
      snippet: candidate.snippet,
      query: candidate.query,
    });
  }

  return validated;
}

export async function findCompanyWebsiteCandidates(input: {
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  const domainCandidates = await collectDomainGuessCandidates(input);
  const serpCandidates = await collectSerpApiCandidates(input);

  const merged = [...domainCandidates, ...serpCandidates];

  const deduped = Array.from(
    new Map(
      merged.map((candidate) => [
        candidate.url,
        {
          ...candidate,
          score: candidate.score,
        },
      ]),
    ).values(),
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return deduped;
}

// Compat temporaire si tu as encore d'autres appels quelque part
export async function findCompanyWebsite(input: {
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  city?: string | null;
  siren?: string | null;
}) {
  const candidates = await findCompanyWebsiteCandidates(input);
  const best = candidates[0];

  if (!best) {
    return {
      found: false,
      website: null,
      method: "none",
      confidence: 0,
      debug: { candidates: [] },
    };
  }

  return {
    found: true,
    website: best.url,
    method: best.source,
    confidence: best.score,
    debug: best,
  };
}

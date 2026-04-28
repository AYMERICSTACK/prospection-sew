const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

const BLOCKED_EMAIL_PARTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".css",
  ".js",
  ".ico",
  "example.com",
];

function cleanEmail(email: string) {
  return email
    .trim()
    .replace(/^mailto:/i, "")
    .toLowerCase();
}

function isLikelyValidBusinessEmail(email: string) {
  const normalized = cleanEmail(email);

  if (!normalized.includes("@")) return false;

  return !BLOCKED_EMAIL_PARTS.some((part) => normalized.includes(part));
}

export async function extractEmailsFromWebsite(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    const matches = html.match(EMAIL_REGEX) ?? [];

    const emails = Array.from(
      new Set(matches.map(cleanEmail).filter(isLikelyValidBusinessEmail)),
    );

    return emails;
  } catch {
    return [];
  }
}

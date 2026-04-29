export type Company = {
  id: string;
  name: string;
  tradeName?: string | null;
  businessKeywords?: string | null;
  siren?: string | null;
  nafCode?: string | null;
  nafLabel?: string | null;
  city?: string | null;
  region?: string | null;
  website?: string | null;
  email?: string | null;
  emailStatus?: string | null;
  emailSource?: string | null;
  employeeRange?: string | null;
  postalCode?: string | null;
  commercialStage?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  lastContactResult?: string | null;
  activities?: CompanyActivity[];
  prospect?: {
    score: number;
    whyRelevant?: string | null;
    pitchAngle?: string | null;
    status?: string | null;
    websiteScan?: string | null;
    websiteScore?: number | null;
  } | null;
};

export type CompaniesResponse = {
  success: boolean;
  count: number;
  data: Company[];
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

export type WebsiteCandidatesMap = Record<string, WebsiteCandidate[]>;

export type CompanyActivity = {
  id: string;
  type: string;
  result?: string | null;
  notes?: string | null;
  actionDate: string;
  nextFollowUpAt?: string | null;
};

export type ActivityFormState = {
  type: string;
  result: string;
  notes: string;
  actionDate: string;
  nextFollowUpAt: string;
};

export type PipelineGroup = "prospect" | "discussion" | "client" | "lost";

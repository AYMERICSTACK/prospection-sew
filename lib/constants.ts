import type { ActivityFormState, PipelineGroup } from "./types";

export const INITIAL_FORM = {
  name: "",
  tradeName: "",
  businessKeywords: "",
  siren: "",
  nafCode: "",
  nafLabel: "",
  city: "",
  region: "",
  website: "",
  employeeRange: "",
  commercialStage: "PROSPECT",
};

export const INITIAL_IMPORT_FORM = {
  query: "",
  department: "",
  nafCode: "",
  perPage: "10",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: "Appel",
  EMAIL: "Email",
  VISIT: "Visite",
  FLYER: "Flyer / prospectus",
  FOLLOW_UP: "Relance",
  NOTE: "Note",
};

export const ACTIVITY_RESULT_LABELS: Record<string, string> = {
  NO_ANSWER: "Pas de réponse",
  NOT_INTERESTED: "Pas intéressé",
  TO_CALL_BACK: "À recontacter",
  INTERESTED: "Intéressé",
  APPOINTMENT_TO_SCHEDULE: "RDV à planifier",
  APPOINTMENT_BOOKED: "RDV pris",
  QUOTE_REQUESTED: "Devis demandé",
  ALREADY_EQUIPPED: "Déjà équipé",
  WRONG_CONTACT: "Mauvais contact",
  INFORMATION_SENT: "Infos envoyées",
  OTHER: "Autre",
};

export const COMMERCIAL_STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  TARGET: "Compte cible",
  CLIENT: "Client",
  INACTIVE: "Inactif",
};

export const COMMERCIAL_STAGE_COLORS: Record<string, string> = {
  PROSPECT: "border border-slate-200 bg-slate-100 text-slate-700",
  TARGET: "border border-blue-200 bg-blue-100 text-blue-700",
  CLIENT: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  INACTIVE: "border border-slate-300 bg-slate-200 text-slate-600",
};

export const ACTIVITY_RESULT_COLORS: Record<string, string> = {
  NO_ANSWER: "border border-slate-200 bg-slate-100 text-slate-700",
  NOT_INTERESTED: "border border-red-200 bg-red-100 text-red-700",
  TO_CALL_BACK: "border border-amber-200 bg-amber-100 text-amber-700",
  INTERESTED: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  APPOINTMENT_TO_SCHEDULE: "border border-blue-200 bg-blue-100 text-blue-700",
  APPOINTMENT_BOOKED: "border border-violet-200 bg-violet-100 text-violet-700",
  QUOTE_REQUESTED: "border border-cyan-200 bg-cyan-100 text-cyan-700",
  ALREADY_EQUIPPED: "border border-slate-300 bg-slate-200 text-slate-700",
  WRONG_CONTACT: "border border-orange-200 bg-orange-100 text-orange-700",
  INFORMATION_SENT: "border border-indigo-200 bg-indigo-100 text-indigo-700",
  OTHER: "border border-slate-200 bg-slate-100 text-slate-700",
};

export const CLOSED_RESULTS = [
  "NOT_INTERESTED",
  "ALREADY_EQUIPPED",
  "WRONG_CONTACT",
];

export const PIPELINE_COLUMNS: {
  key: PipelineGroup;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    key: "prospect",
    label: "Prospect",
    description: "À qualifier",
    className: "border-slate-200 bg-slate-50",
  },
  {
    key: "discussion",
    label: "En discussion",
    description: "Contact, relance, RDV",
    className: "border-blue-200 bg-blue-50/70",
  },
  {
    key: "client",
    label: "Déjà client",
    description: "Portefeuille clients",
    className: "border-emerald-200 bg-emerald-50/70",
  },
  {
    key: "lost",
    label: "Perdu / hors cible",
    description: "Pas intéressé ou inactif",
    className: "border-red-200 bg-red-50/70",
  },
];

export const INITIAL_ACTIVITY_FORM: ActivityFormState = {
  type: "CALL",
  result: "TO_CALL_BACK",
  notes: "",
  actionDate: new Date().toISOString().slice(0, 16),
  nextFollowUpAt: "",
};

export const SURFACE_CARD =
  "rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

export const INPUT_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70";

export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm";

export const BUTTON_GHOST =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50";

export const LABEL_MUTED =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400";

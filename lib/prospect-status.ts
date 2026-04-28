export const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  TO_REVIEW: "À analyser",
  QUALIFIED: "Qualifié",
  CONTACTED: "Contacté",
  FOLLOW_UP: "Relance",
  WON: "Gagné",
  LOST: "Perdu",
  ARCHIVED: "Archivé",
  CLIENT: "Déjà client", // 👈 AJOUT
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: "border border-slate-200 bg-slate-100 text-slate-700",
  TO_REVIEW: "border border-blue-200 bg-blue-100 text-blue-700",
  QUALIFIED: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  CONTACTED: "border border-indigo-200 bg-indigo-100 text-indigo-700",
  FOLLOW_UP: "border border-amber-200 bg-amber-100 text-amber-700",
  WON: "border border-green-200 bg-green-100 text-green-700",
  LOST: "border border-red-200 bg-red-100 text-red-700",
  ARCHIVED: "border border-slate-300 bg-slate-200 text-slate-600",
  CLIENT: "border border-emerald-300 bg-emerald-200 text-emerald-900",
};

export const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  TO_REVIEW: "À analyser",
  QUALIFIED: "Qualifié",
  CONTACTED: "Contacté",
  FOLLOW_UP: "Relance",
  WON: "Gagné",
  LOST: "Perdu",
  ARCHIVED: "Archivé",
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  TO_REVIEW: "bg-purple-100 text-purple-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  FOLLOW_UP: "bg-amber-100 text-amber-700",
  WON: "bg-green-200 text-green-800",
  LOST: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

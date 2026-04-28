export const STRONG_KEYWORDS = [
  { label: "convoyeur", weight: 10 },
  { label: "convoyage", weight: 10 },
  { label: "transporteur a bande", weight: 10 },
  { label: "transporteur à bande", weight: 10 },
  { label: "motorisation", weight: 9 },
  { label: "reducteur", weight: 9 },
  { label: "réducteur", weight: 9 },
  { label: "motoreducteur", weight: 10 },
  { label: "motoréducteur", weight: 10 },
  { label: "variateur", weight: 9 },
  { label: "automatisme", weight: 8 },
  { label: "automatisation", weight: 8 },
  { label: "machine speciale", weight: 9 },
  { label: "machine spéciale", weight: 9 },
  { label: "palettisation", weight: 8 },
  { label: "conditionnement", weight: 8 },
  { label: "emballage", weight: 7 },
];

export const MEDIUM_KEYWORDS = [
  { label: "manutention", weight: 6 },
  { label: "intralogistique", weight: 7 },
  { label: "levage", weight: 5 },
  { label: "ligne de production", weight: 6 },
  { label: "chaine de production", weight: 6 },
  { label: "chaîne de production", weight: 6 },
  { label: "maintenance industrielle", weight: 7 },
  { label: "integration de ligne", weight: 7 },
  { label: "intégration de ligne", weight: 7 },
  { label: "process industriel", weight: 5 },
  { label: "electromecanique", weight: 6 },
  { label: "électromécanique", weight: 6 },
  { label: "atelier industriel", weight: 4 },
];

export const WEAK_KEYWORDS = [
  { label: "maintenance", weight: 2 },
  { label: "process", weight: 2 },
  { label: "production", weight: 2 },
  { label: "industrie", weight: 1 },
  { label: "equipement", weight: 2 },
  { label: "équipement", weight: 2 },
];

export const NEGATIVE_KEYWORDS = [
  { label: "menuiserie", weight: -8 },
  { label: "boulangerie", weight: -10 },
  { label: "coiffure", weight: -12 },
  { label: "restaurant", weight: -12 },
  { label: "commerce de detail", weight: -12 },
  { label: "commerce de détail", weight: -12 },
  { label: "agence immobiliere", weight: -12 },
  { label: "agence immobilière", weight: -12 },
  { label: "cabinet comptable", weight: -12 },
  { label: "pharmacie", weight: -10 },
  { label: "supermarche", weight: -12 },
  { label: "supermarché", weight: -12 },
];

export const HIGH_PRIORITY_NAF_PREFIXES = [
  "2822", // matériel de levage et de manutention
  "2829", // autres machines d'usage général
  "2893", // machines pour industrie agroalimentaire
  "2899", // autres machines spécialisées
  "3320", // installation de machines et équipements mécaniques
];

export const MEDIUM_PRIORITY_NAF_PREFIXES = [
  "28", // fabrication de machines / équipements
  "33", // installation / maintenance industrielle
  "27", // équipements électriques / électromécaniques
];

export const LOW_PRIORITY_NAF_PREFIXES = [
  "25", // fabrication métallique, potentiellement pertinente
];

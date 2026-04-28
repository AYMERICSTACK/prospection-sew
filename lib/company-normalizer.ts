type ApiEntreprise = {
  siren?: string;
  nom_complet?: string;
  tranche_effectif_salarie?: string | null;
  activite_principale?: string | null;
  libelle_activite_principale?: string | null;
  siege?: {
    siret?: string;
    libelle_commune?: string | null;
    code_postal?: string | null;
    adresse?: string | null;
  } | null;
};

export function normalizeCompanyFromApi(company: ApiEntreprise) {
  return {
    name: company.nom_complet ?? "Entreprise sans nom",
    siren: company.siren ?? null,
    siret: company.siege?.siret ?? null,
    nafCode: company.activite_principale ?? null,
    nafLabel: company.libelle_activite_principale ?? null,
    city: company.siege?.libelle_commune ?? null,
    postalCode: company.siege?.code_postal ?? null,
    address: company.siege?.adresse ?? null,
    employeeRange: company.tranche_effectif_salarie ?? null,
    region: null,
    website: null,
    source: "api-recherche-entreprises",
  };
}

"use client";

import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT_CLASS,
  SURFACE_CARD,
} from "../../lib/constants";

type CompanyFormState = {
  name: string;
  tradeName: string;
  businessKeywords: string;
  siren: string;
  nafCode: string;
  nafLabel: string;
  city: string;
  region: string;
  website: string;
  employeeRange: string;
  commercialStage: string;
};

type Props = {
  form: CompanyFormState;
  setForm: React.Dispatch<React.SetStateAction<CompanyFormState>>;
  editingCompanyId: string | null;
  submitting: boolean;
  resetForm: () => void;
  handleCreateCompany: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function CompanyForm({
  form,
  setForm,
  editingCompanyId,
  submitting,
  resetForm,
  handleCreateCompany,
}: Props) {
  return (
    <div className={`${SURFACE_CARD} p-6`}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {editingCompanyId
            ? "Modifier l’entreprise"
            : "Ajouter une entreprise"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {editingCompanyId
            ? "Mets à jour les informations de l’entreprise sélectionnée."
            : "Ajout manuel pour enrichir rapidement la base prospects."}
        </p>
      </div>

      <form onSubmit={handleCreateCompany} className="space-y-4">
        <Field
          label="Nom de l’entreprise *"
          value={form.name}
          onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Field
            label="SIREN"
            value={form.siren}
            onChange={(value) => setForm((prev) => ({ ...prev, siren: value }))}
          />

          <Field
            label="Code NAF"
            value={form.nafCode}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, nafCode: value }))
            }
          />
        </div>

        <Field
          label="Libellé NAF"
          value={form.nafLabel}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, nafLabel: value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Field
            label="Ville"
            value={form.city}
            onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
          />

          <Field
            label="Région"
            value={form.region}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, region: value }))
            }
          />
        </div>

        <Field
          label="Site web"
          value={form.website}
          onChange={(value) => setForm((prev) => ({ ...prev, website: value }))}
          placeholder="https://..."
        />

        <Field
          label="Tranche d’effectif"
          value={form.employeeRange}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, employeeRange: value }))
          }
          placeholder="10-19 / 20-49 / 50-99..."
        />

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${BUTTON_PRIMARY}`}
        >
          {submitting
            ? editingCompanyId
              ? "Modification en cours..."
              : "Ajout en cours..."
            : editingCompanyId
              ? "Enregistrer les modifications"
              : "Ajouter l’entreprise"}
        </button>

        {editingCompanyId && (
          <button
            type="button"
            onClick={resetForm}
            className={`w-full ${BUTTON_SECONDARY}`}
          >
            Annuler la modification
          </button>
        )}
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </label>
  );
}

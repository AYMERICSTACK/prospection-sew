"use client";

import { BUTTON_PRIMARY, INPUT_CLASS, SURFACE_CARD } from "../../lib/constants";

type ImportForm = {
  query: string;
  department: string;
  nafCode: string;
  perPage: string;
};

type Props = {
  importForm: ImportForm;
  setImportForm: React.Dispatch<React.SetStateAction<ImportForm>>;
  submitting: boolean;
  handleImportCompanies: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function ImportCompaniesForm({
  importForm,
  setImportForm,
  submitting,
  handleImportCompanies,
}: Props) {
  return (
    <div className={`${SURFACE_CARD} p-6`}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Import automatique
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Recherche et import direct d’entreprises françaises depuis une source
          publique.
        </p>
      </div>

      <form onSubmit={handleImportCompanies} className="space-y-4">
        <Field
          label="Recherche"
          value={importForm.query}
          onChange={(value) =>
            setImportForm((prev) => ({ ...prev, query: value }))
          }
          placeholder="convoyeur, maintenance industrielle, machines spéciales..."
        />

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Field
            label="Département"
            value={importForm.department}
            onChange={(value) =>
              setImportForm((prev) => ({ ...prev, department: value }))
            }
            placeholder="01 / 69 / 42..."
          />

          <Field
            label="Code NAF"
            value={importForm.nafCode}
            onChange={(value) =>
              setImportForm((prev) => ({ ...prev, nafCode: value }))
            }
            placeholder="2822Z"
          />

          <Field
            label="Nombre"
            value={importForm.perPage}
            onChange={(value) =>
              setImportForm((prev) => ({ ...prev, perPage: value }))
            }
            placeholder="10"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${BUTTON_PRIMARY}`}
        >
          {submitting ? "Import en cours..." : "Importer automatiquement"}
        </button>
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

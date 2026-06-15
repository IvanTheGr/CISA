import { FiSave, FiClipboard } from "react-icons/fi";

/* ================= FIELD ================= */

const Field = ({ label, value, onChange }) => (
  <div className="grid grid-cols-[200px_1fr] border-b">

    <label className="px-4 py-3 bg-slate-50 border-r text-sm font-semibold">
      {label}
    </label>

    <textarea
      rows={3}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 outline-none resize-none w-full"
    />

  </div>
);

/* ================= MAIN COMPONENT ================= */

const IncidentLogForm = ({ data = {}, onChange, onSave, isDirty }) => {

  return (

    <div className="bg-white rounded-xl border shadow-sm">

      {/* HEADER */}

      <div className="flex items-center gap-2 p-4 border-b">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg text-white" style={{ background: "#F05454" }}>
                 <FiClipboard size={15} />
               </div>
        <h2 className="font-semibold text-slate-700">
          Incident Log
        </h2>
      </div>

      {/* FORM */}

      <Field
        label="Issue"
        value={data?.issue}
        onChange={(v) => onChange("issue", v)}
      />

      <Field
        label="Impact"
        value={data?.impact}
        onChange={(v) => onChange("impact", v)}
      />

      <Field
        label="Environment"
        value={data?.environment}
        onChange={(v) => onChange("environment", v)}
      />

      <Field
        label="Chronology"
        value={data?.chronology}
        onChange={(v) => onChange("chronology", v)}
      />

      <Field
        label="Root Cause"
        value={data?.rootCause}
        onChange={(v) => onChange("rootCause", v)}
      />

      <Field
        label="Workaround"
        value={data?.workaround}
        onChange={(v) => onChange("workaround", v)}
      />

      <Field
        label="Recommendation"
        value={data?.recommendation}
        onChange={(v) => onChange("recommendation", v)}
      />

      <Field 
        label="Notes"
        value={data?.notes}
        onChange={(v) => onChange("notes", v)}
      />

      <Field
        label="Permanent Solution"
        value={data?.permanentSolution}
        onChange={(v) => onChange("permanentSolution", v)}
      />

      {/* SAVE BUTTON */}

      <div className="p-4">

        <button
          onClick={onSave}
          disabled={!isDirty}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white
          text-white hover:shadow-md hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          style={{ background: isDirty ? "linear-gradient(90deg, #D73A30, #872924)" : "#94a3b8" }}
                      >
          <FiSave />
          Save Incident Log
        </button>

      </div>

    </div>

  );
};

export default IncidentLogForm;
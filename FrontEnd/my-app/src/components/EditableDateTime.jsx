const EditableDateTime = ({ label, value, onChange }) => {

  const toDisplay = (val) => {
    if (!val) return "";
    try {
      return val.replace("T", " ").substring(0, 23);
    } catch {
      return val;
    }
  };

  const toISO = (val) => {
    if (!val) return val;
    try {
      if (val.includes("T")) return val;
      return val.replace(" ", "T");
    } catch {
      return val;
    }
  };

  return (
    <div
      className="group grid border border-b-0 last:border-b hover:bg-gray-50 transition-colors"
      style={{
        gridTemplateColumns: "minmax(110px, 160px) 1fr",
        borderColor: "#e5e7eb",
        background: "white",
      }}
    >
      <label
        className="flex items-center px-3 py-2.5 border-r text-xs font-semibold uppercase tracking-wide leading-tight"
        style={{
          background: "#f9fafb",
          borderColor: "#e5e7eb",
          color: "#374151",
          wordBreak: "break-word",
          hyphens: "auto",
          minWidth: 0,
        }}
      >
        {label}
      </label>

      <input
        type="text"
        placeholder="YYYY-MM-DD HH:mm:ss"
        value={toDisplay(value)}
        onChange={(e) => onChange(toISO(e.target.value))}
        className="px-3 py-2.5 text-xs text-gray-700 bg-transparent border-none outline-none w-full min-w-0 transition-all placeholder:text-gray-400"
        style={{ fontSize: "12px" }}
        onFocus={(e) => {
          e.currentTarget.style.background = "#f9fafb";
          e.currentTarget.style.boxShadow = "inset 0 0 0 2px rgba(0,0,0,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
};

export default EditableDateTime;

  import EditableDateTime from "./EditableDateTime";
  import { FiFileText, FiEdit3, FiSave } from "react-icons/fi";
  import "./TicketTable.css";
  import { useState } from "react";

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      const date = new Date(value);
      const pad = (n, z = 2) => String(n).padStart(z, "0");
      return (
        date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate()) + " " +
        pad(date.getHours()) + ":" +
        pad(date.getMinutes()) + ":" +
        pad(date.getSeconds()) + "." +
        pad(date.getMilliseconds(), 3)
      );
    } catch { return value; }
  };

  /* Field row — read only */
  const Field = ({ label, value }) => (
    <div
      className="grid transition-colors"
      style={{
        gridTemplateColumns: "minmax(120px, 180px) 1fr",
        borderBottom: "1px solid #F3F4F6",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span
        className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide leading-tight"
        style={{
          background: "#F9FAFB",
          borderRight: "1px solid #F3F4F6",
          color: "#6B7280",
          wordBreak: "break-word",
          hyphens: "auto",
          minWidth: 0,
        }}
      >
        {label}
      </span>
      <span
        className="px-3 py-2.5 text-sm"
        style={{
          color: "#1F2937",
          minWidth: 0,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {value ?? "-"}
      </span>
    </div>
  );

  /* Section header */
  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2.5 mb-0">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg text-white flex-shrink-0"
        style={{ background: "#F05454" }}>
        <Icon size={15} />
      </div>
      <h2 className="text-base font-semibold" style={{ color: "#1F2937" }}>{title}</h2>
    </div>
  );

const TicketDetail = ({ ticket, onChange, onSave, isDirty }) => {

  const [showCalculator, setShowCalculator] = useState(false);
    if (!ticket) {
      return (
        <div className="bg-white rounded-xl border p-10 text-center"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#F3F4F6" }}>
            <span className="text-2xl">🎫</span>
          </div>
          <p className="text-sm font-medium" style={{ color: "#6B7280" }}>Select a ticket to view details</p>
          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Use the search bar above to find a ticket</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Ticket Detail Card */}
        <div className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

          {/* Card header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            <SectionHeader icon={FiFileText} title="Ticket Detail" />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md"
                style={{ background: "#FFF1F1", color: "#F05454", border: "1px solid #FEE2E2" }}>
                #{ticket.id}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-md hidden sm:inline-block"
                style={{ background: "#F3F4F6", color: "#374151" }}>
                {ticket.ticketNumber}
              </span>
            </div>
          </div>

          {/* Fields — stacked on mobile, 2-col on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: "1px solid #F3F4F6" }}>
            <div className="md:border-r" style={{ borderColor: "#F3F4F6" }}>
              <Field label="Company" value={ticket.partner?.name} />
              <Field label="PIC" value={ticket.user?.employee?.name ?? ticket.picName} />
              <Field label="Product" value={ticket.product?.name} />
              <Field label="Priority" value={ticket.priority?.name} />
              <Field label="SLA ID" value={ticket.slaId} />
              <Field label="Countdown Condition" value={ticket.countdownCondition} />
            </div>
            <div>
              <Field label="Target Response Time" value={ticket.responseTime} />
              <Field label="Target Resolution Time" value={ticket.resolutionTime} />
              <Field label="Create Date (GMT)" value={formatDateTime(ticket.createDate)} />
              <Field label="Close Time (GMT)" value={formatDateTime(ticket.closeTime)} />
              <Field label="Close Date" value={ticket.closeDate} />

              <Field label="Response To Close" value={ticket.responseToClose} />
            </div>
          </div>
          <div>
            <Field label="Status" value={ticket.state?.name} /> 
            <Field label="SUBJECT" value={ticket?.subject} />
            <Field label="Start Resolution (GMT)" value={formatDateTime(ticket.startResolutionTimeNoGmt)} />
            <Field label="End Resolution (GMT)" value={formatDateTime(ticket.endResolutionTimeNoGmt)} />
          </div>
        </div>

        {/* Edit Timestamps Card */}
        <div className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

          <div className="flex items-center px-4 py-3"
            style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            <SectionHeader icon={FiEdit3} title="Edit Ticket Timestamps" />
          </div>

          <div className="p-4">
            <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
              <EditableDateTime
                label="Create Date Time"
                value={ticket.createDateTime}
                onChange={(v) => onChange("createDateTime", v)}
              />
              <EditableDateTime
                label="First Response Time"
                value={ticket.startResolutionTime}
                onChange={(v) => onChange("startResolutionTime", v)}
              />
              <EditableDateTime
                label="End Resolution Time"
                value={ticket.endResolutionTime}
                onChange={(v) => onChange("endResolutionTime", v)}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button
                disabled={!isDirty}
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all text-white
                          hover:shadow-lg hover:-translate-y-0.5
                          disabled:opacity-50 disabled:cursor-not-allowed
                          disabled:hover:shadow-none disabled:hover:translate-y-0"
                style={{ background: isDirty ? "linear-gradient(90deg, #D73A30, #872924)" : "#94a3b8" }}
              >
                <FiSave size={15} />
                Save Changes
              </button>

                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
                  style={{ background: "#3B82F6" }}
                >
                  View
                </button>

              {isDirty && (
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#F59E0B" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              )}
            </div>

            
            {showCalculator && (

                <div className="mt-6 grid md:grid-cols-2 gap-4">

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold">
                      Response Time (Open → Start) Decimal Hours
                    </p>
                    <p>
                      {(new Date(ticket.startResolutionTime) - new Date(ticket.createDateTime)) / 3600000}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold">
                      Resolution Time (Start → Close) Decimal Hours
                    </p>
                    <p>
                      {(new Date(ticket.endResolutionTime) - new Date(ticket.startResolutionTime)) / 3600000}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold">
                      First Response Time (Open → Response)
                    </p>
                    <p>
                      {(new Date(ticket.startResolutionTime) - new Date(ticket.createDateTime)) / 3600000}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold">
                      Total Resolution Time (Response + Resolution)
                    </p>
                    <p>
                      {
                        (new Date(ticket.closeTime) - new Date(ticket.createDate)) / 3600000
                      }
                    </p>
                  </div>

                </div>

              )}
          </div>
        </div>
      </div>
    );
  };

  export default TicketDetail;

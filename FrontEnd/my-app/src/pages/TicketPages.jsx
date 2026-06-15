import { useEffect, useState } from "react";
import {
  fetchTicketByNumber,
  fetchMessagesByTicketNumber,
  fetchIncidentByTicketNumber,
  updateTicket,
  updateMessage,
  updateIncidentLog,
  searchTicketDropdown
} from "../api/ticket_api";

import SearchBar from "../components/SearchBar";
import TicketDetail from "../components/TicketTable";
import TicketMessageTable from "../components/TicketMessageTable";
import IncidentLogForm from "../components/IncidentLogForm";

import { motion } from "framer-motion";
import { FiSearch, FiClipboard } from "react-icons/fi";


const normalizeDateTimeForBackend = (value) => {
  if (!value) return null;

  const cleaned = String(value).trim();

  if (!cleaned || cleaned === "-") return null;

  return cleaned.replace(" ", "T");
};

const TicketPage = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [editedTicket, setEditedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const [incidentLog, setIncidentLog] = useState({});
  const [incidentDirty, setIncidentDirty] = useState(false);

  /* ===============================
     LOAD DROPDOWN TICKET LIST
  =============================== */

  const loadTicketDropdown = async (keyword = "") => {
    try {
      const res = await searchTicketDropdown(keyword);
      setTicketList(res.data || []);
    } catch (err) {
      console.error("Failed load ticket dropdown", err);
      setTicketList([]);
    }
  };

  useEffect(() => {
    loadTicketDropdown("");
  }, []);

  /* ===============================
     LOAD TICKET DATA BY TICKET NUMBER
  =============================== */

  const loadTicketData = async () => {
    const number = String(ticketNumber || "").trim();
    if (!number) return;

    try {
      const ticketRes = await fetchTicketByNumber(number);

      setEditedTicket(ticketRes.data);

      try {
        const msgRes = await fetchMessagesByTicketNumber(number);
        setMessages(msgRes.data || []);
      } catch (msgErr) {
        console.warn("Messages not found / failed", msgErr);
        setMessages([]);
      }

      try {
        const incidentRes = await fetchIncidentByTicketNumber(number);
        setIncidentLog(incidentRes.data ?? {});
      } catch (incidentErr) {
        console.warn("Incident log not found / failed", incidentErr);
        setIncidentLog({});
      }

      setIsDirty(false);
      setIncidentDirty(false);
    } catch (err) {
      console.error(err);
      setEditedTicket(null);
      setMessages([]);
      setIncidentLog({});
      alert("Ticket not found atau backend error.");
    }
  };

  /* ===============================
     EDIT TICKET FIELD
  =============================== */

  const handleFieldChange = (field, value) => {
    setEditedTicket(prev => ({
      ...prev,
      [field]: value
    }));

    setIsDirty(true);
  };

  /* ===============================
     SAVE TICKET
  =============================== */

const handleSaveTicket = async () => {
  if (!editedTicket?.id) return;

  try {
    await updateTicket(editedTicket.id, {
      createDateTime: normalizeDateTimeForBackend(editedTicket.createDateTime),
      startResolutionTime: normalizeDateTimeForBackend(editedTicket.startResolutionTime),
      endResolutionTime: normalizeDateTimeForBackend(editedTicket.endResolutionTime)
    });

    await loadTicketData();

    alert("Ticket saved");

    setIsDirty(false);
  } catch (err) {
    console.error(err);
    alert("Gagal save ticket");
  }
};

  /* ===============================
     SAVE MESSAGE
  =============================== */

  const handleSaveMessage = async (id, payload) => {
    try {
      await updateMessage(id, payload);

      await loadTicketData();

      alert("Message saved");
    } catch (err) {
      console.error(err);
      alert("Gagal save message");
    }
  };

  /* ===============================
     INCIDENT LOG CHANGE
  =============================== */

  const handleIncidentChange = (field, value) => {
    setIncidentLog(prev => ({
      ...prev,
      [field]: value
    }));

    setIncidentDirty(true);
  };

  /* ===============================
     SAVE INCIDENT LOG
  =============================== */

  const handleSaveIncident = async () => {
    if (!editedTicket?.id) return;

    try {
      await updateIncidentLog(editedTicket.id, incidentLog);

      await loadTicketData();

      alert("Incident log saved");

      setIncidentDirty(false);
    } catch (err) {
      console.error(err);
      alert("Gagal save incident log");
    }
  };

  /* ===============================
     RENDER
  =============================== */

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#DDDDDD", padding: "16px" }}
    >
      <style>{`
        @media (min-width: 640px) {
          .ticket-page-inner { padding: 24px; }
        }
      `}</style>

      {/* PAGE TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto mb-4"
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D73A30, #872924)" }}
          >
            <FiClipboard size={18} />
          </div>
          <h1
            className="font-bold text-slate-800"
            style={{ fontSize: "clamp(1.2rem, 5vw, 1.75rem)" }}
          >
            Ticket Management
          </h1>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FiSearch style={{ color: "#D73A30", flexShrink: 0 }} />
            <h2 className="font-semibold text-slate-700 text-sm">Search Ticket</h2>
          </div>

          <SearchBar
            value={ticketNumber}
            onChange={setTicketNumber}
            onSearch={loadTicketData}
            tickets={ticketList}
          />
        </motion.div>

        {/* TICKET DETAIL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            padding: "16px",
          }}
        >
          <TicketDetail
            ticket={editedTicket}
            onChange={handleFieldChange}
            onSave={handleSaveTicket}
            isDirty={isDirty}
          />
        </motion.div>

        {/* MESSAGE TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            padding: "16px",
          }}
        >
          <TicketMessageTable
            messages={messages}
            onSaveMessage={handleSaveMessage}
          />
        </motion.div>

        {/* INCIDENT LOG */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            padding: "16px",
          }}
        >
          <IncidentLogForm
            data={incidentLog}
            onChange={handleIncidentChange}
            onSave={handleSaveIncident}
            isDirty={incidentDirty}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default TicketPage;
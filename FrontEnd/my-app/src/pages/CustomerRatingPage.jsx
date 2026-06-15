import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";
import {
  fetchMyCustomerRatingApi,
  submitCustomerRatingApi,
} from "../api/customer_rating_api";

const formatDateTime = (value) => {
  if (!value) return "-";
  return String(value).replace("T", " ").substring(0, 19);
};

function RatingStars({ rating, onChange, readonly = false }) {
  const value = Number(rating || 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(starValue)}
            className={`transition ${
              readonly ? "cursor-default" : "hover:scale-110"
            }`}
          >
            <FiStar
              size={readonly ? 16 : 28}
              className={
                active
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-300"
              }
            />
          </button>
        );
      })}

      {readonly && (
        <span className="ml-2 text-xs font-bold text-slate-600">
          {value ? `${value} / 5` : "N/A"}
        </span>
      )}
    </div>
  );
}

function RatingModal({ open, ticket, onClose, onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
      setShowValidation(false);
    }
  }, [open]);

  if (!open || !ticket) return null;

  const handleSubmit = () => {
    if (!rating) {
      setShowValidation(true);
      return;
    }

    onSubmit(ticket.id, {
      rating,
      comment,
    });
  };

  const handleRatingChange = (value) => {
    setRating(value);
    setShowValidation(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Beri Rating Ticket
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {ticket.ticketNumber} - {ticket.subject || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-60"
          >
            <FiX />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Ticket Info
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Company:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {ticket.companyName || "-"}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Product:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {ticket.productName || "-"}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Priority:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {ticket.priorityName || "-"}
                </span>
              </div>

              <div>
                <span className="text-slate-400">Close Time:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateTime(ticket.closeTime)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">
              Rating <span className="text-red-500">*</span>
            </p>

            <RatingStars rating={rating} onChange={handleRatingChange} />

            {showValidation && !rating && (
              <p className="text-xs text-red-500 mt-2 font-semibold">
                Pilih rating terlebih dahulu
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">
              Comment / Feedback
            </p>

            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis feedback untuk layanan support..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketTable({ title, subtitle, icon: Icon, tickets, type, onRate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            type === "history"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <FiFileText className="mx-auto mb-3" size={26} />
          <p className="text-sm font-semibold">Tidak ada data</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1150px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Ticket Number</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Close Time</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-bold text-sky-600">
                    {ticket.ticketNumber || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {ticket.subject || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {ticket.companyName || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {ticket.productName || "-"}
                  </td>

                  <td className="px-4 py-3 text-red-500 font-semibold">
                    {ticket.priorityName || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(ticket.closeTime)}
                  </td>

                  <td className="px-4 py-3">
                    <RatingStars rating={ticket.rating} readonly />
                  </td>

                  <td className="px-4 py-3">
                    {type === "pending" ? (
                      <button
                        type="button"
                        onClick={() => onRate(ticket)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                      >
                        Beri Rating
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {ticket.comment || "-"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CustomerRatingPage() {
  const [pendingRating, setPendingRating] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const loadRatingPage = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetchMyCustomerRatingApi();

      setPendingRating(res.data?.pendingRating || []);
      setRatingHistory(res.data?.ratingHistory || []);
    } catch (err) {
      console.error("Failed load customer rating page", err);
      setPendingRating([]);
      setRatingHistory([]);

      setMessageType("error");
      setMessage("Gagal memuat data rating ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatingPage();
  }, []);

  const filterTickets = (tickets) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tickets;

    return tickets.filter((ticket) => {
      return (
        String(ticket.ticketNumber || "").toLowerCase().includes(keyword) ||
        String(ticket.subject || "").toLowerCase().includes(keyword) ||
        String(ticket.companyName || "").toLowerCase().includes(keyword) ||
        String(ticket.productName || "").toLowerCase().includes(keyword) ||
        String(ticket.priorityName || "").toLowerCase().includes(keyword)
      );
    });
  };

  const filteredPending = useMemo(
    () => filterTickets(pendingRating),
    [pendingRating, search]
  );

  const filteredHistory = useMemo(
    () => filterTickets(ratingHistory),
    [ratingHistory, search]
  );

  const openRating = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setMessage("");
  };

  const closeRating = () => {
    if (submitting) return;

    setSelectedTicket(null);
    setShowModal(false);
  };

  const submitRating = async (ticketId, payload) => {
    try {
      setSubmitting(true);
      setMessage("");

      await submitCustomerRatingApi(ticketId, payload);

      closeRating();
      await loadRatingPage();

      setMessageType("success");
      setMessage("Rating berhasil disimpan");

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (err) {
      console.error("Failed submit rating", err);

      setMessageType("error");
      setMessage(err?.response?.data || "Gagal submit rating");

      setTimeout(() => {
        setMessage("");
      }, 4500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#efeded] p-5">
        <div className="max-w-[1500px] mx-auto space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center">
                <FiStar />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Rating Ticket
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Berikan penilaian untuk ticket yang sudah selesai
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadRatingPage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="relative max-w-xl">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rating ticket..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-2xl px-5 py-4 text-sm font-semibold border ${
                messageType === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
              Loading rating ticket...
            </div>
          ) : (
            <>
              <TicketTable
                title="Belum Dinilai"
                subtitle="Ticket yang sudah selesai dan belum diberi rating"
                icon={FiClock}
                tickets={filteredPending}
                type="pending"
                onRate={openRating}
              />

              <TicketTable
                title="History Rating"
                subtitle="Ticket yang sudah pernah diberi rating"
                icon={FiStar}
                tickets={filteredHistory}
                type="history"
                onRate={openRating}
              />
            </>
          )}
        </div>
      </div>

      <RatingModal
        open={showModal}
        ticket={selectedTicket}
        onClose={closeRating}
        onSubmit={submitRating}
        submitting={submitting}
      />
    </>
  );
}

export default CustomerRatingPage;
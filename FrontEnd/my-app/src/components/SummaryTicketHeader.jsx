import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/my_ticket_api";

function SummaryTicketHeader({ search, setSearch }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDashboardSummary();
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load summary:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-700">My Ticket</h1>
          <p className="text-sm text-slate-400 mt-1">
            Open tickets for the current customer
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm font-medium bg-purple-100 text-purple-700 border-purple-300">
            Open
          </span>

          {summary && (
            <span className="text-sm text-slate-500">
              {summary.totalOpen} open ticket(s)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-80 px-3 py-2 border rounded-md"
        />

        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-2 border rounded-md bg-white text-sm">
            Filters
          </button>
          <button className="px-3 py-2 border rounded-md bg-white text-sm">
            Group By
          </button>
          <button className="px-3 py-2 border rounded-md bg-white text-sm">
            Favorites
          </button>
        </div>
      </div>
    </div>
  );
}

export default SummaryTicketHeader;
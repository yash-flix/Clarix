import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { StatusBadge, PriorityBadge } from "../components/ui/badges";
import { ArrowUpRight } from "../components/Logo";

function truncate(text, max = 100) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function StatsBar({ stats }) {
  const items = [
    { value: String(stats.total), label: "Total tickets" },
    { value: String(stats.open), label: "Open" },
    { value: String(stats.inProgress), label: "In progress" },
    { value: String(stats.resolved), label: "Resolved" },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-paper mt-auto">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-200">
        {items.map((item) => (
          <div key={item.label} className="stat-cell">
            <p className="font-display text-4xl sm:text-5xl text-ink leading-none">
              {item.value}
            </p>
            <p className="label-caps mt-3">{item.label}</p>
          </div>
        ))}
      </div>
    </footer>
  );
}

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "OPEN").length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    return { total: tickets.length, open, inProgress, resolved };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setToast({ type: "success", message: "Ticket filed. Routing in progress." });
        setForm({ title: "", description: "" });
        fetchTickets();
      } else {
        setToast({ type: "error", message: data.message || "Could not file ticket." });
      }
    } catch (err) {
      setToast({ type: "error", message: "Connection failed. Try again." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="py-0" footer={<StatsBar stats={stats} />}>
      {toast && (
        <div
          className={`fixed top-24 right-5 z-50 border px-4 py-3 text-sm bg-paper shadow-sm ${
            toast.type === "success"
              ? "border-neutral-200 text-ink"
              : "border-accent text-accent"
          }`}
          role="status"
        >
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-4 text-neutral-400 hover:text-ink"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero strip — dot grid */}
      <section className="bg-dots border-b border-neutral-200 -mx-5 sm:-mx-8 px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="label-caps mb-6">001 — Desk</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] text-ink tracking-tight">
              You submit.
              <br />
              <em className="font-normal text-neutral-400">We route.</em>
              <br />
              You <span className="text-accent underline decoration-accent decoration-2 underline-offset-4">resolve.</span>
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-neutral-500 leading-relaxed max-w-md">
              Clarix categorizes every request, assigns priority, and matches the right moderator — without the back-and-forth.
            </p>
          </div>
        </div>
      </section>

      <div className="py-12 sm:py-16 grid lg:grid-cols-12 gap-12 lg:gap-16">
        {/* New ticket */}
        <section id="new-ticket" className="lg:col-span-5">
          <p className="label-caps mb-4">File a ticket</p>
          <h2 className="font-display text-2xl text-ink mb-8">New request</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="label-caps block mb-2">
                Subject
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Brief summary"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="label-caps block mb-2">
                Details
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What happened, when, and what you expected"
                className="textarea-field"
                required
              />
            </div>
            <button type="submit" className="btn-accent w-full sm:w-auto" disabled={loading}>
              {loading ? "Filing…" : "Submit ticket"}
              {!loading && <ArrowUpRight />}
            </button>
          </form>
        </section>

        {/* Ticket list */}
        <section className="lg:col-span-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-caps mb-2">Queue</p>
              <h2 className="font-display text-2xl text-ink">All tickets</h2>
            </div>
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field sm:max-w-[220px] py-2"
            />
          </div>

          <div className="divide-y divide-neutral-200 border-t border-neutral-200">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="group block py-6 transition-colors hover:bg-neutral-50/80 -mx-4 px-4"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg sm:text-xl text-ink group-hover:text-accent transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                      {truncate(ticket.description)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={ticket.status}
                        active={ticket.status === "IN_PROGRESS"}
                      />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                  <span className="label-caps shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                    View →
                  </span>
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-neutral-400">
                  {new Date(ticket.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </Link>
            ))}

            {filteredTickets.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-display text-xl text-neutral-400">
                  {search ? "No matches." : "No tickets filed."}
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  {search ? "Adjust your search." : "Use the form to submit your first request."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

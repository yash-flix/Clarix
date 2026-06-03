import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import PageLayout from "../components/PageLayout";
import { StatusBadge, PriorityBadge } from "../components/ui/badges";

function MetaRow({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 py-4 border-b border-neutral-200 last:border-0">
      <dt className="label-caps pt-0.5">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (data.success && data.ticket) setTicket(data.ticket);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <PageLayout className="py-24">
        <p className="label-caps">Loading</p>
        <p className="font-display text-2xl text-neutral-400 mt-4">Retrieving ticket…</p>
      </PageLayout>
    );
  }

  if (!ticket) {
    return (
      <PageLayout className="py-24 text-center">
        <p className="font-display text-2xl text-neutral-400">Not found</p>
        <Link to="/" className="btn-accent inline-flex mt-8">
          Back to desk
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="py-0">
      <section className="bg-dots border-b border-neutral-200 -mx-5 sm:-mx-8 px-5 sm:px-8 py-10 sm:py-14">
        <Link to="/" className="label-caps hover:text-ink transition-colors">
          ← Desk
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} active={ticket.status === "IN_PROGRESS"} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mt-6 leading-tight max-w-3xl">
          {ticket.title}
        </h1>
        <p className="mt-6 text-sm text-neutral-500 max-w-2xl leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
      </section>

      <div className="py-12 sm:py-16 grid lg:grid-cols-12 gap-12">
        <section className="lg:col-span-5">
          <p className="label-caps mb-6">Record</p>
          <dl>
            {ticket.relatedSkills?.length > 0 && (
              <MetaRow label="Skills">
                <div className="flex flex-wrap gap-2">
                  {ticket.relatedSkills.map((skill) => (
                    <span key={skill} className="badge-box">
                      {skill}
                    </span>
                  ))}
                </div>
              </MetaRow>
            )}
            {ticket.assignedTo && (
              <MetaRow label="Assigned">
                {ticket.assignedTo.email || ticket.assignedTo}
              </MetaRow>
            )}
            {ticket.createdBy && (
              <MetaRow label="Reporter">
                {ticket.createdBy.email || ticket.createdBy}
              </MetaRow>
            )}
            <MetaRow label="Filed">
              {new Date(ticket.createdAt).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </MetaRow>
          </dl>
        </section>

        {ticket.helpfulNotes && (
          <section className="lg:col-span-7 border border-neutral-200 bg-paper p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
              <p className="label-caps">Analysis</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 bg-accent" aria-hidden />
                <span className="label-caps text-accent">Active</span>
              </span>
            </div>
            <div className="prose-clarix">
              <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}

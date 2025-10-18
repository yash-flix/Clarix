import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Loading ticket details...</div>
      </>
    );
    
  if (!ticket)
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Ticket not found</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Ticket Details</h2>

        <div className="bg-base-200 shadow-xl rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold">{ticket.title}</h3>
          <p className="text-base-content/80">{ticket.description}</p>

          <div className="divider">Metadata</div>

          {ticket.status && (
            <p>
              <strong>Status:</strong>{" "}
              <span className="badge badge-primary">{ticket.status}</span>
            </p>
          )}

          {ticket.priority && (
            <p>
              <strong>Priority:</strong>{" "}
              <span
                className={`badge ${
                  ticket.priority === "high"
                    ? "badge-error"
                    : ticket.priority === "medium"
                    ? "badge-warning"
                    : "badge-info"
                }`}
              >
                {ticket.priority}
              </span>
            </p>
          )}

          {ticket.relatedSkills?.length > 0 && (
            <p>
              <strong>Related Skills:</strong>{" "}
              {ticket.relatedSkills.join(", ")}
            </p>
          )}

          {ticket.helpfulNotes && (
            <div className="mt-4">
              <strong className="text-lg">Helpful Notes:</strong>
              <div className="bg-pink-900/30 border-l-4 border-pink-500 rounded-lg p-4 mt-2 prose prose-invert max-w-none">
                <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
              </div>
            </div>
          )}

          {ticket.assignedTo && (
            <p>
              <strong>Assigned To:</strong> {ticket.assignedTo.email || ticket.assignedTo}
            </p>
          )}

          {ticket.createdAt && (
            <p className="text-sm text-base-content/60 mt-4">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
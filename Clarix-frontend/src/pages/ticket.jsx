import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle 401 Unauthorized
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const data = await res.json();
        
        if (data.success && data.ticket) {
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
      <div className="max-w-3xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold mb-8">Ticket Details</h2>

        <div className="bg-base-200 shadow-xl rounded-lg p-8 space-y-6">
          {/* Title */}
          <h3 className="text-2xl font-bold">{ticket.title}</h3>

          {/* Description */}
          <p className="text-base-content/90 text-lg">{ticket.description}</p>

          {/* Metadata Section */}
          <div className="divider text-lg font-semibold">Metadata</div>

          {/* Status */}
          <p className="flex items-center gap-2">
            <strong>Status:</strong>
            <span
              className={`badge ${
                ticket.status === "OPEN"
                  ? "badge-info"
                  : ticket.status === "IN_PROGRESS"
                  ? "badge-warning"
                  : ticket.status === "RESOLVED"
                  ? "badge-success"
                  : "badge-ghost"
              }`}
            >
              {ticket.status}
            </span>
          </p>

          {/* Priority */}
          {ticket.priority && (
            <p className="flex items-center gap-2">
              <strong>Priority:</strong>
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

          {/* Related Skills */}
          {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
            <p>
              <strong>Related Skills:</strong>{" "}
              <span className="text-base-content/80">
                {ticket.relatedSkills.join(", ")}
              </span>
            </p>
          )}

          {/* Helpful Notes (AI Response) */}
          {ticket.helpfulNotes && (
            <div className="mt-6">
              <strong className="text-lg block mb-2">Helpful Notes:</strong>
              <div className="bg-pink-900/30 border-l-4 border-pink-500 rounded-lg p-5 prose prose-invert max-w-none">
                <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {ticket.assignedTo && (
            <p>
              <strong>Assigned To:</strong>{" "}
              <span className="text-base-content/80">
                {ticket.assignedTo.email || ticket.assignedTo}
              </span>
            </p>
          )}

          {/* Created By (for moderators/admins) */}
          {ticket.createdBy && (
            <p>
              <strong>Created By:</strong>{" "}
              <span className="text-base-content/80">
                {ticket.createdBy.email || ticket.createdBy}
              </span>
            </p>
          )}

          {/* Created At */}
          <p className="text-sm text-base-content/60 mt-6 pt-4 border-t border-base-300">
            Created At: {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}
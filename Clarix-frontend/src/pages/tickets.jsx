import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });

      // Handle 401 Unauthorized
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

      // Handle 401 Unauthorized
      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (data.success) {
        alert("Ticket created! AI is analyzing it...");
        setForm({ title: "", description: "" });
        fetchTickets();
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ticket Title"
            className="input input-bordered w-full"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ticket Description"
            className="textarea textarea-bordered w-full"
            required
          ></textarea>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              className="card shadow-md p-4 bg-base-200 block hover:bg-base-300 transition"
              to={`/tickets/${ticket._id}`}
            >
              <h3 className="font-bold text-lg">{ticket.title}</h3>
              <p className="text-sm">{ticket.description}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`badge badge-sm ${
                    ticket.status === "OPEN"
                      ? "badge-info"
                      : ticket.status === "IN_PROGRESS"
                      ? "badge-warning"
                      : "badge-success"
                  }`}
                >
                  {ticket.status}
                </span>
                {ticket.priority && (
                  <span
                    className={`badge badge-sm ${
                      ticket.priority === "high"
                        ? "badge-error"
                        : ticket.priority === "medium"
                        ? "badge-warning"
                        : "badge-info"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                )}
              </div>
              <p className="text-sm text-base-content/60 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
          {tickets.length === 0 && <p>No tickets submitted yet.</p>}
        </div>
      </div>
    </>
  );
}
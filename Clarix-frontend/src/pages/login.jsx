import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo, { ArrowUpRight } from "../components/Logo";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Unable to connect.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-base-200">
      <header className="border-b border-neutral-200 bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex h-[72px] items-center justify-between">
          <Logo to="/login" />
          <div className="flex items-center gap-6 sm:gap-8">
            <span className="text-sm text-neutral-400 hidden sm:inline">Sign in</span>
            <Link to="/signup" className="btn-accent">
              Open desk
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2">
        <section className="bg-dots border-b lg:border-b-0 lg:border-r border-neutral-200 px-5 sm:px-8 py-16 sm:py-24 flex flex-col justify-center">
          <p className="label-caps mb-8">Support desk</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] text-ink tracking-tight max-w-lg">
            The queue
            <br />
            <em className="text-neutral-400">organizes.</em>
            <br />
            You <span className="text-accent underline decoration-accent decoration-2 underline-offset-4">close.</span>
          </h1>
          <p className="mt-8 text-sm text-neutral-500 max-w-sm leading-relaxed">
            AI triage, skill-based routing, and a single place for every support request.
          </p>
        </section>

        <section className="flex items-center justify-center px-5 sm:px-8 py-16 bg-paper">
          <div className="w-full max-w-sm">
            <p className="label-caps mb-3">Account</p>
            <h2 className="font-display text-3xl text-ink mb-10">Sign in</h2>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <p className="text-sm text-accent border-l-2 border-accent pl-3">{error}</p>
              )}

              <div>
                <label htmlFor="email" className="label-caps block mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="input-field"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label-caps block mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="input-field"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-accent w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowUpRight />}
              </button>
            </form>

            <p className="mt-10 text-sm text-neutral-400">
              No account?{" "}
              <Link to="/signup" className="text-ink underline underline-offset-2 hover:text-accent">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-neutral-200 bg-paper">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-200">
          {[
            { v: "AI", l: "Triage" },
            { v: "< 1m", l: "Routing" },
            { v: "24/7", l: "Desk" },
            { v: "1-click", l: "Submit" },
          ].map((s) => (
            <div key={s.l} className="stat-cell">
              <p className="font-display text-3xl sm:text-4xl text-ink">{s.v}</p>
              <p className="label-caps mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

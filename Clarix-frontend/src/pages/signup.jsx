import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo, { ArrowUpRight } from "../components/Logo";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Could not create account.");
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
          <Logo to="/signup" />
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/login" className="btn-ghost-nav">
              Sign in
            </Link>
            <span className="btn-accent opacity-50 cursor-default">
              Open desk
              <ArrowUpRight />
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2">
        <section className="bg-dots border-b lg:border-b-0 lg:border-r border-neutral-200 px-5 sm:px-8 py-16 sm:py-24 flex flex-col justify-center">
          <p className="label-caps mb-8">002 — Manifesto</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.12] text-ink tracking-tight max-w-xl">
            Tickets pile up.
            <br />
            <em className="text-neutral-400">Clarix doesn&apos;t advise.</em>
            <br />
            <span className="text-accent">It executes.</span>
          </h1>
        </section>

        <section className="flex items-center justify-center px-5 sm:px-8 py-16 bg-paper">
          <div className="w-full max-w-sm">
            <p className="label-caps mb-3">Account</p>
            <h2 className="font-display text-3xl text-ink mb-10">Create account</h2>

            <form onSubmit={handleSignup} className="space-y-5">
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
                {loading ? "Creating…" : "Open desk"}
                {!loading && <ArrowUpRight />}
              </button>
            </form>

            <p className="mt-10 text-sm text-neutral-400">
              Already registered?{" "}
              <Link to="/login" className="text-ink underline underline-offset-2 hover:text-accent">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

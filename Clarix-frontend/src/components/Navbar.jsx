import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-neutral-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <div className="flex items-center gap-8 lg:gap-12">
            <div className="flex items-center gap-5">
              <Logo to="/" />
              <Link to="/" className="link-nav pt-0.5 hidden sm:inline">
                Desk
              </Link>
            </div>
            {user.role === "admin" && (
              <nav className="hidden md:flex items-center">
                <Link to="/admin" className="link-nav">
                  Admin
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-5 sm:gap-8">
            <span className="hidden lg:block text-sm text-neutral-400 truncate max-w-[200px]">
              {user.email}
            </span>
            <button type="button" onClick={handleLogout} className="btn-ghost-nav">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

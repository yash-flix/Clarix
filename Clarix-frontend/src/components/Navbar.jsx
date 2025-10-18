import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="navbar bg-base-300 shadow-lg">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Clarix
        </Link>
      </div>
      <div className="flex-none gap-2">
        <span className="text-sm mr-2">Hi, {user.email}</span>
        
        {user.role === "admin" && (
          <Link to="/admin" className="btn btn-sm btn-primary">
            Admin
          </Link>
        )}
        
        <button onClick={handleLogout} className="btn btn-sm btn-error">
          Logout
        </button>
      </div>
    </div>
  );
}
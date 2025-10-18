import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function CheckAuth({ children, protected: protectedRoute }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (protectedRoute) {
      // Protected route: require authentication
      if (!token) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    } else {
      // Public route (login/signup): redirect if already authenticated
      if (token) {
        navigate("/");
      } else {
        setLoading(false);
      }
    }
  }, [navigate, protectedRoute]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}

export default CheckAuth;
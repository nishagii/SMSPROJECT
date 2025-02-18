import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="error-page">
      <div className="error-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn’t exist or has been moved.</p>
        <button className="home-btn" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;

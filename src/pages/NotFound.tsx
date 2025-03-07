
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout fullHeight>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-8xl mb-4 animate-float">🔍</div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! We couldn't find that page
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-telegram-blue text-white rounded-lg hover:bg-telegram-dark transition-colors"
        >
          Return to Home
        </button>
      </div>
    </PageLayout>
  );
};

export default NotFound;

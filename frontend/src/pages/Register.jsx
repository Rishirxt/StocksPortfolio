import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login since registration happens via Google OAuth on Login page
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Capital<span className="text-blue-600">View</span>
        </h1>
        <p className="text-gray-600 mb-4">Redirecting to login...</p>
        <p className="text-sm text-gray-500">
          Registration happens automatically when you sign in with your Google account.
        </p>
      </div>
    </div>
  );
}

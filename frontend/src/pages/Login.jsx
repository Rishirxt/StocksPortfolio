import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Assuming supabaseClient.js is in src/

export default function Login() {
  const navigate = useNavigate();

  const googleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/home", 
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google login error:", error.message);
      alert("Could not start Google login process.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md w-full max-w-md p-8">
        {/* Logo */}
        <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
          Capital<span className="text-blue-600">View</span>
        </h1>

        <p className="text-center text-lg font-medium text-gray-700 mb-8">
          Sign in to your account
        </p>

        {/* Google Login Button */}
        <button
          onClick={googleLogin}
          type="button"
          className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition shadow-md"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
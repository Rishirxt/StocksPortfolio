import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Animated counter hook
function useCounter(end, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end, duration, start]);
    return count;
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [countersStarted, setCountersStarted] = useState(false);

    const portfolios = useCounter(12400, 2200, countersStarted);
    const users = useCounter(98, 1800, countersStarted);
    const assets = useCounter(4700, 2000, countersStarted);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate("/home");
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) navigate("/home");
        });

        const timer = setTimeout(() => setCountersStarted(true), 600);
        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") setShowLogin(false); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const googleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin + "/home" },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Google login error:", error.message);
            alert("Could not start Google login process.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden font-sans">

            {/* ── Ambient blobs ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-[blob_8s_ease-in-out_infinite]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-[blob_8s_ease-in-out_2s_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-[blob_8s_ease-in-out_4s_infinite]" />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)", backgroundSize: "60px 60px" }}
                />
            </div>

            {/* ── Navbar ── */}
            <nav className="relative z-20 flex items-center justify-between px-8 py-5">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        Capital<span className="text-indigo-600">View</span>
                    </span>
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    {["Features", "Pricing", "About"].map((link) => (
                        <a key={link} href="#" className="hover:text-indigo-600 transition-colors duration-150">{link}</a>
                    ))}
                </div>

                {/* Sign In button */}
                <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                    Sign In
                </button>
            </nav>

            {/* ── Hero ── */}
            <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Real-time market data · Always on
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight max-w-3xl mb-6">
                    Invest smarter,{" "}
                    <span className="relative">
                        <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            see clearly.
                        </span>
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                            <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="ul" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
                    CapitalView unifies all your portfolios into one elegant dashboard — live prices, deep analytics, zero noise.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-indigo-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-base"
                    >
                        Get Started — It's Free
                    </button>
                    <a
                        href="#features"
                        className="px-8 py-4 bg-white/80 backdrop-blur border border-gray-200 text-gray-700 font-semibold rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 text-base"
                    >
                        See How It Works ↓
                    </a>
                </div>

                {/* Stats */}
                <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 mb-24">
                    {[
                        { value: portfolios.toLocaleString() + "+", label: "Portfolios tracked" },
                        { value: users.toLocaleString() + "k+", label: "Active investors" },
                        { value: "$" + assets.toLocaleString() + "M+", label: "Assets monitored" },
                    ].map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tabular-nums">{value}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Feature cards ── */}
                <section id="features" className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        {
                            icon: (
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            ),
                            title: "Live Portfolio Tracking",
                            desc: "Connect all your brokerages and see your net worth update in real time across every account.",
                            color: "from-indigo-50 to-blue-50 border-indigo-100",
                        },
                        {
                            icon: (
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ),
                            title: "Deep Analytics",
                            desc: "Sector allocation, P&L breakdowns, risk exposure and benchmark comparisons — all in one view.",
                            color: "from-purple-50 to-pink-50 border-purple-100",
                        },
                        {
                            icon: (
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ),
                            title: "Bank-Grade Security",
                            desc: "Your data is encrypted at rest and in transit. We never sell or share your financial information.",
                            color: "from-emerald-50 to-teal-50 border-emerald-100",
                        },
                    ].map(({ icon, title, desc, color }) => (
                        <div key={title} className={`bg-gradient-to-br ${color} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">{icon}</div>
                            <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 text-center pb-8 text-xs text-gray-400">
                © {new Date().getFullYear()} CapitalView · Terms · Privacy
            </footer>

            {/* ── Login Modal Overlay ── */}
            {showLogin && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(15,23,42,0.45)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
                >
                    {/* Modal card — same design as your Login component */}
                    <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-10 animate-[modalIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                        {/* Close button */}
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Capital<span className="text-blue-600">View</span>
                            </h1>
                            <p className="text-gray-600">Your Investment Dashboard</p>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                            <p className="text-gray-600">Sign in with Google to access your portfolio and manage your investments</p>
                        </div>

                        <button
                            onClick={googleLogin}
                            type="button"
                            className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
                        >
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                Continue with Google
                            </span>
                        </button>

                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                            {["Track multiple portfolios", "Real-time market data", "Secure cloud storage"].map((f) => (
                                <div key={f} className="flex items-center text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {f}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Keyframes via style tag ── */}
            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}

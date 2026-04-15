import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

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
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-200">

            {/* ── Ambient blobs ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-[blob_8s_ease-in-out_infinite]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-[blob_8s_ease-in-out_2s_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-[blob_8s_ease-in-out_4s_infinite]" />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
                />
            </div>

            {/* ── Navbar ── */}
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 flex items-center justify-between px-8 py-5"
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Capital<span className="text-indigo-400">View</span>
                    </span>
                </div>

                {/* Sign In button */}
                <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                    Sign In
                </button>
            </motion.nav>

            {/* ── Hero ── */}
            <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">
                {/* Badge */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Real-time Nifty 50 market data · Always on
                </motion.div>

                {/* Headline */}
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-3xl mb-6"
                >
                    Invest smarter,{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            see clearly.
                        </span>
                        <svg className="absolute -bottom-2 left-0 w-full opacity-60" viewBox="0 0 300 12" fill="none">
                            <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="ul" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                </motion.h1>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed"
                >
                    CapitalView unifies all your portfolios into one elegant dashboard — featuring live prices for Nifty 50 stocks, deep analytics, and zero noise.
                </motion.p>

                {/* CTA buttons */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 mb-20"
                >
                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-200 text-base"
                    >
                        Get Started — It's Free
                    </button>
                    <a
                        href="#features"
                        className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 font-semibold rounded-2xl hover:bg-white/10 transition-all duration-200 text-base"
                    >
                        See How It Works ↓
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-10 sm:gap-16 mb-24"
                >
                    {[
                        { value: portfolios.toLocaleString() + "+", label: "Portfolios tracked" },
                        { value: users.toLocaleString() + "k+", label: "Active investors" },
                        { value: "$" + assets.toLocaleString() + "M+", label: "Assets monitored" },
                    ].map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="text-4xl font-black text-white tabular-nums">{value}</div>
                            <div className="text-sm text-slate-400 mt-1 font-medium">{label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Feature cards ── */}
                <section id="features" className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        {
                            icon: (
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            ),
                            title: "Live Portfolio Tracking",
                            desc: "Connect all your brokerages and see your net worth update in real time across every account.",
                        },
                        {
                            icon: (
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ),
                            title: "Deep Analytics",
                            desc: "Sector allocation, P&L breakdowns, risk exposure and benchmark comparisons — all in one view.",
                        },
                        {
                            icon: (
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ),
                            title: "Bank-Grade Security",
                            desc: "Your data is encrypted at rest and in transit. We never sell or share your financial information.",
                        },
                    ].map(({ icon, title, desc }, idx) => (
                        <motion.div 
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 * idx }}
                            whileHover={{ y: -5 }}
                            key={title} 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:bg-white/10 transition-colors duration-300"
                        >
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-inner mb-4">{icon}</div>
                            <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 text-center pb-8 text-xs text-slate-500">
                © {new Date().getFullYear()} CapitalView · Terms · Privacy
            </footer>

            {/* ── Login Modal Overlay ── */}
            {showLogin && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(2,6,23,0.7)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-10"
                    >
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-150"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 shadow-inner">
                                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Capital<span className="text-indigo-400">View</span>
                            </h1>
                            <p className="text-slate-400">Your Investment Dashboard</p>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                            <p className="text-slate-400">Sign in with Google to access your portfolio and manage your investments</p>
                        </div>

                        <button
                            onClick={googleLogin}
                            type="button"
                            className="w-full flex items-center justify-center bg-white text-slate-900 font-bold py-4 px-6 rounded-xl hover:bg-slate-100 transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:scale-[1.02] group"
                        >
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#slate-900" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#slate-900" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#slate-900" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                Continue with Google
                            </span>
                        </button>

                        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                            {["Track multiple portfolios", "Real-time Nifty 50 data", "Secure cloud storage"].map((f) => (
                                <div key={f} className="flex items-center text-sm text-slate-400">
                                    <svg className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {f}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-500">By signing in, you agree to our Terms of Service and Privacy Policy</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
      `}</style>
        </div>
    );
}

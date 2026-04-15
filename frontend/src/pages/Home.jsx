import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import Navbar from '../components/Navbar'; 
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Mock data for sparklines
const sparklineData = [
    { value: 400 }, { value: 300 }, { value: 550 }, 
    { value: 450 }, { value: 700 }, { value: 650 }, { value: 800 }
];

function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [portfolios, setPortfolios] = useState([]);
    const [portfolioDetails, setPortfolioDetails] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- AUTHENTICATION & INITIALIZATION ---
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setUserId(session.user.id);
                } else {
                    navigate("/"); 
                }
            }
        );

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUserId(session.user.id);
            } else {
                navigate("/");
            }
        }).finally(() => setLoading(false));

        return () => authListener.subscription.unsubscribe();
    }, [navigate]);

    // --- DATA FETCHING ---
    const fetchPortfolios = useCallback(async (currentUserId) => {
        if (!currentUserId) return;
        try {
            const { data, error } = await supabase
                .from("portfolios")
                .select("id, name")
                .eq("user_id", currentUserId);

            if (error) throw error;
            setPortfolios(data || []);
            
            // Fetch portfolio details with stocks
            if (data && data.length > 0) {
                await fetchPortfolioDetails(data);
            } else {
                setPortfolioDetails([]);
            }
        } catch (err) {
            console.error("Failed to fetch portfolios from Supabase", err);
        }
    }, []);

    // Fetch portfolio stocks and calculate values
    const fetchPortfolioDetails = async (portfoliosData) => {
        try {
            const portfolioDetailsPromises = portfoliosData.map(async (portfolio) => {
                // Get stocks in this portfolio
                const { data: stocksData, error } = await supabase
                    .from("portfolio_stocks")
                    .select("*")
                    .eq("portfolio_id", portfolio.id);

                if (error) throw error;

                const stocks = stocksData || [];
                
                // Calculate total invested value for this portfolio
                const investedValue = stocks.reduce((sum, stock) => 
                    sum + (stock.price * stock.quantity), 0
                );

                return {
                    ...portfolio,
                    stocksCount: stocks.length,
                    investedValue: investedValue
                };
            });

            const details = await Promise.all(portfolioDetailsPromises);
            setPortfolioDetails(details);
        } catch (err) {
            console.error("Error fetching portfolio details:", err);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchPortfolios(userId);
        }
    }, [userId, fetchPortfolios]);

    // Refresh portfolios when navigating back to Home
    useEffect(() => {
        if (userId && location.pathname === '/home') {
            fetchPortfolios(userId);
        }
    }, [location.pathname, userId, fetchPortfolios]);

    // --- HANDLERS ---
    const handlePortfolioClick = (portfolioId) => {
        navigate("/portfolio"); 
    };
    
    const handleManagePortfolios = () => {
        navigate("/portfolio");
    };
    
    const totalPortfolios = portfolios.length;
    const totalStocks = portfolioDetails.reduce((sum, portfolio) => sum + portfolio.stocksCount, 0);
    const totalInvestedValue = portfolioDetails.reduce((sum, portfolio) => sum + portfolio.investedValue, 0);
    const averagePortfolioValue = totalPortfolios > 0 ? totalInvestedValue / totalPortfolios : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Framer motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // --- UI RENDERING (Dashboard Layout) ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
            <Navbar /> 
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/20 to-slate-950 pt-16 pb-12 border-b border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto px-8 relative z-10"
                >
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">Dashboard</h1>
                        <p className="text-lg text-slate-400 mb-8">Your comprehensive investment overview</p>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={handleManagePortfolios}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Manage Portfolios
                            </button>
                            <button
                                onClick={() => navigate("/browse-stocks")} 
                                className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200">
                                Browse Stocks
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-12">

                {/* Stats Overview */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* Portfolio Summary Card */}
                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/20 rounded-xl">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-400">Active Portfolios</span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1 relative z-10">{totalPortfolios}</p>
                        <p className="text-sm text-slate-500 mb-4 relative z-10">Track and manage your investments</p>
                        
                        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    
                    {/* Total Value Card */}
                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/20 rounded-xl">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-400">Total Invested</span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1 relative z-10">₹{totalInvestedValue.toFixed(2)}</p>
                        <p className="text-sm text-slate-500 mb-4 relative z-10">Across all portfolios</p>
                        <span className="text-emerald-400 font-semibold text-sm flex items-center relative z-10">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {totalStocks} stocks tracking
                        </span>

                        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 pointer-events-none">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <Area type="monotone" dataKey="value" stroke="#34d399" fill="#34d399" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Performance Card */}
                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:border-purple-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-2.5 bg-purple-500/20 border border-purple-500/20 rounded-xl">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-400">Avg. Portfolio Value</span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2 relative z-10">
                            ₹{averagePortfolioValue.toFixed(2)}
                        </p>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-white/10 relative z-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Stocks:</span>
                                <span className="font-semibold text-purple-300">{totalStocks}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Stocks per Portfolio:</span>
                                <span className="font-semibold text-purple-300">
                                    {totalPortfolios > 0 ? (totalStocks / totalPortfolios).toFixed(1) : 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
                
                {/* Portfolio Quick Access */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-slate-900/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Your Portfolios</h2>
                        <button 
                            onClick={handleManagePortfolios}
                            className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all duration-200"
                        >
                            + Create New
                        </button>
                    </div>
                    
                    {portfolioDetails.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {portfolioDetails.map(portfolio => (
                                <motion.div 
                                    variants={itemVariants}
                                    key={portfolio.id} 
                                    onClick={() => handlePortfolioClick(portfolio.id)}
                                    className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-indigo-400">{portfolio.stocksCount}</span>
                                        <span className="text-sm text-slate-400">stocks</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                        <p className="text-sm text-slate-400">Invested</p>
                                        <p className="text-sm font-semibold text-emerald-400">₹{portfolio.investedValue.toFixed(2)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No portfolios yet</h3>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">Start building your investment track record by creating your first portfolio and adding stocks.</p>
                            <button 
                                onClick={handleManagePortfolios}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Create Portfolio
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default Home;
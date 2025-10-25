import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import Navbar from '../components/Navbar'; 

function Home() {
    const navigate = useNavigate();
    const [portfolios, setPortfolios] = useState([]);
    const [portfolioDetails, setPortfolioDetails] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState(null);
    const [refreshSuccess, setRefreshSuccess] = useState(false);

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

    // --- HANDLERS ---
    const handlePortfolioClick = (portfolioId) => {
        navigate("/portfolio"); 
    };
    
    const handleManagePortfolios = () => {
        navigate("/portfolio");
    };
    // Calculate totals and performance metrics
    const totalPortfolios = portfolios.length;
    const totalStocks = portfolioDetails.reduce((sum, portfolio) => sum + portfolio.stocksCount, 0);
    const totalInvestedValue = portfolioDetails.reduce((sum, portfolio) => sum + portfolio.investedValue, 0);
    
    // Calculate average portfolio value
    const averagePortfolioValue = totalPortfolios > 0 ? totalInvestedValue / totalPortfolios : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-indigo-600">Loading Dashboard...</p>
            </div>
        );
    }

    // --- UI RENDERING (Dashboard Layout) ---
    return (
        <>
            <Navbar /> 
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold mb-4">Welcome to CapitalView</h1>
                            <p className="text-xl opacity-90 mb-8">Your comprehensive investment management platform</p>
                            <div className="flex justify-center space-x-4">
                                <button 
                                    onClick={handleManagePortfolios}
                                    className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Manage Portfolios
                                </button>
                                <button
                                    onClick={() => navigate("/browse-stocks")} 
                                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200">
                                    Browse Stocks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-12">

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Portfolio Summary Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Active Portfolios</span>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mb-2">{totalPortfolios}</p>
                            <p className="text-sm text-gray-600 mb-4">Track and manage your investments</p>
                            <button 
                                onClick={handleManagePortfolios}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center"
                            >
                                View Details
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Total Value Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Total Invested</span>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mb-2">₹{totalInvestedValue.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 mb-4">Across all portfolios</p>
                            <span className="text-green-600 font-semibold text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {totalStocks} stocks
                            </span>
                        </div>

                        {/* Performance Card - Replaced Live Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Portfolio Performance</span>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mb-2">
                                {totalPortfolios > 0 ? totalStocks : 0}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">Total holdings across portfolios</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg. Portfolio Value:</span>
                                    <span className="font-semibold text-purple-600">₹{averagePortfolioValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Stocks per Portfolio:</span>
                                    <span className="font-semibold text-purple-600">
                                        {totalPortfolios > 0 ? (totalStocks / totalPortfolios).toFixed(1) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Portfolio Quick Access */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Your Portfolios</h2>
                            <button 
                                onClick={handleManagePortfolios}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                + Create New
                            </button>
                        </div>
                        
                        {portfolioDetails.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolioDetails.map(portfolio => (
                                    <div 
                                        key={portfolio.id} 
                                        onClick={() => handlePortfolioClick(portfolio.id)}
                                        className="group bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{portfolio.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3">Investment portfolio</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-indigo-600">{portfolio.stocksCount}</span>
                                            <span className="text-sm text-gray-500">stocks</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">Invested: <span className="font-semibold text-green-600">₹{portfolio.investedValue.toFixed(2)}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">No portfolios yet</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">Start building your investment portfolio by creating your first portfolio and adding stocks to track your investments.</p>
                                <button 
                                    onClick={handleManagePortfolios}
                                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Create Your First Portfolio
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Refresh Data Section */}
                </div>
            </div>
        </>
    );
}

export default Home;
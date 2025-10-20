import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import Navbar from '../components/Navbar'; 

function Home() {
    const navigate = useNavigate();
    const [portfolios, setPortfolios] = useState([]);
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

    // --- DATA FETCHING (Portfolios only) ---
    const fetchPortfolios = useCallback(async (currentUserId) => {
        if (!currentUserId) return;
        try {
            const { data, error } = await supabase
                .from("portfolios")
                .select("id, name")
                .eq("user_id", currentUserId);

            if (error) throw error;
            setPortfolios(data || []);
        } catch (err) {
            console.error("Failed to fetch portfolios from Supabase", err);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchPortfolios(userId);
        }
    }, [userId, fetchPortfolios]);

    // --- HANDLERS ---
    const handlePortfolioClick = () => {
        navigate("/portfolio"); 
    };
    
    const handleManagePortfolios = () => {
        navigate("/portfolio");
    };

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
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to CapitalView</h1>
                    <p className="text-xl text-gray-600 mb-10">Your personal investment dashboard.</p>

                    {/* Action/Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Portfolio Summary Card */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                            <p className="text-sm font-medium text-gray-500">Total Portfolios</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{portfolios.length}</p>
                            <button 
                                onClick={handleManagePortfolios}
                                className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                            >
                                Manage Portfolios →
                            </button>
                        </div>
                        
                        {/* Placeholder Card 1 */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                            <p className="text-sm font-medium text-gray-500">Total Invested Value</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">₹0.00</p>
                            <span className="mt-4 text-green-600 text-sm font-semibold block">Calculate Investment</span>
                        </div>

                        {/* Placeholder Card 2 */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                            <p className="text-sm font-medium text-gray-500">Last Market Update</p>
                            <p className="text-xl font-bold text-gray-900 mt-2">N/A</p>
                            <span className="mt-4 text-yellow-600 text-sm font-semibold block">Refresh Data</span>
                        </div>
                    </div>
                    
                    {/* Quick Access Portfolios */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolios.length > 0 ? (
                            portfolios.map(p => (
                                <div 
                                    key={p.id} 
                                    onClick={handlePortfolioClick} // Redirects to /portfolio
                                    className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition cursor-pointer border border-gray-200"
                                >
                                    <h3 className="text-xl font-semibold text-indigo-700">{p.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">View / Edit Holdings</p>
                                    <p className="text-lg font-bold mt-2">Total Stocks: 0</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 bg-white p-6 rounded-xl shadow-md text-center">
                                <p className="text-lg text-gray-600">You don't have any portfolios yet.</p>
                                <button 
                                    onClick={handleManagePortfolios}
                                    className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition font-medium"
                                >
                                    Create Your First Portfolio
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
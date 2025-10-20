import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/'); // Redirect to login page
        } else {
            console.error('Logout Error:', error.message);
            alert('Failed to log out.');
        }
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl border-b border-blue-800 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/home" className="flex items-center space-x-3 group">
                            <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Capital<span className="text-blue-100">View</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-2">
                        <Link 
                            to="/home" 
                            className="text-blue-100 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            <span>Dashboard</span>
                        </Link>
                        
                        <Link 
                            to="/portfolio" 
                            className="text-blue-100 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Portfolios</span>
                        </Link>
                        
                        <Link 
                            to="/browse-stocks" 
                            className="text-blue-100 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Browse Stocks</span>
                        </Link>

                        {/* User Profile & Logout */}
                        <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-blue-500">
                            <button
                                onClick={handleLogout}
                                className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border border-white/30 hover:border-white/50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
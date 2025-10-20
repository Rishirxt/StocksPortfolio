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
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/home" className="text-2xl font-bold text-gray-800">
                            Capital<span className="text-indigo-600">View</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/home" 
                            className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        
                        <Link 
                            to="/portfolio" 
                            className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Portfolios
                        </Link>
                        
                        <Link 
                            to="/browse-stocks" 
                            className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Browse Stocks
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ml-4"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
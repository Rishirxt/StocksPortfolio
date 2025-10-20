import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient"; 
import Navbar from '../components/Navbar'; 

const BrowseStocks = () => {
    const [allStocks, setAllStocks] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    const stocksPerPage = 15;

    const fetchStocks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("stock_prices")
                .select("*"); 

            if (error) {
                throw error;
            }

            setAllStocks(data || []);
        } catch (err) {
            console.error("Error fetching stocks from Supabase:", err);
            setError("Failed to fetch stocks data.");
            setAllStocks([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    // --- Filtering and Pagination Logic (Client-Side) ---
    const filtered = allStocks.filter((stock) => {
        const symbol = stock.symbol || stock.text || ""; 
        const name = stock.name || ""; 
        const searchLower = search.toLowerCase();

        return (
            symbol.toLowerCase().includes(searchLower) ||
            name.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filtered.length / stocksPerPage);
    const indexOfLastStock = currentPage * stocksPerPage;
    const indexOfFirstStock = indexOfLastStock - stocksPerPage;
    const currentStocks = filtered.slice(indexOfFirstStock, indexOfLastStock);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    // --- Render Logic ---
    
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-xl font-medium text-gray-600">Loading stocks...</p>
                        <p className="text-sm text-gray-500 mt-2">Fetching latest market data</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
                    <div className="text-center bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-4">
                        <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Stocks</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button 
                            onClick={() => fetchStocks()}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }
    
    if (filtered.length === 0 && search !== "") {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold mb-4">Stock Market Browser</h1>
                                <p className="text-xl opacity-90 mb-8">Explore and analyze stocks with real-time data</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Search Section */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Search Stocks</h2>
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by stock symbol or company name..."
                                    className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* No Results */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                            <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No stocks found</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                No stocks match your search term "{search}". Try searching with a different keyword or symbol.
                            </p>
                            <button 
                                onClick={() => setSearch("")}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }


    return (
        <>
            <Navbar /> 
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-4">Stock Market Browser</h1>
                            <p className="text-xl opacity-90 mb-8">Explore and analyze stocks with real-time data</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Search Stocks</h2>
                        </div>
                        
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by stock symbol or company name..."
                                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        {/* Results Summary */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-gray-600">
                                Showing {currentStocks.length} of {filtered.length} stocks
                            </p>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-green-600">Live Data</span>
                            </div>
                        </div>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {currentStocks.map((stock) => (
                            <div
                                key={`${stock.symbol || stock.text}-${stock.date}`} 
                                className="group bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                            >
                                {/* Stock Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {stock.date}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {stock.symbol || stock.text}
                                    </h3>
                                    <p className="text-gray-600 text-sm font-medium mb-4 line-clamp-2">{stock.name}</p>
                                </div>

                                {/* Price Information */}
                                <div className="px-6 pb-4">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Open</p>
                                            <p className="font-bold text-gray-900">₹{stock.open}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Close</p>
                                            <p className="font-bold text-gray-900">₹{stock.close}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-[300px] bg-gray-50">
                                    <div className="p-6 pt-0">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-sm font-medium text-gray-600">High</span>
                                                <span className="font-bold text-green-600">₹{stock.high}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-sm font-medium text-gray-600">Low</span>
                                                <span className="font-bold text-red-600">₹{stock.low}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-sm font-medium text-gray-600">Adj Close</span>
                                                <span className="font-bold text-gray-900">₹{stock.adj_close}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm font-medium text-gray-600">Volume</span>
                                                <span className="font-bold text-blue-600">
                                                    {stock.volume ? (stock.volume / 1000).toFixed(1) + 'K' : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="p-6 pt-4 border-t border-gray-100">
                                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Pagination */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex justify-center items-center space-x-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                                    currentPage === 1
                                        ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl"
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-medium text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? "bg-indigo-600 text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                                    currentPage === totalPages
                                        ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl"
                                }`}
                            >
                                <span>Next</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BrowseStocks;
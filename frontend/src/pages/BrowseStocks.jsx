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
                <div className="flex justify-center items-center min-h-screen">
                    <p className="text-xl font-medium text-indigo-600">Loading stocks...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <p className="text-xl font-medium text-red-600">Error: {error}</p>
                </div>
            </>
        );
    }
    
    if (filtered.length === 0 && search !== "") {
        return (
            <>
                <Navbar />
                <div className="bg-[#f5f7fa] min-h-screen pt-4 p-6 max-w-7xl mx-auto">
                    <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Browse Stocks</h2>
                    <input
                        type="text"
                        placeholder="Search stocks by symbol or name..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-6"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <p className="text-center text-lg text-gray-600 mt-10">No stocks found matching your search term.</p>
                </div>
            </>
        );
    }


    return (
        <>
            <Navbar /> 
            <div className="bg-[#f5f7fa] min-h-screen pt-4 p-6 max-w-7xl mx-auto">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Browse Stocks</h2>

                <input
                    type="text"
                    placeholder="Search stocks by symbol or name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-6"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                {/* Stock Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentStocks.map((stock) => (
                        <div
                            key={`${stock.symbol || stock.text}-${stock.date}`} 
                            className="group relative flex flex-col justify-between p-5 bg-white hover:bg-[#f0f4ff] border border-gray-200 rounded-xl
                                     shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                        >
                            <div>
                                <h3 className="text-2xl font-semibold text-indigo-600 mb-1">
                                    {stock.symbol || stock.text} 
                                </h3>
                                <p className="text-gray-600 font-medium mb-2">{stock.name}</p>
                                <p className="text-xs text-gray-400">Date: {stock.date}</p>
                            </div>

                            {/* Expandable Details on Hover */}
                            <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-[400px] mt-2">
                                <div className="space-y-1 text-gray-700 text-sm">
                                    <div><span className="font-semibold">Open:</span> {stock.open}</div>
                                    <div><span className="font-semibold">High:</span> {stock.high}</div>
                                    <div><span className="font-semibold">Low:</span> {stock.low}</div>
                                    <div><span className="font-semibold">Close:</span> {stock.close}</div>
                                    <div><span className="font-semibold">Adj Close:</span> {stock.adj_close}</div>
                                    <div><span className="font-semibold">Volume:</span> {stock.volume ? stock.volume.toLocaleString() : 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-8 space-x-6">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`px-5 py-2 rounded-md font-semibold transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            currentPage === 1
                                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        Previous
                    </button>

                    <span className="text-lg font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`px-5 py-2 rounded-md font-semibold transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            currentPage === totalPages
                                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

export default BrowseStocks;
import { useEffect, useState, useCallback } from "react";
import Navbar from '../components/Navbar'; 

const BrowseStocks = () => {
    const [allStocks, setAllStocks] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);

    const stocksPerPage = 12;

    // Fetch latest stocks from backend
    const fetchLatestStocks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/latest-bse");
            if (!res.ok) throw new Error("Failed to fetch latest stocks");
            const data = await res.json();
            
            // Debug: Check what data we're receiving
            console.log("Received stocks:", data);
            if (data && data.length > 0) {
                console.log("First stock fields:", Object.keys(data[0]));
            }
            
            setAllStocks(data || []);
        } catch (err) {
            console.error("Error fetching latest stocks:", err);
            setError("Failed to fetch latest stocks.");
            setAllStocks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLatestStocks();
    }, [fetchLatestStocks]);

    // Refresh button logic
    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            await fetch("http://localhost:5000/refresh-bse");
            await fetchLatestStocks();
        } catch (err) {
            console.error("Error refreshing stocks:", err);
            setError("Failed to refresh stocks.");
        } finally {
            setRefreshing(false);
        }
    };

    // Filtering using tckr_symbol and name
    const filtered = allStocks.filter((stock) => {
        const symbol = stock.tckr_symbol || stock.symbol || ""; 
        const name = stock.name || stock.security_name || ""; 
        const searchLower = search.toLowerCase();
        return symbol.toLowerCase().includes(searchLower) || name.toLowerCase().includes(searchLower);
    });

    const totalPages = Math.ceil(filtered.length / stocksPerPage);
    const indexOfLastStock = currentPage * stocksPerPage;
    const indexOfFirstStock = indexOfLastStock - stocksPerPage;
    const currentStocks = filtered.slice(indexOfFirstStock, indexOfLastStock);

    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    // Calculate price change and percentage
    const calculatePriceChange = (stock) => {
        const open = stock.open_price || stock.open || 0;
        const close = stock.close_price || stock.close || 0;
        const change = close - open;
        const percentChange = open > 0 ? ((change / open) * 100).toFixed(2) : 0;
        return { change, percentChange };
    };

    // Format volume
    const formatVolume = (volume) => {
        if (!volume) return '0';
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">Stock Market Browser</h1>
                    <p className="text-xl opacity-90 mb-4">Explore and analyze stocks with real-time data</p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                    >
                        {refreshing ? "Refreshing..." : "Refresh Latest Stocks"}
                    </button>
                </div>
            </div>

            {/* Search and Results */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search Input */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search by symbol or company name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full max-w-2xl mx-auto block p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-lg"
                    />
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 text-lg">Loading stocks data...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center max-w-2xl mx-auto">
                        {error}
                    </div>
                )}

                {/* Results Count */}
                {!loading && filtered.length > 0 && (
                    <div className="mb-6 text-gray-600 text-center">
                        <span className="bg-white px-4 py-2 rounded-full shadow-sm">
                            Found {filtered.length} stocks • Page {currentPage} of {totalPages}
                        </span>
                    </div>
                )}

                {/* Stocks Grid */}
                {!loading && currentStocks.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentStocks.map((stock, index) => {
                                const { change, percentChange } = calculatePriceChange(stock);
                                const isPositive = change >= 0;
                                const symbol = stock.tckr_symbol || stock.symbol || "N/A";
                                const name = stock.name || stock.security_name || "No name available";
                                const open = stock.open_price || stock.open || 0;
                                const high = stock.high_price || stock.high || 0;
                                const low = stock.low_price || stock.low || 0;
                                const close = stock.close_price || stock.close || 0;
                                const volume = stock.volume || stock.totaltrades || 0;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                                    >
                                        {/* Stock Header */}
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-bold">{symbol}</h3>
                                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    isPositive ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                    {isPositive ? '+' : ''}{percentChange}%
                                                </div>
                                            </div>
                                            {/* Company name as subtle text */}
                                            <p className="text-indigo-100 text-xs opacity-80 mt-1 truncate">
                                                {name}
                                            </p>
                                        </div>

                                        {/* Price Details */}
                                        <div className="p-4">
                                            {/* Current Price */}
                                            <div className="text-center mb-4">
                                                <div className="text-2xl font-bold text-gray-800">
                                                    ₹{close.toFixed(2)}
                                                </div>
                                                <div className={`text-sm font-medium ${
                                                    isPositive ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Price Grid */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-gray-500">Open</div>
                                                    <div className="font-semibold">₹{open.toFixed(2)}</div>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-gray-500">Close</div>
                                                    <div className="font-semibold">₹{close.toFixed(2)}</div>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                                    <div className="text-green-600">High</div>
                                                    <div className="font-semibold text-green-700">₹{high.toFixed(2)}</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 rounded-lg">
                                                    <div className="text-red-600">Low</div>
                                                    <div className="font-semibold text-red-700">₹{low.toFixed(2)}</div>
                                                </div>
                                            </div>

                                            {/* Volume and Date */}
                                            <div className="mt-3 flex justify-between text-xs text-gray-500">
                                                <span>{stock.trade_date ? new Date(stock.trade_date).toLocaleDateString() : 'N/A'}</span>
                                            </div>

                                            {/* View Details Button */}
                                            <button
                                                onClick={() => setSelectedStock(stock)}
                                                className="w-full mt-3 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-xs"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                ← Previous
                            </button>
                            <span className="text-gray-600 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}

                {/* No Results */}
                {!loading && filtered.length === 0 && allStocks.length > 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No stocks found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && allStocks.length === 0 && !error && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📈</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No stocks available</h3>
                        <p className="text-gray-500 mb-4">Refresh to load the latest stock data</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                )}
            </div>

            {/* Stock Detail Modal */}
            {selectedStock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedStock.tckr_symbol || selectedStock.symbol || "N/A"}</h2>
                                    <p className="text-indigo-100 opacity-90 text-sm">{selectedStock.name || selectedStock.security_name || "No name available"}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedStock(null)}
                                    className="text-white hover:text-indigo-200 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Price Summary */}
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-gray-800 mb-2">
                                    ₹{(selectedStock.close_price || selectedStock.close || 0).toFixed(2)}
                                </div>
                                {(() => {
                                    const { change, percentChange } = calculatePriceChange(selectedStock);
                                    const isPositive = change >= 0;
                                    return (
                                        <div className={`text-lg font-semibold ${
                                            isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Detailed Price Info */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <div className="text-gray-500 text-sm">Open</div>
                                        <div className="text-lg font-semibold">₹{(selectedStock.open_price || selectedStock.open || 0).toFixed(2)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <div className="text-gray-500 text-sm">Close</div>
                                        <div className="text-lg font-semibold">₹{(selectedStock.close_price || selectedStock.close || 0).toFixed(2)}</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-50 p-3 rounded-xl">
                                        <div className="text-green-600 text-sm">High</div>
                                        <div className="text-lg font-semibold text-green-700">₹{(selectedStock.high_price || selectedStock.high || 0).toFixed(2)}</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-xl">
                                        <div className="text-red-600 text-sm">Low</div>
                                        <div className="text-lg font-semibold text-red-700">₹{(selectedStock.low_price || selectedStock.low || 0).toFixed(2)}</div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <div className="text-blue-600 text-sm">Volume</div>
                                    <div className="text-lg font-semibold text-blue-700">
                                        {formatVolume(selectedStock.volume || selectedStock.totaltrades)}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <div className="text-gray-500 text-sm">Trade Date</div>
                                    <div className="text-lg font-semibold">
                                        {selectedStock.trade_date ? new Date(selectedStock.trade_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedStock(null)}
                                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default BrowseStocks;
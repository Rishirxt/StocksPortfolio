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
            console.log("Current API URL:", process.env.REACT_APP_API_URL);
            console.log("Fetching from:", `${process.env.REACT_APP_API_URL}/latest-bse`);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/latest-bse`);
            console.log("Response status:", res.status);
            if (!res.ok) throw new Error(`Failed to fetch latest stocks: ${res.status} ${res.statusText}`);
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
            console.log("Refreshing from:", `${process.env.REACT_APP_API_URL}/refresh-bse`);
            await fetch(`${process.env.REACT_APP_API_URL}/refresh-bse`);
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
    // CAPITAL MARKETS LOGIC:
    // Price Change: Close Price - Open Price (intraday movement)
    // Percentage Change: (Change / Open) * 100 (percentage movement from open)
    // RED = Negative (Loss) | GREEN = Positive (Gain)
    const calculatePriceChange = (stock) => {
        const open = stock.open_price || stock.open || 0;
        const close = stock.close_price || stock.close || 0;
        const change = close - open;  // Daily P&L in rupees
        const percentChange = open > 0 ? ((change / open) * 100).toFixed(2) : 0;
        return { change, percentChange };
    };

    // Format volume with proper scale
    // 1M = 1,000,000 shares | 1K = 1,000 shares
    const formatVolume = (volume) => {
        if (!volume || volume === 0) return 'N/A';  // Show N/A instead of 0
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
            <div className="min-h-screen bg-slate-950 text-slate-200">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/20 to-slate-950 pt-16 pb-12 border-b border-white/5">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                        <h1 className="text-4xl font-bold text-white mb-4">Stock Market Browser</h1>
                        <p className="text-lg text-slate-400 mb-6">Explore and analyze stocks with real-time data</p>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50"
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
                            className="w-full max-w-2xl mx-auto block p-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg text-white placeholder-slate-500 transition-all"
                        />
                    </div>

                    {/* Loading and Error States */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="mt-4 text-slate-400 text-lg">Loading stocks data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-6 text-center max-w-2xl mx-auto">
                            {error}
                        </div>
                    )}

                    {/* Results Count */}
                    {!loading && filtered.length > 0 && (
                        <div className="mb-6 text-slate-400 text-center">
                            <span className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm">
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
                                            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {/* Stock Header */}
                                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xl font-bold text-white">{symbol}</h3>
                                                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {isPositive ? '+' : ''}{percentChange}%
                                                    </div>
                                                </div>
                                                {/* Company name as subtle text */}
                                                <p className="text-slate-400 text-xs mt-1 truncate">
                                                    {name}
                                                </p>
                                            </div>

                                            {/* Price Details */}
                                            <div className="p-4">
                                                {/* Current Price */}
                                                <div className="text-center mb-4">
                                                    <div className="text-2xl font-bold text-white">
                                                        ₹{close.toFixed(2)}
                                                    </div>
                                                    <div className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Price Grid */}
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                                        <div className="text-slate-500">Open</div>
                                                        <div className="font-semibold text-slate-300">₹{open.toFixed(2)}</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                                        <div className="text-slate-500">Close</div>
                                                        <div className="font-semibold text-slate-300">₹{close.toFixed(2)}</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                                                        <div className="text-emerald-500">High</div>
                                                        <div className="font-semibold text-emerald-400">₹{high.toFixed(2)}</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                                        <div className="text-red-500">Low</div>
                                                        <div className="font-semibold text-red-400">₹{low.toFixed(2)}</div>
                                                    </div>
                                                </div>

                                                {/* Volume and Date */}
                                                <div className="mt-4 space-y-2 text-xs">
                                                    <div className="flex justify-between items-center px-2 py-2 bg-indigo-500/10 rounded-lg">
                                                        <span className="text-indigo-400 font-medium">Volume</span>
                                                        <span className="font-semibold text-indigo-300">{formatVolume(volume)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center px-2 py-2 bg-white/5 rounded-lg">
                                                        <span className="text-slate-500">Last Updated</span>
                                                        <span className="font-semibold text-slate-400">{stock.trade_date ? new Date(stock.trade_date).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => setSelectedStock(stock)}
                                                    className="w-full mt-4 bg-white/5 border border-white/10 text-indigo-400 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium text-xs"
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
                                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-slate-300"
                                >
                                    ← Previous
                                </button>
                                <span className="text-slate-400 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-slate-300"
                                >
                                    Next →
                                </button>
                            </div>
                        </>
                    )}

                    {/* No Results */}
                    {!loading && filtered.length === 0 && allStocks.length > 0 && (
                        <div className="text-center py-12">
                            <div className="text-slate-600 text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No stocks found</h3>
                            <p className="text-slate-500">Try adjusting your search terms</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && allStocks.length === 0 && !error && (
                        <div className="text-center py-12">
                            <div className="text-slate-600 text-6xl mb-4">📈</div>
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No stocks available</h3>
                            <p className="text-slate-500 mb-4">Refresh to load the latest stock data</p>
                            <button
                                onClick={handleRefresh}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                            >
                                Refresh Data
                            </button>
                        </div>
                    )}
                </div>

                {/* Stock Detail Modal */}
                {selectedStock && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(2,6,23,0.7)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedStock(null); }}
                    >
                        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 border-b border-white/10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedStock.tckr_symbol || selectedStock.symbol || "N/A"}</h2>
                                        <p className="text-slate-400 text-sm">{selectedStock.name || selectedStock.security_name || "No name available"}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStock(null)}
                                        className="text-slate-400 hover:text-white text-2xl transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Price Summary */}
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-white mb-2">
                                        ₹{(selectedStock.close_price || selectedStock.close || 0).toFixed(2)}
                                    </div>
                                    {(() => {
                                        const { change, percentChange } = calculatePriceChange(selectedStock);
                                        const isPositive = change >= 0;
                                        return (
                                            <div>
                                                <div className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'
                                                    }`}>
                                                    {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    <p>Intraday Movement: Close Price vs Open Price</p>
                                                    <p className="text-xs text-slate-600">RED = Loss (Close &lt; Open) | GREEN = Gain (Close &gt; Open)</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Detailed Price Info */}
                                <div className="space-y-3 mb-6">
                                    {/* OHLC Data - Standard market metrics */}
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-xs text-indigo-300 mb-3">
                                        <div className="font-semibold mb-2">📊 OHLC Data (Daily Trading Range)</div>
                                        <ul className="text-xs space-y-1 text-slate-400">
                                            <li>• <strong className="text-slate-300">Open</strong>: Price at market open</li>
                                            <li>• <strong className="text-slate-300">High</strong>: Highest price during the day</li>
                                            <li>• <strong className="text-slate-300">Low</strong>: Lowest price during the day</li>
                                            <li>• <strong className="text-slate-300">Close</strong>: Final price at market close</li>
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="text-slate-500 text-xs font-medium">OPEN</div>
                                            <div className="text-lg font-semibold text-white">₹{(selectedStock.open_price || selectedStock.open || 0).toFixed(2)}</div>
                                            <div className="text-xs text-slate-600 mt-1">Market Open Price</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="text-slate-500 text-xs font-medium">CLOSE</div>
                                            <div className="text-lg font-semibold text-white">₹{(selectedStock.close_price || selectedStock.close || 0).toFixed(2)}</div>
                                            <div className="text-xs text-slate-600 mt-1">Market Close Price</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                            <div className="text-emerald-500 text-xs font-medium">HIGH</div>
                                            <div className="text-lg font-semibold text-emerald-400">₹{(selectedStock.high_price || selectedStock.high || 0).toFixed(2)}</div>
                                            <div className="text-xs text-emerald-600 mt-1">Peak Price</div>
                                        </div>
                                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                            <div className="text-red-500 text-xs font-medium">LOW</div>
                                            <div className="text-lg font-semibold text-red-400">₹{(selectedStock.low_price || selectedStock.low || 0).toFixed(2)}</div>
                                            <div className="text-xs text-red-600 mt-1">Bottom Price</div>
                                        </div>
                                    </div>

                                    {/* Volume and Trade Info */}
                                    <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                        <div className="text-indigo-400 text-xs font-medium">📈 VOLUME</div>
                                        <div className="text-lg font-semibold text-indigo-300 mt-1">
                                            {formatVolume(selectedStock.volume || selectedStock.totaltrades)}
                                        </div>
                                        <div className="text-xs text-indigo-500 mt-1">
                                            Total shares traded during the day
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="text-slate-500 text-xs font-medium">🗓 LAST UPDATED</div>
                                        <div className="text-lg font-semibold text-white mt-1">
                                            {selectedStock.trade_date ? new Date(selectedStock.trade_date).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">
                                            Data as of market close
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedStock(null)}
                                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-500 transition-colors font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)]"
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
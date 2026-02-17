import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 

// NOTE: This component is intended to be mounted at the /portfolio route.

function Portfolio() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stocks, setStocks] = useState([]); 
  const [stockToAdd, setStockToAdd] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [latestDate, setLatestDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [stockDetails, setStockDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [futureAveragePrice, setFutureAveragePrice] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);

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
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  // --- DATA FETCHING ---

  // Fetch Portfolios
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
    fetchPortfolios(userId);
  }, [userId, fetchPortfolios]);

  // Fetch Stocks in Selected Portfolio with Current Prices from stocks_portfolio
  const fetchPortfolioStocks = useCallback(async (portfolioId) => {
    try {
      // First get the portfolio stocks
      const { data: portfolioStocksData, error } = await supabase
        .from("portfolio_stocks")
        .select("*")
        .eq("portfolio_id", portfolioId);

      if (error) throw error;

      if (portfolioStocksData && portfolioStocksData.length > 0) {
        // Fetch current prices from stocks_portfolio (latest available price for each symbol)
        const symbols = [...new Set(portfolioStocksData.map(stock => stock.stock_symbol))];
        
        const { data: currentPricesData, error: priceError } = await supabase
          .from("stocks_portfolio")
          .select("symbol, close")
          .in("symbol", symbols)
          .order('trade_date', { ascending: false }) ///given date
          .limit(symbols.length * 10); // Get recent prices for all symbols

        if (priceError) throw priceError;

        // Get the latest available price for each symbol
        const currentPriceMap = {};
        currentPricesData.forEach(stock => {
          if (!currentPriceMap[stock.symbol]) {
            currentPriceMap[stock.symbol] = stock.close;
          }
        });

        // Combine portfolio data with current prices
        const stocksWithCurrentPrices = portfolioStocksData.map(stock => ({
          ...stock,
          current_price: currentPriceMap[stock.stock_symbol] || stock.price, // Fallback to purchase price
          market_value: (currentPriceMap[stock.stock_symbol] || stock.price) * stock.quantity
        }));

        setPortfolioStocks(stocksWithCurrentPrices);
      } else {
        setPortfolioStocks([]);
      }
    } catch (err) {
      console.error("Error fetching portfolio stocks from Supabase:", err);
      setPortfolioStocks([]);
    }
  }, []);

  useEffect(() => {
    if (!selectedPortfolio) {
        setPortfolioStocks([]);
        return;
    }
    fetchPortfolioStocks(selectedPortfolio.id);
  }, [selectedPortfolio, fetchPortfolioStocks]);

  // Fetch All Stocks for Add Stock Modal
  const fetchStocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stocks_portfolio") 
        .select("symbol") 
        .order("symbol", { ascending: true });

      if (error) throw error;
      
      const uniqueSymbols = Array.from(new Set(data.map(item => item.symbol)))
        .map(symbol => ({ symbol }));

      setStocks(uniqueSymbols);
    } catch (err) {
      console.error("Failed to fetch stocks from stocks_portfolio:", err);
    }
  }, []);

  // Search stocks with filtering
  const handleStockSearch = useCallback((query) => {
    setSearchQuery(query);
    const searchLower = query.toLowerCase();
    const filtered = stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchLower)
    );
    setFilteredStocks(filtered);
  }, [stocks]);

  // Fetch detailed stock data with latest price info
  const fetchStockDetails = useCallback(async (symbol) => {
    setLoading(true);
    try {
      // Get latest stock data
      const { data: stockData, error } = await supabase
        .from("stocks_portfolio")
        .select("*")
        .eq("symbol", symbol)
        .order("trade_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (stockData) {
        setStockDetails({
          symbol: stockData.symbol,
          currentPrice: stockData.close || stockData.price || 0,
          open: stockData.open || 0,
          high: stockData.high || 0,
          low: stockData.low || 0,
          close: stockData.close || 0,
          volume: stockData.volume || 0,
          tradeDate: stockData.trade_date,
          change: (stockData.close || 0) - (stockData.open || 0),
          changePercent: stockData.open ? (((stockData.close || 0) - (stockData.open || 0)) / stockData.open * 100).toFixed(2) : 0
        });
        // Auto-populate price with current price
        setPrice(stockData.close || stockData.price || "");
      }
    } catch (err) {
      console.error("Error fetching stock details:", err);
      setStockDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate investment totals and future average price
  // CAPITAL MARKETS LOGIC:
  // Market Value = Current Price × Quantity (real-time portfolio worth)
  // Invested Value = Purchase Price × Quantity (original investment)
  // Profit/Loss = Market Value - Invested Value
  // Average Purchase Price = Total Cost / Total Shares (used for new additions)
  useEffect(() => {
    if (quantity && price) {
      const q = parseFloat(quantity);
      const p = parseFloat(price);
      const investment = q * p;
      setTotalInvestment(investment);

      // Find if we already have this stock in portfolio
      const existingStock = portfolioStocks.find(s => s.stock_symbol === stockToAdd?.symbol);
      if (existingStock) {
        const totalShares = existingStock.quantity + q;
        const totalCost = (existingStock.price * existingStock.quantity) + investment;
        const newAveragePrice = totalCost / totalShares;
        setFutureAveragePrice(newAveragePrice);
      }
    }
  }, [quantity, price, stockToAdd, portfolioStocks]);

  useEffect(() => {
    if (showAddStockModal && stocks.length === 0) {
      fetchStocks();
    }
  }, [showAddStockModal, stocks.length, fetchStocks]);
  
  // --- HANDLERS ---

  // Create Portfolio Logic
  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      alert("Missing portfolio name");
      return;
    }
    if (!userId) {
        alert("User ID is missing. Please log in again.");
        return;
    }
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .insert({ 
            name: newPortfolioName, 
            user_id: userId 
        })
        .select();

      if (error) throw error;

      const newPortfolio = data[0]; 
      
      setPortfolios((prev) => [...prev, newPortfolio]);
      setNewPortfolioName("");
      setShowModal(false);
      setSelectedPortfolio(newPortfolio);
    } catch (err) {
      console.error("Error creating portfolio in Supabase:", err.message || err);
      alert("Failed to create portfolio.");
    }
  };

  // Delete Portfolio Logic
  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return;

    try {
      console.log(`[DELETE] Starting deletion of portfolio: ${portfolioToDelete.id} (${portfolioToDelete.name})`);

      // Delete portfolio stocks first
      const { data: deletedStocks, error: deleteStocksError } = await supabase
        .from("portfolio_stocks")
        .delete()
        .eq("portfolio_id", portfolioToDelete.id)
        .select();

      console.log(`[DELETE] Deleted ${deletedStocks?.length || 0} stocks from portfolio`);
      if (deleteStocksError) {
        console.error("[DELETE ERROR] Failed to delete stocks:", deleteStocksError);
        throw deleteStocksError;
      }

      // Delete portfolio (RLS policy handles authorization)
      const { data: deletedPortfolio, error: deletePortfolioError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioToDelete.id)
        .select();

      console.log(`[DELETE] Deleted portfolio:`, deletedPortfolio);
      if (deletePortfolioError) {
        console.error("[DELETE ERROR] Failed to delete portfolio:", deletePortfolioError);
        throw deletePortfolioError;
      }

      if (!deletedPortfolio || deletedPortfolio.length === 0) {
        console.warn("[WARNING] Portfolio might already be deleted or does not exist");
        // Still allow the UI to update even if select returned nothing
      }

      // Update local state
      setPortfolios((prev) => prev.filter(p => p.id !== portfolioToDelete.id));
      
      // Clear selection if deleted portfolio was selected
      if (selectedPortfolio?.id === portfolioToDelete.id) {
        setSelectedPortfolio(null);
        setPortfolioStocks([]);
      }

      setShowDeleteModal(false);
      setPortfolioToDelete(null);
      console.log("[DELETE] ✅ Portfolio deletion successful!");
      alert("Portfolio deleted successfully!");
    } catch (err) {
      console.error("[DELETE FAILED]", err.message || err);
      alert(`Failed to delete portfolio: ${err.message || "Unknown error"}`);
    }
  };

  // Fetch available dates when stock is selected
  const handleStockSelect = async (selectedSymbol) => {
    const selected = stocks.find((s) => s.symbol === selectedSymbol);
    setStockToAdd(selected);
    setShowStockDropdown(false);
    setSearchQuery("");
    
    if (selected) {
      // Fetch detailed stock data
      await fetchStockDetails(selected.symbol);
      
      try {
        // Fetch available dates for this stock
        const { data: datesData, error } = await supabase
          .from("stocks_portfolio")
          .select("trade_date")
          .eq("symbol", selected.symbol)
          .order("trade_date", { ascending: false })
          .limit(10); // Get last 10 available dates

        if (!error && datesData) {
          setAvailableDates(datesData.map(item => item.trade_date));
          if (datesData.length > 0) {
            setLatestDate(datesData[0].trade_date);
            // Auto-set the purchase date to the latest available date
            setPurchaseDate(datesData[0].trade_date);
          }
        }
      } catch (err) {
        console.error("Error fetching available dates:", err);
      }
    } else {
      setAvailableDates([]);
      setLatestDate("");
      setPurchaseDate("");
      setStockDetails(null);
      setPrice("");
    }
  };

  // Add Stock Logic with Date Validation and Latest Date Info
  const handleAddStock = async () => {
    if (!selectedPortfolio || !stockToAdd || !purchaseDate || !quantity || !price) {
      alert("Missing stock or details.");
      return;
    }

    try {
      // Validate that the purchase date exists in stocks_portfolio for this symbol
      const { data: stockData, error: validationError } = await supabase
        .from("stocks_portfolio")
        .select("trade_date")
        .eq("symbol", stockToAdd.symbol)
        .eq("trade_date", purchaseDate)
        .single();

      if (validationError || !stockData) {
        // Get the latest available date for this stock
        const { data: latestDateData, error: latestDateError } = await supabase
          .from("stocks_portfolio")
          .select("trade_date")
          .eq("symbol", stockToAdd.symbol)
          .order("trade_date", { ascending: false })
          .limit(1)
          .single();

        let errorMessage = `No stock data available for ${stockToAdd.symbol} on ${purchaseDate}.`;
        
        if (latestDateData && !latestDateError) {
          errorMessage += ` The latest available date is ${latestDateData.trade_date}.`;
        } else {
          errorMessage += " Please select a valid trading date.";
        }
        
        alert(errorMessage);
        return;
      }

      const newStockData = {
        portfolio_id: selectedPortfolio.id,
        stock_symbol: stockToAdd.symbol,
        purchase_date: purchaseDate,
        quantity: Number(quantity),
        price: Number(price),
      };

      const { data, error } = await supabase
        .from("portfolio_stocks")
        .insert(newStockData)
        .select();

      if (error) throw error;
      
      alert("Stock added successfully!");
      // Refresh the portfolio stocks to include the new stock with current prices
      fetchPortfolioStocks(selectedPortfolio.id);
      
      // Reset form fields
      setStockToAdd(null);
      setPurchaseDate("");
      setQuantity("");
      setPrice("");
      setAvailableDates([]);
      setLatestDate("");
      setShowAddStockModal(false);
    } catch (err) {
      console.error("Error adding stock to Supabase:", err.message || err);
      alert("Server error while adding stock.");
    }
  };

  const handleHomeClick = () => {
      // Navigate back to the dashboard
      navigate("/home"); 
  }

  // Calculate portfolio totals
  // Total Invested Value: Purchase Price × Quantity for all stocks
  // Total Market Value: Current Price × Quantity for all stocks
  // These metrics show unrealized profit/loss in the portfolio
  const totalInvestedValue = portfolioStocks.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0);
  const totalMarketValue = portfolioStocks.reduce((sum, stock) => sum + (stock.market_value || stock.price * stock.quantity), 0);

  // --- UI RENDERING ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
              <p className="text-gray-600">Manage your investment portfolios and track performance</p>
            </div>
            <button 
              onClick={handleHomeClick}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Portfolios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Portfolios</h2>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              {portfolios.length > 0 ? (
                <div className="space-y-3">
                  {portfolios.map(({ id, name }) => (
                    <div
                      key={id}
                      className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedPortfolio?.id === id 
                          ? "bg-indigo-50 border-indigo-200 shadow-md" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div 
                        onClick={() => setSelectedPortfolio({ id, name })}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{name}</h3>
                          <p className="text-sm text-gray-500">Investment Portfolio</p>
                        </div>
                        <svg className={`w-5 h-5 transition-colors ${
                          selectedPortfolio?.id === id ? "text-indigo-600" : "text-gray-400"
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Delete Button - appears on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortfolioToDelete({ id, name });
                          setShowDeleteModal(true);
                        }}
                        className="mt-3 w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center border border-red-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Portfolio
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No portfolios yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click + to create one</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedPortfolio ? (
              <div className="space-y-6">
                {/* Portfolio Header */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedPortfolio.name}</h2>
                      <p className="text-gray-600">Portfolio Overview & Holdings</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPortfolio(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Portfolio Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Holdings</p>
                          <p className="text-2xl font-bold text-blue-900">{portfolioStocks.length}</p>
                        </div>
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Invested Value</p>
                          <p className="text-2xl font-bold text-green-900">
                            ₹{totalInvestedValue.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-2 bg-green-200 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Market Value</p>
                          <p className="text-2xl font-bold text-purple-900">
                            ₹{totalMarketValue.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Holdings</h3>
                      <button 
                        onClick={() => setShowAddStockModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Stock
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {portfolioStocks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No stocks in this portfolio</h3>
                        <p className="text-gray-600 mb-6">Start building your portfolio by adding your first stock.</p>
                        <button 
                          onClick={() => setShowAddStockModal(true)}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          Add Your First Stock
                        </button>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Symbol</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purchase Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purchase Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invested Value</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Market Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {portfolioStocks.map((stock) => (
                            <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                  <span className="font-semibold text-gray-900">{stock.stock_symbol}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-700">{stock.purchase_date}</td>
                              <td className="px-6 py-4 text-gray-700">{stock.quantity}</td>
                              <td className="px-6 py-4 text-gray-700">₹{stock.price.toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-700">₹{(stock.price * stock.quantity).toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-700">₹{(stock.current_price || stock.price).toFixed(2)}</td>
                              <td className="px-6 py-4 text-gray-700">₹{(stock.market_value || stock.price * stock.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Select a Portfolio</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Choose a portfolio from the sidebar to view its details, or create a new one to get started.
                </p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Create New Portfolio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Portfolio Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 max-w-md mx-4">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Portfolio</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio Name</label>
                <input
                  type="text"
                  placeholder="Enter portfolio name"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                onClick={handleCreatePortfolio}
              >
                Create Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[40rem] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add Stock to Portfolio</h2>
              </div>
              <button 
                onClick={() => {
                  setShowAddStockModal(false);
                  setStockToAdd(null);
                  setPurchaseDate("");
                  setQuantity("");
                  setPrice("");
                  setAvailableDates([]);
                  setLatestDate("");
                  setSearchQuery("");
                  setStockDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-indigo-800 text-sm">
                <span className="font-semibold">Portfolio:</span> {selectedPortfolio?.name}
              </p>
            </div>
            
            {/* Stock Search Section */}
            <div className="mb-6 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Stock <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by symbol (e.g., RELIANCE, TCS)..."
                  value={stockToAdd ? `${stockToAdd.symbol} - ${stockDetails?.symbol || 'Loading...'}` : searchQuery}
                  onChange={(e) => {
                    if (!stockToAdd) {
                      handleStockSearch(e.target.value);
                      setShowStockDropdown(true);
                    }
                  }}
                  onFocus={() => !stockToAdd && setShowStockDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  readOnly={!!stockToAdd}
                />
                
                {stockToAdd && (
                  <button
                    onClick={() => {
                      setStockToAdd(null);
                      setPurchaseDate("");
                      setQuantity("");
                      setPrice("");
                      setAvailableDates([]);
                      setLatestDate("");
                      setSearchQuery("");
                      setStockDetails(null);
                    }}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Stock Dropdown */}
              {showStockDropdown && !stockToAdd && filteredStocks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredStocks.slice(0, 10).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock.symbol)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900">{stock.symbol}</div>
                      <div className="text-xs text-gray-500">Select to view details</div>
                    </button>
                  ))}
                </div>
              )}

              {showStockDropdown && !stockToAdd && searchQuery && filteredStocks.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 p-4 text-center text-gray-500">
                  No stocks found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Stock Details Card - Shows when stock is selected */}
            {stockToAdd && stockDetails && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Current Price</p>
                    <p className="text-lg font-bold text-gray-900">₹{stockDetails.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Price Change</p>
                    <p className={`text-lg font-bold ${stockDetails.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockDetails.change >= 0 ? '↑' : '↓'} ₹{Math.abs(stockDetails.change).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Change %</p>
                    <p className={`text-lg font-bold ${stockDetails.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockDetails.changePercent >= 0 ? '+' : ''}{stockDetails.changePercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Volume</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(stockDetails.volume / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>

                {/* OHLC Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 uppercase">Open</p>
                    <p className="font-semibold text-gray-900">₹{stockDetails.open.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 uppercase">High</p>
                    <p className="font-semibold text-gray-900">₹{stockDetails.high.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 uppercase">Low</p>
                    <p className="font-semibold text-gray-900">₹{stockDetails.low.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 uppercase">Close</p>
                    <p className="font-semibold text-gray-900">₹{stockDetails.close.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Last Updated:</span> {stockDetails.tradeDate}
                  </p>
                </div>
              </div>
            )}

            {/* Stock Input Form */}
            {stockToAdd && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {latestDate && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Latest: <span className="font-semibold">{latestDate}</span>
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity (Shares) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter number of shares"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of shares you purchased</p>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purchase Price per Share (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter price per share"
                    min="0"
                    step="0.01"
                  />
                  {stockDetails && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: ₹{stockDetails.currentPrice.toFixed(2)} (auto-filled above)
                    </p>
                  )}
                </div>

                {/* Empty cell for grid alignment */}
                <div></div>

                {/* Investment Summary */}
                {quantity && price && (
                  <div className="md:col-span-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total Investment</p>
                        <p className="text-xl font-bold text-green-700">₹{totalInvestment.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Per Share</p>
                        <p className="text-lg font-semibold text-gray-700">₹{parseFloat(price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Quantity</p>
                        <p className="text-lg font-semibold text-gray-700">{quantity}</p>
                      </div>
                    </div>

                    {/* Average Price Update */}
                    {futureAveragePrice > 0 && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-2">📊 Portfolio Impact</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Average:</span>
                            <p className="font-semibold text-gray-900">
                              ₹{portfolioStocks.find(s => s.stock_symbol === stockToAdd?.symbol)?.price?.toFixed(2) || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">New Average:</span>
                            <p className="font-bold text-blue-600">₹{futureAveragePrice.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Required Fields Note */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Fields marked with <span className="text-red-500 mx-1">*</span> are required
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-semibold transition-colors border border-gray-300"
                onClick={() => {
                  setShowAddStockModal(false);
                  setStockToAdd(null);
                  setPurchaseDate("");
                  setQuantity("");
                  setPrice("");
                  setAvailableDates([]);
                  setLatestDate("");
                  setSearchQuery("");
                  setStockDetails(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddStock}
                disabled={!stockToAdd || !purchaseDate || !quantity || !price || loading}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'Loading...' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Portfolio Confirmation Modal */}
      {showDeleteModal && portfolioToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 max-w-md mx-4">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Portfolio?</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">"{portfolioToDelete.name}"</span>? This action cannot be undone.
            </p>
            
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
              <p className="text-sm text-red-700">
                <span className="font-semibold">⚠ Warning:</span> This will delete the portfolio and all its stocks.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPortfolioToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                onClick={handleDeletePortfolio}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
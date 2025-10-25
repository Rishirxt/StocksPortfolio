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

  // Fetch available dates when stock is selected
  const handleStockSelect = async (selectedSymbol) => {
    const selected = stocks.find((s) => s.symbol === selectedSymbol);
    setStockToAdd(selected);
    
    if (selected) {
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
                      onClick={() => setSelectedPortfolio({ id, name })}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                        selectedPortfolio?.id === id 
                          ? "bg-indigo-50 border-indigo-200 shadow-md" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
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
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[36rem] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Symbol <span className="text-red-500">*</span>
                </label>
                <select
                  onChange={(e) => handleStockSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  defaultValue=""
                >
                  <option value="" disabled>Search and select a stock...</option>
                  {stocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose from available stock symbols</p>
              </div>
              
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
                    Latest available date: <span className="font-semibold">{latestDate}</span>
                  </p>
                )}
                {availableDates.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available dates: {availableDates.slice(0, 3).join(', ')}
                    {availableDates.length > 3 && ` and ${availableDates.length - 3} more...`}
                  </p>
                )}
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter number of shares"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Number of shares purchased</p>
              </div>
              
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Price (₹) <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">Price per share when purchased</p>
              </div>
              
              {/* Investment Summary */}
              {quantity && price && (
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Investment Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Investment:</span>
                    </div>
                    <div className="text-right font-semibold text-green-600">
                      ₹{(parseFloat(quantity || 0) * parseFloat(price || 0)).toFixed(2)}
                    </div>
                    <div>
                      <span className="text-gray-600">Shares:</span>
                    </div>
                    <div className="text-right font-semibold text-gray-700">
                      {quantity} {parseInt(quantity) === 1 ? 'share' : 'shares'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddStock}
                disabled={!stockToAdd || !purchaseDate || !quantity || !price}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Stock to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
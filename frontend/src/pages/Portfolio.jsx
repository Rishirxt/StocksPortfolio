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
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [portfolioStocks, setPortfolioStocks] = useState([]);

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

  // Fetch Stocks in Selected Portfolio
  const fetchPortfolioStocks = useCallback(async (portfolioId) => {
    try {
      const { data, error } = await supabase
        .from("portfolio_stocks")
        .select("*") 
        .eq("portfolio_id", portfolioId);

      if (error) throw error;
      setPortfolioStocks(data || []);
    } catch (err) {
      console.error("Error fetching portfolio stocks from Supabase:", err);
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
        .from("stock_prices") 
        .select("symbol") 
        .order("symbol", { ascending: true });

      if (error) throw error;
      
      const uniqueSymbols = Array.from(new Set(data.map(item => item.symbol)))
        .map(symbol => ({ symbol }));

      setStocks(uniqueSymbols);
    } catch (err) {
      console.error("Failed to fetch stocks from stock_prices:", err);
    }
  }, []);

  useEffect(() => {
    if (showAddStockModal && stocks.length === 0) {
      fetchStocks();
    }
  }, [showAddStockModal, stocks.length, fetchStocks]);
  
  // NOTE: Stock Indexes useEffect has been removed as per the previous fix

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

  // Add Stock Logic
  const handleAddStock = async () => {
    if (!selectedPortfolio || !stockToAdd || !purchaseDate || !quantity || !price) {
      alert("Missing stock or details.");
      return;
    }
    try {
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
      setPortfolioStocks((prev) => [...prev, data[0]]);
      
      // Reset form fields
      setStockToAdd(null);
      setPurchaseDate("");
      setQuantity(1);
      setPrice(0);
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

  // --- UI RENDERING ---
  return (
    <div className="flex h-screen">
      {/* Left Sidebar: Portfolios */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Portfolios</h2>
          <button onClick={() => setShowModal(true)} className="text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-sm">+</button>
        </div>
        {portfolios.length > 0 ? (
          <ul className="space-y-3">
            {portfolios.map(({ id, name }) => (
              <li
                key={id}
                onClick={() => setSelectedPortfolio({ id, name })}
                className={`cursor-pointer px-4 py-3 rounded-lg hover:bg-indigo-100 transition-colors text-gray-800 font-medium ${selectedPortfolio?.id === id ? "bg-indigo-200" : ""}`}
              >
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No portfolios yet. Click '+' to create one.</p>
        )}
      </div>

      {/* Center Panel: Portfolio Details */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedPortfolio ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 cursor-pointer hover:text-indigo-600" onClick={() => setSelectedPortfolio(null)}>
                Portfolio: {selectedPortfolio.name}
            </h2>
            <div className="border p-4 rounded mb-4 bg-gray-50">
              {portfolioStocks.length === 0 ? (
                <p className="text-gray-500">No stocks added yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Symbol</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Purchase Price</th>
                      <th className="py-2">Invested Value</th>
                      <th className="py-2">Market Value</th>
                      <th className="py-2">Current Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioStocks.map((stock) => (
                      <tr key={stock.id} className="border-b hover:bg-gray-100">
                        <td className="py-2">{stock.stock_symbol}</td>
                        <td className="py-2">{stock.purchase_date}</td>
                        <td className="py-2">{stock.quantity}</td>
                        <td className="py-2">₹{stock.price}</td>
                        <td className="py-2">₹{(stock.price * stock.quantity).toFixed(2)}</td>
                        <td className="py-2">₹{stock.price}</td> 
                        <td className="py-2">₹{stock.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button onClick={() => setShowAddStockModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">+ Add Stock</button>
          </div>
        ) : (
          <div className="text-center mt-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Select a Portfolio
            </h1>
            <p className="text-lg text-gray-600">
                Choose a portfolio from the left sidebar to view its details, or click '+' to create a new one.
            </p>
            <button 
                onClick={handleHomeClick} 
                className="mt-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition font-medium"
            >
                ← Go to Dashboard
            </button>
          </div>
        )}
      </div>
      
      {/* Add Portfolio Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Portfolio</h2>
            <input
              type="text"
              placeholder="Portfolio Name"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={handleCreatePortfolio}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[28rem] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Stock to {selectedPortfolio?.name}</h2>
            <select
              onChange={(e) =>
                setStockToAdd(stocks.find((s) => s.symbol === e.target.value))
              }
              className="w-full border p-2 rounded mb-4"
              defaultValue=""
            >
              <option value="" disabled>Select stock</option>
              {stocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Quantity"
              min="1"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Purchase Price"
              min="0"
              step="0.01"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowAddStockModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={handleAddStock}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
import React, { useEffect, useState } from "react";

function Home() {
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
  const [showIndexes, setShowIndexes] = useState(true);
  const [stockIndexes, setStockIndexes] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) setUserId(parsedUser.id);
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchPortfolios = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/portfolios?userId=${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) setPortfolios(data);
      } catch (err) {
        console.error("Failed to fetch portfolios", err);
      }
    };
    fetchPortfolios();
  }, [userId]);

  useEffect(() => {
    if (!selectedPortfolio) return;
    const fetchPortfolioStocks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/portfolio-stocks?portfolioId=${selectedPortfolio.id}`);
        const data = await res.json();
        if (Array.isArray(data)) setPortfolioStocks(data);
      } catch (err) {
        console.error("Error fetching portfolio stocks:", err);
      }
    };
    fetchPortfolioStocks();
  }, [selectedPortfolio]);

  useEffect(() => {
    if (!showAddStockModal) return;
    const fetchStocks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stocks");
        const data = await res.json();
        setStocks(data);
      } catch (err) {
        console.error("Failed to fetch stocks", err);
      }
    };
    fetchStocks();
  }, [showAddStockModal]);

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stock-indexes");
        const data = await res.json();
        setStockIndexes(data);
      } catch (err) {
        console.error("Failed to fetch stock indexes", err);
      }
    };
    fetchIndexes();
    const interval = setInterval(fetchIndexes, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      alert("Missing portfolio name");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPortfolioName, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPortfolios((prev) => [...prev, data]);
        setNewPortfolioName("");
        setShowModal(false);
      } else {
        alert("Failed to create portfolio: " + data.error);
      }
    } catch (err) {
      console.error("Error in POST fetch:", err);
    }
  };

  const handleAddStock = async () => {
    if (!selectedPortfolio) {
      alert("Please select a portfolio first");
      return;
    }
    if (!stockToAdd || !purchaseDate || !quantity || !price) {
      alert("Missing stock input");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/portfolio-stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId: selectedPortfolio.id,
          stockSymbol: stockToAdd.symbol,
          purchaseDate,
          quantity: Number(quantity),
          price: Number(price),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Stock added!");
        setPortfolioStocks((prev) => [...prev, data]);
        setStockToAdd(null);
        setPurchaseDate("");
        setQuantity(1);
        setPrice(0);
        setShowAddStockModal(false);
      } else {
        alert("Failed to add stock: " + data.error);
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      alert("Server error while adding stock");
    }
  };

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
          <p className="text-sm text-gray-500">No portfolios yet.</p>
        )}
      </div>

      {/* Center Panel: Portfolio Details */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedPortfolio ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 cursor-pointer hover:text-indigo-600" onClick={() => setSelectedPortfolio(null)}>Capital View</h2>
            <p className="text-gray-600 mb-4">Portfolio: {selectedPortfolio.name}</p>
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
                        <td className="py-2">₹{stock.price * stock.quantity}</td>
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
          <h1 className="text-2xl font-bold cursor-pointer hover:text-indigo-600">Welcome to Capital View</h1>
        )}
      </div>

      {/* Right Sidebar: Stock Indexes */}
      <div className="w-64 bg-white border-l p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Global Indexes</h2>
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => setShowIndexes(!showIndexes)}>
            {showIndexes ? "Hide" : "Show"}
          </button>
        </div>
        {showIndexes && (
          <ul className="space-y-2">
            {stockIndexes.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : (
              stockIndexes.map((index) => (
                <li key={index.symbol} className="flex justify-between items-center text-sm border-b pb-1">
                  <span className="font-medium">{index.name}</span>
                  <span
                    className={`text-right ${
                      typeof index.change === 'number' && index.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {typeof index.price === 'number' ? index.price.toFixed(2) : 'N/A'} (
                    {typeof index.change === 'number' ? index.change.toFixed(2) : 'N/A'}%)
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;

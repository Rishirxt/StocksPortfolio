const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../config/db"); // use mssql setup

// POST: Add a stock to a portfolio
router.post("/", async (req, res) => {
  const { portfolioId, stockSymbol, purchaseDate, quantity, price } = req.body;

  if (!portfolioId || !stockSymbol || !purchaseDate || !quantity || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await poolConnect;

    const request = pool.request();
    request.input("portfolioId", sql.Int, portfolioId);
    request.input("stockSymbol", sql.VarChar, stockSymbol);
    request.input("purchaseDate", sql.Date, purchaseDate);
    request.input("quantity", sql.Int, quantity);
    request.input("price", sql.Decimal(18, 2), price); // adjust scale/precision if needed

    const result = await request.query(`
      INSERT INTO portfolio_stocks 
        (portfolio_id, stock_symbol, purchase_date, quantity, price)
      OUTPUT INSERTED.*
      VALUES (@portfolioId, @stockSymbol, @purchaseDate, @quantity, @price)
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error inserting portfolio stock:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Get all stocks for a portfolio
router.get("/", async (req, res) => {
  const { portfolioId } = req.query;

  if (!portfolioId) {
    return res.status(400).json({ error: "Missing portfolioId query parameter" });
  }

  try {
    await poolConnect;

    const request = pool.request();
    request.input("portfolioId", sql.Int, parseInt(portfolioId));

    const result = await request.query(`
      SELECT * FROM portfolio_stocks 
      WHERE portfolio_id = @portfolioId 
      ORDER BY purchase_date DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching portfolio stocks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

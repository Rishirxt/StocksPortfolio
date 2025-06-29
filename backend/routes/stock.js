// routes/stock.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all stocks from stock_prices table
router.get("/api/stocks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, symbol, date, open, high, low, close, adj_close, volume 
      FROM stock_prices 
      ORDER BY date DESC 
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stocks:", err.message);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

module.exports = router;

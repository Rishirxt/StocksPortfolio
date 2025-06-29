const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // adjust path to your db setup

router.post("/", async (req, res) => {
  const { portfolioId, stockSymbol, purchaseDate, quantity, price } = req.body;

  if (!portfolioId || !stockSymbol || !purchaseDate || !quantity || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO portfolio_stocks 
        (portfolio_id, stock_symbol, purchase_date, quantity, price)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [portfolioId, stockSymbol, purchaseDate, quantity, price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting portfolio stock:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    // You might want to filter by portfolioId via query param:
    const { portfolioId } = req.query;
    if (!portfolioId) {
      return res.status(400).json({ error: "Missing portfolioId query parameter" });
    }

    const result = await pool.query(
      `SELECT * FROM portfolio_stocks WHERE portfolio_id = $1 ORDER BY purchase_date DESC`,
      [portfolioId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching portfolio stocks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

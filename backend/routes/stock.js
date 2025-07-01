const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../config/db");

router.get("/api/stocks", async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();

    const result = await request.query(`
      SELECT TOP 50 
        id, symbol, date, [open], [high], [low], [close], adj_close, volume 
      FROM stock_prices 
      ORDER BY date DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching stocks:", err.message);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

module.exports = router;

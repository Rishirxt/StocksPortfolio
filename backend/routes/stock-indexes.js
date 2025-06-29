const express = require("express");
const router = express.Router();
const { getTopStocks } = require("../services/stockService");

router.get("/", async (req, res) => {
  try {
    const data = await getTopStocks();
    res.json(data);
  } catch (err) {
    console.error("Error fetching stocks:", err.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const yf = require('yahoo-finance2').default;

router.get('/', async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    const quote = await yf.quoteSummary(symbol, { modules: ['price'] });

    if (!quote.price) {
      return res.status(404).json({ error: "Stock data not found" });
    }

    res.json(quote.price);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

module.exports = router;

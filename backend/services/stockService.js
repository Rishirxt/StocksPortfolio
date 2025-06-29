const axios = require("axios");
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const stockSymbols = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "GOOGL", name: "Alphabet (Google)" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "META", name: "Meta (Facebook)" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "INTC", name: "Intel" },
  { symbol: "IBM", name: "IBM" },
  { symbol: "ADBE", name: "Adobe" },
  { symbol: "ORCL", name: "Oracle" },
  { symbol: "CRM", name: "Salesforce" },
  { symbol: "PYPL", name: "PayPal" },
  { symbol: "PEP", name: "PepsiCo" },
  { symbol: "KO", name: "Coca-Cola" },
  { symbol: "NKE", name: "Nike" },
  { symbol: "MCD", name: "McDonald's" },
  { symbol: "WMT", name: "Walmart" },
  { symbol: "DIS", name: "Walt Disney" },
];
async function getTopStocks() {
  const results = await Promise.all(
    stockSymbols.map(async ({ symbol, name }) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        const res = await axios.get(url);
        const data = res.data;

        return {
          name,
          symbol,
          price: data.c ?? null,
          change: data.d ?? null,
          percentChange: data.dp ?? null,
        };
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err.message);
        return {
          name,
          symbol,
          price: null,
          change: null,
          percentChange: null,
        };
      }
    })
  );

  return results;
}

module.exports = { getTopStocks };

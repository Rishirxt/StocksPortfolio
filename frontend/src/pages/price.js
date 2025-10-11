import yahooFinance from 'yahoo-finance2';

(async () => {
  const quote = await yahooFinance.quote('TCS.NS');
  console.log(`Price: ${quote.regularMarketPrice}`);
  console.log(`Change: ${quote.regularMarketChange}`);
})();

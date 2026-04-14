const axios = require('axios');
const csv = require('csv-parser');

const symbols = ['ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK', 'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BEL', 'BPCL', 'BHARTIARTL', 'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY', 'EICHERMOT', 'GRASIM', 'HCLTECH', 'HDFCBANK', 'HDFCLIFE', 'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'INDUSINDBK', 'INFY', 'ITC', 'JSWSTEEL', 'KOTAKBANK', 'LT', 'M&M', 'MARUTI', 'NESTLEIND', 'NTPC', 'ONGC', 'POWERGRID', 'RELIANCE', 'SBILIFE', 'SBIN', 'SUNPHARMA', 'TATAMOTORS', 'TATASTEEL', 'TCS', 'TECHM', 'TITAN', 'TRENT', 'ULTRACEMCO', 'WIPRO', 'SHRIRAMFIN'];

function getValidTradeDate() {
  let date = new Date('2026-04-13T10:00:00Z');
  let day = date.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0) date.setDate(date.getDate() - 2);
  if (day === 6) date.setDate(date.getDate() - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return { yyyy, mm, dd };
}

const { yyyy, mm, dd } = getValidTradeDate();
const url = `https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_${yyyy}${mm}${dd}_F_0000.CSV`;

async function run() {
  try {
    const response = await axios.get(url, { responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const results = [];
    response.data.pipe(csv()).on('data', (row) => {
        const symbol = row.TckrSymb ? row.TckrSymb.trim() : row.SC_CODE;
        const name = row.FinInstrmNm || row.SECURITY || '';
        if (symbols.includes(symbol)) {
            console.log(`"${name.trim()}",`);
            results.push(name.trim());
        }
    }).on('end', () => {
        console.log('Total found:', results.length);
    });
  } catch (err) {
    console.error(err.message);
  }
}
run();

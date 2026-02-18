import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import csv from "csv-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://stocksportfolio.vercel.app",
  credentials: true
}));
app.use(express.json());

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Top 100 BSE Stocks (exact names from CSV)
const TOP_100_STOCKS = [
  "LG Electronics India Limited",
  "Nippon India Mutual Fund - Per",
  "TATA INVESTMENT CORPORATION LT",
  "TIMKEN INDIA LTD.",
  "ICICI BANK LTD.",
  "G.M.BREWERIES LTD.",
  "SANDUR MANGANESE & IRON ORES L",
  "RELIANCE INDUSTRIES LTD.",
  "LARSEN & TOUBRO LTD.",
  "ICICI Lombard General Insuranc",
  "NIPPON INDIA ETF GOLD BEES",
  "Thyrocare Technologies Limited",
  "TATA MOTORS LTD.",
  "National Securities Depository",
  "Stallion India Fluorochemicals",
  "TATA CONSULTANCY SERVICES LTD.",
  "TATA COMMUNICATIONS LTD.",
  "SWIGGY LIMITED",
  "MULTI COMMODITY EXCHANGE OF IN",
  "PERSISTENT SYSTEMS LTD.",
  "HDFC BANK LTD.",
  "ICICI Prudential Mutual Fund",
  "HYUNDAI MOTOR INDIA LIMITED",
  "Bikaji Foods International Lim",
  "HINDUSTAN PETROLEUM CORPORATIO",
  "Waaree Energies Limited",
  "ADANI POWER LTD.",
  "STATE BANK OF INDIA",
  "INFOSYS LTD.",
  "Eternal Limited",
  "VODAFONE IDEA LIMITED",
  "GENESYS INTERNATIONAL CORPORAT",
  "HCL TECHNOLOGIES LTD.",
  "Tata Capital Limited",
  "BAJAJ FINANCE LIMITED",
  "NETWEB TECHNOLOGIES INDIA LIMI",
  "WAAREE RENEWABLE TECHNOLOGIES",
  "POWER FINANCE CORPORATION LTD.",
  "Hindustan Aeronautics Limited",
  "BANK OF MAHARASHTRA",
  "SUZLON ENERGY LTD.",
  "BHARTI AIRTEL LTD.",
  "BAJAJ FINSERV LTD.",
  "ANGEL ONE LIMITED",
  "Apollo Micro Systems Limited",
  "ANANT RAJ LIMITED",
  "FEDERAL BANK LTD.",
  "RBL Bank Limited",
  "NIPPON INDIA ETF NIFTY BEES",
  "Urban Company Limited",
  "VEDANTA LIMITED",
  "Jio Financial Services Limited",
  "RIR POWER ELECTRONICS LIMITED",
  "SPICEJET LTD.",
  "Garden Reach Shipbuilders & En",
  "One 97 Communications Limited",
  "Quick Heal Technologies Limite",
  "AXIS BANK LTD.",
  "TECH MAHINDRA LTD.",
  "NIPPON INDIA ETF LIQUID BEES",
  "Tatva Chintan Pharma Chem Limi",
  "MOSCHIP TECHNOLOGIES LIMITED",
  "HDFC Asset Management Company",
  "Dixon Technologies (India) Lim",
  "TRENT LTD.",
  "HINDALCO INDUSTRIES LTD.",
  "COLAB PLATFORMS LIMITED",
  "Zerodha Mutual Fund",
  "HDFC Mutual Fund",
  "GODFREY PHILLIPS INDIA LTD.",
  "PUNJAB NATIONAL BANK",
  "MTAR Technologies Limited",
  "BHARAT ELECTRONICS LTD.",
  "HINDUSTAN COPPER LTD.",
  "Indian Renewable Energy Develo",
  "RELIANCE POWER LTD.",
  "Sona BLW Precision Forgings Li",
  "YES BANK LTD.",
  "Newgen Software Technologies L",
  "SAMPRE NUTRITIONS LTD.",
  "ADANI PORTS AND SPECIAL ECONOM",
  "HERO MOTOCORP LTD.",
  "Ather Energy Limited",
  "MAHINDRA & MAHINDRA LTD.",
  "Cochin Shipyard Limited",
  "ITC LTD.",
  "HINDUSTAN UNILEVER LTD.",
  "PETRONET LNG LTD.",
  "BEML LTD.",
  "ITC Hotels Limited",
  "TITAN COMPANY LIMITED",
  "ABBOTT INDIA LTD.",
  "Adani Green Energy Limited",
  "COFORGE LIMITED",
  "Vikram Solar Limited",
  "DSM Fresh Foods Limited",
  "AVANTEL LTD.",
  "TATA POWER CO.LTD.",
  "Tejas Networks Limited",
  "DLF LTD."
];

// ✅ Date Logic (Weekend + Holiday + 8PM rule)
function getValidTradeDate() {
  let date = new Date();
  let hour = date.getHours();

  // If before 8 PM, use yesterday
  if (hour < 20) {
    date.setDate(date.getDate() - 1);
  }

  let day = date.getDay(); // 0 = Sun, 6 = Sat

  // If weekend, roll back to Friday
  if (day === 0) date.setDate(date.getDate() - 2);
  if (day === 6) date.setDate(date.getDate() - 1);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return { tradeDate: `${yyyy}-${mm}-${dd}`, yyyy, mm, dd };
}

// ✅ API: Get latest top 100 stocks
app.get("/latest-bse", async (req, res) => {
  const { tradeDate } = getValidTradeDate();

  const { data, error } = await supabase
    .from("bse_stocks")
    .select("*")
    .eq("trade_date", tradeDate)
    .in("name", TOP_100_STOCKS)
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

// ✅ API: Refresh & Save BhavCopy
app.get("/refresh-bse", async (req, res) => {
  const { tradeDate, yyyy, mm, dd } = getValidTradeDate();
  const url = `https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_${yyyy}${mm}${dd}_F_0000.CSV`;

  try {
    const response = await axios.get(url, { responseType: "stream" });
    const results = [];

    response.data
      .pipe(csv())
      .on("data", (row) => {
        const symbol = row.SC_CODE || row.TckrSymb || "";
        const name = row.FinInstrmNm || row.SECURITY || "";

        if (!symbol || !name || !TOP_100_STOCKS.includes(name.trim())) return;

        results.push({
          trade_date: tradeDate,
          symbol: symbol.trim(),
          name: name.trim(),
          open: parseFloat(row.OpnPric || 0),
          high: parseFloat(row.HghPric || 0),
          low: parseFloat(row.LwPric || 0),
          close: parseFloat(row.ClsPric || 0),
          volume: parseInt(row.TOTTRDVAL || row.VOLUME || 0)
        });
      })
      .on("end", async () => {
        // Upsert into latest table
        const { error: bseError } = await supabase
          .from("bse_stocks")
          .upsert(results, { onConflict: "trade_date,symbol" });

        // Insert into history table
        const { error: portfolioError } = await supabase
          .from("stocks_portfolio")
          .insert(results);

        if (bseError) return res.status(500).json({ message: "bse_stocks failed", error: bseError });
        if (portfolioError) return res.status(500).json({ message: "stocks_portfolio failed", error: portfolioError });

        res.json({
          message: "Top 100 BSE data stored ✅",
          rows: results.length
        });
      });
  } catch (err) {
    res.status(500).json({ message: "BhavCopy fetch failed", error: err.message });
  }
});

// Default Route
app.get("/", (req, res) => res.send("✅ BSE API Running"));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stock");
const portfoliosRouter = require("./routes/portfolios");
const portfolioStocksRouter = require("./routes/portfoliostocks");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Portfolio Management API is running");
});
app.use("/api", authRoutes);
app.use("/", stockRoutes);       // ✅ FIXED this line
app.use("/api/portfolios", portfoliosRouter);
app.use("/api/portfolio-stocks", portfolioStocksRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

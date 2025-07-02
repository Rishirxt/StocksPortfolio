const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.SQLUSER,         // same as PGUSER
  password: process.env.SQLPASSWORD, // same as PGPASSWORD
  server: process.env.SQLHOST,       // e.g. your-server-name.database.windows.net
  database: process.env.SQLDATABASE, // same as PGDATABASE
  port: parseInt(process.env.SQLPORT) || 1433,
  options: {
    encrypt: true,                   // Required for Azure
    trustServerCertificate: false,  // Set to true if using a self-signed cert locally
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect,
};


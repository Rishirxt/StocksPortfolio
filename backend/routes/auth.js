const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, pool, poolConnect } = require("../config/db"); // Make sure this is your MSSQL db config

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    await poolConnect;

    const hashed = await bcrypt.hash(password, 10);

    const request = pool.request();
    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, hashed);

    // Use OUTPUT INSERTED.id to get the new ID in SQL Server
    const result = await request.query(`
      INSERT INTO users (username, email, password)
      OUTPUT INSERTED.id
      VALUES (@username, @email, @password)
    `);

    const userId = result.recordset[0].id;
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await poolConnect;

    const request = pool.request();
    request.input("email", sql.VarChar, email);

    const result = await request.query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = result.recordset[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;

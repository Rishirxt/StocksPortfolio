// backend/routes/portfolios.js

const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db'); // Make sure this is your MSSQL config

// Create a new portfolio
router.post('/', async (req, res) => {
  const { name, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ error: 'Missing name or userId' });
  }

  try {
    await poolConnect;

    const request = pool.request();
    request.input("name", sql.VarChar, name);
    request.input("userId", sql.Int, parseInt(userId));

    // OUTPUT INSERTED.* works like RETURNING * in MSSQL
    const result = await request.query(`
      INSERT INTO portfolios (name, user_id)
      OUTPUT INSERTED.*
      VALUES (@name, @userId)
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error creating portfolio:", err);
    res.status(500).json({ error: "Failed to create portfolio" });
  }
});

// Get portfolios for a specific user
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    await poolConnect;

    const request = pool.request();
    request.input("userId", sql.Int, parseInt(userId));

    const result = await request.query(`
      SELECT * FROM portfolios WHERE user_id = @userId
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching portfolios:', err);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

module.exports = router;

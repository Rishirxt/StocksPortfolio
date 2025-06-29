// backend/routes/portfolios.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Make sure this path is correct and `pool` is properly exported from db.js

// Create a new portfolio
router.post('/', async (req, res) => {
  const { name, userId } = req.body;
  if (!name || !userId) {
    return res.status(400).json({ error: 'Missing name or userId' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO portfolios (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    res.json(result.rows[0]);
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
    const result = await pool.query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching portfolios:', err);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

module.exports = router;

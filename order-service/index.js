const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const CATALOG_URL = 'http://localhost:3001';

app.post('/purchase/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const response = await axios.get(`${CATALOG_URL}/info/${id}`);
    const book = response.data;
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.stock <= 0) return res.status(400).json({ error: "Out of stock" });
    await axios.post(`${CATALOG_URL}/update/${id}`, { change: -1 });
    res.json({ message: `Successfully purchased "${book.title}"` });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3002, () => {
  console.log("Order Service running on http://localhost:3002");
});
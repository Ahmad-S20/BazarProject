const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const CATALOG_URL = 'http://localhost:3001';
const ORDER_URL = 'http://localhost:3002';

app.get('/search/:topic', async (req, res) => {
  const topic = req.params.topic;
  try {
    const response = await axios.get(`${CATALOG_URL}/search/${topic}`);
    const books = response.data;
    const result = books.map(b => ({ id: b.id, title: b.title }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

app.get('/info/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`${CATALOG_URL}/info/${id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

app.post('/purchase/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.post(`${ORDER_URL}/purchase/${id}`);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Could not reach order service" });
    }
  }
});

app.listen(3000, () => {
  console.log("Frontend Service running on http://localhost:3000");
});
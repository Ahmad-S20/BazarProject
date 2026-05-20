const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const CATALOG_REPLICAS = [
  process.env.CATALOG_URL_1 || 'http://localhost:3001',
  process.env.CATALOG_URL_2 || 'http://localhost:3003'
];
const ORDER_REPLICAS = [
  process.env.ORDER_URL_1 || 'http://localhost:3002',
  process.env.ORDER_URL_2 || 'http://localhost:3004'
];

let catalogIndex = 0;
let orderIndex = 0;

function getCatalogURL() {
  const url = CATALOG_REPLICAS[catalogIndex];
  catalogIndex = (catalogIndex + 1) % CATALOG_REPLICAS.length;
  console.log(`Routing to catalog replica: ${url}`);
  return url;
}

function getOrderURL() {
  const url = ORDER_REPLICAS[orderIndex];
  orderIndex = (orderIndex + 1) % ORDER_REPLICAS.length;
  console.log(`Routing to order replica: ${url}`);
  return url;
}

// **************************************************************

const cache = {};
function getFromCache(key) {
  if (cache[key]) {
    console.log(`Cache HIT for key: ${key}`);
    return cache[key];
  }
  console.log(`Cache MISS for key: ${key}`);
  return null;
}

function saveToCache(key, value) {
  cache[key] = value;
  console.log(`Saved to cache: ${key}`);
}

function invalidateCache(id) {
  const key = `info_${id}`;
  if (cache[key]) {
    delete cache[key];
    console.log(`Cache invalidated for book id: ${id}`);
  }
}

// **************************************************************


app.get('/search/:topic', async (req, res) => {
  const topic = req.params.topic;
  const cacheKey = `search_${topic}`;

  const cached = getFromCache(cacheKey);
  if (cached) {console.log(`found cached result for topic: ${topic}`);
    return res.json(cached);}

  try {
    const response = await axios.get(`${getCatalogURL()}/search/${topic}`);
    const books = response.data;
    const result = books.map(b => ({ id: b.id, title: b.title }));

    saveToCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

app.get('/info/:id', async (req, res) => {
  const id = req.params.id;
  const cacheKey = `info_${id}`;

  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(`${getCatalogURL()}/info/${id}`);
    saveToCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

app.post('/purchase/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.post(`${getOrderURL()}/purchase/${id}`);
    invalidateCache(id);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Could not reach order service" });
    }
  }
});

app.post('/invalidate/:id', (req, res) => {
  const id = req.params.id;
  invalidateCache(id);
  res.json({ message: `Cache invalidated for book ${id}` });
});

app.listen(3000, () => {
  console.log("Frontend Service running on http://localhost:3000");
});
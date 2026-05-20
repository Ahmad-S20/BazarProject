const express = require('express');
const fs = require('fs');

const axios = require('axios');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REPLICA_URL = process.env.REPLICA_URL || 'http://localhost:3003';

const app = express();
app.use(express.json());

const CSV_FILE = 'catalog.csv';

function loadBooks() {
  const lines = fs.readFileSync(CSV_FILE, 'utf8').trim().split('\n');
  lines.shift();

  return lines.map(line => {
    const [id, title, topic, price, stock] = line.split(',');
    return {
      id: parseInt(id),
      title,
      topic,
      price: parseFloat(price),
      stock: parseInt(stock)
    };
  });
}

function saveBooks(books) {
  const header = 'id,title,topic,price,stock';
  const lines = books.map(book =>
    `${book.id},${book.title},${book.topic},${book.price},${book.stock}`
  );
  fs.writeFileSync(CSV_FILE, [header, ...lines].join('\n'));
}

let books = loadBooks();

app.get('/search/:topic', (req, res) => {
  const topic = decodeURIComponent(req.params.topic);
  const result = books.filter(book => book.topic === topic);
  res.json(result);
});

app.get('/info/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(book => book.id === id);
  res.json(book);
});

app.post('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const change = req.body.change;
  const book = books.find(book => book.id === id);

  if (book) {
    book.stock += change;
    saveBooks(books);

    try {
      await axios.post(`${FRONTEND_URL}/invalidate/${id}`);
    } catch (err) {
      console.log("Could not invalidate cache:", err.message);
    }
    try {
      await axios.post(`${REPLICA_URL}/sync/${id}`, { stock: book.stock });
    } catch (err) {
      console.log("Could not sync with replica:", err.message);
    }

    res.json({ message: "Updated successfully", book });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.post('/sync/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { stock } = req.body;
  const book = books.find(b => b.id === id);
  if (book) {
    book.stock = stock;
    saveBooks(books);
    console.log(`Synced book ${id} stock to ${stock}`);
    res.json({ message: "Synced successfully" });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

setInterval(async () => {
  console.log("\nRestocking all books...");
  books = loadBooks();
  books.forEach(book => {
    book.stock += 2;
  });
  saveBooks(books);
  for (const book of books) {
    try {
      await axios.post(`${FRONTEND_URL}/invalidate/${book.id}`);
    } catch (err) {
      console.log(`Could not invalidate cache for book ${book.id}:`, err.message);
    }
    try {
      await axios.post(`${REPLICA_URL}/sync/${book.id}`, { stock: book.stock });
    } catch (err) {
      console.log(`Could not sync book ${book.id} with replica:`, err.message);
    }
  }
  //console.log("Restock complete:", books.map(b => `${b.title}: ${b.stock}`));
},60000);// (6000 ms = 6 seconds)

app.listen(3001, () => {
  console.log("Catalog Service running on http://localhost:3001");
});
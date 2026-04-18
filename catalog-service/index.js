const express = require('express');
const fs = require('fs');

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

app.post('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const change = req.body.change;

  const book = books.find(book => book.id === id);

  if (book) {
    book.stock += change;
    saveBooks(books);
    res.json({ message: "Updated successfully", book });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.listen(3001, () => {
  console.log("Catalog Service running on http://localhost:3001");
});
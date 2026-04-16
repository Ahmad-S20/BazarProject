const express = require('express');
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: "How to get a good grade in DOS in 40 minutes a day", topic: "distributed systems", price: 30, stock: 5 },
  { id: 2, title: "RPCs for Noobs", topic: "distributed systems", price: 50, stock: 3 },
  { id: 3, title: "Xen and the Art of Surviving Undergraduate School", topic: "undergraduate school", price: 40, stock: 4 },
  { id: 4, title: "Cooking for the Impatient Undergrad", topic: "undergraduate school", price: 20, stock: 2 }
];

app.get('/search/:topic', (req, res) => {
  const topic = req.params.topic;
  const result = books.filter(b => b.topic === topic);
  res.json(result);
});

app.get('/info/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  res.json(book);
});

app.post('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const change = req.body.change;
  const book = books.find(b => b.id === id);
  if (book) {
    book.stock += change;
    res.json({ message: "Updated successfully", book });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.listen(3001, () => {
  console.log("Catalog Service running on http://localhost:3001");
});
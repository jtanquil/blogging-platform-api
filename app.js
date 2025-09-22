const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/posts', (req, res) => {
  res.send("GET /posts");
});

app.get('/posts/:id', (req, res) => {
  res.send(`GET /posts/${req.params.id}`);
});

app.post('/posts', (req, res) => {
  res.send("POST /posts");
});

app.post('/posts/:id', (req, res) => {
  res.send(`POST /posts/${req.params.id}`);
});

app.delete('/posts/:id', (req, res) => {
  res.send(`DELETE /posts/${req.params.id}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
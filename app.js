const express = require('express');
const dotenv = require('dotenv');
const connection = require('./db.js')

dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT;

async function getQueryResults(req, res) {
  res.send(await connection.connectionTest(req.params.id));
}


app.get('/', getQueryResults);

app.get('/posts/', (req, res) => {
  res.send(connection.connectionTest());
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
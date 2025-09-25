const express = require('express');
const dotenv = require('dotenv');
const connection = require('./db.js')

dotenv.config({ debug: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

async function getQueryResults(req, res) {
  res.send(await connection.connectionTest(req.params.id));
}

async function postQuery(req, res) {
  await connection.createPost(req.body);
  res.send("post made");
}

app.get('/', getQueryResults);

app.get('/posts/', (req, res) => {
  res.send(connection.connectionTest());
});

app.get('/posts/:id', (req, res) => {
  res.send(`GET /posts/${req.params.id}`);
});

app.post('/posts', postQuery);

app.post('/posts/:id', (req, res) => {
  res.send(`POST /posts/${req.params.id}`);
});

app.delete('/posts/:id', (req, res) => {
  res.send(`DELETE /posts/${req.params.id}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
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

async function getPosts(req, res) {
  res.status(200).send(await connection.getPosts());
}

async function getPost(req, res) {
  const post = await connection.getPost(req.params.id);

  if (post.length === 0) {
    res.status(404).send(`post with id ${req.params.id} not found`);
  } else {
    res.status(200).send(post[0]);
  }
}

async function postQuery(req, res) {
  try {
    await connection.createPost(req.body);
    res.status(201).send("post created");
  } catch (err) {
    res.status(400).send(err);
  }
}

app.get('/', getQueryResults);

app.get('/posts/', getPosts);

app.get('/posts/:id', getPost);

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
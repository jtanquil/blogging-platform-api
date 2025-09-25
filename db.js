const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const flatted = require('flatted');

dotenv.config();

const host = process.env.HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = "blogging_platform";

const schema = [
 `CREATE TABLE tags(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255)
  );`,
  `CREATE TABLE categories(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255)
  );`,
  `CREATE TABLE posts(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );`,
  `CREATE TABLE posts_tags(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );`,
];

async function setupDatabase(con) {
  console.log("setting up database...");
  await con.execute(`CREATE DATABASE ${database}`);
  console.log("database created, reestablishing connection...")

  con.end((err) => {
    if (err) throw err;
  });

  con = await mysql.createConnection({ host, user, password, database });

  console.log("setting up tables...");
  for (let ele of schema) {
    await con.execute(ele);
  }
  console.log("tables created, database setup complete")

  return con;
}

// whenever making a connection
// - check whether db exists, create it + tables otherwise
// - create db, create posts, tags, posts_tags join table
// - execute query and return the result
async function connectionTest() {
  // check for db
  let con = await mysql.createConnection({ host, user, password });
  let [ rows, fields ] = 
    await con.execute("SHOW DATABASES");

  if (!rows.find(row => row.Database == database)) {
    con = await setupDatabase(con);
  }

  let res = await con.execute(`SHOW TABLES from ${database}`);
  return res[0];

  con.end((err) => {
    if (err) throw err;
  });
}

// insert tags that aren't in tags
// insert category if it isn't in categories
// insert the post
// insert the post/tag joins
async function createPost(post) {
  let con = await mysql.createConnection({ host, user, password, database });
  const [ tagsResults, tagsFields ] = await con.execute("SELECT id, tag FROM tags");
  let tagIds = [];
  let tags = post.tags.split(",");

  for (let tag of tags) {
    let result = tagsResults.find(tagsResult => tagsResult.tag == tag);

    if (!result) {
      result = (await con.execute(`INSERT INTO tags (tag) VALUES ('${tag}')`))[0];
    }

    if ("id" in result) {
      tagIds.push(result.id);
    } else if ("insertId" in result) {
      tagIds.push(result.insertId);
    }
  }

  let [ categoryResult, categoryFields ] = await con.execute(
    `SELECT id FROM categories WHERE category = "${post.category}"`);
  let categoryId = (categoryResult.length > 0) ? categoryResult[0].id : undefined;
  
  if (categoryResult.length === 0) {
    categoryId = (await con.execute(
      `INSERT INTO categories (category) VALUES ('${post.category}')`))[0].insertId;
  }

  let postId = (await con.execute(
    `INSERT INTO posts (title, content, category_id) VALUES 
    ('${post.title}', '${post.content}', '${categoryId}')`))[0].insertId;

  for (let tagId of tagIds) {
    await con.execute(
      `INSERT INTO posts_tags (post_id, tag_id) VALUES (${postId}, ${tagId})`);
  }

  con.end((err) => {
    if (err) throw err;
  });
}

async function getPosts() {
  let con = await mysql.createConnection({ host, user, password, database });
  const [ postsResults, postsFields ] = await con.execute(`
    SELECT p.id, p.title, p.content, c.category, GROUP_CONCAT(t.tag SEPARATOR ',') tags, p.created_at, p.updated_at
    FROM posts p 
    JOIN posts_tags pt ON p.id = pt.post_id
    JOIN tags t ON t.id = pt.tag_id
    JOIN categories c ON c.id = p.category_id
    GROUP BY p.id, p.title, p.content, c.category, p.created_at, p.updated_at 
    `);

  postsResults.forEach((post) => {
    post.tags = post.tags.split(",");
  });

  con.end((err) => {
    if (err) throw err;
  });

  return postsResults;
}

async function getPost(id) {
  let con = await mysql.createConnection({ host, user, password, database });
  const [ postsResults, postsFields ] = await con.execute(`
    SELECT p.id, p.title, p.content, c.category, GROUP_CONCAT(t.tag SEPARATOR ',') tags, p.created_at, p.updated_at
    FROM posts p 
    JOIN posts_tags pt ON p.id = pt.post_id
    JOIN tags t ON t.id = pt.tag_id
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = '${id}'
    GROUP BY p.id, p.title, p.content, c.category, p.created_at, p.updated_at 
    `);

  postsResults.forEach((post) => {
    post.tags = post.tags.split(",");
  });

  con.end((err) => {
    if (err) throw err;
  });

  return postsResults;
}

module.exports = { connectionTest, createPost, getPosts, getPost };
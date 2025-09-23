const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const flatted = require('flatted');

dotenv.config();

const host = process.env.HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

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
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
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
  await con.execute("CREATE DATABASE blogging_platform");
  console.log("database created, reestablishing connection...")

  con.end((err) => {
    if (err) throw err;
  });

  con = await mysql.createConnection({
    host, user, password, database: "blogging_platform"
  });

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
  const [ rows, fields ] = 
    await con.execute("SHOW DATABASES");

  if (!rows.find(row => row.Database == "blogging_platform")) {
    con = setupDatabase(con);
  }

  let res = await con.execute("SHOW TABLES from blogging_platform");
  return res;
}

module.exports = { connectionTest };
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const host = process.env.HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

const con = mysql.createConnection({ host, user, password });

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

// whenever making a connection
// - check whether db exists, create it + tables otherwise
// - create db, create posts, tags, posts_tags join table
// - execute query and return the result
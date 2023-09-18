const express = require('express')
const expresslayouts = require('express-ejs-layouts')
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);


const app = express();
const port = 8080;

app
.use('/', require('./server/routes/main'))
.use('/', require('./server/routes/admin'))
.use(expresslayouts)
.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.use(session({
  resave: false,
  saveUninitialized: true,
  store: new SQLiteStore,
  secret: 'void vampire',
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } 
}));
app.set('view engine', 'ejs');
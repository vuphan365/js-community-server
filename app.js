const express = require('express');
const morgan = require('morgan');
const debug = require('debug')('app');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();

const config = {
  user: 'vuphan369',
  password: 'Xv01683596091',
  server: 'demonodejslibrary.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'js-community',

  options: {
    encrypt: true // Use this if you're on Windows Azure
  }
};

sql.connect(config).catch(err => debug(err));

const port = process.env.PORT || 3005;

const book = {
  name: 'Rung Na Uy',
  author: 'Koshigawa'
};
app.use(morgan('tiny'));  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTION');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const userRouter = require('./src/routers/userRouter')(sql);
const postRouter = require('./src/routers/postRouter')(sql);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTION');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/post', postRouter);
app.use('/', userRouter);
app.get('/', (req, res) => {
  res.json(book);
});

app.listen(port, () => {
  debug(`Server listening in ${port}`);
});


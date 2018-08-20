const express = require('express');
const morgan = require('morgan');
const debug = require('debug')('app');
const bodyParser = require('body-parser');
const app = express();

const firebase = require('./firebase');
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

const userRouter = require('./src/routers/userRouter')(firebase.database().ref('user'));
const postRouter = require('./src/routers/postRouter')(firebase.database().ref('post'));
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


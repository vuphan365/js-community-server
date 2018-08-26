const express = require('express');
const debug = require('debug')('app:rankRoute');

const rankRouter = express.Router();
const rankController = require('../controllers/rankController')

function route(sql) {
  const { getRank, getRankOfUser } = rankController(sql)
  rankRouter.route('/get')
  .get((req, res) => {
    getRank(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  }); 
  rankRouter.route('/get/:userId')
  .get((req, res) => {
    getRankOfUser(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  }); 
  return rankRouter;
}

module.exports = route;
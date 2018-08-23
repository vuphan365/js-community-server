const express = require('express');
const debug = require('debug')('app:postRoute');

const postRouter = express.Router();
const postController = require('../controllers/postController')

function router(sql) {
  const { getPostById, getPosts } = postController(sql)

  postRouter.route('/post/:id')
    .get((req, res) => {
      getPostById(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  postRouter.route('/get')
    .get((req, res) => {
      getPosts(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });  
  return postRouter; 
}

module.exports = router;
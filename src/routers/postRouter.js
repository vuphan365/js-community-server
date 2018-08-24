const express = require('express');
const debug = require('debug')('app:postRoute');

const postRouter = express.Router();
const postController = require('../controllers/postController')

function router(sql) {
  const { getPostById, getPosts, getLikeById, getCommentById } = postController(sql)

  postRouter.route('/post/:id')
    .get((req, res) => {
      getPostById(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  postRouter.route('/like/:id')
    .get((req, res) => {
      getLikeById(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  postRouter.route('/comment/:id')
    .get((req, res) => {
      getCommentById(req, res)
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
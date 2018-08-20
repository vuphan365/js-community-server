const express = require('express');
const debug = require('debug')('app:postRoute');

const postRouter = express.Router();
const postController = require('../controllers/postController')

function router(ref) {
  const { addPost, getPost } = postController(ref)

  postRouter.route('/add')
    .post((req, res) => {
      addPost(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  postRouter.route('/get')
    .get((req, res) => {
      getPost(req, res);
    });  
  return postRouter; 
}

module.exports = router;
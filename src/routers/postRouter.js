const express = require('express');
const debug = require('debug')('app:postRoute');

const postRouter = express.Router();
const postController = require('../controllers/postController')

function router(sql) {
  const { getPostById, getPosts, getLikeById, getCommentById, getPostsByHashtag, getAllHashTag
  , getHashTagById, addPost, addCommentToPost, addLikeToPost, deleteAPost, deleteAComment
  , getOthers, getPostsOfUser, getInfoOfUser } = postController(sql)

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
  postRouter.route('/hashtag/:id')
    .get((req, res) => {
      getHashTagById(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });        
  postRouter.route('/get')
    .get((req, res) => {
      getPosts(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  postRouter.route('/user/:id')
  .get((req, res) => {
    getPostsOfUser(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });
  postRouter.route('/info/:id')
  .get((req, res) => {
    getInfoOfUser(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });
  postRouter.route('/get/type/:type')
  .get((req, res) => {
    getOthers(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });
  postRouter.route('/get/hashtag/all')
    .get((req, res) => {
      getAllHashTag(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });  
  postRouter.route('/get/hashtag')
    .get((req, res) => {
      getPostsByHashtag(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    }); 
  postRouter.route('/add')
  .post((req, res) => {
    addPost(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });
  postRouter.route('/add/comment')
  .post((req, res) => {
    addCommentToPost(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });  
  postRouter.route('/add/like')
  .post((req, res) => {
    addLikeToPost(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });
  postRouter.route('/delete')
  .post((req, res) => {
    deleteAPost(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });  
  postRouter.route('/delete/comment')
  .post((req, res) => {
    deleteAComment(req, res)
    .then(result => res.send(result))
    .catch(err => res.send(err));
  });         
  return postRouter; 
}

module.exports = router;
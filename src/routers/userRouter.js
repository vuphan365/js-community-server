const express = require('express');
const debug = require('debug')('app:userRoute');

const userRouter = express.Router();
const userController = require('../controllers/userController')

function router(ref) {
  const { addEmail, signInWithEmail } = userController(ref)

  userRouter.route('/user/create')
    .post((req, res) => {
      addEmail(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });
  userRouter.route('/signin')
    .post((req, res) => {
      signInWithEmail(req, res)
      .then(result => res.send(result))
      .catch(err => res.send(err));
    });  
  return userRouter; 
}

module.exports = router;
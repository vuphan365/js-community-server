const express = require('express');
const debug = require('debug')('app:userRoute');

const userRouter = express.Router();
const userController = require('../controllers/userController')

function router(sql) {
  const { addEmail, signInWithEmail } = userController(sql)

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
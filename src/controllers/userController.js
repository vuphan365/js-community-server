const debug = require('debug')('app:userController');
const uuid = require('uuid');

function userController(ref) {
  function addEmail(req, res) {
    return new Promise((resolve, reject) => {
      const { email } = req.body;
      const token = uuid.v4();
      debug(req.body)
      ref.push({ email, token }).then(() => {
        var result = {
          msg: 'Tạo tài khoản thành công'
        }
        resolve(result)
      }).catch(err => reject(err))
    })
  }
  function signInWithEmail(req, res) {
    return new Promise((resolve, reject) => {
      const { email } = req.body;
      ref.orderByChild('email').equalTo(email).once('value').then(snap => {
        if (snap.val() == null) {
          var error = {
            error: 'Tài khoản của bạn không được phép truy cập vào trang này'
          }
          reject(error)
        } else {
          snap.forEach(user => {
            const { email, token } = user.val();
            resolve({ email, token })
          }).catch(err => {
            debug(err)
            reject(err)
          })
        }

      }).catch(err => {
        debug(err)
        reject(err)
      })
    })
  }
  return {
    addEmail,
    signInWithEmail
  }
}

module.exports = userController;
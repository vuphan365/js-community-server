const debug = require('debug')('app:userController');
const uuid = require('uuid');

function userController(sql) {
  function isEmailNotExist(email) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      request.query(`SELECT email FROM dbo.[User] WHERE
         email = '${email}'`).then((result) => {
          const userResult = result.recordset[0];
          debug(userResult)
          if (userResult.name === 'undefined') {
            resolve(true);
          } else {
            reject();
          }
        }).catch(() => resolve(false));
    });
  }
  function addEmail(req, res) {
    return new Promise((resolve, reject) => {
      const { name, email, avatar } = req.body;
      const token = uuid.v4();
      const transaction = new sql.Transaction();
      const request = new sql.Request(transaction);
      debug(`INSERT INTO dbo.[User](name,description,email,token,avatar)
         VALUES(N'${name}', N'${name}', '${email}', '${token}', '${avatar}')`)
      isEmailNotExist(email).then(() => {
        transaction.begin(() => {
          request.query(`INSERT INTO dbo.[User](name,description,email,token,avatar) VALUES 
          (N'${name}', N'${name}', '${email}', '${token}', '${avatar}')`)
            .then((result) => {
              transaction.commit();
              res.send(result);
              resolve(result);
            }).catch((err) => {
              res.send(err);
              reject(err);
            });
        });
      }).catch(() => {
        let err = 'Tài khoản này đã tồn tại';
        res.send({ err });
        reject({ err });
      });

    })
  }
  function signInWithEmail(req, res) {
    return new Promise((resolve, reject) => {
      const { email, picture, name } = req.body;
      const subRequest = new sql.Request();
      debug({ email, picture, name });
      subRequest.query(`UPDATE dbo.[User] SET avatar = '${picture}', [name] = N'${name}' WHERE email = '${email}'`)
        .then(resu => {
          debug(resu);
          const request = new sql.Request();
          request.query(`SELECT email, token, [description], avatar, userId, [name] FROM dbo.[User] WHERE
          email = '${email}'`).then((result) => {
              const userResult = result.recordset[0];
              debug(userResult)
              if (userResult) resolve(userResult)
              else resolve({error : 'Lỗi'})
            }).catch(err => {
              debug(err);
              reject(false)
            });
        }).catch(err => {
          debug(err);
          reject(false)
        });
    })
  }
  return {
    addEmail,
    signInWithEmail
  }
}

module.exports = userController;
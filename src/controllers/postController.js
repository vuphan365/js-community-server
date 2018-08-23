const debug = require('debug')('app:postController');
const uuid = require('uuid');

function postController(sql) {
  function getPostById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params; 
      request.query(`SELECT * FROM dbo.[Post] WHERE postId = ${id}`).then((result) => {
        const postResult = result.recordset[0];
        resolve(postResult)
      }).catch(() => reject(false));
    })
  }
  function getPosts(req, res) {
    return new Promise((resolve, reject) => {
      const subRequest = new sql.Request();
        subRequest.query('SELECT COUNT(*) as total FROM dbo.Post').
        then(resu => {
          const total_pages = resu.recordset[0].total / 10;
          debug(total_pages)
          const request = new sql.Request();
          const likes = []
          const {page} = req.query;
          request.query(`SELECT po.postId, po.authorId, po.title, po.type, po.created_at FROM (
            SELECT ROW_NUMBER() OVER (Order by postId) AS RN, postId, authorId, title, content, created_at, type
            FROM dbo.Post)po WHERE RN > ${(page - 1) * 10} AND RN <= ${page * 10}`).then((result) => {
            const postResult =  result.recordset;
            for (var i = 0; i < postResult.length; i ++) {
              let childRequest = new sql.Request();
              childRequest.query(`SELECT postId, [Like].userId, name FROM dbo.[Like] INNER JOIN dbo.[User] 
              ON [User].userId = [Like].userId WHERE postId = ${postResult[i].postId}`).then(childResult => {
                let like = childResult.recordset;
                debug(like)
                let temp = Object.assign({}, postResult, like)
                temp.like = like
                likes.concat(temp)
                postResult = Object.assign({}, temp)
                // debug(postResult[i])
              })
            }
            debug(likes)
            debug('end')
            resolve({total_pages, page, posts : postResult })
        })
      }).catch((err) => {debug(err); reject(false)});
    })
  }
  return {
    getPostById,
    getPosts
  }
}

module.exports = postController;
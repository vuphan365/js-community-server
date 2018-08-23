const debug = require('debug')('app:postController');
const uuid = require('uuid');

function postController(sql) {
  function addPost(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      request.query(`SELECT * FROM dbo.[Post] WHERE`).then((result) => {
        const postResult = result.recordset[0];
        debug(postResult)
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
        const {page} = req.query;
        request.query(`SELECT po.postId, po.authorId, po.title, po.content, po.created_at FROM (
          SELECT ROW_NUMBER() OVER (Order by postId) AS RN, postId, authorId, title, content, created_at, type
          FROM dbo.Post)po WHERE RN > ${(page - 1) * 10} AND RN <= ${page * 10}`).then((result) => {
          const postResult = result.recordset;
          resolve({total_pages, page, posts : postResult })
      })
      
      }).catch((err) => {debug(err); reject(false)});
    })
  }
  return {
    addPost,
    getPosts
  }
}

module.exports = postController;
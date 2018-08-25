const debug = require('debug')('app:postController');
const uuid = require('uuid');

function postController(sql) {
  function getPostById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params; 
      request.query(`SELECT Post.postId, authorId, [name] AS 'authorName', avatar AS 'authorAvatar',
      description AS 'authorDescription', title, content, created_at, type, total_like_comment.total_comments,
      total_like_comment.total_likes
      FROM dbo.Post INNER JOIN dbo.[User] ON [User].userId = Post.authorId
      LEFT JOIN
      ( SELECT comment.postId, comment.total_comments, [like].total_likes FROM ( SELECT Post.postId, COUNT([Like].userId) AS 'total_likes'
      FROM dbo.Post LEFT JOIN dbo.[Like] ON [Like].postId = Post.postId
      GROUP BY Post.postId) [like]
      INNER JOIN 
      ( SELECT Post.postId,COUNT(Comment.content) AS 'total_comments'
      FROM dbo.Post LEFT JOIN dbo.Comment ON Comment.postId = Post.postId
      GROUP BY Post.postId ) comment
      ON comment.postId = [like].postId) total_like_comment
      ON total_like_comment.postId = Post.postId
      WHERE Post.postId = ${id}`).then((result) => {
        const postResult = result.recordset[0];
        resolve(postResult)
      }).catch(() => reject(false));
    })
  }
  function getLikeById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params; 
      request.query(`SELECT [Like].userId, [name] FROM dbo.[Like] INNER JOIN dbo.[User] ON
       [User].userId = [Like].userId WHERE postId = ${id}`).then((result) => {
        const likeResult = result.recordset;
        if (likeResult) resolve(likeResult)
        else resolve([])
      }).catch((err) => {
        debug(err)
        reject(false)
      });
    })
  }
  function getCommentById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params; 
      request.query(`SELECT postId, Comment.userId, [name] AS 'userName', avatar AS 'userAvatar',
      content, created_at FROM dbo.Comment INNER JOIN dbo.[User] ON [User].userId = Comment.userId
      WHERE postId = ${id} ORDER BY created_at DESC`).then((result) => {
        const commentResult = result.recordset;
        if (commentResult) resolve(commentResult)
        else resolve([])
      }).catch((err) => {
        debug(err)
        reject(false)
      });
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
          request.query(`SELECT po.postId, po.authorId, po.title, po.type, po.created_at, po.total_comments, po.total_likes, po.authorName, po.authorAvatar FROM (
            SELECT ROW_NUMBER() OVER (Order by created_at DESC) AS RN, Post.postId, authorId, [name] AS 'authorName',
            avatar AS 'authorAvatar', title, created_at, type, total_like_comment.total_comments, total_like_comment.total_likes
            FROM dbo.Post LEFT JOIN 
            ( SELECT comment.postId, comment.total_comments, [like].total_likes FROM ( SELECT Post.postId, COUNT([Like].userId) AS 'total_likes'
            FROM dbo.Post LEFT JOIN dbo.[Like] ON [Like].postId = Post.postId
            GROUP BY Post.postId) [like]
            INNER JOIN 
            ( SELECT Post.postId,COUNT(Comment.content) AS 'total_comments'
            FROM dbo.Post LEFT JOIN dbo.Comment ON Comment.postId = Post.postId
            GROUP BY Post.postId ) comment
            ON comment.postId = [like].postId) total_like_comment
            ON total_like_comment.postId = Post.postId
            INNER JOIN dbo.[User] ON [User].userId = Post.authorId
          )po WHERE RN > ${(page) * 10} AND RN <= ${(page + 1) * 10}`).then((result) => {
            const postResult =  result.recordset;
            resolve({total_pages, page, posts : postResult })
            }).catch((err) => {debug(err); reject(false)});
        })
      }).catch((err) => {debug(err); reject(false)});
    }
  return {
    getPostById,
    getPosts,
    getLikeById,
    getCommentById
  }
}

module.exports = postController;
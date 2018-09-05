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
      WHERE Post.postId = ${id} AND visible = 1`).then((result) => {
          const post = result.recordset[0];
          resolve({post})
        }).catch(() => reject(false));
    })
  }
  function getLikeById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params;
      request.query(`SELECT [Like].userId, [name] FROM dbo.[Like] INNER JOIN dbo.[User] ON
       [User].userId = [Like].userId WHERE postId = ${id}`).then((result) => {
          const likes = result.recordset;
          if (likes) resolve({likes})
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
      request.query(`SELECT commentId, postId, Comment.userId, [name] AS 'userName', avatar AS 'userAvatar',
      content, created_at FROM dbo.Comment INNER JOIN dbo.[User] ON [User].userId = Comment.userId
      WHERE postId = ${id} AND visible = 1 ORDER BY created_at DESC`).then((result) => {
          const comments = result.recordset;
          if (comments) resolve({comments})
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
      subRequest.query(`SELECT COUNT(*) as total FROM dbo.Post WHERE visible = 1`).
        then(resu => {
          const total_pages = Math.ceil(resu.recordset[0].total / 10);
          debug(total_pages)
          const request = new sql.Request();
          const likes = []
          const { page } = req.query;
          request.query(`SELECT po.postId, po.authorId,po.title, po.type, po.created_at, po.total_comments, po.total_likes, po.authorName, po.authorAvatar FROM (
            SELECT ROW_NUMBER() OVER (Order by Post.postId DESC) AS RN, Post.postId, authorId, [name] AS 'authorName',
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
            WHERE visible = 1
          )po WHERE RN > ${(page) * 10} AND RN <= ${(parseInt(page) + 1) * 10}`).then((result) => {
            debug(`RN > ${(page) * 10} AND RN <= ${(parseInt(page)+ 1) * 10}`)
              const postResult = result.recordset;
              resolve({ total_pages, page, posts: postResult })
            }).catch((err) => { debug(err); reject(false) });
        })
    }).catch((err) => { debug(err); reject(false) });
  }
  function getOthers(req, res) {
    return new Promise((resolve, reject) => {
      const subRequest = new sql.Request();
      const { type } = req.params;
      subRequest.query(`SELECT COUNT(*) as total FROM dbo.Post WHERE visible = 1 AND type='${type}'`).
        then(resu => {
          const total_pages = Math.ceil(resu.recordset[0].total / 10);
          debug(total_pages)
          const request = new sql.Request();
          const likes = []
          const { page } = req.query;
          request.query(`SELECT po.postId, po.authorId,po.title, po.type, po.created_at, po.total_comments, po.total_likes, po.authorName, po.authorAvatar FROM (
            SELECT ROW_NUMBER() OVER (Order by Post.postId DESC) AS RN, Post.postId, authorId, [name] AS 'authorName',
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
            WHERE visible = 1 AND type='${type}'
          )po WHERE RN > ${(page) * 10} AND RN <= ${(parseInt(page) + 1) * 10}`).then((result) => {
            debug(`RN > ${(page) * 10} AND RN <= ${(parseInt(page)+ 1) * 10}`)
              const postResult = result.recordset;
              resolve({ total_pages, page, posts: postResult })
            }).catch((err) => { debug(err); reject(false) });
        })
    }).catch((err) => { debug(err); reject(false) });
  }
  function getAllHashTag(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      request.query(`SELECT DISTINCT hashtag FROM dbo.Hashtag`).then((result) => {
        const hashTags = result.recordset;
        if (hashTags) resolve({hashTags})
        else resolve([])
      }).catch((err) => {
        debug(err)
        reject(false)
      });
    })
  }
  function getPostsByHashtag(req, res) {
    return new Promise((resolve, reject) => {
      const subRequest = new sql.Request();
      const { h } = req.query;
      subRequest.query(`SELECT COUNT(*) as total FROM dbo.Post INNER JOIN dbo.Hashtag ON Hashtag.postId = Post.postId WHERE hashtag = '${h}' AND visible = 1`).
        then(resu => {
          const total_pages = Math.ceil(resu.recordset[0].total / 10)
          const request = new sql.Request();
          const { page } = req.query;
          request.query(`SELECT po.postId, po.authorId, po.title, po.type, po.created_at, po.total_comments, po.total_likes, po.authorName, po.authorAvatar FROM (
            SELECT ROW_NUMBER() OVER (Order by Post.postId DESC) AS RN, Post.postId, authorId, [name] AS 'authorName',
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
            INNER JOIN dbo.Hashtag ON Hashtag.postId = Post.postId
	          WHERE hashtag = N'${h}' AND visible = 1
          )po WHERE RN > ${(page) * 10} AND RN <= ${(parseInt(page) + 1) * 10}`).then((result) => {
              const postResult = result.recordset;
              resolve({ total_pages, page, posts: postResult })
            }).catch((err) => { debug(err); reject(false) });
        })
    }).catch((err) => { debug(err); reject(false) });
  }
  function getHashTagById(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params;
      request.query(`SELECT hashtag FROM dbo.Hashtag WHERE postId = ${id}`).then((result) => {
        const hashtagResult = result.recordset;
        if (hashtagResult) resolve(hashtagResult)
        else resolve([])
      }).catch((err) => {
        debug(err)
        reject(false)
      });
    })
  }
  function addHashTag(postId, hashtag) {
    return new Promise((resolve, reject) => {
      const transaction = new sql.Transaction();
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`INSERT dbo.Hashtag(postId, hashtag) 
        VALUES(${postId}, N'${hashtag}')`)
          .then((result) => {
            transaction.commit();
            resolve(result);
          }).catch((err) => {
            reject(err);
          });
      });
    });
  }
  function addPost(req, res) {
    return new Promise((resolve, reject) => {
      const { authorId, title, content, type, hashtag } = req.body;
      const transaction = new sql.Transaction();
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`INSERT dbo.Post(authorId, title, content, created_at, type, visible ) 
        OUTPUT Inserted.postId 
        VALUES(${authorId}, N'${title}', N'${content}', GETDATE(), '${type}', 1)`)
          .then((result) => {
            transaction.commit();
            const { postId } = result.recordset[0];
            for (let i = 0; i < Object.keys(hashtag).length; i += 1) {
              addHashTag(postId, hashtag[i]);
            }
            res.send(result);
            resolve(result);
          }).catch((err) => {
            debug(err)
            res.send(err);
            reject(err);
          });
      });
    });
  }
  function addCommentToPost(req, res) {
    return new Promise((resolve, reject) => {
      const transaction = new sql.Transaction();
      debug(req.body);
      const { postId, userId, content } = req.body
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`INSERT INTO dbo.Comment(postId, userId, content, created_at, visible)
        VALUES(${postId}, ${userId}, N'${content}', GETDATE(), 1)`)
          .then((result) => {
            transaction.commit();
            resolve(result);
          }).catch((err) => {
            debug(err)
            reject(err);
          });
      });
    });
  }
  function  addLikeToPost(req, res) {
    return new Promise((resolve, reject) => {
      const transaction = new sql.Transaction();
      const { postId, userId } = req.body
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`INSERT INTO dbo.[Like](postId, userId)
        VALUES(${postId}, ${userId})`)
          .then((result) => {
            transaction.commit();
            resolve(result);
          }).catch((err) => {
            debug(err)
            reject(err);
          });
      });
    });
  }
  function deleteAPost(req, res) {
    return new Promise((resolve, reject) => {
      const transaction = new sql.Transaction();
      const { postId } = req.body
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`UPDATE dbo.Post SET visible = 0 WHERE postId = ${postId}`)
          .then((result) => {
            transaction.commit();
            resolve(result);
          }).catch((err) => {
            debug(err)
            reject(err);
          });
      });
    });
  }
  function deleteAComment(req, res) {
    return new Promise((resolve, reject) => {
      const transaction = new sql.Transaction();
      const { commentId } = req.body
      const request = new sql.Request(transaction);
      transaction.begin(() => {
        request.query(`UPDATE dbo.Comment SET visible = 0 WHERE commentId = ${commentId}`)
          .then((result) => {
            transaction.commit();
            resolve(result);
          }).catch((err) => {
            debug(err)
            reject(err);
          });
      });
    });
  }
  function getPostsOfUser(req, res) {
    return new Promise((resolve, reject) => {
      const subRequest = new sql.Request();
      const { id } = req.params;
      subRequest.query(`SELECT COUNT(*) as total FROM dbo.Post
        INNER JOIN dbo.[User] ON [User].userId = Post.authorId
        WHERE visible = 1 AND userId = ${id}`).
        then(resu => {
          const total_pages = Math.ceil(resu.recordset[0].total / 10);
          debug(total_pages)
          const request = new sql.Request();
          const likes = []
          const { page } = req.query;
          request.query(`SELECT po.postId, po.authorId,po.title, po.type, po.created_at, po.total_comments, po.total_likes, po.authorName, po.authorAvatar FROM (
            SELECT ROW_NUMBER() OVER (Order by Post.postId DESC) AS RN, Post.postId, authorId, [name] AS 'authorName',
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
            WHERE visible = 1 AND userId = ${id}
          )po WHERE RN > ${(page) * 10} AND RN <= ${(parseInt(page) + 1) * 10}`).then((result) => {
            debug(`RN > ${(page) * 10} AND RN <= ${(parseInt(page)+ 1) * 10}`)
              const postResult = result.recordset;
              resolve({ total_pages, page, posts: postResult })
            }).catch((err) => { debug(err); reject(false) });
        })
    }).catch((err) => { debug(err); reject(false) });
  }
  function getInfoOfUser(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params;
      request.query(`SELECT [User].userId, name, avatar, description, COUNT([Like].userId) AS 'total_like' FROM dbo.[User] INNER JOIN dbo.Post ON Post.authorId = [User].userId 
      INNER JOIN dbo.[Like] ON [Like].postId = Post.postId
      WHERE visible = 1 AND [User].userId = ${id}
      GROUP BY [User].userId, name, avatar, description`).then((result) => {
          const rs = result.recordset[0];
          resolve({rs})
        }).catch(() => reject(false));
    })
  }
  return {
    getPostById,
    getPosts,
    getLikeById,
    getCommentById,
    getPostsByHashtag,
    getAllHashTag,
    getHashTagById,
    addPost,
    addCommentToPost,
    addLikeToPost,
    deleteAPost,
    deleteAComment,
    getOthers,
    getPostsOfUser,
    getInfoOfUser
  }
}

module.exports = postController;
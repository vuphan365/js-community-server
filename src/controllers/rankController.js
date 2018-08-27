const debug = require('debug')('app:postController');

function rankController(sql) {
  function getRank (req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { id } = req.params;
      request.query(`SELECT TOP 10 [User].userId, [name], avatar, COUNT([Like].userId) AS total_votes,
      ROW_NUMBER() OVER (ORDER BY COUNT([Like].userId) DESC) AS 'top' 
      FROM dbo.[User] LEFT JOIN dbo.Post ON Post.authorId = [User].userId
      LEFT JOIN dbo.[Like] ON [Like].postId = Post.postId GROUP BY 
      [User].userId, [name], avatar ORDER BY total_votes DESC`).then((result) => {
          const rank = result.recordset;
          if (rank) resolve({ rank })
          else resolve([])
        }).catch((err) => {
          debug(err)
          reject(false)
        });
    })
  }
  function getRankOfUser(req, res) {
    return new Promise((resolve, reject) => {
      const request = new sql.Request();
      let { userId } = req.params;
      request.query(`SELECT * FROM
      ( SELECT [User].userId, [name], avatar, COUNT([Like].userId) AS total_votes,
      ROW_NUMBER() OVER (ORDER BY COUNT([Like].userId) DESC) AS 'top' 
      FROM dbo.[User] LEFT JOIN dbo.Post ON Post.authorId = [User].userId
      LEFT JOIN dbo.[Like] ON [Like].postId = Post.postId GROUP BY 
      [User].userId, [name], avatar ) ra
      WHERE ra.userId = ${userId}`).then((result) => {
          const rank = result.recordset[0];
          if (rank) resolve({ rank })
          else resolve([])
        }).catch((err) => {
          debug(err)
          reject(false)
        });
    })
  }
  return {
    getRank,
    getRankOfUser
  }
}

module.exports = rankController;
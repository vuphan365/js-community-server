const debug = require('debug')('app:postController');
const uuid = require('uuid');

function postController(ref) {
  function addPost(req, res) {
    return new Promise((resolve, reject) => {
      const { type, author, content , date, hashtags } = req.body;
      const id = uuid.v4();
      ref.push({ id, type, author, content, date, hashtags }).then(() => {
        debug('ok')
        var result = {
          msg: 'Tạo bài đăng thành công'
        }
        debug(result)
        resolve(result)
      }).catch(err => reject(err))
    })
  }
  function getPost(req, res) {
    let posts = [];
    try {
      ref.once('value').then(snap => {
        snap.forEach(post => {
          const {id, type, author, date, votes, comments, content , hashtags } = post.val();
          posts.push({id, type, author, date, votes, comments, content , hashtags });
        })
        res.send(posts)
      })
    } catch(err) {
      res.send(err)
    }
  }
  return {
    addPost,
    getPost
  }
}

module.exports = postController;
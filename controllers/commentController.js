const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then(comment => {
        res.redirect(`/restaurants/${req.body.restaurantId}`)
      })
      .catch(err => console.log(error))
  },
  deleteComment: (req, res) => {
    Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(() => { //實驗不加comment
            return res.redirect(`/restaurants/${comment.RestaurantId}`)
          })
      })
      .catch(err => console.log(error))
  }
}

module.exports = commentController
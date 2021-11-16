db = require('../models')
Category = db.Category

const categoryController = {
  // Read all
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/categories', { categories })
      })
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "Name didn't exist!")
      return res.redirect('back')
    }
    return Category.create({
      name: req.body.name
    })
      .then(category => {
        res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryController
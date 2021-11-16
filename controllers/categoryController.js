db = require('../models')
Category = db.Category

const categoryController = {
  // Read all or edit page
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              return res.render('admin/categories', {
                categories: categories,
                category: category.toJSON()
              })
            })
        } else {
          return res.render('admin/categories', { categories })
        }
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
  },
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "Name didn't exist!")
      return res.redirect('back')
    }
    return Category.findByPk(req.params.id)
      .then(category => {
        category.update({
          name: req.body.name
        })
          .then(category => {
            res.redirect('/admin/categories')
          })
      })
  }
}

module.exports = categoryController
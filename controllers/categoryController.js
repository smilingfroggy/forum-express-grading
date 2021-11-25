const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

const categoryController = {
  // Read all or edit page
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
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
  },
  deleteCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(category => {
            res.redirect('/admin/categories')
          })
      })
  }
}

module.exports = categoryController
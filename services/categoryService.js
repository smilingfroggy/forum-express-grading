const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              callback({
                categories: categories,
                category: category.toJSON()
              })
              // return res.render('admin/categories', { categories: categories, category: category })
            })
        } else {
          callback({ categories })
        }
      })
      .catch(err => console.log(error))
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "Name didn't exist!" })
    }
    return Category.create({
      name: req.body.name
    })
      .then(category => {
        return callback({ status: 'success', message: "Category created successfully!" })
      })
      .catch(err => console.log(error))
  },
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "Name didn't exist!" })
    }
    return Category.findByPk(req.params.id)
      .then(category => {
        category.update({
          name: req.body.name
        })
          .then(category => {
            return callback({ status: 'success', message: "Category updated successfully!" })
          })
      })
      .catch(err => console.log(error))
  },
  deleteCategory: (req, res, callback) => {
    Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(category => {
            callback({ status: 'success', message: 'Category was deleted' })
          })
      })
      .catch(err => console.log(error))
  }
}

module.exports = categoryService
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
  }
}

module.exports = categoryService
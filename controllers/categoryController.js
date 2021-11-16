db = require('../models')
Category = db.Category

const categoryController = {
  // Read all
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/categories', { categories })
      })
  }
}

module.exports = categoryController
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ""
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    if (req.query.page) {
      offset = (Number(req.query.page) - 1) * pageLimit
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      limit: pageLimit,
      offset: offset
    })
      .then(result => {
        const page = Number(req.query.page) || 1  //目前要顯示哪一頁
        const pages = Math.ceil(result.count / pageLimit)  //總共需要幾頁
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)  //[1,2,3..,pages]
        const next = page + 1 > pages ? page : page + 1 //下一頁是第幾頁
        const prev = page - 1 < 1 ? page : page - 1

        const data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          categoryName: r.Category.name
          // categoryName: r.dataValues.Category.name
        }))
        Category.findAll({ raw: true, nest: true })
          .then(categories => {
            return res.render('restaurants', {
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page, totalPage, next, prev
            })
          })
      })
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: [User] }]
    })
      .then(restaurant => {
        // console.log('restaurant.Category.name: ', restaurant.Category.name)   //OK e.g."日本料理"
        // console.log('restaurant.Comments[0].dataValues: ', restaurant.Comments[0].dataValues)
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  }
}

module.exports = restController
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const helpers = require('../_helpers')
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
          categoryName: r.Category.name,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),  //收藏餐廳id總清單 是否包含r.id
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        restaurant.increment('viewCounts')
        // console.log('restaurant.Category.name: ', restaurant.Category.name)   //OK e.g."日本料理"
        // console.log('restaurant.Comments[0].dataValues: ', restaurant.Comments[0].dataValues)
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
        //收藏此餐廳的users' id 是否包含此已登入使用者的id
        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id)
        return res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited, isLiked
        })
      })
  },
  getDashBoard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        Comment.findAndCountAll({
          where: { RestaurantId: req.params.id },
        }).then(results => {
          const commentsCounts = results.count
          return res.render('dashboard', {
            restaurant: restaurant.toJSON(),
            commentsCounts: commentsCounts
          })
        })
      })
  },
  getTopRestaurant: (req, res) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }],
    }).then(restaurants => {
      // 找出top 10 餐廳
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        favoritedCount: restaurant.FavoritedUsers.length, //各餐廳被加入最愛數量
        // isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)  //是否被登入者加到最愛
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      // let topRestaurants = restaurants.sort((a,b) => b.favoritedCount - a.favoritedCount)
      // topRestaurants = topRestaurants.slice(0, 10)
      restaurants = restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount).slice(0, 10)
      return res.render('topRestaurant', { restaurants })
    })
  }
}

module.exports = restController
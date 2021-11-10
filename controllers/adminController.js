const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ raw: true })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants: restaurants })
      })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  }
}

module.exports = adminController
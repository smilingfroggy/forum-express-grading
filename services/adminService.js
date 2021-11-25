const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        callback({ restaurants })
        // return res.render('admin/restaurants', { restaurants: restaurants })
      })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      })
  },
  postRestaurant: (req, res, callback) => {
    if (!req.body.name) { // name欄位必填驗證
      return callback({ status: 'error', message: "Name didn't exist"})
    }
    const { file } = req  //解構賦值 file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          CategoryId: req.body.categoryId,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hour,
          description: req.body.description,
          image: file ? img.data.link : null
        })
          .then(restaurant => {
            callback({ status: 'success', message:'restaurant was successfully created'})
          })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        CategoryId: req.body.categoryId,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hour,
        description: req.body.description,
        image: null
      })
        .then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
    }
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  },
}

module.exports = adminService
const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ raw: true })
      .then(restaurants => {
        console.log('Show all restaurants', restaurants)
        return res.render('admin/restaurants', { restaurants: restaurants })
      })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    if (!req.body.name) { // name欄位必填驗證
      req.flash('error_messages', "Name didn't exist")
      return res.redirect('back')
    }
    const { file } = req  //解構賦值 file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hour,
          description: req.body.description,
          image: file ? img.data.link : null
        })
          .then(restaurant => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hour,
        description: req.body.description,
        image: null
      })
        .then((restaurant) => {
          req.flash('success_messages', 'Restaurant was successfully created!')
          res.redirect('/admin/restaurants')
        })
    }
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant })
      })
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        return res.render('admin/create', { restaurant })
      })
  },
  putRestaurant: (req, res) => {
    if (!req.body.name) { // name欄位必填驗證
      req.flash('error_messages', "Name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              opening_hours: req.body.opening_hours,
              address: req.body.address,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image
            }).then(restaurant => {
              req.flash('success_messages', 'restaurant was successfully updated')
              res.redirect('/admin/restaurants')
            })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            opening_hours: req.body.opening_hours,
            address: req.body.address,
            description: req.body.description,
            image: req.body.image
          })
            .then(restaurant => {
              req.flash('success_messages', 'Restaurant was successfully update!')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
      })
  }
}

module.exports = adminController
const fs = require('fs')
const adminService = require('../services/adminService')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
    return res.render('admin/restaurants', data)
    })
  },
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories: categories })
      })
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
          CategoryId: req.body.categoryId,
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
        CategoryId: req.body.categoryId,
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
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
  },
  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            return res.render('admin/create', {
              restaurant: restaurant.toJSON(),
              categories: categories
            })
          })
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
              CategoryId: req.body.categoryId,
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
            CategoryId: req.body.categoryId,
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
  },
  // R01: 顯示使用者清單
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        res.render("admin/users", { users })
      })
  },
  // R01: 修改使用者權限
  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id)   //不用, { raw: true }，否則Error: user.update is not a function 
      .then(user => {
        // root 最高管理員禁止變更權限
        if (user.email == 'root@example.com') {
          req.flash('error_messages', '禁止變更管理者權限')
          return res.redirect('back')
        }
        // 一般使用者isAdmin 0->1 或 1->0
        const isAdmin = user.toJSON().isAdmin
        user.update({
          isAdmin: !isAdmin
        })
          .then(() => {
            req.flash('success_messages', '使用者權限變更成功')
            return res.redirect('/admin/users')
          })
      })
      .catch(err => console.log(err))
  }
}

module.exports = adminController
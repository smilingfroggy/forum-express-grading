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
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error' ) { // name欄位必填驗證
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
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
      .catch(err => console.log(error))
  },
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  // R01: 顯示使用者清單
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        res.render("admin/users", { users })
      })
      .catch(err => console.log(error))
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
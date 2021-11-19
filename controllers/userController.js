const bcrypt = require('bcryptjs')
const db = require("../models")
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    console.log('Got req.body: ', name, email, password, passwordCheck)
    // confirm password
    if (password !== passwordCheck) {
      req.flash('error_messages', '兩次輸入密碼不同！')
      console.log('兩次輸入密碼不同！')
      return res.render('signup', { error_messages: req.flash('error_messages'), name, email, password, passwordCheck })
    } else {
      User.findOne({ where: { email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '此帳號已註冊過')
            console.log('此帳號已註冊過')
            // return res.redirect('/signup')
            return res.render('signup', { error_messages: req.flash('error_messages'), name, email, password, passwordCheck })
          } else {
            User.create({
              name, email,
              password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
            })
              .then(user => {
                req.flash('success_message', '成功註冊帳號！')
                return res.redirect('/signin')
              })
          }
        })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
    //failureRedirect @ routers/index.js, passport.authenticate有完成認證才會進到userController.signIn
  },
  logOut: (req, res) => {
    req.flash('success_messages', '成功登出！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    const myId = helpers.getUser(req).id
    return User.findByPk(req.params.id, {
      include: { model: Comment, include: [Restaurant] }
    })
      .then(user => {
        // console.log('userController.getUser..after then', user)
        // console.log('user.Comment', user.Comments)
        return res.render('profile', { user: user.toJSON(), myId })
      })
  },
  editUser: (req, res) => {
    const myId = helpers.getUser(req).id
    if (Number(req.params.id) !== myId) {   // 只能編輯自己的profile
      req.flash('error_messages', "No permission")
      return res.redirect(`/users/${req.params.id}`)
    }
    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('edit', { user: user.toJSON() })
      })
  },
  putUser: (req, res) => {
    if (!req.body.name || !req.body.email) {  //必填欄位驗證
      req.flash('error_messages', "Name and email are required")
      return res.redirect('back')
    }
    const { file } = req
    // console.log(req.file)
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            })
              .then(user => {
                console.log(user.toJSON())
                req.flash('success_messages', '使用者資料編輯成功')
                console.log('success edited user id:', user.id)
                // return res.redirect(`/users/${user.id}`)
                return res.redirect(`/users/${req.params.id}`)
              })
          })
          .catch(err => console.log(err))
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: req.body.image
          })
            .then(user => {
              req.flash('success_messages', '使用者資料編輯成功')
              // return res.redirect(`/users/${user.id}`)
              return res.redirect(`/users/${req.params.id}`)
            })
        })
        .catch(err => console.log(err))
    }
  }, getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants, comments })
      })    
  }
}

module.exports = userController
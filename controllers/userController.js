const bcrypt = require('bcryptjs')
const db = require("../models")
const User = db.User

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
  }
}

module.exports = userController
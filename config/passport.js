const passport = require('passport')
const LocalStrategy = require('passport-local')
// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true   //傳送flash message
}, (req, username, password, cb) => {
  User.findOne({ where: { email: username } })
    .then(user => {
      if (!user) {
        return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
      }
      return cb(null, user)
    })
}))

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT_SECRET

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  User.findByPk( jwt_payload.id, {
    include: [
      { model: db.Restaurant, as: 'FavoritedRestaurants'},
      { model: db.Restaurant, as: 'LikedRestaurants'},
      { model: User, as: 'Followers'},
      { model: User, as: 'Followings' }
    ]
  }).then(user => {
    if (!user) return next(null, false)
    return next(null, user)
  })
})

passport.use(strategy)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followings' },
      { model: User, as: 'Followers' }
    ]
  })
    .then(user => {
      user = user.toJSON()
      return cb(null, user)
    })
})

module.exports = passport
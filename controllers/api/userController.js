const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

//JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JWTStrategy = passportJWT.Strategy

let userController = {
  signIn: (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: "Required fields didn't exist" })
    }
    let username = req.body.email
    let password = req.body.password
    User.findOne({ where: { email: username } })
      .then(user => {
        if (!user) return res.status(401).json({ status: 'error', message: "No such user found" })
        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({ status: 'error', message: 'Passwords did not match' })
        }
        let payload = { id: user.id }
        let token = jwt.sign(payload, process.env.JWT_SECRET)
        return res.json({
          status: 'success',
          message: 'OK',
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        })
      })
  }
}

module.exports = userController
const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const helpers = require('./_helpers')

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}
const session = require('express-session')
const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000

// template engine
app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')

app.use(express.urlencoded({ extented: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

// setup session, passport, and flash message
app.use(session({
  secret: 'MySecret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  // res.locals.user = req.user
  res.locals.user = helpers.getUser(req)
  next()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app  //app測試環境用

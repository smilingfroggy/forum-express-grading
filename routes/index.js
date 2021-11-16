const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      // if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }

  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) {
        // if (req.isAuthenticated()) {
        // if (req.user.isAdmin) { 
        return next()
      }
      return res.redirect('/')  //回到一般使用者首頁
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => { res.redirect('/restaurants') })

  app.get('/restaurants', authenticated, restController.getRestaurants)

  // 管理員後台餐廳 CRUD
  app.get('/admin', authenticatedAdmin, (req, res) => { res.redirect('/admin/restaurants') })
  // read all
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

  // create
  app.get('/admin/restaurants/create', authenticatedAdmin,
    adminController.createRestaurant)

  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'),
    adminController.postRestaurant)

  // read one
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

  // edit one
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

  // delete
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // 分類管理
  // read all
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  // create new category
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  // 使用者管理
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)

  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

  // 註冊、登入、登出
  app.get('/signup', userController.signUpPage)

  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)

  app.post('/signin', passport.authenticate('local',
    { failureRedirect: '/signin', failureFlash: true }),
    userController.signIn)

  app.get('/logout', userController.logOut)
}

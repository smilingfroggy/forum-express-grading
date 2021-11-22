const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')


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

router.get('/', authenticated, (req, res) => { res.redirect('/restaurants') })

router.get('/restaurants', authenticated, restController.getRestaurants)

router.get('/restaurants/feeds', authenticated, userController.getFeeds)

router.get('/restaurants/top', authenticated, restController.getTopRestaurant)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)

router.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)

router.post('/comments', authenticated, commentController.postComment)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)

router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

router.post('/like/:restaurantId', authenticated, userController.addLike)

router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.get('/users/top', authenticated, userController.getTopUser)

router.post('/following/:userId', authenticated, userController.addFollowing)

router.delete('/following/:userId', authenticated, userController.removeFollowing)

// R02 User Profile 
router.get('/users/:id', authenticated, userController.getUser)

router.get('/users/:id/edit', authenticated, userController.editUser)

router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

// 管理員後台餐廳 CRUD
router.get('/admin', authenticatedAdmin, (req, res) => { res.redirect('/admin/restaurants') })
// read all
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

// create
router.get('/admin/restaurants/create', authenticatedAdmin,
  adminController.createRestaurant)

router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'),
  adminController.postRestaurant)

// read one
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

// edit one
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

// delete
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

// 分類管理
// read all
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
// create new category
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
// update
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
// delete
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

// 使用者管理
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)

router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

// 註冊、登入、登出
router.get('/signup', userController.signUpPage)

router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)

router.post('/signin', passport.authenticate('local',
  { failureRedirect: '/signin', failureFlash: true }),
  userController.signIn)

router.get('/logout', userController.logOut)

module.exports = router
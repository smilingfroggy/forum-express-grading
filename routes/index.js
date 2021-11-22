// const express = require('express')
// const router = express.Router()

const routes = require('./routes')
const apis = require('./apis')


module.exports = (app) => {
  app.use('/', routes)
  app.use('/api', apis)
}
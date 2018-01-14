var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('../models/goods')

// 连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall')
mongoose.connection.on('connected', function () {
  console.log('MongoDB connected success.')
})

mongoose.connection.on('error', function () {
  console.log('MongoDB connected fail.')
})
mongoose.connection.on('disconnected', function () {
  console.log('MongoDB connected disconnected.')
})
// 查询商品数据
router.get('/list', function (req, res, next) {
  // res.send('good')
  let page = parseInt(req.param('page'))
  let pageSize = parseInt(req.param('pageSize'))
  let priceLevel = parseInt(req.param('priceLevel'))
  let sort = req.param('sort')
  let skip = (page - 1) * pageSize
  let priceGt = ''
  let priceLte = ''
  let params = {}
  if (priceLevel !== 0) {
    switch (priceLevel) {
      case 1:
        priceGt = 0; priceLte = 100
        break
      case 2:
        priceGt = 100; priceLte = 500
        break
      case 3:
        priceGt = 500; priceLte = 1000
        break
      case 4:
        priceGt = 1000; priceLte = 5000
        break
      default:
        break
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
  goodsModel.sort({'salePrice': sort})
  // let params = {}
  // let goodsModel = Goods.find(params)
  goodsModel.exec(function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
})
// 加入购物车
router.post('/addCart', function (req, res, next) {
  let userId = '100000077'
  let productId = req.body.productId
  let User = require('../models/user')
  User.findOne({
    userId: userId
  }, function (err1, userDoc) {
    if (err1) {
      res.json({
        status: '1',
        msg: err1.message
      })
    } else {
      if (userDoc) {
        let goodsItem = ''
        userDoc.cartList.forEach(function (item) {
          if (item.productId === productId) {
            goodsItem = item
            item.productNum++
          }
        })
        if (goodsItem) {
          userDoc.save(function (err, doc) {
            if (err) {
              res.json({
                status: '1',
                msg: err.message
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              })
            }
          })
        } else {
          Goods.findOne({ productId: productId }, function (err, doc) {
            if (err) {
              res.json({
                status: '1',
                msg: err.message
              })
            } else {
              if (doc) {
                doc.productNum = 1
                doc.checked = 1
                userDoc.cartList.push(doc)
                userDoc.save(function (err2, doc2) {
                  if (err) {
                    res.json({
                      status: '1',
                      msg: err.message
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: 'suc'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
})
module.exports = router

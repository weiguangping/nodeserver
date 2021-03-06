var express = require('express')
var router = express.Router()
var User = require('./../models/user')
require('./../util/util')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users', {
    title: 'Express'
  })
})
router.get('/test', function (req, res, next) {
  res.send('test')
})
router.post('/login', function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  console.log(param)
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        // req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      } else {
        res.json({
          status: '0',
          msg: 'error'
        })
      }
    }
  })
})
// 登出
router.post('/logout', function (req, res, next) {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})
router.get('/checkLogin', function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
})
router.get('/getCartCount', function (req, res, next) {
  if (req.cookies && req.cookies.userId) {
    console.log('userId:' + req.cookies.userId)
    var userId = req.cookies.userId
    User.findOne({
      'userId': userId
    }, function (err, doc) {
      if (err) {
        res.json({
          status: '0',
          msg: err.message
        })
      } else {
        let cartList = doc.cartList
        let cartCount = 0
        cartList.map(function (item) {
          cartCount += parseFloat(item.productNum)
        })
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        })
      }
    })
  } else {
    res.json({
      status: '0',
      msg: '当前用户不存在'
    })
  }
})
// 查询当前用户的购物车数据
router.get('/cartList', function (req, res, next) {
  let userId = req.cookies.userId
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})
// 购物车删除
router.post('/cartDel', function (req, res, next) {
  let userId = req.cookies.userId
  let productId = req.body.productId
  User.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
router.post('/cartEdit', function (req, res, next) {
  let userId = req.cookies.userId
  let productId = req.body.productId
  let productNum = req.body.productNum
  let checked = req.body.checked
  User.update({
    'userId': userId,
    'cartList.productId': productId
  }, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
router.post('/editCheckAll', function (req, res, next) {
  let userId = req.cookies.userId
  let checkAll = req.body.checkAll ? '1' : '0'
  User.findOne({
    userId: userId
  }, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (user) {
        user.cartList.forEach(item => {
          item.checked = checkAll
        })
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
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
})
// 查询用户地址接口
router.get('/addressList', function (req, res, next) {
  let userId = req.cookies.userId
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })
})
// 设置默认地址
router.post('/setDeafault', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  if (!addressId) {
    res.json({
      status: '1',
      msg: 'addressId is null',
      result: ''
    })
  }
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let addressList = doc.addressList
      addressList.forEach(item => {
        if (item.addressId === addressId) {
          item.isDefault = true
        } else {
          item.isDefault = false
        }
      })
      doc.save(function (err1, doc1) {
        if (err) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
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
  })
})
// 删除地址
router.post('/delAddress', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  User.update({
    userId: userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
router.post('/payMent', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  let orderTotal = req.body.orderTotal
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let address = ''
      let goodsList = []
      // 获取当前用户的地址信息
      doc.addressList.forEach((item) => {
        if (addressId === item.addressId) {
          address = item
        }
      })
      // 获取用户购物车的购买商品
      doc.cartList.map((item) => {
        if (item.checked === '1') {
          goodsList.push(item)
        }
      })

      var platform = '622'
      var r1 = Math.floor(Math.random() * 10)
      var r2 = Math.floor(Math.random() * 10)

      var sysDate = new Date().Format('yyyyMMddhhmmss')
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      var orderId = platform + r1 + sysDate + r2
      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }

      doc.orderList.push(order)
      console.log(doc.orderList)
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})
router.get('/orderDetail', function (req, res, next) {
  let userId = req.cookies.userId
  let orderId = req.param('orderId')
  User.findOne({
    userId: userId
  }, function (err, userInfo) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let orderList = userInfo.orderList
      let orderTotal = 0
      if (orderList.length > 0) {
        orderList.map(item => {
          if (item.orderId === orderId) {
            orderTotal = item.orderTotal
          }
        })
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '120002',
            msg: '无此订单',
            result: ''
          })
        }
      } else {
        res.json({
          status: '120001',
          msg: '当前用户未创建订单',
          result: ''
        })
      }
    }
  })
})
module.exports = router

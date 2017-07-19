var http = require('../../utils/httpHelper.js')
Page({
  data: {
    hidden: true,//loading
  },
  onLoad(options) {
    var id = options.id
    this.getOrderDetail(id)
    this.setData({
      orderId: id,
      index: options.index
      })
  },
  onShow() { },
  getOrderDetail(id) {//获取订单详情
    this.setData({ hidden:false})
    http.Get("app/order/detail/retrieve", { orderId: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        this.setData({ order: res.data })
        this.setData({ hidden: true })
      }
    })
  },
  delOrder() {//删除订单
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];  //上一个页面
    var orderID = this.data.orderId
    wx.showModal({
      title: '确定删除订单吗',
      success: (res)=> {
        if (res.confirm) {
          http.Post("app/order/delete", { orderId: orderID, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              if (prevPage.route == 'pages/orders/index') {//来自订单列表
                var arr = prevPage.data.orderList
                arr.splice(this.data.index, 1)
                if (arr.length == 0) {
                  prevPage.setData({
                    'nodata.show': true
                  })
                }
                prevPage.setData({
                  orderList: arr
                })
              }
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      }
    })
  },
  cancelOrder() {//取消订单
    var orderID = this.data.orderId
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];  //上一个页面
    wx.showModal({
      title: '取消此订单吗',
      success: (res)=> {
        if (res.confirm) {
          http.Post("app/order/cancel", { orderId: orderID, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              if (prevPage.route == 'pages/orders/index') {//来自订单列表
                var arr = prevPage.data.orderList
                arr[this.data.index].new_state = '已取消'
                prevPage.setData({
                  orderList: arr
                })
              }
              this.setData({ 'order.new_state':'已取消'})
            }
          })
        }
      }
    })
  },
  doneOrder(){//确认订单
    var orderID = this.data.orderId
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];  //上一个页面
    wx.showModal({
      title: '取消此订单吗',
      success: (res) => {
        if (res.confirm) {
          http.Post("app/order/done", { orderId: orderID, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              if (prevPage.route == 'pages/orders/index') {//来自订单列表
                var arr = prevPage.data.orderList
                arr[this.data.index].new_state = '已完成'
                prevPage.setData({
                  orderList: arr
                })
              }
              this.setData({ 'order.new_state': '已完成' })
            }
          })
        }
      }
    })
  },
  inquiryLogistics () {//查询物流
    var order_id = this.data.order_id
    wx.redirectTo({
      url: "../logisticsinformation/index?id=" + order_id,
    })
  },
  pay (){//支付订单
    var orderID = this.data.orderId
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];  //上一个页面
    http.Post("app/pay/gateway/create", { orderId: orderID, tradeType: 0, payType: 7, openid: wx.getStorageSync('openid'), accessToken: wx.getStorageSync('accessToken') }, (res) => {
      wx.requestPayment({
        'timeStamp': res.data.timeStamp,
        'nonceStr': res.data.nonceStr,
        'package': res.data.package,
        'signType': 'MD5',
        'paySign': res.data.paySign,
        'success': (res)=> {//支付成功
          if (prevPage.route == 'pages/orders/index') {//来自订单列表
            var arr = prevPage.data.orderList
            arr[this.data.index].new_state = '待收货'
            prevPage.setData({
              orderList: arr
            })
          }
          this.setData({ 'order.new_state': '待收货' })
        },
        'fail': (res)=> {//取消支付
          wx.showModal({
            title: '提示',
            content: '您已取消支付,订单将在15分钟后取消!',
            showCancel: false
          })
        }
      })
    })
  }
})
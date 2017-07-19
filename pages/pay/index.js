var http = require('../../utils/httpHelper.js')
Page({
  data: {
    param: {
      deliverType: 1
    }
  },
  onLoad(options) {
    this.getOrder()
    this.getSelectAddress(this.data.addressId)
    console.log(this.data.good)
    this.getCoupon(this.data.good.id, this.data.ticket.total, this.data.good.is_coupon, this.data.couponId, this.data.type)
    console.log(this.data.param.deliverType)
    this.calculate(this.data.param.deliverType, this.data.couponId, this.data.addressId)//初始化

  },
  onShow() { },
  getOrder() {//获取本地存储
    var good = wx.getStorageSync('good')
    var ticket = wx.getStorageSync('ticket')
    var addressId = wx.getStorageSync('addressId')
    var couponId = wx.getStorageSync('couponId')
    var type = wx.getStorageSync('type')
    this.setData({ good: good })
    this.setData({ ticket: ticket })
    this.setData({ addressId: addressId })
    this.setData({ couponId: couponId })
    this.setData({ type: type })

    if (wx.getStorageSync('deliverType') == 2) {
      var deliverType = wx.getStorageSync('deliverType')//同步存储
      var name = wx.getStorageSync('name')//同步姓名
      var tel = wx.getStorageSync('tel')//同步姓名
      this.setData({ 'param.deliverType': deliverType })
      this.setData({ 'param.name': name })
      this.setData({ 'param.tel': tel })
    }

  },
  cdDeliverType(e) {//切换取票方式
    var deliverType = e.currentTarget.dataset.type
    this.setData({ 'param.deliverType': deliverType })
    this.calculate(deliverType, this.data.ticket.couponId, this.data.ticket.addressId)//监听
  },
  getSelectAddress(id) {//获取地址
    console.log(132)
    if (id) {//获取选择后地址
      http.Get("app/address/getbyid", { accessToken: wx.getStorageSync('accessToken'), id: id }, (res) => {
        if (res.retCode == 0) {
          var address = res.data
          this.setData({ address: address })
          this.setData({ 'ticket.addressId': id })
          this.calculate(this.data.param.deliverType, this.data.ticket.couponId, id)//监听
        }
      })
    } else {//获取默认地址
      http.Get("app/address/getDefault", { accessToken: wx.getStorageSync('accessToken') }, (res) => {
        if (res.retCode == 0) {
          var address = res.data
          this.setData({ address: address })
          this.setData({ 'ticket.addressId': address.id })
          this.calculate(this.data.param.deliverType, this.data.ticket.couponId, address.id)//监听
        }
      })
    }

  },
  payAddress() {//选择地址
    var goodId = this.data.good.id
    wx.redirectTo({
      url: "../address/list/index?from=" + goodId
    })
  },
  getCoupon(order_id, total, is_coupon, couponId, type) {//检测可用优惠券
    console.log(798)
    if (is_coupon == 1) {//项目可有使用优惠券
      if (couponId) {
        this.setData({ csl: type })
        this.setData({ 'ticket.couponId': couponId })
        console.log(this.data.param.deliverType)
        this.calculate(this.data.param.deliverType, couponId, this.data.ticket.addressId)//监听
      } else {
        http.Get("app/detail/coupon/retrieve", { id: order_id, total: total, accessToken: wx.getStorageSync('accessToken') }, (res) => {
          if (res.retCode == 0) {
            var len = res.data.length + '张优惠券可用'
            this.setData({ csl: len })
          }
        })
      }
    } else {
      this.setData({ csl: '此演出不可使用优惠券' })
    }
  },
  payCoupn() {//选择优惠券
    var isCoupon = this.data.good.is_coupon
    var orderId = this.data.good.orderId
    var total = this.data.ticket.total
    if (isCoupon == 1) {//是否可以使用优惠券
      if (this.data.param.deliverType == 2) {//记住选择现场取票状态
        wx.setStorageSync('deliverType', 2)//同步存储
        wx.setStorageSync('name', this.data.param.name)//同步姓名
        wx.setStorageSync('tel', this.data.param.tel)//同步姓名
      }
      wx.redirectTo({
        url: "../coupons/index?from=" + orderId + "&isCoupon=" + isCoupon + "&total=" + total
      })
    }
  },
  calculate(deliverType, couponId, addressId) {//计算价格 取票方式/地址/优惠券/数量/单价
    console.log(deliverType)
    var ticket = this.data.ticket
    var _params = { deliverType: deliverType, accessToken: wx.getStorageSync('accessToken') }
    _params.num = ticket.num2
    _params.price = ticket.price
    if (deliverType == 1) {
      _params.addressId = addressId;
    }
    if (couponId) {
      _params.couponId = couponId;
    }
    http.Get("app/order/index/calculate", _params, (res) => {
      if (res.retCode == 0) {
        this.setData({ _price: res.data })
      }
    })
  },
  changeName(e) {//同步更新姓名
    var val = e.detail.value
    this.setData({ 'param.name': val })
  },
  changeTel(e) {//同步更新手机号
    var val = e.detail.value
    this.setData({ 'param.tel': val })
  },
  pay() {//支付
    var myreg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
    var ticket = this.data.ticket
    var Personparam = this.data.param
    var _param = { ticketId: ticket.id, ticketNum: ticket.num2, accessToken: wx.getStorageSync('accessToken') }
    if (Personparam.deliverType == 1) {//快递配送
      if (!ticket.addressId) {
        wx.showModal({
          title: '提示',
          content: '请添加收货地址',
          showCancel: false
        })
        return
      }
      _param.deliverType = 1
      _param.addressId = ticket.addressId
    }
    if (Personparam.deliverType == 2) {//现场取票
      if (!Personparam.name || !Personparam.tel) {
        wx.showModal({
          title: '提示',
          content: '请填写取票信息',
          showCancel: false
        })
        return
      }
      if (!myreg.test(Personparam.tel)) {
        wx.showModal({
          title: '提示',
          content: '请输入有效的手机号码',
          showCancel: false
        })
        return
      }
      _param.liveName = Personparam.name
      _param.liveMobile = Personparam.tel
      _param.deliverType = 2
    }
    if (this.data.couponId) {//是否使用优惠券
      _param.couponId = this.data.couponId
    }
    http.Post("app/order/index/create", _param, (res) => {
      if (res.retCode == 0) {//生成订单
        var orderId = res.data.orderId
        http.Post("app/pay/gateway/create", { orderId: orderId, tradeType: 0, payType: 7, openid: wx.getStorageSync('openid'), accessToken: wx.getStorageSync('accessToken')},(res)=>{
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': (res) =>{//支付成功
              wx.redirectTo({
                url: '../orderdetail/index?id=' + orderId
              })
            },
            'fail':(res) =>{//取消支付
              wx.showModal({
                title: '提示',
                content: '您已取消支付,订单将在15分钟后取消!',
                showCancel: false,
                complete:(res)=>{
                  wx.redirectTo({
                    url: '../orders/index'
                  })
                }
              })
            }
          })
        })
      }
      if (res.retCode == 20406){
        wx.showModal({
          title: '提示',
          content: '已有此类订单，如需取消请至【我的订单】',
          showCancel: false
        })
      }
    })
  }
})
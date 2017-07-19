var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
// var flag = false
// var more = true
var kind = ''
// var goods = []
Page({
  data: {
    navbar: [
      { name: '全部', kind: '' }, { name: '待支付', kind: '-1' },
      { name: '待发货', kind: '0' }, { name: '待收货', kind: '1' },
      { name: '已完成', kind: '2' }
    ],
    page_num:0,
    orderList: [],//列表  
    currentTab: '',
    hidden: true,//loading
    scrollHeight: 0,
    nodata: {//暂无数据
      show: false,
      icon: '../../images/404_order@2x.png',
      text: '咦，目前还没有订单'
    },
    flag:false,
    more:true,
    goods:[],
  },
  onLoad() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    })
    this.getOrderList('')
  },
  onShow() {
    // this.getOrderList('')
  },
  navbarTap: function (event) {//点击分类查询
    kind = event.currentTarget.id
    this.data.flag = false
    this.data.more = true
    this.data.goods = []
    this.data.page_num = 0
    this.getOrderList(kind)
    this.setData({ currentTab: kind })
  },
  getOrderList(kind) {//获取订单列表
    this.data.flag = false
    this.data.page_num++
    this.setData({ hidden: false })
    http.Get("app/order/list/retrieve", {
      status: kind, accessToken: wx.getStorageSync('accessToken'), pageNum: this.data.page_num, pageSize: 10 }, (res) => {
      console.log(res)
      if (res.retCode == 0) {
        var items = res.data
        for (var i = 0; i < items.length; i++) {
          this.data.goods.push(items[i])
        }
        var total_row = res.total_row
        var page_num = res.page_num
        var page_size = res.page_size
        if (total_row - page_num * page_size < 0) {
          this.data.more = false
        }
        if (total_row == 0) {
          this.setData({ 'nodata.show': true })
        } else {
          this.setData({ 'nodata.show': false })
        }
        this.setData({ orderList: this.data.goods})
        this.setData({ hidden: true })
        this.data.flag = true;
      }
    })
  },
  bindDownLoad() {//触底回调函数
    if (this.data.more) {
      if (this.data.flag) {
        this.getOrderList(kind)
      }
    }
  },
  delOrder (event) {//删除订单
    var id = event.target.id
    var index = event.target.dataset.index
    wx.showModal({
      title: '确定删除订单吗',
      success: (res) => {
        if (res.confirm) {
          http.Post("app/order/delete", { orderId: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              var arr = this.data.orderList
              arr.splice(index, 1)
              if (arr.length==0){
                this.setData({'nodata.show':true})
              }
              this.setData({
                'orderList': arr
              })
            }
          })
        }
      }
    })
  },
  cencelOrder (event) {//取消订单
    var id = event.target.id
    var index = event.target.dataset.index
    wx.showModal({
      title: '取消此订单吗',
      success: (res) => {
        if (res.confirm) {
          http.Post("app/order/cancel", { orderId: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              var arr = this.data.orderList
              arr[index].new_state = '已取消'
              this.setData({
                'orderList': arr
              })
            }
          })
        }
      }
    })
  },
  donelOrder (event){//确认订单
    var id = event.target.id
    var index = event.target.dataset.index
    wx.showModal({
      title: '确认此订单吗',
      success:(res)=>{
        if(res.confirm){
          http.Post("app/order/done", { orderId: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
            if (res.retCode == 0) {
              var arr = this.data.orderList
              arr[index].new_state = '已完成'
              this.setData({
                'orderList': arr
              })
            }
          })
        }
      }
    })
  },
  checkExpress (event){//查看物流
    var id = event.target.id
    wx.redirectTo({
      url: "../logisticsinformation/index?id=" + id
    })
  },
  pay(event){//支付订单
    var id = event.target.id
    console.log(id)
    http.Post("app/pay/gateway/create", { orderId: id, tradeType: 0, payType: 7, openid: wx.getStorageSync('openid'), accessToken: wx.getStorageSync('accessToken') }, (res) => {
      wx.requestPayment({
        'timeStamp': res.data.timeStamp,
        'nonceStr': res.data.nonceStr,
        'package': res.data.package,
        'signType': 'MD5',
        'paySign': res.data.paySign,
        'success':  (res)=> {//支付成功
          wx.navigateTo({
            url: '../orderdetail/index?id='+id
          })
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
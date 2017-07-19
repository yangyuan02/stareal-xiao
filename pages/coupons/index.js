var http = require('../../utils/httpHelper.js')
// var flag = false
// var more = true
var kind = 0
// var goods = []
Page({
  data:{
    currentTab:0,
    navbar: [
      { name: '未使用', kind: 0 }, { name: '待支付', kind: 2 }
    ],
    couponList:[],
    hidden: true,//loading
    scrollHeight: 0,
    nodata: {//暂无数据
      show: false,
      icon: '../../images/404_coupon@2x.png',
      text: '哎呀，没有相关折扣'
    },
    page_num:0,
    flag:false,
    more:true,
    goods:[],
  },
  onLoad(options){
    if (options.from) {
      this.setData({
        isCoupon: options.isCoupon,
        orderId: options.from,
        total: options.total
      })
      this.getDetailCoupon(options.from, options.total)
    }else{
      this.getCouponList(0)
    }
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    })
  },
  onShow (){},
  navbarTap (event){//点击分类查询
    kind = event.currentTarget.id
    this.data.flag = false
    this.data.more = true
    this.data.goods = []
    this.data.page_num = 0
    this.setData({ currentTab: kind })
    this.getCouponList(kind)
  },
  getCouponList (kind){//获取优惠券列表
    this.data.flag = false
    this.data.page_num++
    this.setData({hidden:false})
    http.Get("app/coupon/list/retrieve", { accessToken: wx.getStorageSync('accessToken'), status: kind, pageNum: this.data.page_num, pageSize: 10},(res)=>{
      if (res.retCode==0){
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
        this.setData({ couponList: this.data.goods})
        this.setData({ hidden: true })
        this.data.flag = true;
      }
    })
  },
  getDetailCoupon(id, total){//支付页页面获取可以使用的优惠券
    http.Get("app/detail/coupon/retrieve", { id: id, total: total, accessToken: wx.getStorageSync('accessToken')},(res)=>{
      if (res.retCode == 0) {
        console.log(res)
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
        this.setData({ couponList: this.data.goods })
        this.setData({ hidden: true })
        this.data.flag = true;
      }
    })
  },
  bindDownLoad() {//触底回调函数
    if (this.data.more) {
      if (this.data.flag) {
        this.getCouponList(kind)
      }
    }
  },
  select(e) {//选择优惠券
    var id = e.currentTarget.dataset.id
    var isCoupon = this.data.isCoupon
    var orderId = this.data.orderId
    var total = this.data.total
    var ratio = e.currentTarget.dataset.ratio
    if (isCoupon && orderId && isCoupon==1) {
      wx.setStorageSync('couponId', id)//同步存储
      wx.setStorageSync('type', ratio)//同步存储
      wx.redirectTo({//回跳确认订单
        url: "../pay/index?orderId=" + orderId + "&total=" + total + "&is_coupon=" + isCoupon + "&couponId=" + id + "&type=" + ratio
      })
    }
  }
})
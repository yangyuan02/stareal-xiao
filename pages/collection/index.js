var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
var app = getApp()//获取应用实例
Page({
  data: {
    hotLIst: [],//列表
    hidden: true,//loading
    scrollHeight: 0,
    nodata: {//暂无数据
      show: false,
      icon: '../../images/404_collection@2x.png',
      text: '这里没演出，去隔壁看看吧'
    },
    page_num:0,
    goods:[],
    flag:false,
    more:true
  },
  onLoad() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    })
    this.getCategoryList()
  },
  onShow() {
    // this.getCategoryList()
  },
  getCategoryList() {//获取列表
    this.data.flag = false
    this.data.page_num++
    this.setData({ hidden: false })
    var param = {
      accessToken: wx.getStorageSync('accessToken'),
      page_num: this.data.page_num,
      page_size: 10
    }
    http.Get("app/favor/list", param, (res) => {
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
        this.setData({ hotLIst: Public.setState(this.data.goods) })
        this.setData({ hidden: true })
        this.data.flag = true;
      }
    })
  },
  bindDownLoad() {//触底回调函数
    if (this.data.more) {
      if (this.data.flag) {
        this.getCategoryList()
      }
    }
  }
})
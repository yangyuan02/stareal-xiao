var http = require('../../utils/httpHelper.js')
Page({
  data: {
    hidden: true,//loading
    nodata: {//暂无数据
      show: false,
      icon: '../../images/404_order@2x.png',
      text: '暂无物流信息'
    }
  },
  onLoad(options) {
    var id = options.id
    this.getExpress(id)
  },
  onShow() { },
  getExpress(id) {
    this.setData({ hidden: false })
    http.Get("app/order/shunfeng/retrieve", { orderId: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        this.setData({
          express: res.data,
          invoice: res.invoice
        })
        this.setData({ hidden: true })
        var total_row = res.total_row
        if (total_row == 0) {
          this.setData({ 'nodata.show': true })
        } else {
          this.setData({ 'nodata.show': false })
        }
      }
    })
  }
})
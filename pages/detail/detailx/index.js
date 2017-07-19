var Base64 = require('../../../utils/base64.modified.js')//解析base64
var WxParse = require('../../../utils/wxParse.js')//解析富文本
Page({
  onLoad(){
    var decode = Base64.decode(wx.getStorageSync('datail'))//解析后
    WxParse.wxParse('decode', 'html', decode, this, 5)
  },
  onShow(){}
})
var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
var history = []//历史记录
Page({
  data: {
    cdshow: true,
    hidden: true,//loading
    nodata: {//暂无数据
      show: false,
      icon: '../../images/404_classify@2x.png',
      text: '这里没演出，去隔壁看看吧'
    }
  },
  onLoad() {
    this.getHotList()
    this.setHistory()
  },
  onShow() { },
  goBack() {//返回上页
    wx.navigateBack({
      delta: 1
    })
  },
  getHotList() {//获取热词
    this.setData({ hidden: false })
    http.Get("app/search/hot/retrieve", {}, (res) => {
      if (res.retCode == 0) {
        this.setData({ hotWord: res.data })
        this.setData({ hidden: true })
      }
    })
  },
  hws(e) {//点击热词
    var keyWord = e.currentTarget.dataset.word.replace(/\s+/g, "")//删除所有空格
    this.search(keyWord)
    this.setData({ value: keyWord })
    var a = history.findIndex((value, index, arr) => value.word == keyWord) //数组对象去重
    if (a == -1) {
      history.unshift({ "word": keyWord })
      this.setData({ history: Array.from(new Set(history)) })
      wx.setStorageSync('list', history)//同步存储
    }
  },
  search(keyword) {//搜索方法
    this.setData({ hidden: false })
    http.Get("app/search/list/index", { keyword: keyword }, (res) => {
      if (res.retCode == 0) {
        this.setData({ cdshow: false })
        this.setData({ hidden: true })
        this.setData({ hotLIst: Public.setState(res.data) })
        var total_row = res.total_row
        if (total_row == 0) {
          this.setData({ 'nodata.show': true })
        }
      }
    })
  },
  listenInput(e) {//监听输入框内容长度
    var value = e.detail.value.replace(/\s+/g, "")//删除所有空格
    if (value.length == 0) {
      this.setData({ cdshow: true })
      this.setData({ 'nodata.show': false })
    }
  },
  confirmSearch(e) {//回车搜索
    var value = e.detail.value.replace(/\s+/g, "")//删除所有空格
    if (value == '') {
      return
    }
    this.search(value)
    this.setData({ value: value })
    var a = history.findIndex((value1, index, arr)=> value1.word == value)
    if (a == -1) {
      history.unshift({ "word": value })
      this.setData({ history: history })
      wx.setStorageSync('list', history)//同步存储
    }
  },
  delHot(e) {//删除历史记录
    var index = e.currentTarget.dataset.index
    var arr = this.data.history
    arr.splice(index, 1)
    this.setData({ history: arr })
    wx.setStorageSync('list', arr)//同步存储
  },
  setHistory() {//设置历史记录
    if (wx.getStorageSync('list')) {
      history = wx.getStorageSync('list')
      this.setData({ history: history })
    }
  }
})
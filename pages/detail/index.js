var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
var Base64 = require('../../utils/base64.modified.js')//解析base64
var WxParse = require('../../utils/wxParse.js')//解析富文本
var app = getApp()
Page({
  data: {
    id: '',//演出id
    good: {
      state: null,
      color: null
    },
    btn: '立即购买',
    hidden: true,//loading
    animationData: {},//动画
    favor: '/images/show details_tab_collection_n@2x.png'
  },
  onLoad(options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          screenWidth: res.screenWidth
        })
      }
    })
    var id = options.id
    this.getDetail(id)
    this.getTour(id)
    this.setData({
      id: id,
      index: options.index
    })
  },
  onShow() {
    this.animation = wx.createAnimation({//创建动画实例
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: 'left bottom 0',
    })
  },
  getDetail(id) {//获取演出详情
    this.setData({ hidden: false })
    http.Get("app/detail/good/retrieve", { id: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        console.log(res)
        var datail = res.data.detail//解析前
        wx.setStorageSync('datail', datail)//同步存储
        var decode = Base64.decode(datail)//解析后
        WxParse.wxParse('decode', 'html', decode, this, 5)
        this.setData({ good: res.data })
        if (res.data.favor == 1) {
          this.setData({ favor: '/images/collection_s@2x.png' })
        }
        if (res.data.star) {
          this.setData({ star: res.data.star.split('.') })
        }
        if (this.data.good.state == '即将开票') {
          this.setData({
            'good.sold': 0,
            btn: '预定中',
            code: 0
          })
        } else if (this.data.good.state == '演出结束') {
          this.setData({
            btn: '演出结束',
            code: 1
          })
        } else {
          this.setData({
            btn: '立即购票',
            code: 2
          })
        }
        this.setData({ hidden: true })
      }
    })
  },
  goTicket() {//跳转选票
    if (this.data.code == 1) {//演出结束
      return
    }
    if (!wx.getStorageSync('accessToken')) {//检查登录
      wx.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userInfo"]) {
            //调用应用实例的方法获取全局数据
            app.getUserInfo((userInfo) => {
              this.setData({
                userInfo: userInfo
              })
            })
          }
        }
      })
      return
    }
    if (this.data.code == 0) {//预约登记
      var screenWidth = this.data.screenWidth / 750
      var a = 456 * screenWidth
      this.upAnimation(-a, 1)
      return
    }
    if (this.data.code == 2) {
      var id = this.data.id
      var is_coupon = this.data.good.is_coupon
      wx.removeStorageSync('couponId')//清除优惠券id
      wx.removeStorageSync('type')//清除优惠券类型
      wx.removeStorageSync('deliverType')//清除取票类型
      wx.removeStorageSync('name')//清除取票人
      wx.removeStorageSync('tel')//清除取票人手机号
      wx.setStorageSync('good', this.data.good)//同步存储
      wx.redirectTo({
        url: "../ticket/index?id=" + id + "&is_coupon=" + is_coupon,
      })
    }

  },
  upAnimation(step, code) {//执行动画
    this.animation.translate(0, step).step()
    this.setData({ animation: this.animation.export() })
    var display = (code == 1 ? 'block' : 'none')
    this.setData({ display: display })
  },
  closeAnimation() {//关闭动画
    var screenWidth = this.data.screenWidth / 750
    var a = 456 * screenWidth
    this.upAnimation(a, 0)
  },
  listenInput(e) {//同步更新手机号
    var tel = e.detail.value
    this.setData({ tel: tel })
  },
  appointment() {//预约登记
    var tel = this.data.tel
    var id = this.data.id
    var myreg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
    if (!myreg.test(tel)) {
      wx.showModal({
        title: '提示',
        content: '请输入有效的手机号码',
        showCancel: false
      })
      return
    }
    http.Post("app/register/appointment/create", { good_id: id, mobile: tel, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        this.closeAnimation()
        wx.showModal({
          title: '提示',
          content: '预约成功',
          showCancel: false
        })
      }
      if (res.retCode == 22202) {//不能重复预约
        this.closeAnimation()
        wx.showModal({
          title: '提示',
          content: '不能重复预约',
          showCancel: false
        })
      }
    })
  },
  goDetail() {//跳转演出详情
    wx.navigateTo({
      url: 'detailx/index'
    })
  },
  getTour(id) {//获取巡演
    http.Get("app/detail/good/tour", { id: id }, (res) => {
      if (res.retCode == 0) {
        this.setData({ tour: res.data })
      }
    })
  },
  switchTour(e) {//切换巡演
    var id = e.currentTarget.dataset.id
    this.getDetail(id)
    this.setData({ id: id })
  },
  favor() {//收藏
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];//上一页
    var good = this.data.good
    if (!wx.getStorageSync('accessToken')) {//检查登录
      wx.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userInfo"]) {
            //调用应用实例的方法获取全局数据
            app.getUserInfo((userInfo) => {
              this.setData({
                userInfo: userInfo
              })
            })
          }
        }
      })
      return
    }
    http.Post("app/favor/create", { good_id: this.data.id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        if (this.data.good.favor == 0) {//收藏成功
          if (prevPage.route == 'pages/collection/index') {//来自于我的收藏页面
            if (good.state == '即将开票') {
              good.state = '预定中';
              good.color = 'jijiang';
            }
            if (good.state == '演出结束') {
              agood.state = '已结束';
              good.color = 'jieshu';
            }
            if (good.state == '预售中') {
              good.color = 'yushou';
            }
            if (good.state == '售票中') {
              good.color = 'shoupiao';
            }
            if (good.state == '扫尾票') {
              good.color = 'saopiao';
            }
            if (good.state == '已售罄') {
              good.color = 'shouqin';
            }
            var arr = prevPage.data.hotLIst
            var item = {
              date: good.date,
              coupon_label: good.coupon_label,
              thumb: good.thumb,
              price: good.price,
              id: good.id,
              state: good.state,
              title: good.title,
              site_title: good.site_title,
              color: good.color
            }
            arr.push(item)
            prevPage.setData({
              hotLIst: arr,
              'nodata.show': false
            })
          }
          this.setData({
            favor: '/images/collection_s@2x.png',
            'good.favor': 1
          })
        } else {//取消收藏
          if (prevPage.route == 'pages/collection/index') {//来自于我的收藏页面
            var arr = prevPage.data.hotLIst
            arr.splice(this.data.index, 1)
            if (arr.length == 0) {
              prevPage.setData({
                'nodata.show': true
              })
            }
            prevPage.setData({
              hotLIst: arr
            })
          }
          this.setData({
            favor: '/images/show details_tab_collection_n@2x.png',
            'good.favor': 0
          })
        }
      }
    })
  },
  seatThumb() {//座位图预览
    if (this.data.good.seat_thumb) {
      wx.previewImage({
        current: '', // 当前显示图片的http链接
        urls: [this.data.good.seat_thumb] // 需要预览的图片http链接列表
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '暂无座位图',
        showCancel: false
      })
    }
  }
})
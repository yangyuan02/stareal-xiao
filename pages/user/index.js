var app = getApp()
Page({
  data: {
    userInfo: {},
    userListInfo: [
      {
        icon: '../../images/personal_all@2x.png',
        text: '我的订单',
        path: '../orders/index',
      },
      {
        icon: '../../images/personal_vip@2x.png',
        text: '我的会员',
        path: '../member/index',
      },
      {
        icon: '../../images/personal_collect@2x.png',
        text: '我的收藏',
        path: '../collection/index',
      },
      {
        icon: '../../images/personal_coupon@2x.png',
        text: '我的卡券',
        path: '../coupons/index',
      },
      {
        icon: '../../images/iconfont-shouhuodizhi.png',
        text: '地址管理',
        path: '../address/list/index',
      },
      {
        icon: '../../images/personal_privilege@2x.png',
        text: '联系客服',
        path: 'orders3'
      },
      {
        icon: '../../images/personal_issue@2x.png',
        text: '常见问题',
        path: '../problems/index',
      }
    ]
  },
  onLoad () {
    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo)=>{
      //更新数据
      this.setData({
        userInfo: userInfo
      })
    })
  },
  goPath (event) {//进入下个页面
    var index = event.currentTarget.id
    var path = event.currentTarget.dataset.path
    if (index == 5) {
      wx.makePhoneCall({
        phoneNumber: '4008798613', //此号码并非真实电话号码，仅用于测试
      })
    }
    if (!wx.getStorageSync('accessToken')&&index!=5&&index!=6) {//检查登录
      wx.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userInfo"]) {
            //调用应用实例的方法获取全局数据
            app.getUserInfo((userInfo) => {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
            })
          }
        }
      })
      return
    }
    wx.navigateTo({
      url: path
    })
  }
})
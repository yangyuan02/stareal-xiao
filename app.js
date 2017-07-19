//app.js
var http = require('/utils/httpHelper.js')
App({
  onLaunch: function () {
   
  },
  getUserInfo: function (cb) {
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({//调用登录接口
        success: (res) =>{
          http.Get("app/login/social/xcxGetToken", { code: res.code }, (res) => {//获取Openid
            wx.setStorageSync('openid', res.openid)//同步存储
          })
          wx.getUserInfo({//获取用户信息
            success:  (res)=> {
              this.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(this.globalData.userInfo)
              var _param = {
                plat:'wx',
                nickname: res.userInfo.nickName,
                province: res.userInfo.province,
                city: res.userInfo.city,
                headimgurl: res.userInfo.avatarUrl,
                openid: wx.getStorageSync('openid')
              }
              http.Post("app/login/social/xcxLogin",_param, (res) => {//获取accessToken
                wx.setStorageSync('accessToken', res.accessToken)//accessToken
              })
            },
            fail:(err)=>{
              console.log(err)
            }
          })
        }
      })
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData: {
    userInfo: null
  }
})
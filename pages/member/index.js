var http = require('../../utils/httpHelper.js')
Page({
  data:{
    colors: ['#98A4B2', '#C2C2C2', '#FFEB3B', '#B7EDDF','#CCD7FA'],
    icon: [
      '/images/vip_ordinary@2x.png',
      '/images/vip_silver@2x.png',
      '/images/vip_gold@2x.png',
      '/images/vip_platinum@2x.png',
      '/images/vip_diamond@2x.png']
  },
  onLoad(){
    this.getMember()
  },
  onShow(){},
  getMember(){//获取会员
    http.Get("app/member/index/retrieve", { accessToken: wx.getStorageSync('accessToken')},(res)=>{
      console.log(res)
      if(res.retCode==0){
        this.setData({member:res.data})
        if (res.data.coupon_flag){//优惠券是否可领取
            this.setData({
              'Btn.Text':'可领取',
              'Btn.Color': '#FF5000',
              'Btn.flag': res.data.coupon_flag
              })
        }else{
            this.setData({
              'Btn.Text': '已领取',
              'Btn.Color': '#999',
              'Btn.flag': res.data.coupon_flag
              })
        }
        switch (Number(res.data.level))
          {
          case 1: this.setData({ progress:res.data.value/1000*100});break;
          case 2: this.setData({ progress: (res.data.value - 1001) / 2000 * 100 }); break;
          case 3: this.setData({ progress: (res.data.value - 3001) / 2000 * 100 }); break;
          case 4: this.setData({ progress: (res.data.value - 6001) / 2000 * 100 }); break;
          case 5: this.setData({ progress: 100}); break;
          }
      }
    })
  },
  getCoupon(){//领取优惠券
    if (this.data.Btn.flag){
      http.Get("app/member/coupon/retrieve", {accessToken: wx.getStorageSync('accessToken')},(res)=>{
        if(res.retCode==0){
          this.setData({
            'Btn.Text': '已领取',
            'Btn.Color': '#999',
            'Btn.flag':false
          })
        }
      })
    }
  }
})
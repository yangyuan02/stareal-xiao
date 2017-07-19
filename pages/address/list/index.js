var http = require('../../../utils/httpHelper.js')
Page({
  data: {
    defaultSize: 'default',
    addressList:[],//地址列表
    hidden: true,//loading
    icon1:'../../../images/check.png',
    icon2: '../../../images/check_s.png',
    nodata: {//暂无数据
      show: false,
      icon: '../../../images/404_signal@2x.png',
      text: '暂无地址'
    }
  },
  onLoad (options){
    
    if (options.from){
      var from = options.from
      this.setData({ from: from }) //来自支付页面
    }
    this.getAddress()
  },
  onShow (){
    
  },
  getAddress (){//获取地址列表
    this.setData({ hidden:false})
    http.Get("app/address/retrieve", { accessToken: wx.getStorageSync('accessToken')},(res)=>{
      console.log(res)
      if (res.retCode==0){
        this.setData({ addressList:res.data})
        this.setData({ hidden: true})
      }
      if (res.data.length==0){
        this.setData({ 'nodata.show': true})
      }else{
        this.setData({ 'nodata.show': false})
      }
    })
  },
  setDefault (event){//设置默认地址
    var id = event.currentTarget.id
    http.Post("app/address/isdefault", { id: id, accessToken: wx.getStorageSync('accessToken')},(res)=>{
      if(res.retCode==0){
        this.getAddress()
      }
    })
  },
  delAddress (){//删除地址

  },
  addAddress (){//新增地址
    wx.navigateTo({
      url:"../add/index",
      success: (res)=>{
        console.log(res)
      },
      fail: (res)=>{
        console.log(res)
      }
    })
  },
  select (e){//选择地址
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    if(this.data.from){
      wx.setStorageSync('addressId', id)//同步存储
      wx.redirectTo({//回跳确认订单
        url: "../../pay/index?addressId=" + id,
      })
    }else{
      wx.navigateTo({
        url: "../add/index?id=" + id+"&index="+index,
      })
    }
  }
})
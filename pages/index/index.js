var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
var app = getApp()
Page({
  data:{
    imgUrls: [],//banner列表
    hotLIst:[],//热门推荐
    indicatorDots: true,//是否显示指示点
    autoplay: true,//是否自动切换
    interval: 5000,//自动切换时间间隔	    
    duration: 1000,//滑动动画时长	
    circular: true,//是否采用衔接滑动
    hidden:true//loading
  },
  onLoad () {
    this.getBanner();
    this.getHotList();
    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo: userInfo
      })
    })
  },
  onShow (){
      
  },
  getBanner (){//获取banner
      http.Get("app/main/ad/retrieve", {},(res)=>{
        if (res.retCode==0){
          this.setData({ imgUrls:res.data})
        }
      });
  },
  getHotList (){//获取热门推荐列表
    this.setData({ hidden: false })
    http.Get("app/main/latest/good", {},(res)=>{
      if (res.retCode == 0) {
        this.setData({hotLIst: Public.setState(res.data)})
        this.setData({ hidden: true })
      }
    });
  },
  goSearch(){//跳转搜索框
    wx.navigateTo({
      url: "../search/index"
    })
  }
}) 
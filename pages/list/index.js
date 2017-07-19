var http = require('../../utils/httpHelper.js')
var Public = require('../../utils/public.js')
var app = getApp()//获取应用实例
// var flag = false
// var more = true
var kind = 0;
// var goods = [];
Page({
  data: {
    currentId: '0',
    category: [//分类
      { name: '演唱会', kind: '0' }, { name: '话剧歌剧', kind: '1' },
      { name: '体育赛事', kind: '2' }, { name: '展览景点', kind: '3' },
      { name: '儿童亲子', kind: '4' }, { name: '音乐舞蹈', kind: '8' },
      { name: '曲艺杂谈', kind: '5' }, { name: '同城活动', kind: '6' }
    ],
    hotLIst:[],//列表
    hidden: true,//loading
    scrollHeight: 0,
    nodata:{//暂无数据
      show:false,
      icon:'../../images/404_classify@2x.png',
      text:'这里没演出，去隔壁看看吧'
    },
    page_num:0,
    flag:false,
    more:true,
    goods:[],
  },
  onLoad (){
    wx.getSystemInfo({
      success: (res)=> {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    })
    this.getCategoryList(0)
  },
  onShow () {
    
  },
  handleTap (event){//点击分类
    kind = event.currentTarget.id
    this.data.flag = false
    this.data.more = true
    this.data.goods = []
    this.data.page_num = 0
    this.getCategoryList(kind)
    this.setData({ currentId:kind})
  },
  getCategoryList (kind){//获取列表
    this.data.flag = false
    this.data.page_num++
    this.setData({ hidden: false })
    var param = {
      kind:kind,
      sort: 'hot',
      direct:'desc',
      page_num: this.data.page_num,
      page_size:10
    }
    http.Get("app/search/list/index",param,(res)=>{
      if (res.retCode == 0) {
        var items = res.data
        for(var i = 0;i<items.length;i++){
          this.data.goods.push(items[i])
        }
        var total_row = res.total_row
        var page_num = res.page_num
        var page_size = res.page_size
        if (total_row - page_num*page_size<0){
          this.data.more = false
        }
        if (total_row==0){
          this.setData({'nodata.show':true})
        } else{
          this.setData({ 'nodata.show': false })
        }
        this.setData({ hotLIst: Public.setState(this.data.goods)})
        this.setData({ hidden: true })
        this.data.flag = true;
      }
    })
  },
  bindDownLoad () {//触底回调函数
    if (this.data.more){
      if (this.data.flag){
        this.getCategoryList(kind)
      }
    }
  }
})
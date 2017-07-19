var http = require('../../../utils/httpHelper.js')
var city = require("../../../utils/city.js");
Page({
  data: {
    username: '',
    iphone: '',
    address:''
  },
  onLoad (options) {
    // 页面初始化 options为页面跳转所带来的参数  
    var that = this;
    city.init(that);
    this.setData({ addressId: options.id})
    this.getById(options.id)
  },
  getById (id){//编辑地址
    if (id){
      http.Get("app/address/getbyid", { id: id, accessToken: wx.getStorageSync('accessToken') }, (res) => {
        if (res.retCode == 0) {
          wx.setNavigationBarTitle({
            title: '编辑地址'
          })
          var data = res.data
          this.setData({ username: data.name })
          this.setData({ iphone: data.mobile })
          this.setData({ address: data.address })
          var province = data.province
          var city = data.city.substring(0, data.city.length - 1)
          var district = data.district

          var provinceS = this.data.city.province
          var cityS = this.data.city.city[province]
          console.log(city)
          var districtS = this.data.city.district[city]
          console.log(districtS)
          var provinceIndex = provinceS.findIndex(function (value, index, arr) {
            return value == province
          })
          var cityIndex = cityS.findIndex(function (value, index, arr) {
            return value == city
          })
          var districtIndex = districtS.findIndex(function (value, index, arr) {
            return value == district
          })
          this.setData({ 'city.provinceIndex': provinceIndex })
          this.setData({ 'city.selectedProvince': province })
          this.setData({ 'city.cityIndex': cityIndex })
          this.setData({ 'city.selectedCity': city })
          this.setData({ 'city.districtIndex': districtIndex })
          this.setData({ 'city.selectedDistrct': district })
        }
      })
    }
  },
  bindblurname (e) {//设置姓名
    var username = e.detail.value;
    if (username!=''){
      this.setData({ username: username})
    }else{
      wx.showModal({
        title: '提示',
        content: '姓名不能为空',
        showCancel: false,
      })
      this.setData({ username: '' })
    }
  },
  bindblurphone (e) {//设置手机号
    var userphone = e.detail.value;
    if(this.checkPhone(userphone)){
      this.setData({ iphone: userphone})
    }else{
      this.setData({ iphone: '' })
    }
  },
  checkPhone (phone) {//验证手机号
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showModal({
        title: '提示',
        content: '手机号码有误',
        showCancel: false,
      })
      return false
    }else{
      return true
    }
  },
  particularFn (e){//设置详细地址
    var address = e.detail.value
    if (address!=''){
      this.setData({ address: address})
    }else{
      wx.showModal({
        title: '提示',
        content: '详细地址不能为空',
        showCancel: false,
      })
      this.setData({ address: '' })
    }
  },
  save (){//保存
    var provinceIndex = this.data.city.provinceIndex//等于0没有选择
    var name = this.data.username
    var tel = this.data.iphone
    var address = this.data.address
    var province = this.data.city.selectedProvince
    var city = this.data.city.selectedCity+'市'
    var district = this.data.city.selectedDistrct
    var param = {
      name:name,
      mobile:tel,
      province:province,
      city:city,
      district: district,
      address:address,
      accessToken: wx.getStorageSync('accessToken'),
    }
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];  //上一个页面
    if (!this.data.addressId){//新增接口
      if (name != '' && tel != '' && address != '' && provinceIndex != 0) {
        http.Post("app/address/create", param, (res) => {
          prevPage.getAddress()
          wx.navigateBack({
            delta: 1
          })
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请填写正确的信息',
          showCancel: false,
        })
      }
    }else{//更新接口
      if (name != '' && tel != '' && address != '' && provinceIndex != 0) {
        param.id = this.data.addressId
        http.Post("app/address/update", param, (res) => {
          prevPage.getAddress()
          wx.navigateBack({
            delta: 1
          })
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请填写正确的信息',
          showCancel: false,
        })
      }
    }
  }
})
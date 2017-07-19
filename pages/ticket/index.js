var http = require('../../utils/httpHelper.js')
Page({
  data: {
    num: 1,
    max_num: 6,
    minusStatus: 'disabled',//class类
    paras: {//自定义一个对象
      planIndex: 0,
      catIndex: 0,
      goryIndex: 0,
      pricesIndex: 0
    },
    animationData: {}//动画
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
    var is_coupon = options.is_coupon
    this.getTicket(id)
    this.setData({ good_id: id })
    this.setData({ is_coupon: is_coupon })
  },
  onShow() {
    this.animation = wx.createAnimation({//创建动画实例
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: 'left bottom 0',
    })
  },
  getAvailableCatIndex() {//获取第一个可以选择的价格
    var _index = [null, null];

    catsLoop:
    for (var _i = 0; _i < this.data.cat.length; _i++) {
      var _gory = this.data.cat[_i].children;
      for (var _j = 0; _j < _gory.length; _j++) {
        if (_gory[_j].status) {
          _index = [_i, _j];
          break catsLoop;
        }
      }
    }
    return _index;
  },
  getAvailablePriceIndex() {//获取第一个可以选择的座位
    var _index = null;
    if (this.data.prices) {
      for (var _i = 0; _i < this.data.prices.length; _i++) {
        if (this.data.prices[_i].status) {
          _index = _i;
          break;
        }
      }
    }
    return _index;
  },
  getTicket(id) {//获取票

    http.Get("app/detail/ticket/retrieve", { id: id }, (res) => {
      if (res.retCode == 0) {
        var plans = res.data  //时间
        plans.forEach(function (value, key) {
          plans[key].bBuildDate = value.name.substring(0, value.name.indexOf('#'))//时间格式化
          plans[key].aBuildDate = value.name.substring(value.name.indexOf('#') + 1)
        })
        this.setData({ plans: plans })//初始化时间
        this.setData({ cat: plans[0].children })//初始化票面价格
        this.setData({ max_num: plans[0].max_num })//设置最大值
        var _index = this.getAvailableCatIndex()
        if (this.data.cat[_index[0]] == undefined) {//没有座位可选择
          this.setData({ num: 0 })
          this.setData({ total: '0.00' })
        } else {
          this.setData({ 'paras.goryIndex': _index[1] })
          this.setData({ 'paras.catIndex': _index[0] })
          this.setData({ prices: this.data.cat[_index[0]].children[_index[1]].children })//初始化座位
          this.setData({ total: this.data.prices[0].price })//初始化总价
        }
      }
    })
  },
  switchPlan(e) {//选择时间
    var index = e.currentTarget.id
    this.setData({ 'paras.planIndex': index })
    this.setData({ cat: this.data.plans[index].children })//初始化票面价格

    var _index = this.getAvailableCatIndex()
    this.setData({ 'paras.goryIndex': _index[1] })
    this.setData({ 'paras.catIndex': _index[0] })
    this.setData({ prices: this.data.cat[_index[0]].children[_index[1]].children })//初始化座位

    this.setData({ 'paras.pricesIndex': 0 })  //可以
    this.setData({ total: this.data.prices[this.data.paras.pricesIndex].price })//初始化总价
    this.setData({ max_num: this.data.plans[index].max_num })//设置最大值

    this.setData({ num: 1 })//重置
    this.calTotal()
  },
  switchCat(e, index1, index2, choosable) {//选择票面价格
    var catIndex = e.target.dataset.catIndex
    var goryIndex = e.target.dataset.goryIndex
    var goryStatus = e.target.dataset.goryStatus
    if (goryStatus) {
      this.setData({ 'paras.catIndex': catIndex })
      this.setData({ 'paras.goryIndex': goryIndex })
      // 没有可选择的价位
      if (catIndex == null) {
        this.setData({ prices: null })
      } else {
        var data = this.data
        var planIndex = data.paras.planIndex
        var prices = data.plans[planIndex].children[catIndex].children[goryIndex].children
        this.setData({ prices: prices })
      }
    } else {//票面价格不可选择
      var screenWidth = this.data.screenWidth / 750
      var a = 552 * screenWidth
      this.upAnimation(-a, 1)
      this.setData({
        registerCat: this.data.cat[catIndex].children[goryIndex].name,//票面价格
        registerData: this.data.plans[this.data.paras.planIndex].name,//选择时间
        registerId: this.data.cat[catIndex].children[goryIndex].id
      })
    }
    var index = this.getAvailablePriceIndex()
    this.setData({ 'paras.pricesIndex': index })
    this.setData({ num: 1 })//重置
    this.calTotal()
  },
  switchPrice(e, index, choosable) {//选择座位
    var pricesIndex = e.target.dataset.pricesIndex
    var pricesStatus = e.target.dataset.pricesStatus
    if (pricesStatus) {
      this.setData({ 'paras.pricesIndex': pricesIndex })
    }
    this.setData({ num: 1 })//重置
    this.calTotal()
  },
  calTotal() {//计算价格
    var data = this.data
    var num = data.num
    var _po = (data.prices ? data.prices[data.paras.pricesIndex] : 0)
    var _price = (_po ? _po.price : 0)
    var total = _price * num
    this.setData({ total: total })
  },
  subNum() { //数量-
    var num = this.data.num;
    if (num > 1) {
      num--;
    }
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.calTotal()
  },
  addNum() {//数量+
    var data = this.data
    var num = Number(this.data.num);
    var _po = (data.prices ? data.prices[data.paras.pricesIndex] : 0)
    var _price_maxNum = Number(_po.num)//剩余多少票
    var plans_maxNum = Number(this.data.max_num)
    var _MaxNum = _price_maxNum >= plans_maxNum ? plans_maxNum : _price_maxNum
    var minusStatus = num == _MaxNum ? 'disabled' : 'normal';
    if (num == _MaxNum) {
      wx.showModal({
        title: '最多只能购买' + _MaxNum + '张',
        showCancel: false
      })
      return;
    }
    num++;
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.calTotal()
  },
  goPay() {//去支付
    var goodID = this.data.good_id
    var is_coupon = this.data.is_coupon
    var prices = this.data.prices
    if (!prices) {
      wx.showModal({
        title: '请选择座位',
        showCancel: false
      })
      return
    }
    var currentIndex = this.data.paras.pricesIndex
    var _po = prices[currentIndex]
    var total = this.data.total
    _po.total = total//最后的总价
    _po.num2 = this.data.num //最后的num值
    var paras = this.data.paras
    _po.data = this.data.plans[paras.planIndex].name//选择的时间
    _po.cat = this.data.cat[paras.catIndex].children[paras.goryIndex].name//票面价格
    var _sku = Number(_po.num)
    if (_sku < Number(this.data.num)) {
      wx.showModal({
        title: '库存不足',
        showCancel: false
      })
      return
    }
    wx.setStorageSync('ticket', _po)//同步存储
    wx.redirectTo({
      url: "../pay/index?total=" + total + "&orderId=" + goodID + "&is_coupon=" + is_coupon,
    })
  },
  upAnimation(step, code) {//执行动画
    this.animation.translate(0, step).step()
    this.setData({ animation: this.animation.export() })
    var display = (code == 1 ? 'block' : 'none')
    this.setData({ display: display })
  },
  closeAnimation() {//关闭动画
    var screenWidth = this.data.screenWidth / 750
    var a = 552 * screenWidth
    this.upAnimation(a, 0)
  },
  listenInput(e) {//同步更新手机号
    var tel = e.detail.value
    this.setData({ tel: tel })
  },
  submitOos() {//缺货登记
    var tel = this.data.tel
    var id = this.data.registerId
    var myreg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
    if (!myreg.test(tel)) {
      wx.showModal({
        title: '提示',
        content: '请输入有效的手机号码',
        showCancel: false
      })
      return
    }
    http.Post("app/register/oos/create", { ticket_id: id, mobile: tel, accessToken: wx.getStorageSync('accessToken') }, (res) => {
      if (res.retCode == 0) {
        this.closeAnimation()
        wx.showModal({
          title: '提示',
          content: '登记成功',
          showCancel: false
        })
      }
      if (res.retCode == 22202) {//不能重复预约
        this.closeAnimation()
        wx.showModal({
          title: '提示',
          content: '不能重复登记',
          showCancel: false
        })
      }
    })
  }
})
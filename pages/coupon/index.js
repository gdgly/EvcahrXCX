//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    loginMobileVal: '',//注册时的手机号，初始化为空
    loginPWVal:"",
    inputSms:"",
    loginBox:false,//已有账号密码登陆，默认隐藏
  },  
  toRechargeCoin:function()
  {
    wx.navigateTo({
      url: '../rechargeCoin/index'
    })  
  },
  onLoad: function () {
    var that=this;
      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
      wx.request({
          url: 'https://wx.chongdian.club/getData.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/coupon/getUsefulCoupons',
            'evheader':evheader,
            'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("优惠券列表")
            console.log((res))
            for(var i=0;i<(res.data.Edata[0].data).length;i++)
            {
                (res.data.Edata[0].data[i]).amount=(Number((res.data.Edata[0].data[i]).amount)*0.01).toFixed();
            }
            that.setData({
              listArray:res.data.Edata[0].data//明细列表
              })
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")        
          }
      }) 
  },
  onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
  }
})



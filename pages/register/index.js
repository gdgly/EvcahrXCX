//index.js
//获取应用实例
var app = getApp();
var tel="";
var pwd="";
var sms="";
var intSecond;
Page({
  data: {
    findMobileVal:"",//找回密码，初始化为空
    findPWVal:"",//找回密码，密码初始化为空
    findSms:"",//找回密码，短信验证码
    leftBtn:"获取验证码",
    btnstatus:false
  },
  onShow: function (){
    this.setData({
        defaultTel:tel,
        defaultPwd:pwd,
        defaultSms:sms
    })
  },
  userMobile:function(e)
  {
    tel= e.detail.value;
  },
  userPW:function(e)
  {
    pwd= e.detail.value;    
  },
  userSms:function(e)
  {
    sms= e.detail.value;    
  },
  getSms:function()
  {
    var that=this;
    console.log(tel)
    if(tel==''||tel==undefined)
    {
          wx.showToast({
              title: '手机号不能为空',
              icon: 'loading',
              duration: 1000
          }) 
    }else if(tel.length!=11)
    {
        wx.showToast({
              title: '手机号不正确',
              icon: 'loading',
              duration: 1000
          }) 
    }else
    {//去获取验证码
        this.setData({
                      btnstatus:true
                    })
        
        var timeSecond=59;
      	intSecond=setInterval(function(){
          console.log(timeSecond)
            if(timeSecond>0)
            {
                timeSecond--
                that.setData({
                      leftBtn:timeSecond
                    })
            }else
            {
                clearInterval(intSecond)
                that.setData({
                      btnstatus:false,
                      leftBtn:"获取验证码"
                    })
            }
            
        },1000)
        console.log("appkey"+wx.getStorageSync('evcharAppkey'))
        console.log("mobile"+tel)
        wx.request({
            url: app.getHostURL()+'/userNameLoginAndRegister.php',//找回密码和注册以及发短信
            method:'POST',
            data: {
              'evUrl':'/sms/verifycode/fetch',
              'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","mobile":"'+tel+'","smsVerifyCodeType":1}'// 1注册  2找回
            },  
            header: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },  
            success: function(res) {
              console.log("发送验证码返回结果")
              console.log((res));
              if(res.data.code!=0)
              {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'loading',
                    duration: 1000
                })
                clearInterval(intSecond)
                that.setData({
                      btnstatus:false,
                      leftBtn:"获取验证码"
                    })
              }else{
                that.setData({
                      btnstatus:true
                    })
              }              
            },
            fail: function(res) {  
              console.log("获取钱包信息失败")        
            }
        })
    }
  },
  regist:function()
  {
      console.log(pwd)
      var patt1=/[^a-zA-Z0-9]/;//如果出现字母和数字组合外的字符，为true
      if(pwd==""||pwd==undefined)
      {
          wx.showToast({
              title: '密码不能为空',
              icon: 'loading',
              duration: 1000
          }) 
          return;
      }else if(patt1.test(pwd))
      {
          wx.showToast({
              title: '密码只能为字母和数字组合',
              icon: 'loading',
              duration: 1000
          }) 
          return;
      }
      if(sms==""||sms==undefined)
      {
            wx.showToast({
              title: '验证码不能为空',
              icon: 'loading',
              duration: 1000
          }) 
          return;
      }
      wx.request({
          url: app.getHostURL()+'/userNameLoginAndRegister.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/user/regist',
            'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","openId":"'+wx.getStorageSync('openid')+'","password":"'+pwd+'","smsVerifyCode":"'+sms+'","userName":"'+tel+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) { 
            console.log("注册成功后返回结果")          
            console.log((res))
            if(res.data.code!=0)
            {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'loading',
                    duration: 1000
                }) 
            }
            //找回成功后登陆成功后返回主入口重新登陆
            if(res.data.code==0)
            {
                clearInterval(intSecond)
                console.log("开始跳转")
                setTimeout(function(){
                  wx.switchTab({
                    url: '../index/index'
                  })
                },1000)
                console.log("结束跳转")
            }                
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")  
            wx.showToast({
                    title: "注册失败，请重试",
                    icon: 'loading',
                    duration: 1500
                })      
          }
      })
  },
  getSmsInputerr:function(){
    var that=this;
    that.setData({
        inputStatus:false                      
    })
    setTimeout(function(){
      that.getSms()
    },400)
  },
  registInputerr:function(){
    wx.showToast({
              title: '正在注册',
              icon: 'loading',
              duration: 10000
    })
    var that=this;
    that.setData({
        inputStatus:false                      
    })
    setTimeout(function(){
      that.regist()
    },400)
  }
})



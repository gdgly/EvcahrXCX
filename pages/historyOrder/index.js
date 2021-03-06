//index.js
//获取应用实例
var wxCharts = require('../images/wxcharts.js');
var app = getApp();
var lineChart = null;
var pageNum=1;
var listArray=new Array;
Page({
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      //background: '#7cb5ec'//详细信息的背景色
    });
  },onShow:function(){
    pageNum = 1;
    listArray = new Array;
  },
  onLoad: function () {
    pageNum = 1;
    listArray = new Array;
    var that = this;
    that.listOrdersApp(1);
    //下面是折线图
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/listUserDegreeByDay',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code == "0" && res.data.Edata[0].data != null) {
          var timeList = new Array();//日期
          var MoneyList = new Array();//充电度数
          for (var i = 0; i < 10; i++)//10天电量
          {
            //第一步   获取当前时间戳
            var lockStr = 0;
            var nowTime = that.timeToTimestamp(that.TimestampToTime(new Date().getTime())) - 86400000 * i
            //因为时间戳精度不一致①获取当前日期②转成js时间戳 //获取时间格式太复杂了  		

            //第二步  循环订单日期，并且与第一步的时间戳进行匹配
            for (var x = 0; x < (res.data.Edata[0].data).length; x++) {
              var orderTime = that.timeToTimestamp((res.data.Edata[0].data)[x].day)//当前循环订单时间戳
              if (nowTime == orderTime)//如果两个时间相等，说明这一天有充过电
              {
                var timee = (res.data.Edata[0].data)[x].day.substr(5, 5);
                var degree = (res.data.Edata[0].data)[x].totalDegree * 0.01
                //alert(recData.data[x].paramMap.totalDegree)
                timeList.unshift(timee)//在数组前面增加元素
                MoneyList.unshift(degree.toFixed(2));
                //MoneyList.unshift(0);
                lockStr = 1;
              }
            }
            if (lockStr == 0)//如果两个时间不相等  则添加时间到数组  添加当天充电量为0
            {
              var timee = (that.TimestampToTime(nowTime)).substr(5, 5);
              timeList.unshift(timee)//在数组前面增加元素
              MoneyList.unshift(0);
            }
          }
          that.drawCanvas(timeList, MoneyList)
        }else if (res.data.Edata[0].code == "0" && res.data.Edata[0].data != null){
          var timeList = new Array();//日期
          for (var i = 0; i < 15; i++)//15天电量
          {
            //第一步   获取当前时间戳
            var lockStr = 0;
            var nowTime = that.timeToTimestamp(that.TimestampToTime(new Date().getTime())) - 86400000 * i
            //因为时间戳精度不一致①获取当前日期②转成js时间戳 //获取时间格式太复杂了  		


              var timee = (that.TimestampToTime(nowTime)).substr(5, 5);
              timeList.unshift(timee)//在数组前面增加元素
          }
          that.drawCanvas(timeList, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
        }
      },
      fail: function (res) {
        console.log("获取折线图信息失败")
      }
    })
  },
  timeToTimestamp: function (timee)//日期转时间戳
  {
    var date = timee;
    date = date.substring(0, 19);
    date = date.replace(/-/g, '/');
    var timestamp = new Date(date).getTime();
    return timestamp;
  },
  TimestampToTime: function (timee)//时间戳转日期
  {
    var timestamp = timee;
    var d = new Date(timestamp);    //根据时间戳生成的时间对象
    var date = (d.getFullYear()) + "-" +
      (d.getMonth() + 1) + "-" +
      (d.getDate());
    return date;
  },
  drawCanvas: function (timee, datee) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();//获取窗口宽度
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',//画布ID
      type: 'area',//面积图
      categories: timee,//x轴  时间轴 是由上面的随机数得来的
      animation: true,//动画效果
      legend: false,
      background: '#FF0000',//背景色  不知道在哪显示
      series: [{
        name: '用电量',
        data: datee,
        format: function (val, name) {
          return Number(val).toFixed(2);
        }
      },],
      xAxis: {
        disableGrid: false,//x轴  分割线    
        title: '日期',
        'type': "calibration"
      },
      yAxis: {
        title: '充电量 (kWh)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,//标注在点上的信息
      dataPointShape: true,//是否在图表中显示数据点图形标识
      extra: {
        lineStyle: 'straight'//straight 直线 curve 曲线
      }
    });
  }, onShow: function () {
    var that = this;
    var res = wx.getSystemInfoSync()
    that.setData({
      scrollHeight: res.windowHeight - 250
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  toHistoryorderInfo: function (e) {
    console.log("输出点击对象" + e.currentTarget.id)
    wx.navigateTo({
      url: 'historyorderInfo/index?orderid=' + e.currentTarget.id
    })
  },
  lower:function(){
    var that=this;
    console.log("已经滚动底部");
    pageNum = pageNum+1
    that.listOrdersApp(pageNum);
  },
  listOrdersApp: function (pageNum){
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 1500,
      mask: true
    })
    var that=this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageNum":' + pageNum+',"pageSize":25}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/listOrdersApp',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageNum":' + pageNum+',"pageSize":25}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log(res.data.Edata[0].data);
        if (res.data.Edata[0].data==null){
          //没有更多订单了
          wx.showToast({
            title: "没有更多历史订单了",
            icon: 'loading',
            duration: 1500,
            mask: true
          })
          return;
        }
        var listDate = new Array();
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).totalPrice = (Number((res.data.Edata[0].data[i]).totalPrice) * 0.01).toFixed(2);
          (res.data.Edata[0].data[i]).endDegree = (Number((res.data.Edata[0].data[i]).endDegree) * 0.01).toFixed(2);
        }
        listArray = listArray.concat(res.data.Edata[0].data)
        console.log("1112222",listArray)
        that.setData({
          listArray: listArray//明细列表
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败");
      }
    })
  }
})



const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    rid: 0,
    start: 0,
    end: 0,
    calendarList: [],
    systemInfo: {},
    ssDay: 0, //晒晒天数
  },
  onLoad(options) {
    //console.log(options)
    if(options.start){
      this.setData({
        systemInfo: my.getSystemInfoSync(),
        rid: options.toView,
        start: options.start,
        end: options.end,
      });
    }else{
      var now = new Date(); //当前日期 
      var nowYear = now.getFullYear(); //当前年 
      var nowMonth = now.getMonth(); //当前月 
      let start = publicFun.timeStampChangeDate(new Date(nowYear, nowMonth, 1));
      let end = publicFun.timeStampChangeDate(new Date(nowYear, nowMonth+1, 0));
      this.setData({
        start: start,
        end: end,
      });
    }
    this.getCalendarList(this.data.start, this.data.end);
  },
  onShow() {
    this.setData({
        toView: this.data.toView
      });
  },
  getCalendarList(start, end) {
    my.showLoading();
    let params = {
      sorttype: 0, //0从截止时间往前  1 从开始时间往后
      pagesize: 150, //页数
      pageindex: 1, //页码
      lat: app.globalData.location.lat ? app.globalData.location.lat : 0,
      lng: app.globalData.location.lng ? app.globalData.location.lng : 0,
      userid: app.globalData.userid,
      duserid: 0,
      type: 1,
      dt_start: start,
      dt_end: end,
    }
    publicFun.requestPostApi(publicFun.api.danRiLiDetails, params, this, this.successCalendarList);
  },
  successCalendarList(res, selfObj) {
    //console.log(res);
    if(res.S == 1){
        var arr = [];
        //var dayNum = res.WZ.split("，")[0].replace(/[^0-9]/ig,"");
        for(let item in res.L){
          arr.push(res.L[item][4].split(" ")[0])
        }
        
        let result = []
        let obj = {}
        for (var i of arr) {
            if (!obj[i]) {
                result.push(i)
                obj[i] = 1
            }
        }

        selfObj.setData({
          calendarList: res.L,
          toView: 'list'+selfObj.data.rid,
          ssDay: result
        });
        console.log(selfObj.data.ssDay)
      }
  },
  jumpMyCalendar() {
    if(this.data.ssDay.length >= 21){
      my.navigateTo({
        url: '../myCalendar/myCalendar?start='+this.data.start+'&end='+this.data.end
      });
    }else{
      publicFun.showToast('请至少晒满21天图片后再来制作并发布日历', 2000);
    }
  }
});

//const request = require('./utils/request.js');
const secretKey = require('/utils/secretKey.js');
const publicFun = require('/utils/public.js');
App({
  globalData: {
    userInfo: {}, //支付宝授权
    userid: '', //用户id 871969
    mobileInfo: '', //手机类型
    secondCount: '',
    //miyao: '',
    lat: 39.91, //经度
    lng: 116.44, //纬度
    tabPage: 0, //页面跳转
  },
  onLaunch(options) {
    this.getUserId();
    this.getLocation();
    this.getMobileInfo();   
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  getMiyao() {
    var data = this.getTimestamp()+this.globalData.secondCount;
    let miyao = secretKey.encrypt(data);
    return miyao;
  },
  getSecondCount() { //获取密钥
    let that = this;
    var params  = {
      str: this.getTimestamp(),
      miyao: '2wfjwefik-w0fwfjweofjweof',
      Token: ''
    }
    return new Promise((resolve, reject) => {
      my.request({
        url: publicFun.api.miyao,
        method: 'POST',
        data: params,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          that.globalData.secondCount = '|'+res.data.D+'|'+res.data.H+'|'+res.data.M+'|'+res.data.Se;
          resolve(that.globalData);
        }
      })
    });
    //publicFun.requestGetApi(publicFun.api.miyao, params, this, this.successFun, this.failFun);
  },
  successFun(res, selfObj) { //密钥成功后返回的参数
    var data = selfObj.getTimestamp()+'|'+res.D+'|'+res.H+'|'+res.M+'|'+res.Se;
    let miyao = secretKey.encrypt(data);
    selfObj.globalData.miyao = miyao;
  },
  getUserId() {
    var that = this;
    my.getStorage({
      key: 'userid',
      success: function(res) {
        that.globalData.userid = res.data
      },
    });
  },
  getLocation() { //获取定位信息
    var that = this;
    my.showLoading();
    my.getLocation({
      success(res) {
        my.hideLoading();
         var location = publicFun.formatLocation(res.longitude, res.latitude);
         //console.log(location);
         that.globalData.lat = location.latitude[0]+'.'+location.latitude[1];
         that.globalData.lng = location.longitude[0]+'.'+location.longitude[1];
      },
      fail() {
        my.hideLoading();
        my.alert({ title: '定位失败' });
        //that.getLocation();
      },
    })
  },
  getMobileInfo() { //获取手机信息
    let that = this;
    my.getSystemInfo({
      success: (res) => {
        that.globalData.mobileInfo = res.platform === "Android" ? 1 : 2;
      }
    });
  },
  getTimestamp() { //获取当前时间戳  
    var timestamp = Date.parse(new Date());  
    timestamp = timestamp / 1000;  
    return publicFun.getTime(timestamp);
  },
});

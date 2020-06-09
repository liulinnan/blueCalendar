const secretKey = require('/utils/secretKey.js');
const publicFun = require('/utils/public.js');
import uma from 'umtrack-alipay'
App({
  umengConfig: {
    appKey: '5e3a35d81dd6da21af9e5673',
    debug: true
  },
  globalData: {
    userInfo: {}, //支付宝授权
    userid: '', //用户id 889489
    authCode: '', //authCode码
    zfbUid: '', //获取公益三小时数据 2088022915906671
    mobileInfo: '', //手机类型
    secondCount: '',
    location: {},
    aqi: {},
    tabPage: 0, //页面跳转
    tabs: [],
    uma
  },
  onLaunch() {
    this.getUserId();
    this.getLocation();
    this.getMobileInfo();   
  },
  onShow(options) {
    // options.query == {number:1}
    const updateManager = my.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
      if(res.hasUpdate){
        console.log('版本提醒');
        updateManager.onUpdateReady(function () {
          my.confirm({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                //my.clearStorage();
                //app.globalData.userid = '';
                //app.globalData.zfbUid = '';
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        });
        updateManager.onUpdateFailed(function () {
          // 新版本下载失败
          my.alert({
            title: '更新提示',
            content: '新版本已上线，请您退出并删除当前小程序，重新搜索打开',
          })
        });
      }
    })
  },
  getMiyao() {
    var data = publicFun.getTimestamp()+this.globalData.secondCount;
    let miyao = secretKey.encrypt(data);
    return miyao;
  },
  getSecondCount() { //获取密钥
    let that = this;
    var params  = {
      str: publicFun.getTimestamp(),
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
    var data = publicFun.getTimestamp()+'|'+res.D+'|'+res.H+'|'+res.M+'|'+res.Se;
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
    my.getStorage({
      key: 'zfbUid',
      success: function(res) {
        that.globalData.zfbUid = res.data
      },
    });
  },
  getLocation() { //获取定位信息
    var that = this;
    //my.showLoading();
    my.getLocation({
      cacheTimeout: 1,
      type: 2,
      success(res) {
        //my.hideLoading();
        var location = publicFun.formatLocation(res.longitude, res.latitude);
        that.globalData.location.lng = location.longitude[0]+'.'+location.longitude[1]; //经度
        that.globalData.location.lat = location.latitude[0]+'.'+location.latitude[1]; //纬度
        that.globalData.location.city = res.city;

        //that.globalData.location.lng = res.longitude; 
        //that.globalData.location.lat = res.latitude; 
        that.globalData.location.province = res.province; //省
        //that.globalData.location.city = res.city; //市
        that.globalData.location.district = res.district; //区
        that.globalData.location.address = res.province+res.city+res.district+res.streetNumber.street //地址
        //console.log(that.globalData.location);
      },
      fail() {
        //my.hideLoading();
        my.confirm({
          content: '您需要开启定位服务，来获取您所在位置的天气和空气信息。',
          confirmButtonText: '开启定位',
          cancelButtonText: '以后再说',
          success: (result) => {
            if(result.confirm == true){
              my.openSetting({
                success: (res) => {
                  my.getLocation({
                    cacheTimeout: 1,
                    type: 2,
                    success(res) {
                      
                      var location = publicFun.formatLocation(res.longitude, res.latitude);
                      that.globalData.location.lat = location.latitude[0]+'.'+location.latitude[1];
                      that.globalData.location.lng = location.longitude[0]+'.'+location.longitude[1];

                      that.globalData.location.province = res.province; //省
                      that.globalData.location.city = res.city; //市
                      that.globalData.location.district = res.district; //区
                      that.globalData.location.address = res.province+res.city+res.district+res.streetNumber.street //地址
                      
                    }
                  })
                }
              })
            }
          },
        });
      },
    })
  },
  getSScontent(city, latitude, longitude) {
    let location = this.globalData.location;
    var params  = {
      CityName: location.city ? location.city : city,
      Lat: location.lat ? location.lat : latitude,
      Lng: location.lng ? location.lng : longitude,
    }
    return new Promise((resolve, reject) => {
      publicFun.requestPostApi(publicFun.api.ssContent, params, this, this.successGetContent,resolve);
    })
  },
  successGetContent(res, selfObj, sou, resolve) { //获取默认aqi内容
    selfObj.globalData.aqi = res;
    //console.log(selfObj.globalData.aqi);
    resolve(res);
  },
  getMobileInfo() { //获取手机信息
    let that = this;
    my.getSystemInfo({
      success: (res) => {
        that.globalData.mobileInfo = res.platform === "Android" ? 1 : 2;
      }
    });
  },
});

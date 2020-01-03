const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    protocolStatus: 1, //是否同意协议：1 同意 0 不同意
    //authStatus: 1, //是否授权 1 是 2 否 
    authCode: '',
  },
  onLoad(query) {
    // 页面加载
    //console.log(app.mobileInfo);
    //my.clearStorageSync();
  },
  onReady() {
    // 页面加载完成
  },
  authTap() {
    if(this.data.protocolStatus === 1){
      this.setData({protocolStatus: 0})
    }else{
      this.setData({protocolStatus: 1})
    }
  },
  onGetAuthorize(res) { //授权
    let that = this;
    if(this.data.protocolStatus == 1){
      console.log(111);
      my.getAuthCode({
        scopes: ['auth_base'],
        success: (res) => {
          that.data.authCode = res.authCode;
          console.log(res);
        },
      });
      my.getOpenUserInfo({
        success: (res) => {
          let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
          app.globalData.userInfo = userInfo;
          if(app.globalData.userInfo || userInfo){
            that.LoginTap();
          }
        },
        fail: (res) => {
          console.log(res);
        },
      });
    }else{
      publicFun.showToast("请勾选蔚蓝地图协议")
    }
  },
  onAuthError(res) { //授权失败
    console.log(res);
    publicFun.showToast('授权失败');
  },
  LoginTap() {
    var params  = {
      EmailOrPhone: '',
      Pwd: '',
      NickName: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '蔚蓝',
      Uid: this.data.authCode,
      Flag: 6,
      Type: app.globalData.mobileInfo,
      headurl: app.globalData.userInfo.avatar,
      sex: app.globalData.userInfo.gender === "m" ? 1 : 2,
      WeiXinUnionId: 0
    }
    my.showLoading();
    let data1 = {};
    publicFun.requestPostApi(publicFun.api.LoginAccount, params, this, this.successLogin, data1, this.failLogin);
  },
  successLogin(res, selfObj) {
    //console.log(res);
    if(res.S == 1){
      publicFun.showToast(res.M);
      app.globalData.userid = res.R;
      my.setStorage({
        key: 'userid',
        data: res.R
      }); 
      my.reLaunch({
        url: '/pages/index/index'
      });
      // if(res.isneedphone == 1){ 
      //   my.navigateTo({
      //     url: '/pages/loginBind/loginBind?userid='+res.R
      //   });
      // }else{
      //   publicFun.showToast(res.M);
      //   app.globalData.userid = res.R;
      //   my.setStorage({
      //     key: 'userid',
      //     data: res.R
      //   }); 
      //   my.reLaunch({
      //     url: '/pages/index/index'
      //   });
      // }
    } else {
      publicFun.showToast(res.M);
    }
  },
  failLogin(res, selfObj) {
    selfObj.LoginTap();
  },
  mobileLogin() { //手机号登录/注册
    my.navigateTo({
      url: '/pages/loginAccount/loginAccount'
    });
  },
  blueMapTap() { //协议
    my.navigateTo({
      url: '/pages/blueMap/blueMap'
    });
  },
});


const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    protocolStatus: 1, //是否同意协议：1 同意 0 不同意
    //authStatus: 1, //是否授权 1 是 2 否 
    authCode: '',
    loginType: null,
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
    this.getAuthorize();
    this.setData({loginType: 0});
  },
  onGetAuthorizeMobile(res) { //手机号登录/注册
    this.getAuthorize();
    this.setData({loginType: 1});
  },
  onAuthError(res) { //授权失败
    publicFun.showToast('授权失败');
  },
  getAuthorize() {
    let that = this;
    my.showLoading();
    if(this.data.protocolStatus == 1){
      my.getAuthCode({
        scopes: ['auth_base'],
        success: (res) => {
          //console.log(res);
          if(res.authCode){
            that.setData({
              authCode: res.authCode
            });
            my.getOpenUserInfo({
              success: (ress) => {
                // 以下方的报文格式解析两层 response
                let userInfo = JSON.parse(ress.response).response; 
                app.globalData.userInfo = userInfo;
                if(app.globalData.userInfo || userInfo){
                  if(app.globalData.secondCount){
                    that.LoginTap();
                  }else{
                    app.getSecondCount().then(res => {
                      that.LoginTap();
                    });
                  }
                }else{
                  publicFun.showToast('获取用户信息失败，请重新授权');
                }
              },
              fail: (resss) => {
                console.log(resss);
                publicFun.showToast('获取用户信息失败，请重新授权');
              },
            });
          }
        },
        fail: (err) => {
          console.log(err);
          publicFun.showToast('获取授权码失败，请重新授权');
        }
      });
    }else{
      publicFun.showToast("请勾选蔚蓝地图协议")
    }
  },
  LoginTap() {
    let data = {
      authorization_code: "authorization_code",
      zhifubaoCode: this.data.authCode,
      refreshtoken: "",
      //miyao: app.getMiyao()
    }
    publicFun.requestPostApi(publicFun.api.getAuthCode, data, this, this.successAuthCode);
  },
  successAuthCode(res, selfObj) {
    if(res.S == 1 && selfObj.data.loginType == 0){
      app.globalData.zfbUid = res.UserInfo.user_id;
      var params  = {
        EmailOrPhone: '',
        Pwd: '',
        NickName: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '蔚蓝',
        Uid: res.UserInfo.user_id,
        Flag: 6,
        Type: app.globalData.mobileInfo,
        headurl: app.globalData.userInfo.avatar ? app.globalData.userInfo.avatar : '',
        sex: app.globalData.userInfo.gender === "m" ? 1 : 2,
        WeiXinUnionId: 0
      }
      //my.showLoading();
      let data1 = {};
      publicFun.requestPostApi(publicFun.api.LoginAccount, params, selfObj, selfObj.successLogin, data1, selfObj.failLogin);
    } else if(res.S == 1 && selfObj.data.loginType == 1){
        app.globalData.zfbUid = res.UserInfo.user_id;
        my.setStorage({
          key: 'zfbUid',
          data: res.UserInfo.user_id
        });
        my.navigateTo({
          //url: '/pages/loginAccount/loginAccount'
          url: '/pages/loginQuick/loginQuick?zfbUid='+res.UserInfo.user_id
        });
    }else{
      publicFun.showToast(res.M);
    }
  },
  successLogin(res, selfObj) {
    console.log(res);
    my.hideLoading();
    if(res.S == 1){
      if(res.isneedphone == 0){
        publicFun.showToast(res.M);
        app.globalData.userid = res.R;
        my.setStorage({
          key: 'userid',
          data: res.R
        }); 
        my.setStorage({
          key: 'zfbUid',
          data: app.globalData.zfbUid
        });
        my.reLaunch({
          url: '/pages/index/index'
        });
      }else{
        my.navigateTo({
          url: '/pages/loginBind/loginBind?userid='+res.R
        });
      }
    } else {
      publicFun.showToast(res.M);
    }
  },
  failLogin(res, selfObj) {
    selfObj.LoginTap();
  },
  blueMapTap() { //协议
    my.navigateTo({
      url: '/pages/blueMap/blueMap'
    });
  },
});


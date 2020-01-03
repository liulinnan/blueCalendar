const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    account: '', // 账号
    pwd: '', // 密码
    disabled: false, // 是否可以登录
    authCode: '', //uid
  },
  onLoad() {
  },
  onAccountInput(e) { //账号
    //console.log(e.detail.value);
    this.setData({
      account: e.detail.value
    })
  },
  onPwdInput(e) { //密码
    this.setData({
      pwd: e.detail.value
    })
  },
  onGetAuthorize() { //登录
    var that = this;
    if(!that.data.authCode){
      my.getAuthCode({
        scopes: ['auth_base'],
        success: (res) => {
          that.data.authCode = res.authCode;
        },
      });
      my.getOpenUserInfo({
        success: (res) => {
          let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
          app.globalData.userInfo = userInfo;
          that.LoginTap();
        },
      });
    }else{
      this.LoginTap();
    }
  },
  LoginTap() {
    var params  = {
      EmailOrPhone: this.data.account,
      Pwd: this.data.pwd,
      NickName: '',
      Uid: '',
      Flag: 0,
      Type: app.globalData.mobileInfo,
      headurl: '',
      sex: 0,
      WeiXinUnionId: ''
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.LoginAccount, params, this, this.successLogin);
  },
  successLogin(res, selfObj) {
    if(res.S == 1){
      if(res.isneedphone == 1){ //绑定手机号
        my.navigateTo({
          url: '/pages/loginBind/loginBind?userid='+res.R
        });
      }else{
        publicFun.showToast(res.M);
        app.globalData.userid = res.R;
        my.setStorage({
          key: 'userid',
          data: res.R
        }); 
        my.reLaunch({
          url: '/pages/index/index' //15301188573
        });
      }
    } else {
      publicFun.showToast(res.M);
    }
  },
  onAuthError(res) { //授权失败
    publicFun.showToast('授权失败');
  },
  forgetPwd() {
    my.navigateTo({
      url: '/pages/forgetPwd/forgetPwd'
    })
  },
});

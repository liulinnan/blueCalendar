const publicFun = require('/utils/public.js');
Page({
  data: {
    mobile: '', // 手机号
    code: '', // 手机验证码input内容
    pwd1: '', // 密码1
    pwd2: '', // 密码2
    disabled: false,// 是否可以编辑手机号
  },
  onLoad() {},
   onSendCode(object) {
     this.setData({ mobile: object.mobile }); 
    if(object.mobile){
      var params  = {
        EmailOrPhone: object.mobile,
        type: 2 //1Email 2电话
      }
      publicFun.requestPostApi(publicFun.api.forgetSendCode, params, this, this.successCode);
      this.setData({ mobile: object.mobile }); 
    }
  },
  successCode(res, selfObj) {
    publicFun.showToast(res.M)
  },
  onCodeInput(e) {
    const { value } = e.detail;
    this.setData({ code: value });
  },
  onPwd1Input(e) { //账号
    this.setData({
      pwd1: e.detail.value
    })
  },
  onPwd2Input(e) { //密码
    this.setData({
      pwd2: e.detail.value
    });
  },
  bindTap() {
    if(this.data.pwd1 == this.data.pwd2){
      var params  = {
        EmailOrPhone: this.data.mobile,
        Code: this.data.code,
        type: 2, //1Email 2电话
        NewPwd: this.data.pwd2
      }
      my.showLoading();
      publicFun.requestPostApi(publicFun.api.forgetSuccess, params, this, this.successPassword);
    }else{
      publicFun.showToast('两次密码输入不一致！')
    }
  },
  successPassword(res, selfObj) {
    if(res.S == 1){
      publicFun.showToast(res.M)
      my.redirectTo({url: '/pages/loginAccount/loginAccount'});
    }
  }
});

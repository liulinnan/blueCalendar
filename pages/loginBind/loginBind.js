const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    mobile: '', // 手机号
    code: '', // 手机验证码input内容
    disabled: false,// 是否可以编辑手机号
    userid: '',
  },
  onLoad(options) {
    console.log(app.globalData.userInfo)
    this.setData({
      userid: options.userid
    })
  },
  /**
   * 点击发送验证码触发的事件
   * @method onSendCode
   * @param {object} object 组件传递参数,包含手机号
   */
  onSendCode(object) {
    if(object.mobile){
      var params  = {
          Phone: object.mobile,
          UserId: this.data.userid
      }
      // my.showLoading();
      publicFun.requestPostApi(publicFun.api.sendCode, params, this, this.successCode);
      this.setData({ mobile: object.mobile }); 
    }
  },
  successCode(res, selfObj) {
    console.log(res)
    publicFun.showToast(res.M)
  },
  /**
   * 输入验证码触发的事件
   * @method onCodeInput
   * @param {*} e
   */
  onCodeInput(e) {
    const { value } = e.detail;
    this.setData({ code: value });
  },
  /**
   * 点击提交触发的事件
   * @method bindTap
   */
  bindTap() {
    var params  = {
      UserId: this.data.userid,
      Phone: this.data.mobile,
      Code: this.data.code,
      //Type: app.globalData.mobileInfo
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.bindMobile, params, this, this.successBind);
  },
  successBind(res, selfObj) {
    if(res.S == 1){ //绑定
      publicFun.showToast('绑定成功');
      app.globalData.userid = selfObj.data.userid;
      my.setStorage({
        key: 'userid',
        data: selfObj.data.userid
      }); 
      my.switchTab({
        url: '/pages/index/index'
      });
    }else if(res.S == 2){ //合并
      selfObj.mergeAccount(res.fId);
    } else {
      publicFun.showToast(res.M);
    }
  },
  mergeAccount(FUserId) {
    publicFun.showToast('正在合并数据');
    let params = {
      UserId: FUserId,
      FUserId: this.data.userid,
      Phone: this.data.mobile,
      Code: this.data.code,
    }
    console.log(params);
    publicFun.requestPostApi(publicFun.api.mergeAccount, params, this, this.successMerge);

  },
  successMerge(res, selfObj) {
    if(res.S == 1)  {
      //publicFun.showToast(res.M);
      my.showLoading();
      let params  = {
        Phone: selfObj.data.mobile,
        Code: selfObj.data.code,
        Type: app.globalData.mobileInfo
      }
      publicFun.requestPostApi(publicFun.api.quickLogin, params, selfObj, selfObj.quickLogin);
    }else{
      publicFun.showToast(res.M);
    }
  },
  quickLogin(res, selfObj) {
    if(res.S == 1){
      publicFun.showToast('合并成功');
      app.globalData.userid = res.R;
      my.setStorage({
        key: 'userid',
        data: res.R
      }); 
      my.switchTab({
        url: '/pages/index/index'
      });
    } else {
      publicFun.showToast(res.M);
    }
  },
  jumpIndex() { //跳过
    app.globalData.userid = this.data.userid;
    my.setStorage({
      key: 'userid',
      data: this.data.userid
    }); 
    my.switchTab({
      url: '/pages/index/index'
    });
  },
});

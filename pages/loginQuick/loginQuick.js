const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    mobile: '', // 手机号
    code: '', // 手机验证码input内容
    disabled: false,// 是否可以编辑手机号
  },
  onLoad(options) {
    let that = this;
    console.log(options.zfbUid);
    my.getStorage({
      key: 'phone',
      success: function(res) {
        if(res.data){
          that.setData({
            mobile: Number(res.data)
          })
        }
      },
    });
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
          Type: app.globalData.mobileInfo
      }
      // my.showLoading();
      publicFun.requestPostApi(publicFun.api.quickLoginCode, params, this, this.successCode);
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
      Phone: this.data.mobile,
      Code: this.data.code,
      Type: app.globalData.mobileInfo
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.quickLogin, params, this, this.successBind);
  },
  successBind(res, selfObj) {
    if(res.S == 1){
      publicFun.showToast('登录成功');
      app.globalData.userid = res.R;
      my.setStorage({
        key: 'userid',
        data: res.R
      }); 
      my.setStorage({
        key: 'phone',
        data: selfObj.data.mobile
      });
      my.switchTab({
        url: '/pages/index/index'
      });
    } else {
      publicFun.showToast(res.M);
    }
  }
});

const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    textareaVal: '',
    disabled: false
  },
  onLoad() {},
  onTextareaInput(e) {
    this.setData({
      textareaVal: e.detail.value
    })
  },
  bindFormSubmit() {
    if(this.data.textareaVal) {
      var params = {
        UserId: app.globalData.userid,
        Message: this.data.textareaVal
      }
      my.showLoading();
      publicFun.requestPostApi(publicFun.api.userFeedBack, params, this, this.successUserFeedBack);
    }else{
      my.showToast({
        content: '请填写建议', // 文字内容
      });
    }
  },
  successUserFeedBack(res, selfObj) {
    console.log(res);
    if(res.S == 1){
      my.showToast({
        type: 'none',
        content: res.M,
        duration: 2000,
        success: () => {
          my.switchTab({
            url: '/pages/my/my'
          }); 
        },
      });
      selfObj.setData({
        textareaVal: ''
      });
    }else{
      publicFun.showToast(res.M);
    }
  },
});

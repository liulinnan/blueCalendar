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
  bindFormSubmit(e) {
    var params = {
      UserId: app.globalData.userid,
      Message: this.data.textareaVal
    }
    publicFun.requestPostApi(publicFun.api.userFeedBack, params, this, this.successUserFeedBack);
  },
  successUserFeedBack(res, selfObj) {
    console.log(res);
    if(res.S == 1){
      publicFun.showToast(res.M);
      selfObj.setData({
        textareaVal: ''
      })
    }else{
      publicFun.showToast(res.M);
    }
  },
});

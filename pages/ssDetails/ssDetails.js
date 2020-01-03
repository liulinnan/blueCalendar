const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    optionsData: {}
  },
  onLoad(options) {
    if(options.follow == 1){  //点击关注
      this.setData({
        optionsData: {
          ssUserId: options.ssUserId,
          type: options.type,
          follow: 1,
        }
      })
    }else{
      this.setData({
        optionsData: {
          ssId: options.ssId,
          //ssUserId: options.ssUserId,
          type: options.type
        }
      })
    }
  }
})
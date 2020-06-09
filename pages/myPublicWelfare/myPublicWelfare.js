const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    threeHours: 0
  },
  onLoad(options) {
    //console.log(options);
    // if(options.threeHours) {
    //   this.setData({
    //     threeHours: options.threeHours
    //   })
    // }
    this.getThreeHours();
  },
  jumpThreeHours() {
    my.navigateToMiniProgram({
      appId: '2019052265312523',
      path: 'pages/index/index',
      success: (res) => {
        console.log(JSON.stringify(res))
      },
      fail: (res) => {
        console.log(JSON.stringify(res))
      }
    });
  },
  getThreeHours() {
    var params  = {
      Uid: app.globalData.zfbUid, //支付宝id
    }
    //console.log(params);
    publicFun.requestPostApi(publicFun.api.getThreeHours, params, this, this.successThreeHours);
  },
  successThreeHours(res, selfObj) {
    if(res.S == 1){
      selfObj.setData({
        threeHours: publicFun.formatSeconds(res.D.data)
      })
    }
  }
});

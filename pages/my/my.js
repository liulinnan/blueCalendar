const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    userData: {},
    threeHours: 0,
    //tabbar
    tabbar: {},
  },
  onLoad() {
    app.editTabbar();
    if(app.globalData.userid){
      this.getUserData();
      this.getThreeHours();
    }else{
      my.redirectTo({
        url: '/pages/login/login',
      });
    }
  },
  getUserData() {
    var params  = {
      Uid: app.globalData.userid
    }
    //my.showLoading();
    publicFun.requestPostApi(publicFun.api.userData, params, this, this.successUser);
  },
  successUser(res, selfObj) {
    if(res.IsSuccess == 1) {
      let data = {
        Url: res.Url,
        UserName: res.UserName
      }
      selfObj.setData({
        userData: data
      });
      if(res.isdeleted == 1){
        selfObj.signOut();
      }
    }
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
  seeYL() {
    //publicFun.showToast("此功能暂未开放，待完成和阿里公益时对接后方可使用,您可以去蔚蓝地图App进行月历的制作。", 5000)
    my.navigateTo({
      url: '../myCalendarDetails/myCalendarDetails'
    });
  },
  activityShot() {
    my.navigateTo({
      url: '../myActivityShot/myActivityShot'
    });
  },
  auditResult() {
    my.navigateTo({
      url: '../myAuditResult/myAuditResult'
    });
  },
  myDynamic() {
    my.navigateTo({
      url: '../myDynamic/myDynamic'
    });
  },
  myCalendarList() {
    my.navigateTo({
      url: '../myCalendarList/myCalendarList'
    });
  },
  myFeedback() {
    my.navigateTo({
      url: '../myFeedback/myFeedback'
    })
  },
  publicWelfare() {
    my.navigateTo({
      url: '../myPublicWelfare/myPublicWelfare?threeHours='+this.data.threeHours
    });
  },
  signOut() {
    my.clearStorage();
    app.globalData.userid = '';
    app.globalData.zfbUid = '';
    my.redirectTo({
      url: '/pages/login/login',
    });
  },
  getThreeHours() {
    if(app.globalData.zfbUid) {
      var params  = {
        Uid: app.globalData.zfbUid, //支付宝id
      }
      //console.log(params);
      publicFun.requestPostApi(publicFun.api.getThreeHours, params, this, this.successThreeHours);
    }else{
      this.getAuthorize();
    }
  },
  successThreeHours(res, selfObj) {
    if(res.S == 1){
      selfObj.setData({
        threeHours: publicFun.formatSeconds(res.D.data)
      })
    }
  },
  getAuthorize() {
    let that = this;
    my.getAuthCode({
      scopes: ['auth_base'],
      success: (res) => {
        //console.log(res);
        if(res.authCode){
          let data = {
            authorization_code: "authorization_code",
            zhifubaoCode: res.authCode,
            refreshtoken: ""
          }
          publicFun.requestPostApi(publicFun.api.getAuthCode, data, this, this.successAuthCode);
        }
      },
      fail: (resss) => {
        console.log(resss);
        that.signOut();
      },
    });
  },
  successAuthCode(res, selfObj) {
    console.log(res);
    if(res.S == 1){
      app.globalData.zfbUid = res.UserInfo.user_id;
      my.setStorage({
        key: 'zfbUid',
        data: res.UserInfo.user_id
      });
      selfObj.getThreeHours();
    }
  }
});

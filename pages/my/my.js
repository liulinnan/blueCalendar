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
    app.hidetabbar();
    if(app.globalData.userid){
      this.getUserData();
      this.getThreeHours();
      this.setData({
        userid: app.globalData.userid
      })
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
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myCalendarDetails/myCalendarDetails'
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  activityShot() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myActivityShot/myActivityShot'
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  auditResult() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myAuditResult/myAuditResult'
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  myDynamic() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myDynamic/myDynamic'
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  myCalendarList() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myCalendarList/myCalendarList'
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  myFeedback() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myFeedback/myFeedback'
      })
    }else{
      publicFun.jumpLogin();
    }
  },
  publicWelfare() {
    if(app.globalData.userid){
      my.navigateTo({
        url: '../myPublicWelfare/myPublicWelfare?threeHours='+this.data.threeHours
      });
    }else{
      publicFun.jumpLogin();
    }
  },
  signOut() {
    //my.clearStorage();
    my.removeStorage({key: 'userid'});
    my.removeStorage({key: 'zfbUid'});
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

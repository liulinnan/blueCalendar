const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    userData: {}
  },
  onLoad() {
    if(app.globalData.userid){
      this.getUserData();
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
    let data = {
      Url: res.Url,
      UserName: res.UserName
    }
    selfObj.setData({
      userData: data
    })
  },
  seeYL() {
    publicFun.showToast("此功能暂未开放，待完成和阿里公益时对接后方可使用,您可以去蔚蓝地图App进行月历的制作。", 5000)
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
  myFeedback() {
    my.navigateTo({
      url: '../myFeedback/myFeedback'
    })
  },
  publicWelfare() {
    my.navigateTo({
      url: '../myPublicWelfare/myPublicWelfare'
    });
  },
  signOut() {
    my.clearStorage();
    app.globalData.userid = '';
    my.redirectTo({
      url: '/pages/login/login',
    });
  }
});

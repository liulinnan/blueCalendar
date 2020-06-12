const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    feedbackList: [],
    pageindex: 1,
  },
  onLoad() {
    this.feedBackList(this.data.pageindex);
  },
  feedBackList(pageindex) {
    my.showLoading();
    let params = {
      UserId: app.globalData.userid ? app.globalData.userid : 0,
      PageIndex: pageindex,
    }
    publicFun.requestGetApi(publicFun.api.userFeedBackList, params, this, this.successFeedBackList);
  },
  successFeedBackList(res, selfObj) {
    if(res.S == 1){
      res.L.forEach((item) => {   
        selfObj.data.feedbackList.push(item);
      });
      selfObj.setData({
        feedbackList: selfObj.data.feedbackList
      })
    }
  },
  scrollMytrip() { //上拉加载
    try {
      //const { pageindex } = this.data;
      const newPage = this.data.pageindex + 1;
      this.feedBackList(newPage);
      this.setData({pageindex: newPage});
    } catch (e) {
      my.hideLoading();
      console.log('scrollMytrip执行异常:', e);
    }
  },
});

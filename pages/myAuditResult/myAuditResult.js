const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    //pageindex: 1,
    auditList: []//0正在审核 1成功 2失败  
  },
  onLoad() {
    this.getSSAudit();
  },
  getSSAudit(){
    this.setData({
      auditList: [] 
    })
    var params  = {
      userid: app.globalData.userid,
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.ssAudit, params, this, this.successSSAudit);
  },
  successSSAudit(res, selfObj) {
    res.L.forEach((item) => {   
      selfObj.data.auditList.push(item);
    });
    selfObj.setData({
      //ssKey: res.Key,
      auditList: selfObj.data.auditList
    });
  },
  // scrollMytrip() {
  //   try {
  //       //const { pageindex } = this.data;
  //       const newPage = this.data.pageindex + 1;
  //       this.getSSAudit(newPage);
  //       this.setData({pageindex: newPage});
  //     } catch (e) {
  //       my.hideLoading();
  //       console.log('scrollMytrip执行异常:', e);
  //     }
  // },
});

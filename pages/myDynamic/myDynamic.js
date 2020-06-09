const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    pageindex: 1,
    type: 1,
    dynamicList: [],
    userName: '',
    detailsComment: '',
    commentDetails: {},
    focusKeyboard: false
  },
  onLoad() {
    this.getMyDynamic(this.data.pageindex);
  },
  getMyDynamic(pageindex){
    var params  = {
      userid: app.globalData.userid,
      isread: 2,
      pageindex: pageindex,
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.myDynamic, params, this, this.successMyDynamic);
  },
  successMyDynamic(res, selfObj) {
    res.L.forEach((dyItem) => {   
      selfObj.data.dynamicList.push(dyItem);
    });
    selfObj.setData({
      //ssKey: res.Key,
      dynamicList: selfObj.data.dynamicList
    });
  },
  commentUserData(e) {//获取点击的某个要回复用户的信息
    let data = e.target.dataset;
    //console.log(data);
    var ids = {
      wallid: data.wallid,
      parentid: data.parentid,
      parentuserid: data.parentuserid,
      rootid: data.rootid,
      name: data.name
    }
    this.setData({
      focusKeyboard: true,
      commentDetails: ids,
      userName: '回复：'+ data.name
    });
  },
  getCommentVal(e) { //获取框里的内容
    this.setData({
      detailsComment: e.detail.value
    })
  },
  commentListSub() { //评论单个提交
    if(app.globalData.userid){
      if(this.data.detailsComment){
        let params = {
          content: this.data.detailsComment,
        }
        publicFun.requestPostApi(publicFun.api.getriskContent, params, this, this.successRiskContentAlone);
        // let params = {
        //   userid: app.globalData.userid, //login id
        //   dt: publicFun.getTimestamp(), //time
        //   wallid: this.data.commentDetails.wallid, //ss id
        //   parentid: this.data.commentDetails.parentid, //评论id
        //   parentuserid: this.data.commentDetails.parentuserid, //被留言id
        //   Content: this.data.detailsComment, //内容
        //   rootid: this.data.commentDetails.rootid, // 首次评论 0 
        // }
        // publicFun.requestPostApi(publicFun.api.commentSub, params, this, this.successCommentDetaile);
      }else{
        publicFun.showToast("请输入评论内容")
      }
    }else{
      publicFun.jumpLogin();
    }
  },
  successRiskContentAlone(res, selfObj) {
    if(res.S == 1) {
      if(res.D.action == 'PASSED') {
        let params = {
          userid: app.globalData.userid, //login id
          dt: publicFun.getTimestamp(), //time
          wallid: selfObj.data.commentDetails.wallid, //ss id
          parentid: selfObj.data.commentDetails.parentid ? selfObj.data.commentDetails.parentid : 0, //评论id
          parentuserid: selfObj.data.commentDetails.parentuserid, //被留言id
          Content: selfObj.data.detailsComment, //内容
          rootid: selfObj.data.commentDetails.rootid ? selfObj.data.commentDetails.rootid : 0, // 首次评论 0 
        }
        publicFun.requestPostApi(publicFun.api.commentSub, params, selfObj, selfObj.successCommentDetaile);
      }else{
        setTimeout(function () {
          publicFun.showToast("您输入的内容涉及敏感词汇，请重新输入。", 2000);
          selfObj.setData({
            detailsComment: ''
          });
        }, 300)
      }
    }
  },
  successCommentDetaile(res, selfObj) {
    if(res.S == 1){
      setTimeout(function () {
        publicFun.showToast("提交成功", 2000);
      }, 300);
      selfObj.setData({
        detailsComment: '',
        commentDetails: {},
        userName: '',
        focusKeyboard: false
      });
    }
  },
  jumpDetails(e) {
    my.navigateTo({ 
      url: '../ssDetails/ssDetails?ssId='+ e.target.dataset.ssId+'&type='+this.data.type
    });
  },
  scrollMytrip() { //上拉加载
    try {
        //const { pageindex } = this.data;
        const newPage = this.data.pageindex + 1;
        this.getMyDynamic(newPage);
        this.setData({pageindex: newPage});
      } catch (e) {
        my.hideLoading();
        console.log('scrollMytrip执行异常:', e);
      }
  },
});

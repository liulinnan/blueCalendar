const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    loginState: '', //0 未登录 1已登录
    searchVal: '', //搜索框
    winHeight:"",//窗口高度
    currentTab: 1, //预设当前项的值
    scrollLeft:0, //tab标题的滚动条位置
    tabs: [ //sstab //关注300 推荐400 实景1 人物3 水质8 花草7 美食6 污染2 萌宠4
      ["300", "关注", "0"],
      ["400", "推荐", "0"],
      ["1", "实景", "0"],
      ["3", "人物", "0"],
      ["8", "水质", "0"],
      ["7", "花草", "0"],
      ["6", "美食", "0"],
      ["2", "污染", "0"],
      ["4", "萌宠", "0"]
    ], 
    activeTab: 1, //选中tab
    ssKey: '', //数据缓存
    ssType: 400,
    pageindex: 1, //下拉加载页数
    ssList: [],
    followUserState: false, //是否关注好友数量
    followList: [], //关注列表
    followLength: 0,//关注数量
    ssDetailsList: [1,2,3], //关注晒晒列表
    optionsData: {},//详情
    ssId: '',
    parentuserid: '', //被评论id
    commentId: '', //评论当前ssid
    commentIndex: 1, //评论下拉页数
    commentNumber: 0, //评论数量
    listComment: '', //列表评论内容
    detailsComment: '', //全部评论单个内容
    commentDetails: {},
    showAllTap: false, //是否显示全部评论标签
    userName: '喜欢就评论一下吧',
    //focusKeyboard: false, //键盘谈起
    showInput: false, //控制输入栏
    followList: [], //关注列表
    followLength: 0,//关注数量
  },
  onLoad() {
    //my.navigateTo({url:'/pages/loginBind/loginBind'});
    var that = this; 
    my.getSystemInfo( { // 高度自适应
      success ( res ) { 
        var clientHeight=res.windowHeight,
        clientWidth=res.windowWidth,
        rpxR=750/clientWidth;
        var calc=clientHeight*rpxR-180;
        that.setData( { 
          winHeight: calc 
        }); 
      } 
    });
    if(app.globalData.secondCount){
      //this.getSSTab();
      this.getSSList(this.data.ssType, this.data.pageindex);
    }else{
      app.getSecondCount().then(res => {
        //this.getSSTab();
        this.getSSList(this.data.ssType, this.data.pageindex);
      });
    }
  },
  onShow:function(e){
    if(app.globalData.tabPage == 1){
      this.setData({
        ssType: 1,
        ssList: [],
        currentTab: 2
      });
      this.getSSList(1, 0);
    }
  },
  onPullDownRefresh() { //下拉刷新
    console.log(this.data.ssType)
    this.setData({
      followList: [],
      ssList: []
    })
    if(this.data.ssType == 300){
      this.getFollowList();
      this.getSSList(this.data.ssType, 1);
    }else{
      this.getSSList(this.data.ssType, 1);
    }
  },
  // 点击标题切换当前页时改变样式
  swichNav(e) {
    app.globalData.tabPage = 0;
    this.checkCor();  
    var cur = e.target.dataset;
    this.setData({
      currentTab: cur.current,
      ssList: [],
      followList: [],    
      ssType: cur.id, //ssTab id
      loginState: app.globalData.userid,
    })
    if(cur.current > 0){
       this.getSSList(cur.id, this.data.pageindex);
    }
    if(cur.current == 0 && app.globalData.userid){
      //my.showLoading();
      this.getFollowList();
      //this.getSSTab();
      this.getSSList(this.data.ssType, this.data.pageindex);
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor() {
    if (this.data.currentTab>4){
      this.setData({
        scrollLeft: 100
      })
    }else{
      this.setData({
        scrollLeft:0
      })
    }
  },
  handleInput(value) {
    this.setData({
      value,
    });
  },
  handleClear(value) {
    this.setData({
      value: '',
    });
  },
  handleFocus() {},
  handleBlur() {},
  handleCancel() {
    this.setData({
      value: '',
    });
  },
  handleSubmit(value) {
    my.alert({
      content: value,
    });
  },

  followAll(e) { ////跳转关注列表
    if(e.target.dataset.id === 'all'){ 
      my.navigateTo({
        url: '../followList/followList'
      });
    }else{ //关注的人详情 
      my.navigateTo({ 
        url: '../ssDetails/ssDetails?follow=1&ssUserId='+ e.target.dataset.ssUserId+'&type='+this.data.ssType
      });
    }
  },
  getFollowList() { //获取关注列表
    var params  = {
      userid: app.globalData.userid
    }
    //my.showLoading();
    publicFun.requestPostApi(publicFun.api.followList, params, this, this.successFollow);
  },
  successFollow(res, selfObj) {
    //console.log(res.L);
    if(res.L.length > 3){
      for(let i=0;i<3;i++){
        selfObj.data.followList.push(res.L[i]);
      }
      selfObj.setData({followUserState: false})
    }else if(res.L.length == 0){
      selfObj.setData({followUserState: true})
    }else{
      res.L.forEach((followItem) => {
        selfObj.data.followList.push(followItem);
      });
      selfObj.setData({followUserState: false})
    }
    //selfObj.data.followList.push(["", "全部", "/images/ss-all.png"])
    selfObj.setData({
      followList: selfObj.data.followList,
      followLength: res.L.length,
    });
  },

  getSSTab() { //获取ss tab
    let params = {
      userid: app.globalData.userid ? app.globalData.userid : 0,
    }
    //publicFun.requestGetApi(publicFun.api.ssTab, params, this, this.successTab);
  },
  successTab(res, selfObj) { //获取成功返回的tab list
    var resList = [];
    resList.push({
      value: res.L[res.L.length-1][0],
      title: res.L[res.L.length-1][1]
    });
    for(var i=1;i<res.L.length-1;i++){
      resList.push({
        value: res.L[i][0],
        title: res.L[i][1]
      });
    }
    console.log(res);
    selfObj.setData({
      activeTab: app.globalData.userid ? Number(res.X) : 1,
      tabs: resList
    })
    //selfObj.getSSList(selfObj.data.ssType, selfObj.data.pageindex);
  },

  getSSList(type, pageindex) { //获取晒晒列表
    //console.log(type, pageindex);
    //my.showLoading();
    let params = {
      sorttype: 2,
      pagesize: 10,
      pageindex: pageindex,
      lat: 0,
      lng: 0,
      userid: 0,
      duserid: app.globalData.userid ? app.globalData.userid : 0,
      type: type,
      cityid: 0,
      area: '',
      keyword: '',
      typelabelid: 0,
      isindex: 0,
      ismanypics: type == 300 ? 1 : 0,
      lastid: 0,
      islabel: type == 300 ? 1 : 0,
    }
    publicFun.requestPostApi(publicFun.api.ssList, params, this, this.successList);
  },
  successList(res, selfObj) { //晒晒成功后返回参数
    res.L.forEach((ssItem) => {
      selfObj.data.ssList.push(ssItem);
    });
    selfObj.setData({
      ssKey: res.Key,
      ssList: selfObj.data.ssList
    });
    my.stopPullDownRefresh({
      complete(res) {
        console.log("刷新成功");
      }
    })
  },

  /* 关注 */
  followState(e) { //关注状态
    let data = e.target.dataset;
    let params  = {
      userid: app.globalData.userid,
      otheruserid: data.otheruserid
    }
    if(data.state == 1){
      this.unfollowTap(params, data.index);
    }else{
      this.followTap(params, data.index);
    }
  },
  followTap(params, item) { //关注
    publicFun.requestPostApi(publicFun.api.follow, params, this, this.successFollowTap, item);
  },
  successFollowTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.ssList[dataParams][27] = 1;
    selfObj.setData({
      ssList: selfObj.data.ssList
    });
  },
  unfollowTap(params, index) { //取消关注
    publicFun.requestPostApi(publicFun.api.unfollow, params, this, this.successUnfollowTap, index);
  },
  successUnfollowTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.ssList[dataParams][27] = 0;
    selfObj.setData({
      ssList: selfObj.data.ssList
    });
  },

  getLikeState(e) { //是否赞过
    if(app.globalData.userid){
      let data = e.target.dataset;
      let params  = {
        userid: app.globalData.userid,
        dt: app.getTimestamp(),
        wallid: data.ssId
      }
      if(data.state == 1){
        this.unlikeTap(params, data.index);
      }else{
        this.likeTap(params, data.index);
      }
    }else{
      publicFun.jumpLogin();
    }
  },
  likeTap(params, index) { //点赞
    publicFun.requestPostApi(publicFun.api.like, params, this, this.successLikeTap, index);
  },
  successLikeTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.ssList[dataParams][12] = 1;
    selfObj.data.ssList[dataParams][7] = Number(selfObj.data.ssList[dataParams][7])+1;
    selfObj.setData({
      ssList: selfObj.data.ssList
    });
  },

  unlikeTap(params, index) { //取消点赞
    publicFun.requestPostApi(publicFun.api.unlike, params, this, this.successUnlikeTap, index);
  },
  successUnlikeTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.ssList[dataParams][12] = 0;
    selfObj.data.ssList[dataParams][7] = Number(selfObj.data.ssList[dataParams][7])-1;
    selfObj.setData({
      ssList: selfObj.data.ssList
    });
  },

     /* 评论 */
  commentSub(e) { //是否可评论
    let data = e.target.dataset;
    this.setData({
      listComment: e.detail.value
    })
    if(app.globalData.userid){
      let params = {
        userid: app.globalData.userid, //login id
        dt: app.getTimestamp(), //time
        wallid: data.ssId, //ss id
        parentid: 0, //评论id
        parentuserid: data.ssUserId, //被留言id
        Content: this.data.listComment, //内容
        rootid: 0, // 首次评论 0 
      }
      my.showLoading();
      publicFun.requestPostApi(publicFun.api.commentSub, params, this, this.successComment, data.index);
    }else{
      publicFun.jumpLogin();
    }
  },
  successComment(res, selfObj, sourceObj, dataParams) {
    if(res.S == 1){
      publicFun.showToast("提交成功", 2000);
      selfObj.data.ssList[dataParams][9] = Number(selfObj.data.ssList[dataParams][9])+1;
      selfObj.setData({
        ssList: selfObj.data.ssList,
        listComment: ''
      });
    }
  },
  openComment(e) { //打开全部评论列表
    //console.log(e.target.dataset)
    if(app.globalData.userid){
      this.setData({
        commentList: [],
        commentIndex: 1,
        commentNumber: 0,
        showAllTap: false,
        alertState: true, //全部评论弹窗
        showInput: true, // input输入评论框
        //focusKeyboard: false,
        userName: '喜欢就评论一下吧',
        ssId: e.target.dataset.ssId,
        parentuserid: e.target.dataset.parentuserid
      });
      this.getAllComment(e.target.dataset.ssId,this.data.commentIndex);
    }else{
      publicFun.jumpLogin();
    }
  },
  getAllComment(ssId,commentIndex) {//获取全部评论
    let params = {
      id: ssId,
      pageindex: commentIndex
    }
    publicFun.requestPostApi(publicFun.api.commentAllList, params, this, this.successCommentList);
  },
  successCommentList(res, selfObj) { 
    //console.log(res);
    if(res.L.length > 0){
      res.L.forEach((item) => {   
        selfObj.data.commentList.push(item);
      });
      selfObj.setData({
        commentNumber: res.CC,
        commentList: selfObj.data.commentList
      });
    }else{
      selfObj.setData({
        showAllTap: true
      })
    }
  }, 
  getCommentVal(e) { //获取框里的内容
    this.setData({
      detailsComment: e.detail.value
    })
  },
  commentUserData(e) { //获取点击的某个要回复用户的信息
    let data = e.target.dataset;
    var ids = {
      parentid: data.parentid,
      parentuserid: data.parentuserid,
      rootid: data.rootid,
      name: data.name
    }
    this.setData({
      showInput: true,
      commentDetails: ids,
      //focusKeyboard: true,
      userName: '回复：'+ data.name
    });
  },
  commentListSub() { //评论单个提交
    if(app.globalData.userid){
      if(this.data.detailsComment){
        let params = {
          userid: app.globalData.userid, //login id
          dt: app.getTimestamp(), //time
          wallid: this.data.ssId, //ss id
          parentid: this.data.commentDetails.parentid ? this.data.commentDetails.parentid : 0, //评论id
          parentuserid: this.data.commentDetails.parentuserid ? this.data.commentDetails.parentuserid : this.data.parentuserid, //被留言id
          Content: this.data.detailsComment, //内容
          rootid: this.data.commentDetails.parentid ? this.data.commentDetails.parentid : 0, // 首次评论 0 
        }
        my.showLoading();
        publicFun.requestPostApi(publicFun.api.commentSub, params, this, this.successCommentDetaile);
      }else{
        publicFun.showToast("请输入评论内容")
      }
    }else{
      publicFun.jumpLogin();
    }
  },
  successCommentDetaile(res, selfObj) {
    if(res.S == 1){
      publicFun.showToast("提交成功", 2000);
      //selfObj.data.ssList[dataParams][9] = Number(selfObj.data.ssList[dataParams][9])+1;
      selfObj.setData({
        commentList: [],
        //showInput: false,
        detailsComment: '',
        commentDetails: {},
        userName: '喜欢就评论一下吧',
        //focusKeyboard: false
      });
      selfObj.getAllComment(selfObj.data.ssId, 1);
    }
  },
  //隐藏输入框
  onHideInput() {
    this.setData({
      detailsComment: '',
      listComment: '',
      //focusKeyboard: false,
      userName: '喜欢就评论一下吧',
    })
  },
  closeAlert() { //关闭评论
    this.setData({
      alertState: false,
      showInput: false,

    })
  },

  async scrollMytrip(e) { //上拉加载
    //console.log(e)
    try {
      my.showLoading();
      //const { pageindex } = this.data;
      const newPage = this.data.pageindex + 1;
      this.getSSList(this.data.ssType, newPage);
      this.setData({pageindex: newPage});
    } catch (e) {
      my.hideLoading();
      console.log('scrollMytrip执行异常:', e);
    }
  },
  async scrollComment(e) { //评论上拉加载
    try {
      const newPage = this.data.commentIndex + 1;
      this.getAllComment(this.data.ssId,newPage);
      this.setData({commentIndex: newPage});
    } catch (e) {
      my.hideLoading();
      console.log('scrollMytrip执行异常:', e);
    }
  },

  jumpSSDetails(e) {
    if(this.data.ssType === 400){
      my.navigateTo({
        url: '../ssDetails/ssDetails?ssId='+e.target.dataset.ssId+'&ssUserId='+ e.target.dataset.ssUserId+'&type=1'
      })
    }else{
      my.navigateTo({
        url: '../ssDetails/ssDetails?ssId='+e.target.dataset.ssId+'&ssUserId='+ e.target.dataset.ssUserId+'&type='+this.data.ssType
      });
    }
  },
  jumpLogin() {
    publicFun.jumpLogin();
  },
  jumpFollowList() {

  },
  chooseSSImg() { //上传ss
    let that = this;
    if(app.globalData.userid){ 
      my.chooseImage({
        //chooseImage: 1,
        sourceType: ['camera','album'],
        count: 6,
        success: (res) => {
          //console.log(JSON.stringify(res));
          const path = res.apFilePaths;
          console.log(res); 
          my.navigateTo({
            //url: '/pages/ssUpload/ssUpload?path='+path //水印页面
            url: '/pages/ssRelease/ssRelease?pathArr='+path+'&key='+that.data.ssKey//发布页面
          });
        },
      })
    }else{
      publicFun.jumpLogin();
    }
},
  footerTap:app.footerTap
});
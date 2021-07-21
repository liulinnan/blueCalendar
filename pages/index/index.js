const app = getApp();
const publicFun = require('/utils/public.js');

Page({
  data: {
    loginState: '', //0 未登录 1已登录
    searchVal: '', //搜索框
    winHeight:"",//窗口高度
    currentTab: 1, //预设当前项的值
    scrollLeft:0, //tab标题的滚动条位置
    tabs: [], //sstab //关注300 推荐400 实景1 人物3 水质8 花草7 美食6 污染2 萌宠4
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
    autoplay: false,
    interval: 5000,
    circular: true,
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
    webView: '',
    //tabbar
    tabbar: {},
  },
  onLoad() {
    //my.navigateTo({url:'/pages/loginBind/loginBind'});
    // my.navigateTo({url:'/pages/ssRelease/ssRelease'});
    // my.navigateTo({
    //   //url: '../myCalendarList/myCalendarList'
    // });
    app.hidetabbar();
    app.editTabbar();
    this.setData({
      webView: ''
    })
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
      if(app.globalData.tabs.length > 0){
        that.setData({
          tabs: app.globalData.tabs
        })
      }else{
        this.getSSTab();
      }
      this.getSSList(this.data.ssType, this.data.pageindex);
    }else{
      app.getSecondCount().then(res => {
        this.getSSTab();
        this.getSSList(this.data.ssType, this.data.pageindex);
      });
    }
  },
  onShow:function(e){
    app.hidetabbar();
    app.editTabbar();
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
      this.setData({
        optionsData: {
          type: 300,
          follow: 1,
        }
      })
    }else{
      this.getSSList(this.data.ssType, 1);
    }
  },

  getSSTab() { //获取ss tab
    let params = {
      userid: app.globalData.userid ? app.globalData.userid : 0,
    }
    publicFun.requestGetApi(publicFun.api.ssTab, params, this, this.successTab);
  },
  successTab(res, selfObj) { //获取成功返回的tab list
    if(res.S == 1){
      for(let i=0;i<res.L.length;i++){
        if(res.L[i][0] == 1000 || res.L[i][0] == 3 || res.L[i][0] == 6 || res.L[i][0] == 300){
          res.L.splice(i,1);
        }
      }
      res.L.unshift(["300", "关注", "0"]);
      selfObj.setData({
        tabs: res.L
      });
      app.globalData.tabs = res.L;
      app.hidetabbar();
    }
  },

  // 点击标题切换当前页时改变样式
  swichNav(e) {
    app.globalData.tabPage = 0;
    this.checkCor();  
    var cur = e.target.dataset;
    console.log(cur)
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
      this.setData({
        optionsData: {
          type: cur.id,
          follow: 1,
        }
      })
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
  
  getSSList(type, pageindex) { //获取晒晒列表
    //my.showLoading();
    let params = {
      sorttype: 2,
      pagesize: 20,
      pageindex: pageindex,
      lat: app.globalData.location.lat ? app.globalData.location.lat : 0,
      lng: app.globalData.location.lng ? app.globalData.location.lng : 0,
      userid: 0,
      duserid: app.globalData.userid ? app.globalData.userid : 0,
      type: type,
      cityid: 0,
      area: '',
      keyword: '',
      typelabelid: 0,
      isindex: 1,
      // ismanypics: type == 300 ? 1 : 0,
      // lastid: 0,
      // islabel: type == 300 ? 1 : 0,
    }
    publicFun.requestPostApi(publicFun.api.ssList, params, this, this.successList);
  },
  successList(res, selfObj) { //晒晒成功后返回参数
    res.L.forEach((ssItem) => {
      ssItem[2] = publicFun.Base64.decode(ssItem[2]);
      ssItem[10] = publicFun.Base64.decode(ssItem[10]);
      selfObj.data.ssList.push(ssItem);
    });
    selfObj.setData({
      ssKey: res.Key,
      ssList: selfObj.data.ssList
    });
    app.hidetabbar();
    my.stopPullDownRefresh({
      complete(res) {
        app.hidetabbar();
        console.log("刷新成功");
        setTimeout(function() {
          app.hidetabbar();
        },300)
      }
    })
  },

  getLikeState(e) { //是否赞过
    if(app.globalData.userid){
      let data = e.target.dataset;
      let params  = {
        userid: app.globalData.userid,
        dt: publicFun.getTimestamp(),
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

  jumpInfor() {
    this.setData({
      webView: 'https://www.ipe.org.cn/apphelp/newsdetail/index.html?newid=5397446&page=1'
    });
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
  jumpGarbage() {
    my.navigateToMiniProgram({
     appId: '2021002146610067',//收藏有礼小程序的appid，固定值请勿修改
     path: 'pages/index/index',//收藏有礼跳转地址和参数
     success: (res) => {
       // 跳转成功
       my.alert({ content: 'success' });
     },
     fail: (error) => {
       // 跳转失败
       my.alert({ content: 'fail' });
     }
   });
  },
  previewImage(e) { //查看大图
    let data = e.currentTarget.dataset;
    let arr = [];
    for(let i=0;i<data.list.length;i++){
      arr.push(data.imgUrl+data.list[i].replace(/\/ico/g, ''));
    }
    my.previewImage({
      current: data.index,
      enablesavephoto: true,
      urls: arr
    });
  },
  // intervalChange(e) { //轮播图
  //   console.log(e.detail.current);
  //   this.setData({
  //     imgIndex: e.detail.current+1
  //   })
  // },
  footerTap:app.footerTap
});
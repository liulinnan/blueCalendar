const app = getApp();
const publicFun = require('/utils/public.js');
Component({
  mixins: [],
  data: {
    options: {}, //父传过来的路由值
    loginState: '',
    //indicatorDots: true,
    autoplay: false,
    interval: 5000,
    circular: true,
    imgIndex: 1,
    commentContent: '', //评论内容
    commentList: [], //评论列表
    alertState: false, //评论弹窗 false 关闭 true 打开
    ssId: '', //ssid
    userId: '',
    type: '',
    ssList: [],
    pageindex: 1, //下拉加载页数
    parentuserid: '', //被评论id
    commentId: '', //ssid
    commentIndex: 1, //评论下拉页数
    commentNumber: 0, //评论数量
    listComment: '', //列表评论内容
    detailsComment: '', //全部评论单个内容
    commentDetails: {},
    showAllTap: false, //是否显示全部评论标签
    userName: '喜欢就评论一下吧',
    //focusKeyboard: false, //键盘谈起
    showInput: false, //控制输入栏
  },
  props: {
    optionsData: {}
  },
  onInit() {
    //this.data.ssList = [];
  },
  didMount() {
    const {optionsData} = this.props;
    //console.log(optionsData);
    this.setData({
      pageindex: 0,
      commentNumber: 0,
      ssList: [],
      options: optionsData,
      loginState: app.globalData.userid,
    });
    this.getSSDetailes(this.data.pageindex);
  },
  methods: {
    intervalChange(e) { //轮播图
      //console.log(e.detail.current);
      this.setData({
        imgIndex: e.detail.current+1
      })
    },

    followState(){ //关注状态
      if(app.globalData.userid){
        console.log("已登录")
      }else{
        publicFun.jumpLogin();
      }
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
      if(app.globalData.userid){
        publicFun.requestPostApi(publicFun.api.follow, params, this, this.successFollowTap, item);
      }else{
        publicFun.jumpLogin();
      }
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

    /* 评论 */
    commentSub(e) { //是否可评论
      let data = e.target.dataset;
      this.setData({
        listComment: e.detail.value
      })
      if(app.globalData.userid){
        let params = {
          content: this.data.listComment,
        }
        publicFun.requestPostApi(publicFun.api.getriskContent, params, this, this.successRiskContent, data);
      }else{
        publicFun.jumpLogin();
      }
    },
    successRiskContent(res, selfObj, sourceObj, dataParams) {
      if(res.S == 1) {
        if(res.D.action == 'PASSED') {
          my.showLoading();
          let params = {
            userid: app.globalData.userid, //login id
            dt: publicFun.getTimestamp(), //time
            wallid: dataParams.ssId, //ss id
            parentid: 0, //评论id
            parentuserid: dataParams.ssUserId, //被留言id
            Content: selfObj.data.listComment, //内容
            rootid: 0, // 首次评论 0 
          }
          publicFun.requestPostApi(publicFun.api.commentSub, params, selfObj, selfObj.successComment, dataParams.index);
        }else{
          setTimeout(function () {
            publicFun.showToast("您输入的内容涉及敏感词汇，请重新输入。", 2000);
            selfObj.setData({
              listComment: ''
            });
          }, 300)
        }
      }
    },
    successComment(res, selfObj, sourceObj, dataParams) {
      if(res.S == 1){
        setTimeout(function () {
          publicFun.showToast("提交成功", 2000);
        }, 300);
        selfObj.data.ssList[dataParams][9] = Number(selfObj.data.ssList[dataParams][9])+1;
        selfObj.setData({
          ssList: selfObj.data.ssList,
          listComment: ''
        });
      }
    },
  
    openComment(e) { //打开全部评论列表
      console.log(e.target.dataset)
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
            content: this.data.detailsComment,
          }
          publicFun.requestPostApi(publicFun.api.getriskContent, params, this, this.successRiskContentAlone);
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
            wallid: selfObj.data.ssId, //ss id
            parentid: selfObj.data.commentDetails.parentid ? selfObj.data.commentDetails.parentid : 0, //评论id
            parentuserid: selfObj.data.commentDetails.parentuserid ? selfObj.data.commentDetails.parentuserid : selfObj.data.parentuserid, //被留言id
            Content: selfObj.data.detailsComment, //内容
            rootid: selfObj.data.commentDetails.parentid ? selfObj.data.commentDetails.parentid : 0, // 首次评论 0 
          }
          selfObj.setData({
            commentList: [],
            detailsComment: '',
            commentDetails: {},
            userName: '喜欢就评论一下吧',
          });
          my.showLoading();
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
        showInput: false
      })
    },

    /* 点赞 */
    getLikeState(e) { //是否赞过
      if(app.globalData.userid){
        let data = e.target.dataset;
        let params  = {
          userid: app.globalData.userid,
          dt: publicFun.getTimestamp(),
          wallid: data.ssId
        }
        //console.log(params)
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

    getSSDetailes(pageindex) { //获取列表
      //my.showLoading();
      let params = {
        sorttype: 2,
        pagesize: 10,
        pageindex: pageindex,
        lat: 0,
        lng: 0,
        userid: this.data.options.ssUserId ? this.data.options.ssUserId : 0, //查看的ss userid
        duserid: app.globalData.userid ? app.globalData.userid : 0, //登录的id 
        type: this.data.options.type,
        cityid: 0,
        area: '',
        keyword: '',
        typelabelid: 0,
        isindex: 0,
        ismanypics: 1,
        lastid: this.data.options.ssId ? this.data.options.ssId : 0, // 查看的当前ss的id
        islabel: 1,
      }
      //console.log(params);
      publicFun.requestPostApi(publicFun.api.ssList, params, this, this.successList);
    },
    successList(res, selfObj) { //晒晒成功后返回参数
      if(res.L.length > 0){
        res.L.forEach((ssItem) => {   
          selfObj.data.ssList.push(ssItem);
        });
        selfObj.setData({
          ssKey: res.Key,
          ssList: selfObj.data.ssList
        });
      }
      //console.log(selfObj.data.ssList)
    },

    bindInputMsg() {
      this.getAllComment(this.data.ssId,this.data.commentIndex);
    },
    sendTextMsg() {},
    scrollMytrip(e) { //上拉加载
      try {
        //const { pageindex } = this.data;
        const newPage = this.data.pageindex + 1;
        this.getSSDetailes(newPage);
        this.setData({pageindex: newPage});
      } catch (e) {
        my.hideLoading();
        console.log('scrollMytrip执行异常:', e);
      }
    },
    scrollComment(e) { //评论上拉加载
      try {
        const newPage = this.data.commentIndex + 1;
        this.getAllComment(this.data.ssId,newPage);
        this.setData({commentIndex: newPage});
      } catch (e) {
        my.hideLoading();
        console.log('scrollMytrip执行异常:', e);
      }
    },
    previewImage(e) { //查看大图
      let data = e.currentTarget.dataset;
      let arr = [];
      for(let i=0;i<data.list.length;i++){
        arr.push(data.imgUrl+data.list[i]);
      }
      my.previewImage({
        current: data.index,
        urls: arr
      });
    }
  }
});

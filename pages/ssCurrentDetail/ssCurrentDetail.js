const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    ssId: '',//782358,
    ssUserId: '', //889489
    ssKey: '',
    imgList: [],
    ssList: [],
    ssType: [],
    type: 6,
    answerList: [], //问题答案
    isfl: '',
    //commentIndex: 1, //评论页数
    commentList: [], //评论列表
    //commentNumber: 0, //评论数量
    //showInput: false, //控制输入栏
    detailsComment: '', //全部评论单个内容
    commentDetails: {},
    userName: '喜欢就评论一下吧',
    xiaoquName: "",//小区名字
  },
  onLoad(options) {
    this.setData({
      ssId: options.ssId,
      ssUserId: options.ssUserId,
      ssKey: options.ssKey,
      imgList: [],
      ssList: [],
      ssType: [],
      answerList: [],
      type: options.type,
      commentList: [],
      detailsComment: '',
      commentDetails: {},
      xiaoquName: "",
    });
    this.getSharePictureList();
    this.getSSType();
    this.getAllComment();
  },
  getSharePictureList() { //ss图片列表
    let params = {
      id: this.data.ssId,
    }
    publicFun.requestPostApi(publicFun.api.ssSharePictureList, params, this, this.successSharePictureList);
  },
  successSharePictureList(res, selfObj) {
    //console.log(res.L)
    if(res.S == 1){
      res.L.forEach((ssImg) => {
        selfObj.data.imgList.push(ssImg);
      });
      selfObj.setData({
        imgList: selfObj.data.imgList
      });
      //console.log(selfObj.data.imgList)
    }
  },
  getSSType() { //ss 标签
    let params = {
      wallid: this.data.ssId
    }
    publicFun.requestPostApi(publicFun.api.ssCurrentDetailType, params, this, this.successSSType);
  },
  successSSType(res, selfObj) {
    if(res.S == 1){
      res.L.forEach((ssItem) => {
        selfObj.data.ssType.push(ssItem);
      });
      selfObj.setData({
        ssType: selfObj.data.ssType
      });
      selfObj.getSSDetailes();
    }else{
      publicFun.showToast('请求失败',2000);
    }
  },
  getSSDetailes() { //获取列表
    my.showLoading();
    let params = {
      id: this.data.ssId,
      lat: app.globalData.location.lat,
      lng: app.globalData.location.lng,
      userid: this.data.ssUserId,
      keyclear: this.data.ssKey,
      type: this.data.type
    }
    publicFun.requestPostApi(publicFun.api.ssCurrentDetail, params, this, this.successSSCurrentDetail);
  },
  successSSCurrentDetail(res, selfObj) { //晒晒成功后返回参数
    //console.log(res);
    if(res.L.length > 0){
      res.L.forEach((ssItem) => {
        selfObj.data.ssList.push(ssItem);
      });
      selfObj.setData({
        ssList: selfObj.data.ssList
      });
      if(selfObj.data.ssList[15] == 4){
        let params = {
          id: selfObj.data.ssList[16], //selfObj.data.ssList[16],
          userid: selfObj.data.ssUserId,
        }
        publicFun.requestPostApi(publicFun.api.garbageDetail, params, selfObj, selfObj.successGarbageDetail);
      }
    }
  },
  successGarbageDetail(res, selfObj) {
    //console.log(res);
    var isflKey={};
    var issuliaodaiKey={};
    var weishengtypeKey={};
    var ddtypeKey={};
    var fuzhusheshiKey={};
    var shiyituKey={};
    var youhaidingdianKey={};
    var huishoutypeKey={};
    var lajitongbuzhitypeKey={};
    if(res.S == 1) {
      //console.log(res);
      switch(res.isfl) {
        case "1":
            isflKey.content = '本小区厨余垃圾与其他垃圾 已分类丢弃';
            isflKey.color = "green";
            break;
        case "2":
            isflKey.content = '本小区厨余垃圾与其他垃圾 没有分类丢弃';
            isflKey.color = "red"
            break;
      }
      switch(res.issuliaodai) {
        case "1":
            issuliaodaiKey.content = '本小区投放垃圾或拍摄时，厨余垃圾桶里没有塑料袋';
            break;
        case "2":
            issuliaodaiKey.content = '本小区投放垃圾或拍摄时，厨余垃圾桶里有塑料袋';
            break;
      }
      switch(res.weishengtype) {
        case "1":
          weishengtypeKey.content = '本小区投放垃圾或拍摄时，垃圾桶和周围的卫生很干净';
          break;
        case "2":
          weishengtypeKey.content = '本小区投放垃圾或拍摄时，垃圾桶和周围的卫生一般';
          break;
        case "3":
          weishengtypeKey.content = '本小区投放垃圾或拍摄时，垃圾桶和周围的卫生很脏';
          break;
      }
      switch(res.ddtype) {
        case "1":
            ddtypeKey.content = '本小区投放垃圾或拍摄时，垃圾桶旁边有垃圾分类督导员';
            break;
        case "2":
            ddtypeKey.content = '本小区投放垃圾或拍摄时，垃圾桶旁边没有垃圾分类督导员';
            break;
      }
      //console.log(isflKey,issuliaodaiKey,weishengtypeKey,ddtypeKey);
      var fuzhusheshiArr = [];
      for(let i=1;i<Number(res.fuzhusheshi)*2;i*=2){
        switch(Number(res.fuzhusheshi)&i) {
          case 1:
              fuzhusheshiArr.push("洗手池");
              break;
          case 2:
              fuzhusheshiArr.push("遮雨棚");
              break;
          case 4:
              fuzhusheshiArr.push("破袋工具");
              break;
        }
      }
      res.fuzhusheshi != "0" ? fuzhusheshiKey.content = '本小区垃圾投放点有以下辅助设施'+fuzhusheshiArr.join("、") : "";
      //console.log(fuzhusheshiKey)
      switch(res.shiyitu) {
        case "1":
            shiyituKey.content = '本小区的投放点分布示意图很显眼';
            break;
        case "2":
            shiyituKey.content = '本小区的投放点分布示意图不显眼';
            break;
        case "3":
            shiyituKey.content = '没见过本小区的投放点分布示意图';
            break;
      }
      switch(res.youhaidingdian) {
        case "1":
            youhaidingdianKey.content = '本小区的有害垃圾分品类回收';
            break;
        case "2":
            youhaidingdianKey.content = '本小区的有害垃圾有定点收集点';
            break;
        case "3":
            youhaidingdianKey.content = '本小区的有害垃圾没有定点收集点';
            break;
      }
      //console.log(shiyituKey,youhaidingdianKey)
      var huishoutypeArr = [];
      for(let i=1;i<Number(res.huishoutype)*2;i*=2){
        switch(Number(res.huishoutype)&i) {
          case 1:
              huishoutypeArr.push("有可回收物桶");
              break;
          case 2:
              huishoutypeArr.push("上门收");
              break;
          case 4:
              huishoutypeArr.push("周边有废品回收站");
              break;
          case 8:
              huishoutypeArr.push("智能回收箱");
              break;
          case 16:
              huishoutypeArr.push("什么都没有");
              break;
        }
      }
      res.huishoutype != "0" ? huishoutypeKey.content = '本小区的可回收方式有：'+huishoutypeArr.join("、") : "";
      console.log(huishoutypeKey)
      switch(res.lajitongbuzhitype) {
        case "1":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在高楼每层楼内';
            break;
        case "2":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在各楼门下一组垃圾桶（有厨余桶）';
            break;
        case "3":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在各楼门下一组垃圾桶（无厨余桶）';
            break;
        case "4":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在专门的厨余收集点';
            break;
        case "5":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在撤桶后的分类驿站（有人定时值守）';
            break;
        case "6":
            lajitongbuzhitypeKey.content = '本小区的公共垃圾桶布置在流动车上门或到楼门外收集';
            break;
      }
      console.log(lajitongbuzhitypeKey)

      if(res.isfl != "0"){
        selfObj.data.answerList.push(isflKey)
      }
      if(res.issuliaodai != "0"){
        selfObj.data.answerList.push(issuliaodaiKey)
      }
      if(res.weishengtype != "0") {
        selfObj.data.answerList.push(weishengtypeKey)
      }
      if(res.ddtype != "0") {
        selfObj.data.answerList.push(ddtypeKey)
      }
      if(res.fuzhusheshi != "0") {
        selfObj.data.answerList.push(fuzhusheshiKey)
      }
      if(res.shiyitu != "0") {
        selfObj.data.answerList.push(shiyituKey)
      }
      if(res.youhaidingdian != "0") {
        selfObj.data.answerList.push(youhaidingdianKey)
      }
      if(res.huishoutype != "0") {
        selfObj.data.answerList.push(huishoutypeKey)
      }
      if(res.lajitongbuzhitype != "0"){
        selfObj.data.answerList.push(lajitongbuzhitypeKey)
      }
      //selfObj.data.answerList.push(isflKey,issuliaodaiKey,weishengtypeKey,ddtypeKey,fuzhusheshiKey,shiyituKey,youhaidingdianKey,huishoutypeKey);
      selfObj.setData({
        answerList: selfObj.data.answerList,
        xiaoquName: res.xiaoqu
      });
      //console.log(16&9)
      //console.log(selfObj.data.answerList);
    }
  },
  previewImage(e) { //查看大图
    let data = e.currentTarget.dataset;
    let arr = [];
    for(let i=0;i<data.list.length;i++){
      arr.push(data.list[i][2]);
    }
    my.previewImage({
      current: data.index,
      enablesavephoto: true,
      urls: arr
    });
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
    if(res.S == 1){
      selfObj.data.ssList[13] = 1;
      selfObj.data.ssList[7] = Number(selfObj.data.ssList[7])+1;
      selfObj.setData({
        ssList: selfObj.data.ssList
      });
    }else{
      publicFun.showToast(res.M)
    };
  },
  unlikeTap(params, index) { //取消点赞
    publicFun.requestPostApi(publicFun.api.unlike, params, this, this.successUnlikeTap, index);
  },
  successUnlikeTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.ssList[13] = 0;
    selfObj.data.ssList[7] = Number(selfObj.data.ssList[7])-1;
    selfObj.setData({
      ssList: selfObj.data.ssList
    });
  },
  getAllComment() {//获取全部评论
    let params = {
      id: this.data.ssId
    }
    publicFun.requestPostApi(publicFun.api.ssCommentList, params, this, this.successCommentList);
  },
  successCommentList(res, selfObj) { 
    //console.log(res);
    if(res.L.length > 0){
      res.L.forEach((item) => {   
        selfObj.data.commentList.push(item);
      });
      selfObj.setData({
        //commentNumber: res.CC,
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
          parentuserid: selfObj.data.commentDetails.parentuserid ? selfObj.data.commentDetails.parentuserid : selfObj.data.ssUserId, //被留言id
          Content: selfObj.data.detailsComment, //内容
          rootid: selfObj.data.commentDetails.parentid ? selfObj.data.commentDetails.parentid : 0, // 首次评论 0 
        }
        console.log(params);
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
      selfObj.data.ssList[9] = Number(selfObj.data.ssList[9])+1;
      selfObj.setData({
        commentList: [],
        detailsComment: '',
        commentDetails: {},
        userName: '喜欢就评论一下吧',
        ssList: selfObj.data.ssList
      });
      selfObj.getAllComment();
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
});

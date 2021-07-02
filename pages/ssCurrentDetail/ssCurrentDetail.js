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
    var issuliaodaiKey={};
    var changshiKey={};
    var weishengtypeKey={};
    var fuzhusheshiKey={};
    var xuanchuancuoshiKey={};
    var youhaidingdianKey={};
    var huishoutypeKey={};
    var lajitongbuzhitypesKey={};
    if(res.S == 1) {
      let toufangdianqingkuangArr = [];
      for(let i=1;i<Number(res.toufangdianqingkuang)*2;i*=2){
        switch(Number(res.toufangdianqingkuang)&i) {
          case 1:
              if(res.issuliaodai == 1){ //已分类
                toufangdianqingkuangArr.push("基本都是厨余垃圾");
                // green
              }else{
                toufangdianqingkuangArr.push("厨余垃圾带袋投放");
                // yellow
              }
              break;
          case 16:
              toufangdianqingkuangArr.push("存在垃圾混合投放现象");
              // red
              break;
        }
      }
      res.toufangdianqingkuang != "0" ? issuliaodaiKey.content = '扔垃圾或拍摄时，垃圾投放点符合以下情况：'+toufangdianqingkuangArr.join("、") : "";

      let changshiArr = [];
      for(let i=1;i<Number(res.changshi)*2;i*=2){
        switch(Number(res.changshi)&i) {
          case 1:
              changshiArr.push("实行定时投放，非投放时间上锁或将桶移走");
              break;
          case 2:
              changshiArr.push("撤销每栋楼下的垃圾投放点，全小区设少量集中投放站");
              break;
          case 4:
              changshiArr.push("投放时总有监督员驻守检查（监督员会制止和约束混合投放行为）");
              break;
          case 8:
              changshiArr.push("投放时有24小时电子监控");
              break;
          case 16:
              changshiArr.push("不正确投放的个人确实会被问责");
              break;
          case 32:
              changshiArr.push("小区垃圾分类机制有待完善");
              break;
        }
      }
      res.changshi != "0" ? changshiKey.content = '本小区垃圾分类做出以下尝试：'+changshiArr.join("、") : "";

      switch(res.weishengtype) {
        case "1":
          weishengtypeKey.content = '我投放垃圾或拍摄时，垃圾桶和周边经常清理，很干净';
          break;
        case "2":
          weishengtypeKey.content = '我投放垃圾或拍摄时，垃圾桶和周边的卫生条件一般';
          break;
        case "3":
          weishengtypeKey.content = '我投放垃圾或拍摄时，垃圾桶和周边的卫生条件很脏';
          break;
      }

      var fuzhusheshiArr = [];
      for(let i=1;i<Number(res.fuzhusheshi)*2;i*=2){
        switch(Number(res.fuzhusheshi)&i) {
          case 1:
              fuzhusheshiArr.push("净手设施（洗手处、消毒液等）");
              break;
          case 2:
              fuzhusheshiArr.push("垃圾桶遮雨棚");
              break;
          case 4:
              fuzhusheshiArr.push("破袋工具");
              break;
          case 8:
              fuzhusheshiArr.push("垃圾桶盖拉手或脚踏");
              break;
          case 16:
              fuzhusheshiArr.push("夜间照明");
              break;
          case 32:
              fuzhusheshiArr.push("以上都没有");
              break;
        }
      }
      res.fuzhusheshi != "0" ? fuzhusheshiKey.content = '本小区垃圾投放点有以下辅助设施：'+fuzhusheshiArr.join("、") : "";

      var xuanchuancuoshiArr = [];
      for(let i=1;i<Number(res.xuanchuancuoshi)*2;i*=2){
        switch(Number(res.xuanchuancuoshi)&i) {
          case 1:
              xuanchuancuoshiArr.push("有分类细则宣传板");
              break;
          case 2:
              xuanchuancuoshiArr.push("有分类宣传横幅、标语、海报等");
              break;
          case 4:
              xuanchuancuoshiArr.push("最近一年内有入户讲解");
              break;
          case 8:
              xuanchuancuoshiArr.push("在业主微信群宣传介绍");
              break;
          case 16:
              xuanchuancuoshiArr.push("最近一年内发放了分类垃圾桶或垃圾袋");
              break;
          case 32:
              xuanchuancuoshiArr.push("最近一年内发放了垃圾分类细则宣传册");
              break;
          case 64:
              xuanchuancuoshiArr.push("有投放点位置示意图或指示牌");
              break;
          case 128:
              xuanchuancuoshiArr.push("以上都没有");
              break;
        }
      }
      res.xuanchuancuoshi != "0" ? xuanchuancuoshiKey.content = '本小区的垃圾分类宣传措施：'+xuanchuancuoshiArr.join("、") : "";

      switch(res.youhaidingdian) {
        case "4":
            youhaidingdianKey.content = '本小区的有害垃圾只回收特定品类（例如过期药品、灯管、电池）';
            break;
        case "5":
            youhaidingdianKey.content = '本小区有有害垃圾桶，但投放不准确';
            break;
        case "6":
            youhaidingdianKey.content = '本小区有有害垃圾桶，只投放有害垃圾';
            break;
        case "3":
            youhaidingdianKey.content = '本小区没见过有害垃圾桶';
            break;
      }

      var huishoutypeArr = [];
      for(let i=1;i<Number(res.huishoutype)*2;i*=2){
        switch(Number(res.huishoutype)&i) {
          case 1:
              huishoutypeArr.push("有可回收物桶");
              break;
          case 2:
              huishoutypeArr.push("电商预约上门回收");
              break;
          case 4:
              huishoutypeArr.push("周边有废品回收站");
              break;
          case 8:
              huishoutypeArr.push("有智能回收箱");
              break;
          case 32:
              huishoutypeArr.push("随便放，有人拉走");
              break;
          case 16:
              huishoutypeArr.push("以上都没有");
              break;
        }
      }
      res.huishoutype != "0" ? huishoutypeKey.content = '本小区的可回收物的回收方式有：'+huishoutypeArr.join("、") : "";

      var lajitongbuzhitypesArr = [];
      for(let i=1;i<Number(res.lajitongbuzhitypes)*2;i*=2){
        switch(Number(res.lajitongbuzhitypes)&i) {
          case 1:
              lajitongbuzhitypesArr.push("撤桶并点后的分类驿站");
              break;
          case 2:
              lajitongbuzhitypesArr.push("高楼每层楼内垃圾桶");
              break;
          case 4:
              lajitongbuzhitypesArr.push("各楼门下一组垃圾桶（有厨余桶）");
              break;
          case 8:
              lajitongbuzhitypesArr.push("各楼门下一组垃圾桶（无厨余桶）");
              break;
          case 16:
              lajitongbuzhitypesArr.push("地下车库有一组垃圾桶（有厨余桶）");
              break;
          case 32:
              lajitongbuzhitypesArr.push("地下车库有一组垃圾桶（无厨余桶）");
              break;
          case 64:
              lajitongbuzhitypesArr.push("小区内有只收厨余垃圾的收集点");
              break;
          case 128:
              lajitongbuzhitypesArr.push("流动车定时分类收集每户垃圾");
              break;
          case 256:
              lajitongbuzhitypesArr.push("流动车定时分类收集每户垃圾");
              break;
        }
      }
      res.lajitongbuzhitypes != "0" ? lajitongbuzhitypesKey.content = '本小区的公共垃圾桶布置在：'+lajitongbuzhitypesArr.join("、") : "";

      if(res.toufangdianqingkuang != "0"){
        selfObj.data.answerList.push(issuliaodaiKey)
      }
      if(res.changshi != "0") {
        selfObj.data.answerList.push(changshiKey)
      }
      if(res.weishengtype != "0") {
        selfObj.data.answerList.push(weishengtypeKey)
      }
      if(res.fuzhusheshi != "0") {
        selfObj.data.answerList.push(fuzhusheshiKey)
      }
      if(res.xuanchuancuoshi != "0") {
        selfObj.data.answerList.push(xuanchuancuoshiKey)
      }
      if(res.youhaidingdian != "0") {
        selfObj.data.answerList.push(youhaidingdianKey)
      }
      if(res.huishoutype != "0") {
        selfObj.data.answerList.push(huishoutypeKey)
      }
      if(res.lajitongbuzhitypes != "0"){
        selfObj.data.answerList.push(lajitongbuzhitypesKey)
      }
      console.log(selfObj.data.answerList)
      selfObj.setData({
        answerList: selfObj.data.answerList,
        info: res.info,
        xiaoquName: res.xiaoqu
      });
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

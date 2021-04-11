const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    labelList: [],
    labelSelect: [],
    pictureList: [],
    describe: '',
    location: {},
    PR: 'PM2.5',
    PM: 0,
    disabled: false,
    AIList: [],
    focus: false,
    noneState: false
  },
  onLoad(options) {
    //console.log(app.globalData.location)
    let pathArr = options.pathArr.split(",");
    let tag = []
    tag.push(["1/0","蓝天"])
    this.setData({
      pictureList: pathArr,
      AIList: [],
      labelSelect: tag,
      key: options.key
    });
    // this.uploadImg(pathArr[0]);
    this.aiResults(options.path); //ai识别
    this.getSSUploadTag();
    this.getAddress();
    //this.getWatermarkurl();
  },
  addImg() { //添加照片
    var that = this;
    my.chooseImage({
      sourceType: ['camera','album'],
      count: 6 - this.data.pictureList.length,
      success: (res) => {
        const path = res.apFilePaths;
        res.apFilePaths.forEach((imgItem) => {
          that.data.pictureList.push(imgItem);
        });
        this.setData({
          pictureList: this.data.pictureList
        });
      },
    })
  },
  deleteImg(e) { //删除照片
   if(this.data.pictureList.length > 1){
    this.data.pictureList.splice(e.target.dataset.index, 1);
    this.setData({
      pictureList: this.data.pictureList
    });
   }else{
     publicFun.showToast("至少保留一张照片上传");
   }
  },
  previewImage(e) { //预览照片
    let that = this;
    my.previewImage({
      current: e.target.dataset.index,
      urls: that.data.pictureList,
    });
  },
  // ai识别
  aiResults(url) {
    var params  = {
      url: url
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.aiImg, params, this, this.successAiResults);
  },
  successAiResults(res, selfObj) {
    for(let i=0;i<3;i++){
      if(res.L[i][4]){
        var text = publicFun.Base64.decode(res.L[i][4]);
      }
      res.L[i].splice(res.L[i].length-1, 1, text);
      if(i == 0){
        let checked = true;
        res.L[0].push(checked);
      }
      selfObj.data.AIList.push(res.L[i]);
    }
    let none = ["以上都没有",'none']
    selfObj.data.AIList.push(none);
    selfObj.setData({
      AIList: selfObj.data.AIList,
      AIText: selfObj.data.AIList[0][0]+'。',
      baikeImg: selfObj.data.AIList[0][3],
      baikeText: selfObj.data.AIList[0][4]
    })
  },
  bindKeyInput(e) {
    this.setData({
      baikeText: e.detail.value,
    });
  },
  AIFocus() {
    this.setData({
      focus: true,
    });
  },
  AIBlur() {
    this.setData({
      focus: false,
    });
  },
  AIChange(e) {
    if(e.detail.value == this.data.AIList.length-1){
      this.setData({
        noneState: true,
        AIText: '',
        baikeText: ''
      })
    }else{
      this.setData({
        noneState: false, 
        AIText: this.data.AIList[e.detail.value][0]+'。',
        baikeImg: this.data.AIList[e.detail.value][3],
        baikeText: this.data.AIList[e.detail.value][4]
      })
    }
  },

  selectTag(e) { //标签选中 index label name
    let data = e.target.dataset;
    for (let i = 0; i < this.data.labelSelect.length; i += 1) {
      if (this.data.labelSelect[i][1] == data.name) {
        //this.data.labelSelect[i][0] = data.label
        return
      }
    }
    this.data.labelSelect.push([e.target.dataset.label+'/0',e.target.dataset.name])
    this.setData({
      labelSelect: this.data.labelSelect
    });
  },
  deleteTag(e) { //标签删除
    this.data.labelSelect.splice(e.target.dataset.index, 1);
    this.setData({
      labelSelect: this.data.labelSelect
    });
  },
  bindTextAreaBlur(e) {
    this.setData({
      describe: e.detail.value
    });
  },
  chooseLocation() { //选择位置
    var that = this;
    my.chooseLocation({
      success:(res)=>{
        that.data.location.lng = res.longitude; //经度
        that.data.location.lat = res.latitude; //纬度
        that.data.location.address = res.address; //地址
        app.globalData.location.name = res.name; //名字
        that.setData({
          location: app.globalData.location
        });
      },
      fail:(error)=>{
        publicFun.showToast('选择位置失败，请重新选择');
      },
    });
  },
  subSS() { //发布晒晒
    let aqi = app.globalData.aqi;
    console.log(aqi)
    // if(this.data.location.lng > 0) {
      let AIContent = this.data.AIText+this.data.describe+'\\n'+this.data.baikeText
      var params  = {
        userid: app.globalData.userid,
        dt: publicFun.getTimestamp(),
        describe: AIContent, //描述
        describe1: '支付宝小程序请搜索：蔚蓝日历',
        address: app.globalData.location.address, //地址
        lat: app.globalData.location.lat ? app.globalData.location.lat : 0, //纬度
        lng: app.globalData.location.lng ? app.globalData.location.lng : 0, //经度
        province: app.globalData.location.province, //省
        city: app.globalData.location.city, //市
        area: app.globalData.location.district, //区县
        type: 0, //0晒晒，1日历
        airlevel: aqi["A"] != undefined ? aqi.A.L : 0, //空气质量级别
        riliid: 0, //主日历id
        start: publicFun.getTimestamp(), //开始时间
        end: publicFun.getTimestamp(), //结束时间
        des: '', //日历描述文字
        tempid: 0, //serRiLiDetail_V4_0 返回的TempId，用户记录状态
        fmurl: '', //封面
        huancun: this.data.key, //缓存名称（ShareList_V4_1返回的Key）
        isbufa: 0, //1补发，0正常发
        rivername: '', //河流名称
        riverdescribe: '', //河流描述
        isbobao: app.globalData.location.city ? 1 : 0, //1显示到播报地图0不显示到播报地图
        aqi: aqi["A"] != undefined ? aqi.A.A : 0, //Aqi值
        temperature: aqi["W"] != undefined ? aqi.W.T : 0, //实况温度
        weatherdes: aqi["W"] != undefined ? aqi.W.M : 0, //实况天气（例如：晴，多云 等）
      }
      // console.log(params)
      if(this.data.baikeText){
        //if(this.data.labelSelect.length > 0){
          if(this.data.describe){
            if(app.globalData.location.address){
              this.setData({disabled:true})
              publicFun.requestPostApi(publicFun.api.ssUpload, params, this, this.successSubSS);
            }else{
              publicFun.showToast('请选择地址');
            }
          }else{
            publicFun.showToast('请填写描述');
          }
        // }else{
        //   publicFun.showToast('请填写标签');
        // }
    }else{
      publicFun.showToast('请选择AI识别结果');
    }
  },
  successSubSS(res, selfObj) {
    if(res.S == 1){
      selfObj.subTag(res.R); 
    }else{
      publicFun.showToast(res.M);
    }
  },
  subTag(wallid) {
    var tagList = '';
    this.data.labelSelect.forEach((item) => { //提交标签
      tagList +=  item[0]+','
    });
    var params  = {
      wallid: wallid, //发布ss返回的ssId
      typestr: tagList
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.tagUpload, params, this, this.successTagUpload, params);
  },
  successTagUpload(res, selfObj, sourceObj, dataParams) {
    let successUp = 0;
    let failUp = 0;
    let i = 0;
    if(res.S == 1){
      publicFun.showToast(res.M);
      selfObj.subImg(dataParams,selfObj.data.pictureList, successUp, failUp, i, selfObj.data.pictureList.length);
    }
  },
  subImg(dataParams,filePaths, successUp, failUp, i, length) { //上传照片
    my.uploadFile({
      url: publicFun.api.imgUrlUpload,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      fileType: 'image',
      fileName: 'url',
      filePath: filePaths[i],
      formData: {
        uid: app.globalData.userid,
        wallid: dataParams.wallid,
        Iscover: 1,
        url: filePaths[i],
        datetime: publicFun.getTimestamp(), 
        //typestr: dataParams.typestr,
        miyao: app.getMiyao()
      },
      success: res => {
        successUp++;
        my.uma.trackEvent('Commit_pictureNum');
      },
      fail: res => {
        failUp++;
      },
      complete: () => {
        i++;
        if (i == length) {
          app.globalData.tabPage = 1;
          my.switchTab({
            url: '/pages/index/index'
          });
          console.log("成功");
        } else { //递归调用uploadDIY函数
          this.subImg(dataParams, filePaths, successUp, failUp, i, length);
        }
      }
    })
  },
  getSSUploadTag() { //获取发布ss标签
    var params  = {
      tabid: 0,
      parentid: 0,
      ishot: 0
    }
    // my.showLoading();
    publicFun.requestPostApi(publicFun.api.ssTagList, params, this, this.successGetTagList);
  },
  successGetTagList(res, selfObj) {
    for(let i=0;i<res.L.length;i++){
      if(res.L[i][2] == 3 || res.L[i][2] == 6){
        res.L.splice(i,1);
      }
    }
    selfObj.setData({
      labelList: res.L
    });
  },
  getAddress() {
    this.setData({
      location: app.globalData.location
    })
    if(app.globalData.location.city){
      this.getDefaultContent(app.globalData.location.city, app.globalData.location.lat, app.globalData.location.lng);
    }else{
      let date = publicFun.getNowFormatDate();
      let content = '#蔚蓝地图#实景。'+ date +'。';
      this.setData({
        describe: content
      });
      // this.addWatermark(this.data.pictureLength);
    }
  },
  getDefaultContent(city, lat, lng) {
    app.getSScontent(city, lat, lng).then((res) => {
      let date = publicFun.getNowFormatDate();
      let content = '#蔚蓝地图#实景。'+ date +'，'+ app.globalData.location.city +'，当前'+res.W.M+'，'+res.W.T+'℃'+'，湿度'+res.W.H+'%，'+res.W.W+res.W.Ws+'，空气质量'+res.A.LN+'。';
      this.setData({ 
        describe: content,
      });
    });
  },
});

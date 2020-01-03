const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    labelList: [],
    labelSelect: [],
    pictureList: [],
    describe: '',
    location: {}, //定位
  },
  onLoad(options) {
    let pathArr = options.pathArr.split(",");
    this.getSSUploadTag();
    this.setData({
      pictureList: pathArr,
      labelList: [],
      labelSelect: [],
      location: {}, //定位
      key: options.key
    });
    this.getAddress();
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
  selectTag(e) { //标签选中 index label name
    let data = e.target.dataset;
    for (let i = 0; i < this.data.labelSelect.length; i += 1) {
      if (this.data.labelSelect[i][1] == data.name) {
        //this.data.labelSelect[i][0] = data.label
        return
      }
    }
    this.data.labelSelect.push([e.target.dataset.index+'/0',e.target.dataset.name])
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
  chooseLocation() { //位置
    var that = this;
    this.getAddress();
    my.chooseLocation({
        success:(res)=>{
          that.data.location.longitude = res.longitude; //经度
          that.data.location.latitude = res.latitude; //纬度
          that.data.location.address = res.address; //地址
          //that.data.location.name = res.name; //名字
          that.setData({
            location: that.data.location
          });
      },
    });
  },
  subSS() { //发布晒晒
    var params  = {
      userid: app.globalData.userid,
      dt: app.getTimestamp(),
      describe: this.data.describe, //描述
      describe1: '',
      address: this.data.location.address, //地址
      lat: this.data.location.longitude, //纬度
      lng: this.data.location.latitude, //经度
      province: this.data.location.province, //省
      city: this.data.location.city, //市
      area: this.data.location.district, //区县
      type: 0, //0晒晒，1日历
      airlevel: 0, //空气质量级别
      riliid: 0, //主日历id
      start: app.getTimestamp(), //开始时间
      end: app.getTimestamp(), //结束时间
      des: '', //日历描述文字
      tempid: 0, //serRiLiDetail_V4_0 返回的TempId，用户记录状态
      fmurl: '', //封面
      huancun: this.data.key, //缓存名称（ShareList_V4_1返回的Key）
      isbufa: 0, //1补发，0正常发
      rivername: '', //河流名称
      riverdescribe: '', //河流描述
      isbobao: 0, //1显示到播报地图0不显示到播报地图
      aqi: 0, //Aqi值
      temperature: 0, //实况温度
      weatherdes: '', //实况天气（例如：晴，多云 等）
    }
    if(this.data.labelSelect.length > 0){
      if(this.data.describe){
        if(this.data.location.address){
          publicFun.requestPostApi(publicFun.api.ssUpload, params, this, this.successSubSS);
        }else{
          publicFun.showToast('请选择地址');
        }
      }else{
        publicFun.showToast('请填写描述');
      }
    }else{
      publicFun.showToast('请填写标签');
    }
    //my.showLoading();
  },
  successSubSS(res, selfObj) {
    //console.log(res);
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
        datetime: app.getTimestamp(), 
        typestr: dataParams.typestr,
        miyao: app.getMiyao()
      },
      success: res => {
        successUp++;
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
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.ssTagList, params, this, this.successGetTagList);
  },
  successGetTagList(res, selfObj) {
    for(let i=0;i<res.L.length-1;i++) {
      selfObj.data.labelList.push(res.L[i]);
    }
    selfObj.setData({
      labelList: selfObj.data.labelList
    });
  },
  getAddress() {
    let that = this;
    my.getLocation({
      cacheTimeout: 1,
      type: 2,
      success(res) {
        that.data.location.longitude = res.longitude; //经度
        that.data.location.latitude = res.latitude; //纬度
        that.data.location.province = res.province; //省
        that.data.location.city = res.city; //市
        that.data.location.district = res.district; //区
        that.data.location.address = res.province+res.city+res.district+res.streetNumber.street //地址
        that.setData({
          location: that.data.location
        });
      },
    });
  }
});

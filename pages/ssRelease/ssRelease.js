const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    labelList: [],
    labelSelect: [],
    pictureList: [],
    describe: '',
    canvasW: 0,
    canvasH: 0,
    location: {},
    PR: 'PM2.5',
    PM: 0,
    disabled: false,
  },
  onLoad(options) {
    //console.log(app.globalData.location)
    let pathArr = options.pathArr.split(",");
    this.setData({
      pictureLength: pathArr,
      //labelList: [],
      labelSelect: [],
      key: options.key
    });
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
        //that.data.location.name = res.name; //名字
        that.setData({
          location: app.globalData.location
        });
      },
    });
  },
  subSS() { //发布晒晒
    let aqi = app.globalData.aqi;
    // if(this.data.location.lng > 0) {
      var params  = {
        userid: app.globalData.userid,
        dt: publicFun.getTimestamp(),
        describe: this.data.describe, //描述
        describe1: '',
        address: app.globalData.location.address, //地址
        lat: app.globalData.location.lat ? app.globalData.location.lat : 0, //纬度
        lng: app.globalData.location.lng ? app.globalData.location.lng : 0, //经度
        province: app.globalData.location.province, //省
        city: app.globalData.location.city, //市
        area: app.globalData.location.district, //区县
        type: 0, //0晒晒，1日历
        airlevel: aqi.A.L ? aqi.A.L : 0, //空气质量级别
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
        aqi: aqi.A.A ? aqi.A.A : 0, //Aqi值
        temperature: aqi.W.T ? aqi.W.T : 0, //实况温度
        weatherdes: aqi.W.M ? aqi.W.M : 0, //实况天气（例如：晴，多云 等）
      }
      if(this.data.labelSelect.length > 0){
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
      }else{
        publicFun.showToast('请填写标签');
      }
    // }
    // else{
    //   if(app.globalData.mobileInfo == 1){
    //     publicFun.showToast('请打开手机定位');
    //   }
    // }
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
      this.addWatermark(this.data.pictureLength);
    }
  },
  getDefaultContent(city, lat, lng) {
    app.getSScontent(city, lat, lng).then((res) => {
      let date = publicFun.getNowFormatDate();
      let content = '#蔚蓝地图#实景。'+ date +'，'+ app.globalData.location.city +'，当前'+res.W.M+'，'+res.W.T+'℃'+'，湿度'+res.W.H+'%，'+res.W.W+res.W.Ws+'，空气质量'+res.A.LN+'。';
      this.setData({ 
        describe: content,
      });
      this.getWaterMarkPm(res.A.Id);
    });
  },
  getWaterMarkPm(MCid) { //获取PM值
    var params  = {
      MCid: MCid, //监测点id
      IsCity: 0, //0 监测点 1城市
    }
    publicFun.requestPostApi(publicFun.api.waterMarkPM, params, this, this.successWaterMarkPm);
  },
  successWaterMarkPm(res, selfObj) {
    if(res.S == 1){
      // if(res.PR){
      //   var PR = res.PR;
      // }else{
      //   var PR = "PM2.5";
      // }
      var PR = "PM2.5";
      selfObj.addWatermark(selfObj.data.pictureLength, PR, res.X[0]);
    }
  },
  addWatermark(item, PR, PM) {
    var urlArr = [];
    var that = this;
    my.showLoading();
    for (let i=0;i<item.length;i++) {
      my.getImageInfo({
        src: item[i],
        success: (res) => {
          that.setData({
            canvasW: res.width,
            canvasH: res.height
          });
          console.log(res);
          let ctx = my.createCanvasContext('firstCanvas'+i);
          //将图片src放到cancas内，宽高为图片大小(原图片);
          ctx.drawImage(item[i], 0, 0, res.width, res.height);

          if(app.globalData.location.city){
            //var cityLength = '北京市市北京'
            var city = app.globalData.location.city.substr(0,app.globalData.location.city.length-1);
            if(city.length > 5){
              var taxtWidth = res.width/2-((city.length)*40);
            }else{
              var taxtWidth = res.width/2-((city.length+1)*40);
            }
            
            var imgWidth = taxtWidth+ ((city.length)*80);//(res.width/2)+(city.length*((city.length+1)*10-5));
            var watermarkUrl = 'watermark3.png';

            ctx.setFontSize(80);
            ctx.setFillStyle('#ffffff'); // 文字颜色：黑色  
            ctx.fillText(city, taxtWidth, res.height/2); //在画布上绘制被填充的文本


            ctx.setFontSize(40);
            ctx.fillText(PR+'：'+PM+'μg/m³', res.width/2-120, res.height/2+60); //在画布上绘制被填充的文本
            ctx.setTextAlign('center'); // 文字居中

          }else{
            var watermarkUrl = 'watermark-zjhb.png';
          }
          
            my.downloadFile({
            url: 'https://www.ipe.org.cn/public/static/images/'+ watermarkUrl,
            success(wkUrl) {
              //ctx.drawImage(wkUrl.apFilePath, res.width/2-res.width/4/2, res.height/2-res.width/4/2, res.width/4, res.width/4);
              if(app.globalData.location.city){
                // if(city.length >= 4) {
                //   var imgWidth = res.width/2+city.length*50;
                // }else if(city.length == 3) {
                //   var imgWidth = res.width/2+city.length*40;
                // }else{
                //   var imgWidth = res.width/2+city.length*30;
                // }
                
                ctx.drawImage(wkUrl.apFilePath, imgWidth, res.height/2-100, 120, 120);
              }else{
                //ctx.drawImage(wkUrl.apFilePath, res.width/2-res.width/4/2, res.height/2-res.width/4/2, res.width/4, res.width/4);
                ctx.drawImage(wkUrl.apFilePath, res.width/2-res.width/4/2, res.height/2-res.width/4/2, res.width/4, res.width/4);
              }
              
              ctx.draw(false, function() {
                setTimeout(function() {
                  ctx.toTempFilePath({
                    success(resUrl) {
                      urlArr.push(resUrl.apFilePath);
                      that.setData({
                        pictureList: urlArr,
                      });
                      my.hideLoading();
                    },
                  });
                }, 600)
              });
              ctx.clearRect(0, 0, res.width, res.height);
            }
          })
        }
      })
    }
  },
  getWaterMark() { //获取水印
    var params  = {
      
    }
    publicFun.requestPostApi(publicFun.api.getWaterMark, params, this, this.successWaterMark);
  },
  successWaterMark(res, selfObj) {
    console.log(res);
  },
});

const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    xiaoqu: '',
    address: '',
    isfl: '',
    issuliaodai: '',
    weishengtype: '',
    ddtype: '',
    fuzhusheshi: '',
    shiyitu: '',
    youhaidingdian: '',
    huishoutype: '',
    lajitongbuzhitype: '',
    describe: '',
    pictureList: [],
    uploadImgList: [],
  },
  onLoad() {
    this.setData({
      pictureList: [],
      uploadImgList: [],
    })
    if(app.globalData.userid){
      if(app.globalData.location.address){
        this.setData({
          xiaoqu: app.globalData.location.name,
          address: app.globalData.location.address
        });
      }else{
        this.setData({
          address: "未获取到您的小区位置和名称，无法点亮您的小区"
        })
        app.getLocation('您需要开启定位服务，来获取您所在的小区位置。');
      }
    }else{
      publicFun.jumpLogin();
    }
  },
  openPos() {
    this.getLocation();
  },
  chooseSSImg() {//上传ss
    let that = this;
    my.chooseImage({
      //chooseImage: 1,
      compressed: 'compressed',
      sourceType: ['camera'],
      count: 6,
      success: (res) => {
        my.compressImage({
          apFilePaths: res.apFilePaths,
          compressLevel: 1,
          success: data => {
            that.data.pictureList.push(data.apFilePaths[0]);
            that.setData({
              pictureList: that.data.pictureList
            });
          }
        })
      },
      fail:()=>{
        my.getSetting({
          success: (res) => {
            if(!res.authSetting.camera){
              publicFun.showToast("没有相机访问权限，请授权", 2000);
              my.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                }
              });
            }
          },
        }) 
      }
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
  getLocation() {
    let that = this;
    my.getLocation({
      cacheTimeout: 1,
      type: 3,
      success(res) {
        //console.log(res);
        var location = publicFun.formatLocation(res.longitude, res.latitude);
        app.globalData.location.lng = location.longitude[0]+'.'+location.longitude[1]; //经度
        app.globalData.location.lat = location.latitude[0]+'.'+location.latitude[1]; //纬度
        
        app.globalData.location.province = res.province; //省
        app.globalData.location.city = res.city; //市
        app.globalData.location.district = res.district; //区
        app.globalData.location.address = res.province+res.city+res.district+res.streetNumber.street+res.streetNumber.number; //地址
        app.globalData.location.name = res.pois[0].name;
        that.setData({
          xiaoqu: app.globalData.location.name,
          address: app.globalData.location.address
        });
      },
      fail() {
        my.confirm({
          content: '您需要开启定位服务，来获取您所在的小区位置。',
          confirmButtonText: '开启定位',
          cancelButtonText: '以后再说',
          success: (result) => {
            if(result.confirm == true){
              my.openSetting({
                success: (res) => {
                  my.getLocation({
                    cacheTimeout: 1,
                    type: 3,
                    success(res) {
                      
                      var location = publicFun.formatLocation(res.longitude, res.latitude);
                      app.globalData.location.lat = location.latitude[0]+'.'+location.latitude[1];
                      app.globalData.location.lng = location.longitude[0]+'.'+location.longitude[1];

                      app.globalData.location.province = res.province; //省
                      app.globalData.location.city = res.city; //市
                      app.globalData.location.district = res.district; //区
                      app.globalData.location.address = res.province+res.city+res.district+res.streetNumber.street //地址
                      app.globalData.location.name = res.pois[0].name;
                      that.setData({
                        xiaoqu: app.globalData.location.name,
                        address: app.globalData.location.address
                      });
                    }
                  })
                }
              })
            }
          },
        });
      }
    })
  },
  villageChange() {
    let that = this;
    my.chooseLocation({
        success:(res)=>{
        //console.log(res)
        let location = publicFun.formatLocation(res.longitude, res.latitude);
        app.globalData.location.lng = location.longitude[0]+'.'+location.longitude[1];
        app.globalData.location.lat = location.latitude[0]+'.'+location.latitude[1];
        app.globalData.location.name = res.name; //小区名字
        my.getLocation({
          type: 2,
          success(res) {
            //console.log(res)
            app.globalData.location.province = res.province;
            app.globalData.location.city = res.city;
            app.globalData.location.district = res.district;
            app.globalData.location.address = res.province+res.city+res.district+res.streetNumber.street+res.streetNumber.number;
            that.setData({
              xiaoqu: app.globalData.location.name,
              address: app.globalData.location.address
            })
          },
          fail() {
            publicFun.showToast('定位失败');
          },
        })
      },
      fail:(error)=>{
        publicFun.showToast('选择位置失败，请重新选择');
      },
    });
  },
  isflChange(e) {
    this.setData({
      isfl: e.detail.value
    })
  },
  issuliaodaiChange(e) {
    this.setData({
      issuliaodai: e.detail.value
    })
  },
  weishengtypeChange(e) {
    this.setData({
      weishengtype: e.detail.value
    })
  },
  ddtypeChange(e) {
    this.setData({
      ddtype: e.detail.value
    })
  },
  fuzhusheshiChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      fuzhusheshi: number+''
    });
  },
  shiyituChange(e) {
    this.setData({
      shiyitu: e.detail.value
    })
  },
  youhaidingdianChange(e) {
    this.setData({
      youhaidingdian: e.detail.value
    })
  },
  huishoutypeChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      huishoutype: number+''
    });
  },
  lajitongbuzhitypeChange(e) {
    this.setData({
      lajitongbuzhitype: e.detail.value
    })
  },
  bindTextAreaInput(e) {
    this.setData({
      describe: e.detail.value
    });
  },
  submitTap() {
    if(this.data.pictureList.length > 0){
      if(app.globalData.location.name){
        if(this.data.isfl){
          let successUp = 0;
          let failUp = 0;
          let i = 0;
          this.subImg(this.data.pictureList, successUp, failUp, i, this.data.pictureList.length);
        }else{
          publicFun.showToast("请选择小区垃圾是否分类", 2000);
        }
      }else{
        app.getLocation('您需要开启定位服务，来获取您所在的小区位置。');
      }
    }else{
      publicFun.showToast("请拍摄小区垃圾图片", 2000);
    }
  },
  subImg(filePaths, successUp, failUp, i, length) { //上传照片
    let that = this;
    my.uploadFile({
      url: publicFun.api.commonImg,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      fileType: 'image',
      fileName: 'filename',
      filePath: filePaths[i],
      formData: {
        uid: app.globalData.userid,
        miyao: publicFun.api.imgMiyao
      },
      success: res => {
        let ress = JSON.parse(res.data);
        if(ress.S == 1){
          that.data.uploadImgList.push(ress.path);
          that.setData({
            uploadImgList: that.data.uploadImgList
          });
        }
        successUp++;
      },
      fail: res => {
        failUp++;
      },
      complete: (ress) => {
        i++;
        if (i == length) {
          let res = JSON.parse(ress.data);
          if(res.S == 1){
            //console.log(that.data.uploadImgList)
            that.submitClass(that.data.uploadImgList);
          }
          console.log("成功");
        } else { //递归调用uploadDIY函数
          this.subImg(filePaths, successUp, failUp, i, length);
        }
      }
    })
  },
  submitClass(uploadImgList) {
    let picsStr = '';
    for(let i=0;i<uploadImgList.length;i++){
      picsStr += uploadImgList[i]+'|'
    }
    var params  = {
      userid: app.globalData.userid, 
      province: app.globalData.location.province, //省份
      city: app.globalData.location.city, //城市
      area: app.globalData.location.district, //区县
      lat: app.globalData.location.lat, //纬度
      lng: app.globalData.location.lng, //经度
      xiaoqu: app.globalData.location.name, //小区
      address: app.globalData.location.address, //地址
      isfl: this.data.isfl, //是否分类 1是 2否
      issuliaodai: this.data.issuliaodai ? this.data.issuliaodai : 0, //厨垃是否有袋子 1没有 2有
      weishengtype: this.data.weishengtype ? this.data.weishengtype : 0,
      ddtype: this.data.ddtype ? this.data.ddtype : 0,
      fuzhusheshi: this.data.fuzhusheshi ? this.data.fuzhusheshi : 0,
      shiyitu: this.data.shiyitu ? this.data.shiyitu : 0,
      youhaidingdian: this.data.youhaidingdian ? this.data.youhaidingdian : 0,
      huishoutype: this.data.huishoutype ? this.data.huishoutype : 0,
      lajitongbuzhitype: this.data.lajitongbuzhitype ? this.data.lajitongbuzhitype : 0,
      info: this.data.describe, //备注
      pics: picsStr, //图片 |分割多张图片
      hcs: '',
    }
    //console.log(params)
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.submitGarbage, params, this, this.successSubmitTap);
  },
  successSubmitTap(res, selfObj) {
    //console.log(res);
    if(res.S == 1){
      publicFun.showToast('提交成功');
      app.globalData.tabPage = 1;
      my.switchTab({
        url: '/pages/index/index'
      });
    }else{
      publicFun.showToast(res.M);
    }
  }
});

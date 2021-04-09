const app = getApp();
const publicFun = require('/utils/public.js');
var index = 0;
Page({
  data: {
    xiaoqu: '',
    address: '',
    //isfl: '',
    issuliaodai: '',
    //ddtype: '',
    toufangdianqingkuang: '',
    lajifenleichangshi: '',
    weishengtype: '',
    fuzhusheshi: '',
    xuanchuancuoshi: '',
    youhaidingdian: '',
    huishoutype: '',
    lajitongbuzhitypes: '',
    howtype: '',
    describe: '',
    pictureList: [],
    uploadImgList: [],
    suliaodaiState: false,
    sharewalldes: '', //晒晒文案
    toufangdianqingkuangArr: [],
    lajifenleichangshiArr: [],
    weishengtypeArr: [
      // {value: '1', text: '经常清理，很干净'},
      // {value: '2', text: '一般'},
      // {value: '3', text: '很脏，有很多污物、蚊蝇，很臭'}
    ],
    fuzhusheshiArr: [],
    xuanchuancuoshiArr: [],
    huishoutypeArr: [],
    lajitongbuzhitypesArr: [],
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
  // isflChange(e) {
  //   this.setData({
  //     isfl: e.detail.value
  //   })
  // },
  issuliaodaiChange(e) {
    this.setData({
      issuliaodai: e.detail.value
    })
  },
  // ddtypeChange(e) {
  //   this.setData({
  //     ddtype: e.detail.value
  //   })
  // },
  istoufangdianqingkuangChange(e){
    console.log(e);
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
      if(e.detail.value[i] == 1){
        this.setData({
          suliaodaiState: true,
        })
      }
    }
    this.setData({
      toufangdianqingkuang: number+'',
      toufangdianqingkuangArr: e.detail.value,
    })
  },
  ischangshiChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      lajifenleichangshi: number+'',
      lajifenleichangshiArr: e.detail.value
    });
  },
  weishengtypeChange(e) {
    this.setData({
      weishengtype: e.detail.value
    })
  },
  fuzhusheshiChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      fuzhusheshi: number+'',
      fuzhusheshiArr: e.detail.value
    });
  },
  xuanchuancuoshiChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      xuanchuancuoshi: number+'',
      xuanchuancuoshiArr: e.detail.value
    });
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
      huishoutype: number+'',
      huishoutypeArr: e.detail.value
    });
  },
  lajitongbuzhitypesChange(e) {
    let number = 0;
    for(let i=0;i<e.detail.value.length;i++){
      number += Number(e.detail.value[i]);
    }
    this.setData({
      lajitongbuzhitypes: number+'',
      lajitongbuzhitypesArr: e.detail.value
    });
  },
  howtypeChange(e) {
    this.setData({
      howtype: e.detail.value
    })
  },
  bindTextAreaInput(e) {
    this.setData({
      describe: e.detail.value
    });
  },
  submitTap() {
    // this.getSSCopywrite();
    if(this.data.pictureList.length > 0){
      if(app.globalData.location.name){
        if(this.data.toufangdianqingkuang && this.data.lajifenleichangshi){
          if(this.data.issuliaodai){
            let successUp = 0;
            let failUp = 0;
            let i = 0;
            this.subImg(this.data.pictureList, successUp, failUp, i, this.data.pictureList.length);
          }else{
            publicFun.showToast("第一题请选择：厨余垃圾是否带袋投放？", 2000);
          }
        }else{
          publicFun.showToast("请回答第一和第二两道必答题", 2000);
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
    this.getSSCopywrite();
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
      //isfl: this.data.isfl, //是否分类 1是 2否
      toufangdianqingkuang: this.data.toufangdianqingkuang,
      issuliaodai: this.data.issuliaodai, //厨垃是否有袋子 1没有 2有
      lajifenleichangshi: this.data.lajifenleichangshi,
      //ddtype: this.data.ddtype ? this.data.ddtype : 0,
      weishengtype: this.data.weishengtype ? this.data.weishengtype : 0,
      fuzhusheshi: this.data.fuzhusheshi ? this.data.fuzhusheshi : 0,
      xuanchuancuoshi: this.data.xuanchuancuoshi ? this.data.xuanchuancuoshi : 0,
      //shiyitu: this.data.shiyitu ? this.data.shiyitu : 0,
      youhaidingdian: this.data.youhaidingdian ? this.data.youhaidingdian : 0,
      huishoutype: this.data.huishoutype ? this.data.huishoutype : 0,
      lajitongbuzhitypes: this.data.lajitongbuzhitypes ? this.data.lajitongbuzhitypes : 0,
      howtype: this.data.howtype ? this.data.howtype : 0,
      info: this.data.describe, //备注
      pics: picsStr, //图片 |分割多张图片
      hcs: '',
      sharewalldes: this.data.sharewalldes,
    }
    // console.log(params)
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
  },
  getSSCopywrite() {
    var text1 = [];var text2= [];var text4 = [];
    var text5 = [];var text7 = [];var text8 = [];
    var text3 = '',text6 = '',text9 = '';
    if(this.data.toufangdianqingkuangArr.length > 0){
      index++;
      let content = index+'.扔垃圾或拍摄时，垃圾投放点符合以下情况：'
      for(let i=0;i<this.data.toufangdianqingkuangArr.length;i++){
        switch (this.data.toufangdianqingkuangArr[i]) {
          case '1':
            if(this.data.issuliaodai == 1){
              text1 = '厨余垃圾基本都能正确投放、基本都是厨余垃圾、'
            }else{
              text1 = '厨余垃圾基本都能正确投放、厨余垃圾带袋投放、'
            }
            break;
          case '2':
            text1 += "可回收物基本都能正确投放、";
            break;
          case '4':
            text1 += "有害垃圾基本都能正确投放、";
            break;
          case '8':
            text1 += "其他垃圾基本都能正确投放、";
            break;
          case '16':
            text1 += "存在垃圾混合投放现象、";
            break;
        } 
      }
      let lastIndex = text1.lastIndexOf('、');
      if(lastIndex > -1) {
        text1 = content+text1.substring(0, lastIndex) + text1.substring(lastIndex + 1, text1.length)+'；\\n';
      }
    }
    if(this.data.lajifenleichangshiArr.length > 0){
      index++;
      let content = index+'.本小区垃圾分类做出以下尝试：'
      for(let i=0;i<this.data.lajifenleichangshiArr.length;i++){
        switch (this.data.lajifenleichangshiArr[i]) {
          case '1':
            text2 += "垃圾只能定时投放、";
            break;
          case '2':
            text2 += "楼宇已撤桶，垃圾只能定点集中投放、";
            break;
          case '4':
            text2 += "投放垃圾时总有人监督、";
            break;
          case '8':
            text2 += "投放垃圾时有24小时电子监控、";
            break;
          case '16':
            text2 += "不正确投放垃圾个人确实会被问责、";
            break;
          case '32':
            text2 += "以上都没有、";
            break;
        } 
      }
      let lastIndex = text2.lastIndexOf('、');
      if(lastIndex > -1) {
        text2 = content+text2.substring(0, lastIndex) + text2.substring(lastIndex + 1, text2.length)+'；\\n';
      }
    }
    if(this.data.weishengtype){
      index++;
      let content = index+'.我投放垃圾或拍摄时，垃圾桶和周边卫生'
      switch (this.data.weishengtype) {
        case '1':
          text3 = content+"经常清理，很干净；\\n";
          break;
        case '2':
          text3 = content+"条件一般；\\n";
          break;
        case '3':
          text3 = content+"很脏，有很多污物、蚊蝇，很臭；\\n";
          break;
      } 
    }
    if(this.data.fuzhusheshiArr.length > 0){
      index++;
      let content = index+'.本小区垃圾投放点有以下辅助设施：'
      for(let i=0;i<this.data.fuzhusheshiArr.length;i++){
        switch (this.data.fuzhusheshiArr[i]) {
          case '1':
            text4 += "净手设施（洗手处、消毒液等）、";
            break;
          case '2':
            text4 += "垃圾桶遮雨棚、";
            break;
          case '4':
            text4 += "破袋工具、";
            break;
          case '8':
            text4 += "垃圾桶盖拉手或脚踏、";
            break;
          case '16':
            text4 += "夜间照明、";
            break;
          case '32':
            text4 += "什么都没有、";
            break;
        } 
      }
      let lastIndex = text4.lastIndexOf('、');
      if(lastIndex > -1) {
        text4 = content+text4.substring(0, lastIndex) + text4.substring(lastIndex + 1, text4.length)+'；\\n';
      }
    }
    if(this.data.xuanchuancuoshiArr.length > 0){
      index++;
      let content = index+'.本小区的垃圾分类宣传措施：'
      for(let i=0;i<this.data.xuanchuancuoshiArr.length;i++){
        switch (this.data.xuanchuancuoshiArr[i]) {
          case '1':
            text5 += "有分类细则宣传板、";
            break;
          case '2':
            text5 += "有分类宣传横幅、标语、海报等、";
            break;
          case '4':
            text5 += "最近一年内有入户讲解、";
            break;
          case '8':
            text5 += "在业主微信群宣传介绍、";
            break;
          case '16':
            text5 += "最近一年内发放了分类垃圾桶或垃圾袋、";
            break;
          case '32':
            text5 += "最近一年内发放了垃圾分类细则宣传册、";
            break;
          case '64':
            text5 += "有投放点位置示意图或指示牌、";
            break;
          case '128':
            text5 += "什么都没有、";
            break;
        } 
      }
      let lastIndex = text5.lastIndexOf('、');
      if(lastIndex > -1) {
        text5 = content+text5.substring(0, lastIndex) + text5.substring(lastIndex + 1, text5.length)+'；\\n';
      }
    }
    if(this.data.youhaidingdian){
      index++;
      let content = index+'.本小区';
      switch (this.data.youhaidingdian) {
        case '3':
          text6 = content+"没见过有害垃圾桶；\\n";
          break;
        case '4':
          text6 = content+"的有害垃圾只回收特定品类（例如过期药品、灯管、电池）；\\n";
          break;
        case '5':
          text6 = content+"有有害垃圾桶，但投放不准确；\\n";
          break;
        case '6':
          text6 = content+"有有害垃圾桶，只投放有害垃圾；\\n";
          break;
      } 
    }
    if(this.data.huishoutypeArr.length > 0){
      index++;
      let content = index+'.本小区的可回收物的回收方式有：';
      for(let i=0;i<this.data.huishoutypeArr.length;i++){
        switch (this.data.huishoutypeArr[i]) {
          case '1':
            text7 += "有可回收物桶、";
            break;
          case '2':
            text7 += "电商预约上门回收、";
            break;
          case '4':
            text7 += "周边有废品回收站、";
            break;
          case '8':
            text7 += "有智能回收箱、";
            break;
          case '16':
            text7 += "什么都没有、";
            break;
          case '32':
            text7 += "随便放，有人拉走、";
            break;
        } 
      }
      let lastIndex = text7.lastIndexOf('、');
      if(lastIndex > -1) {
        text7 = content+text7.substring(0, lastIndex) + text7.substring(lastIndex + 1, text7.length)+'；\\n';
      }
    }
    if(this.data.lajitongbuzhitypesArr.length > 0){
      index++;
      let content = index+'.本小区的公共垃圾桶布置在：'
      for(let i=0;i<this.data.lajitongbuzhitypesArr.length;i++){
        switch (this.data.lajitongbuzhitypesArr[i]) {
          case '1':
            text8 += "撤桶并点后的分类驿站、";
            break;
          case '2':
            text8 += "高楼每层楼内设垃圾桶、";
            break;
          case '4':
            text8 += "各楼门下一组垃圾桶（有厨余桶）、";
            break;
          case '8':
            text8 += "各楼门下一组垃圾桶（无厨余桶）、";
            break;
          case '16':
            text8 += "地下车库有一组垃圾桶（有厨余桶）、";
            break;
          case '32':
            text8 += "地下车库有一组垃圾桶（无厨余桶）、";
            break;
          case '64':
            text8 += "小区内有只收厨余垃圾的收集点、";
            break;
          case '128':
            text8 += "流动车定时分类收集每户垃圾、";
            break;
          case '256':
            text8 += "流动车定时混合收集每户垃圾、";
            break;
        } 
      }
      let lastIndex = text8.lastIndexOf('、');
      if(lastIndex > -1) {
        text8 = content+text8.substring(0, lastIndex) + text8.substring(lastIndex + 1, text8.length)+'；\\n';
      }
    }
    if(this.data.howtype){
      index++;
      let content = index+'.我家的垃圾分类';
      switch (this.data.howtype) {
        case '1':
          text9 = content+"能做到严格四分类；";
          break;
        case '2':
          text9 = content+"只把厨余垃圾分出来；";
          break;
        case '3':
          text9 = content+"只把可回收物分出来；";
          break;
        case '4':
          text9 = content+"只把有害垃圾分出来；";
          break;
        case '5':
          text9 = content+"随便扔，不分类；";
          break;
      } 
    }
    let data = text1+text2+text3+text4+text5+text6+text7+text8+text9;
    let lastIndex = data.lastIndexOf('；');
    if(lastIndex > -1) {
      console.log(data.substring(0, lastIndex))
      console.log(data.substring(lastIndex + 1, data.length));
      data = data.substring(0, lastIndex)+'。' + data.substring(lastIndex + 1, data.length);
    }
    let address = '我在【'+app.globalData.location.city+'】【'+ app.globalData.location.district +'】【'+app.globalData.location.name+'】进行垃圾分类随手拍，该小区垃圾分类情况如下所示：\\n \\n';
    let mapBlue = '\\n#垃圾分类##随手拍点亮小区垃圾分类#@蔚蓝地图';
    this.setData({
      sharewalldes: address+data+mapBlue
    })
    // console.log(this.data.sharewalldes)
    // console.log(text1)
    // console.log(text2)
    // console.log(text3)
    // console.log(text4)
    // console.log(text5)
    // console.log(text6)
    // console.log(text7)
    // console.log(text8)
    // console.log(text9)
  }
});

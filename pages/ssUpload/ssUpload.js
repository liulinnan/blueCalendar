let index = 0,
  items = [],
  flag = true,
  itemId = 1;
const hCw = 1.62; // 图片宽高比
const canvasPre = 1; // 展示的canvas占mask的百分比
const maskCanvas = my.createCanvasContext('maskCanvas');
const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    selectList: [],
    itemList: [],
    // bigImg: '/images/logo.png', //缩略图
    currentData: 0, //选中缩略图
    watermarkList: [ //水印列表
      '/images/ss-watermark1.png',
      '/images/ss-watermark2.png',
      '/images/ss-watermark3.png',
      '/images/ss-watermark4.png'
    ], 
    watermarkState: 0, //水印状态 0关闭 1打开
    watermarkIndex: 0, //选中的水印下标
    sysData: '',
  },
  onLoad(options) {
    let pathArr = options.pathArr.split(",");
    this.setData({
      bigImg: pathArr[0],
      selectList: pathArr,
      key: options.key,
      itemList: [],
    })
    my.getSystemInfo({
      success: res => {
        console.log(res);
        this.setData({
          sysData: res
          //canvasWidth: sysData.windowWidth * canvasPre * 2, // 如果觉得不清晰的话，可以把所有组件、宽高放大一倍
          //canvasHeight: sysData.windowWidth * canvasPre * hCw * 2,
        })
        this.getImgWH(); //获取图片的等比宽高比
        this.getPM(); //绘制水印
      }
    })
    items = this.data.itemList;
    this.drawTime = 0;
  },
  switchImg(e) { //切换缩略图
    this.setData({
      bigImg: e.target.dataset.item,
      currentData: e.target.dataset.current
    })
  },
  deleteImg(e) { //删除某一项
    if(this.data.selectList.length > 1){
    this.data.selectList.splice(e.target.dataset.index, 1);
    this.setData({
      bigImg: this.data.selectList[e.target.dataset.index],
      selectList: this.data.selectList,
      currentData: e.target.dataset.index
    });
   }else{
     publicFun.showToast("至少保留一张照片上传");
   }
  },
  addImg() { //添加照片
    var that = this;
    my.chooseImage({
      sourceType: ['camera','album'],
      count: 6 - this.data.selectList.length,
      success: (res) => {
        const path = res.apFilePaths;
        res.apFilePaths.forEach((imgItem) => {
          that.data.selectList.push(imgItem);
        });
        this.setData({
          selectList: this.data.selectList
        });
      },
      fail:()=>{
          publicFun.showToast("选择失败，请重新选择", 2000);
        }
    })
  },
  getImgWH() {
    my.getImageInfo({
      src: this.data.selectList[0],
      success:(res) => {
        let imgScale = res.height / res.width;//图片高宽比
        let windowScale = this.data.sysData.windowHeight / this.data.sysData.windowWidth;
        console.log(imgScale, windowScale)
        if(imgScale < windowScale){//图片高宽比小于屏幕高宽比
          //图片缩放后的宽为屏幕宽
          this.setData({
            imgWidth: this.data.sysData.windowWidth*2,
            imgHeight: (this.data.sysData.windowWidth * res.height) / res.width*2
          })
        }else{ //图片高宽比大于屏幕高宽比
          //图片缩放后的高为屏幕高
          this.setData({
            imgWidth: (this.data.sysData.windowHeight * res.width) / res.height*2,
            imgHeight: this.data.sysData.windowHeight*2,
          })
        }
      }
    })
  },
  getPM() {
    let that = this;
    let city = app.globalData.location.city;
    let lat = app.globalData.location.lat;
    let lng = app.globalData.location.lng;
    if(app.globalData.location.city){
      app.getSScontent(city, lat, lng).then((res) => {
        var params  = {
          MCid: res.A.Id, //监测点id
          IsCity: 0, //0 监测点 1城市
        }
        publicFun.requestPostApi(publicFun.api.waterMarkPM, params, this, this.successWaterMarkPm);
      });
    }else{
      var watermarkUrl = 'watermark-zjhb.png';
      my.downloadFile({
        url: 'https://www.ipe.org.cn/public/static/images/'+ watermarkUrl,
        success(wkUrl) {
          console.log(wkUrl)
          that.setDropItem({
            url: wkUrl.apFilePath
          });
        }
      })
    }
  },
  successWaterMarkPm(res, selfObj) {
    var city = app.globalData.location.city.substr(0,app.globalData.location.city.length-1);
    if(res.S == 1){
      selfObj.getWatermark(city, res.X[0])
    }
  },
  getWatermark(city, PM) {
    var that = this;
    if(city){
      let ctx = my.createCanvasContext('watermarkCanvas');
      ctx.setFillStyle('#ffffff'); // 文字颜色：黑色  
      ctx.setFontSize(60);
      ctx.setTextAlign('center'); //对齐方式
      ctx.fillText(city, 116, 66); //在画布上绘制被填充的文本

      ctx.setFontSize(30);
      ctx.setTextAlign('center'); // 文字居中
      ctx.fillText('PM2.5：'+PM+'μg/m³', 150,116); //在画布上绘制被填充的文本

      ctx.drawImage('/images/icon-horn.png', 210, 12, 55, 55);
      ctx.draw(false, ()=> {
        ctx.toTempFilePath({
          quality: 1,
          success(resUrl) {
            that.setDropItem({
              url: resUrl.apFilePath
            });
          },
        });
      })
    }
  },
  setDropItem(imgData) {
    let data = {}
    my.getImageInfo({
      src: imgData.url,
      success: res => {
        // 初始化数据
        data.width = res.width/2; //宽度
        data.height = res.height/2; //高度
        data.image = imgData.url; //地址
        data.id = ++itemId; //id
        data.top = this.data.imgHeight/4 - res.height/4; //top定位
        data.left = this.data.imgWidth/4 - res.width/4; //left定位
        //圆心坐标
        data.x = data.left + data.width / 2;
        data.y = data.top + data.height / 2;
        data.scale = 1; //scale缩放
        data.oScale = 1; //方向缩放
        // data.rotate = 1; //旋转角度
        data.active = false; //选中状态
        items[items.length] = data;
        this.setData({
          itemList: items
        })
      }
    })
  },
  WraptouchStart: function(e) {
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        index = i;
        items[index].active = true;
      }
    }
    this.setData({
      itemList: items
    })

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;
  },
  WraptouchMove(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    // console.log('WraptouchMove', e)
    items[index]._lx = e.touches[0].clientX;
    items[index]._ly = e.touches[0].clientY;

    items[index].left += items[index]._lx - items[index].lx;
    items[index].top += items[index]._ly - items[index].ly;
    items[index].x += items[index]._lx - items[index].lx;
    items[index].y += items[index]._ly - items[index].ly;

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;
    //console.log(items)
    this.setData({
      itemList: items
    })
  },
  WraptouchEnd() {
    // this.synthesis()
  },
  oTouchStart(e) {
    //找到点击的那个图片对象，并记录
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        index = i;
        items[index].active = true;
      }
    }
    //获取作为移动前角度的坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    //移动前的角度
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
    //获取图片半径
    items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top);
  },
  oTouchMove: function(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    //记录移动后的位置
    items[index]._tx = e.touches[0].clientX;
    items[index]._ty = e.touches[0].clientY;
    //移动的点到圆心的距离
    items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx, items[index]._ty - 10)

    items[index].scale = items[index].disPtoO / items[index].r;
    items[index].oScale = 1 / items[index].scale;

    //移动后位置的角度
    items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
    //角度差
    //items[index].new_rotate = items[index].angleNext - items[index].anglePre;

    //叠加的角度差
    //items[index].rotate += items[index].new_rotate;
    //items[index].angle = items[index].rotate; //赋值

    //用过移动后的坐标赋值为移动前坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)

    //赋值setData渲染
    this.setData({
      itemList: items
    })

  },
  getDistancs(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    return Math.sqrt(
      ox * ox + oy * oy
    );
  },
  /*
   *参数1和2为图片圆心坐标
   *参数3和4为手点击的坐标
   *返回值为手点击的坐标到圆心的角度
   */
  countDeg: function(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    var to = Math.abs(ox / oy);
    var angle = Math.atan(to) / (2 * Math.PI) * 360;
    // console.log("ox.oy:", ox, oy)
    if (ox < 0 && oy < 0) //相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
    {
      angle = -angle;
    } else if (ox <= 0 && oy >= 0) //左下角,3象限  
    {
      angle = -(180 - angle)
    } else if (ox > 0 && oy < 0) //右上角，1象限  
    {
      angle = angle;
    } else if (ox > 0 && oy > 0) //右下角，2象限  
    {
      angle = 180 - angle;
    }
    return angle;
  },
  synthesis() { // 合成图片
    console.log('合成图片')
    maskCanvas.save();
    maskCanvas.beginPath();
    //一张白图  可以不画
    maskCanvas.setFillStyle('#fff');
    maskCanvas.fillRect(0, 0,  this.data.imgWidth, this.data.imgHeight)
    maskCanvas.closePath();
    maskCanvas.stroke();

    //画背景 hCw 为 1.62 背景图的高宽比
    maskCanvas.drawImage(this.data.selectList[0], 0, 0, this.data.imgWidth, this.data.imgHeight);
    /*
        num为canvas内背景图占canvas的百分比，若全背景num =1
        prop值为canvas内背景的宽度与可移动区域的宽度的比，如一致，则prop =1;
      */
    //画组件
    const num = 1,
      prop = 1;
    items.forEach((currentValue, index) => {
      maskCanvas.save();
      maskCanvas.translate(this.data.imgWidth/2 * (1 - num) / 2, 0);
      maskCanvas.beginPath();
      maskCanvas.translate(currentValue.x * prop * 2, currentValue.y * prop * 2); //圆心坐标
      // maskCanvas.rotate(currentValue.angle * Math.PI / 180);
      maskCanvas.translate(-(currentValue.width * currentValue.scale * prop), -(currentValue.height * currentValue.scale * prop))
      maskCanvas.drawImage(currentValue.image, 0, 0, currentValue.width * currentValue.scale * prop * 2, currentValue.height * currentValue.scale * prop * 2);
      maskCanvas.restore();
    })
    maskCanvas.draw(false, (e) => {
      maskCanvas.toTempFilePath({
        success: res => {
          let arr = [];
          arr.push(res.apFilePath);
          this.uploadImg(arr);
        }
      }, this)
    })
  },

  openMask () {
    if (this.drawTime == 0) {
      this.synthesis()
    }
  },
  // 上传图片获取识别path
  uploadImg(arr) {
    my.uploadFile({
      url: publicFun.api.commonImg,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      fileType: 'image',
      fileName: 'filename',
      filePath: arr[0],
      formData: {
        uid: app.globalData.userid,
        miyao: publicFun.api.imgMiyao
      },
      success: res => {
        let ress = JSON.parse(res.data);
        if(ress.S == 1){
          my.navigateTo({
            url: '/pages/ssRelease/ssRelease?pathArr='+arr+'&path='+ress.path+'&key='+this.data.key
          });
        }
      }
    })
  },

  openWatermark() { //打开/关闭水印列表
    if(this.data.watermarkState === 1){
      this.setData({
        watermarkState: 0
      })
    }else{
      this.setData({
        watermarkState: 1
      })
    }
  },
  selectWatermark(e) { //选择水印
    this.setData({
      watermarkIndex: e.target.dataset.index
    })
  }
});

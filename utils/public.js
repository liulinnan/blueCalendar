import { requestGetApi, requestPostApi, api} from '/utils/request'
import { Base64 } from '/utils/base64';

//获取当前时间戳转换为时间 
function getTimestamp() {  
  var timestamp = Date.parse(new Date());  
  timestamp = timestamp / 1000;  
  return getTime(timestamp);
}

//获取当前年月日
function getThisDate() {
  var now = new Date(); //当前日期 
	var nowYear = now.getFullYear(); //当前年 
	var nowMonth = now.getMonth(); //当前月 
	let start = timeStampChangeDate(new Date(nowYear, nowMonth, 1));
	let end = timeStampChangeDate(new Date(nowYear, nowMonth+1, 0));
  return {start: start, end: end}
}

// 时间戳转换为2020-02-20 xx:xx:xx格式
function getTime(timestamp) {
  //获取当前时间  
  var n = timestamp * 1000;  
  var date = new Date(n);  
  //年  
  var Y = date.getFullYear();  
  //月  
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);  
  //日  
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();  
  //时  
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();  
  //分  
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();  
  //秒  
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(); 

  var time = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
  return time;
}
//获取当前时间转为年月日点分格式
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
  var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
  var currentdate = date.getFullYear() + '年'  + month  + '月'  + strDate
      + '日' + date.getHours()  + '点' + date.getMinutes()
      + '分'; //+ date.getSeconds();
  return currentdate;
}

//日期转为时间戳
function timeStampChangeDate(date) {
  let timeStamp = new Date(date).getTime();
  var date = new Date(timeStamp);  
  //年  
  var Y = date.getFullYear();  
  //月  
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);  
  //日  
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();  
  var time = Y+'-'+M+'-'+D;
  return time;
}

//秒转时
function formatSeconds(value) {

    var theTime = parseInt(value);// 秒
    var hour= 0;// 小时

    if(theTime > 60) {
      hour = (theTime/3600).toFixed(0);
      return hour;
  }
}

// 获取位置
function formatLocation(longitude, latitude) {
  longitude = Number(longitude).toFixed(2)
  latitude = Number(latitude).toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}
//数组去重
function arrayUnique(arr) {
	var result = [], hash = {};
	for (var i = 0, elem; (elem = arr[i]) != null; i++) {
		if (!hash[elem]) {
			result.push(elem);
			hash[elem] = true;
		}
	}
	return result;
}
//跳转登录
function jumpLogin() {
  return my.navigateTo({
    url: '/pages/login/login'
  });
}
//弹窗
function showToast(content, duration) {
  return my.showToast({
    type: 'none',
    content: content,
    duration: duration ? duration: 1000,
  });
}

// 判断图片大小是否满足需求
function imageSizeIsLessLimitSize(imagePath, limitSize, lessCallBack, moreCallBack) {
  my.getFileInfo({
      apFilePath: imagePath,
      success(res) {
          console.log("压缩前图片大小:", res.size / 1024, 'kb');
          if (res.size > 1024 * limitSize) {
              moreCallBack();
          } else {
              lessCallBack();
          }
      }
  })
};

/**
 * 获取画布图片 
 */
// 利用cavas进行压缩  每次压缩都需要ctx.draw()  my.canvasToTempFilePath()连用
function getCanvasImage(canvasId, imagePath, imageW, imageH, getImgsuccess) {
    const ctx = my.createCanvasContext(canvasId);
    ctx.drawImage(imagePath, 0, 0, imageW, imageH);
    ctx.draw(false, setTimeout(function() { // 一定要加定时器，因为ctx.draw()应用到canvas是有个时间的
        ctx.toTempFilePath({
            //canvasId: canvasId,
            x: 0,
            y: 0,
            width: imageW,
            height: imageH,
            quality: 1,
            success: function(res) {
              console.log(res);
              getImgsuccess(res.tempFilePath);
              my.getFileInfo({
                apFilePath: res.apFilePath,
                success:function(res){
                  console.log(res);
                  console.log('压缩后：'+res.size/1024+'kb')
                }
              })
            },
        });
    }, 200));
};

// 主调用方法
/**
 * 获取小于限制大小的Image, limitSize默认为100KB，递归调用。
 */
function getLessLimitSizeImage(canvasId, imagePath, limitSize = 200, drawWidth, callBack) {
  imageSizeIsLessLimitSize(imagePath, limitSize,
      (lessRes) => {
        console.log(imagePath);
        callBack(imagePath);
      },
      (moreRes) => {
          my.getImageInfo({
              src: imagePath,
              success: function(imageInfo) {
                  console.log(imageInfo)
                  var maxSide = Math.max(imageInfo.width, imageInfo.height);
                  console.log(maxSide);
                  //画板的宽高默认是windowWidth
                  var windowW = drawWidth;
                  var scale = 1;
                  if (maxSide > windowW) {
                      scale = windowW / maxSide;
                      console.log(scale);
                  }
                  var imageW = Math.trunc(imageInfo.width * scale);
                  var imageH = Math.trunc(imageInfo.height * scale);
                  console.log('调用压缩', imageW, imageH);
                  getCanvasImage(canvasId, imagePath, imageW, imageH,
                      (pressImgPath) => {
                          getLessLimitSizeImage(canvasId, pressImgPath, limitSize, drawWidth * 0.95, callBack);
                      }
                  );
              }
          })
      }
  )
};

module.exports = {
  Base64,
  requestGetApi,
  requestPostApi,
  api,
  getTimestamp,
  getThisDate,
  getTime,
  getNowFormatDate,
  timeStampChangeDate,
  formatSeconds,
  
  formatLocation,
  arrayUnique,
  jumpLogin,
  showToast,
  
  getLessLimitSizeImage,
}


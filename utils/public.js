import { requestGetApi, requestPostApi, api} from '/utils/request'
// my.getStorage({
//   key: 'userid',
//   success: function(res) {
//     res.key = res.data
//   },
// });
//const userid = '' //userid

// 转换为当前时间
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
  //console.log(time); 
  //return timestamp;
  return time;
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
    url: '../login/login'
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

module.exports = {
  requestGetApi,
  requestPostApi,
  api,
  getTime,
  formatLocation,
  arrayUnique,
  //userid,
  jumpLogin,
  showToast
}

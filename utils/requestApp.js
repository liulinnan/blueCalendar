const apiUrl = 'https://nginx.ipe.org.cn/app/app_v3.asmx';
const imgUrl = 'https://wwwoa.ipe.org.cn';

export const LoginAccount = (data) => {return requestPostApi(apiUrl + '/User_Login_V', data)}; //第三方登录

export const quickLogin = (data) => {return requestPostApi(apiUrl + '/User_RegisterOrLogin', data)} //快捷登录
export const quickLoginCode = (data) => {return requestPostApi(apiUrl + '/User_RegisterOrLogin_SendCode', data)}  //快捷登录手机号验证码

export const sendCode = (data) => {return requestPostApi(apiUrl + '/ModifyUser_HeBing_PhoneSendCode', data)} //绑定手机号发送验证码
export const bindMobile = (data) => {return requestPostApi(apiUrl + '/ModifyUser_HeBing_ModifyPhone', data)} //绑定手机号
export const mergeAccount = (data) => {return requestPostApi(apiUrl + '/ModifyUser_HeBing_V1', data)} //合并数据

// request get 请求
const requestGetApi = (url, param) => {
  const app = getApp();
  if(app.globalData.secondCount){
    param.miyao = app.getMiYao();
  }
  param.Token = '';
  return new Promise((resolve, reject) => {
    // console.log(param)
    my.request({
      url: url,
      method: 'GET',
      data: param,
      // dataType: 'json',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success (res) {
        // console.log(res)
        resolve(res.data)
      },
      fail (err) {
        console.log(err)
        reject(err)
      }
    })
  })
}
// request post 请求
const requestPostApi = (url, param) => {
  const app = getApp();
  console.log(app)
  if(app.globalData.secondCount){
    param.miyao = app.getMiYao();
  }
  param.Token = '';
  return new Promise((resolve, reject) => {
    my.request({
      url: url,
      method: 'POST',
      data: param,
      // dataType: 'json',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success (res) {
        // console.log(res)
        resolve(res.data)
      },
      fail (err) {
        console.log(err)
        reject(err)
      }
    })
  })
}
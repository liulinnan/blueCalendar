const apiUrl = 'https://nginx.ipe.org.cn/app/app_v3.asmx';
const imgUrl = 'https://wwwoa.ipe.org.cn';
const api = {
  //apiUrl: 'https://nginx.ipe.org.cn/app/app_v3.asmx',
  imgUrlUpload: imgUrl + '/App/APP_V3_Solve.ashx', //上传图片 //动态密钥
  commonImg: imgUrl + '/App/CommonUpload.ashx', //月历上传封面 //固定密钥
  activityImg: imgUrl + '/SiteManage/BlueMapCalendar/UploadImg.aspx', //上传活动截图
  miyao: apiUrl + '/GetSecondCount',
  imgMiyao: '24646572424578787574454', //上传图片密钥

  getAuthCode: apiUrl + '/GetZhiFubaoCode', //获取支付宝user_id
  LoginAccount: apiUrl + '/User_Login_V', //第三方登录
  sendCode: apiUrl + '/ModifyUser_HeBing_PhoneSendCode', //绑定手机号发送验证码
  bindMobile: apiUrl + '/ModifyUser_HeBing_ModifyPhone', //绑定手机号
  mergeAccount: apiUrl + '/ModifyUser_HeBing_V1', //合并数据
  quickLogin: apiUrl + '/User_RegisterOrLogin', //快捷登录
  quickLoginCode: apiUrl + '/User_RegisterOrLogin_SendCode', //快捷登录手机号验证码

  forgetSendCode: apiUrl + '/ModifyUser_PwdSendCode', //忘记密码发送验证码
  forgetSuccess: apiUrl + '/ModifyUser_PwdValidateCodeAndEdit', //设置密码成功
  
  userData: apiUrl + '/User_Center', //用户信息
  
  ssTab: apiUrl + '/ShareWallTab_V1', //晒晒tab
  ssList: apiUrl + '/ShareList_V4_1_NP', //晒晒列表/详情
  followList: apiUrl + '/UserCenter_Users', //关注列表
  follow: apiUrl + '/UserCenter_AddUsers', //关注
  unfollow: apiUrl + '/UserCenter_RemoveUsers', //取消关注
  //followDetails: apiUrl + '/UserCenter_Users_Details' //关注的人详情
  like: apiUrl + '/ShareWall_Praise', //点赞
  unlike: apiUrl + '/ShareWall_Praise_Remove', //取消点赞
  commentSub: apiUrl + '/ShareWall_AddComment_V2', //发评论
  commentAllList: apiUrl + '/ShareCommentList_V1', //全部评论列表
  ssContent: apiUrl + '/GetAQIInfo_NameAndLL', //获取默认空气内容
  waterMarkPM:apiUrl + '/GetAQIBasicByMCid', //获取水印上PM
  ssUpload: apiUrl + '/AddShare_V6_1', //发布晒晒
  ssTagList: apiUrl + '/GetShareWallType_V4', // 上传标签list
  tagUpload: apiUrl + '/ShareList_AddType_V3_1', //提交标签

  ssAudit: apiUrl + '/ShareWall_ShenHePics', //审核列表
  myDynamic: apiUrl + '/ShareWall_MyMessage', //我的动态
  GetZhiFubaoCode: apiUrl + '/GetZhiFubaoCode', //支付宝uid
  userFeedBack: apiUrl + '/UserFeedBack', //用户反馈
  userFeedBackList: apiUrl + '/UserFeedBack_Reply', //用户反馈回复列表
  
  monthlyCalendar: apiUrl + '/UserRiLiDetail_V4_1', //获取月份月历
  DanRiLiList: apiUrl + '/RiLi_DanRiLi_V4_0', //获取月份月历下发布过的月历封面列表
  danRiLiDetails: apiUrl + '/ShareList_V3_1_UserList', //单日历详情
  //getWaterMark: apiUrl + '/GetWaterMark_V3_1', //水印

  getThreeHours: apiUrl + '/GetZhiFubaoCharitytime', //获取公益时
  getriskContent: apiUrl + '/GetZhiFubaoRiskContent', //文本风险识别

  submitGarbage: apiUrl + '/Garbage_Submit_V2', //提交垃圾分类信息
  garbageDetail: apiUrl + '/Garbage_Detail_V2', //垃圾分类问题详情

  ssCurrentDetail: apiUrl + '/ShareContent_V1', //ss详情页（只有当前的一条）
  ssCurrentDetailType: apiUrl + '/GetShareWallTypeByWallId_V3_1', //ss详情页（只有当前的一条） type
  ssSharePictureList: apiUrl + '/SharePictureList', //ss详情页多图
  ssCommentList: apiUrl + '/ShareCommentList' //ss详情全部评论
}
/**
 * @desc    API请求接口类封装
 */
/**
 * POST请求API
 * @param  {String}   url         接口地址
 * @param  {Object}   params      请求的参数
 * @param  {Object}   sourceObj   来源对象
 * @param  {Function} successFun  接口调用成功返回的回调函数
 * @param  {Function} failFun     接口调用失败的回调函数
 * @param  {Function} completeFun 接口调用结束的回调函数(调用成功、失败都会执行)
 */
function requestPostApi(url, params, sourceObj, successFun, dataParams, failFun, completeFun) {
    requestApi(url, params, 'POST', sourceObj, successFun, dataParams, failFun, completeFun)
}
/**
 * GET请求API
 * @param  {String}   url         接口地址
 * @param  {Object}   params      请求的参数
 * @param  {Object}   sourceObj   来源对象
 * @param  {Function} successFun  接口调用成功返回的回调函数
 * @param  {Function} failFun     接口调用失败的回调函数
 * @param  {Function} completeFun 接口调用结束的回调函数(调用成功、失败都会执行)
 */
function requestGetApi(url, params, sourceObj, successFun, dataParams, failFun, completeFun ) {
    requestApi(url, params, 'GET', sourceObj, successFun, dataParams, failFun, completeFun )
}
/**
 * 请求API
 * @param  {String}   url         接口地址
 * @param  {Object}   params      请求的参数
 * @param  {String}   method      请求类型
 * @param  {Object}   sourceObj   来源对象
 * @param  {Function} successFun  接口调用成功返回的回调函数
 * @param  {Function} failFun     接口调用失败的回调函数
 * @param  {Function} completeFun 接口调用结束的回调函数(调用成功、失败都会执行)
 */
function requestApi(url, params, method, sourceObj, successFun, dataParams, failFun, completeFun) {
    var contentType = 'application/x-www-form-urlencoded';
    const app = getApp();
    params.miyao = app.getMiyao();   
    params.Token = '';
    my.request({
        url:    url,
        headers: {'content-type': contentType},
        method: method,
        data:   params,
        dataType: 'json',
        success: function (res) {
          if(res.data.S == 1){
            my.hideLoading();
          }
          typeof successFun  == 'function' && successFun(res.data, sourceObj, this, dataParams)
        },
        fail: function (res) {
          my.hideLoading();
          my.showToast({
            type: 'none',
            content: res,
          });
          typeof failFun  == 'function' && failFun(res.data, sourceObj, this)
        },
        complete: function (res) {
            typeof completeFun == 'function' && completeFun(res.data, sourceObj, this,)
        }
    })
}
module.exports = { 
    api,
    requestPostApi,
    requestGetApi
}
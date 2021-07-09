const app = getApp()
const publicFun = require('/utils/public.js')
import { quickLoginCode,quickLogin, } from '/utils/requestApp'
Page({
  data: {
    text: '获取验证码', //按钮文字
    currentTime: 61, //倒计时
    disabled: false, //按钮是否禁用
    phone: '', //获取到的手机栏中的值
    code: '',
    interval: null
  },
  onLoad() {
    let that = this;
    my.getStorage({
      key: 'phone',
      success: function(res) {
        if(res.data){
          that.setData({
            phone: Number(res.data)
          })
        }
      },
    });
  },
  phoneInput (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  codeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },
  async bindButtonTap () {
    var that = this;
    that.setData({
      disabled: true, 
      color: '#A2BEEE',
    })
    var phone = that.data.phone;
    var currentTime = that.data.currentTime //把手机号跟倒计时值变例成js值
    
    var warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空
    
    if (phone == '') {
      warn = "手机号码不能为空";
    } else {
      try {
        var params  = {
          Phone: that.data.phone,
          Type: app.globalData.mobileInfo
        }
        console.log(params)
        //当手机号正确的时候提示用户短信验证码已经发送
        const res = await quickLoginCode(params)
        if (res.S == 1) {
          publicFun.showToast(res.M)
          //设置一分钟的倒计时
           clearInterval(that.interval)
           that.interval = setInterval(function () {
            currentTime--; //每执行一次让倒计时秒数减一
            that.setData({
              text: '倒计时'+currentTime + '秒', //按钮文字变成倒计时对应秒数
            })
            //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
            if (currentTime <= 0) {
              clearInterval(that.interval)
              that.setData({
                text: '重新发送',
                currentTime: 61,
                disabled: false,
                color: '#437DDE'
              })
            }
          }, 1000);
        }else{
          publicFun.showToast(res.M);
        }
      } catch (e) {
        console.log(e)
      }
    };
    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (warn != null) {
      publicFun.showToast(warn)
      that.setData({
        disabled: false,
        color: '#437DDE'
      })
      return;
    };
  },
  async bindTap() {
    let that = this;
    try {
      var params  = {
        Phone: this.data.phone,
        Code: this.data.code,
        Type: app.globalData.mobileInfo
      }
      const res = await quickLogin(params)
      if (res.S == 1) {
        clearInterval(that.interval)
        publicFun.showToast('登录成功');
        app.globalData.userid = res.R;
        my.setStorage({
          key: 'userid',
          data: res.R
        }); 
        my.setStorage({
          key: 'phone',
          data: that.data.phone
        });
        my.switchTab({
          url: '/pages/index/index'
        });
      }else{
        publicFun.showToast(res.M);
      }
    } catch (e) {
      console.log(e)
    }
  }
});

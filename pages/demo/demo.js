Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showInput: false, //控制输入栏
  },
 
  //返回上一层
  goback() {
    wx.navigateBack({
      success(res) {
        console.log("返回成功")
      },
      fail(res) {
        console.log("error")
      }
    })
  },
 
  //点击出现输入框
  showInput: function() {
    this.setData({
      showInput: true
    })
    console.error('show+++++++++++')
  },
  //隐藏输入框
  onHideInput: function() {
    this.setData({
      showInput: false
    })
    console.error('hide+++++++++++')
  },
 
})
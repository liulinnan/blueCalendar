Page({
  data: {
    selectList: [
      '/images/logo.png',
      '/images/icon-like.png',
      '/images/icon-unlike.png',
      '/images/logo.png',
      '/images/icon-like.png',
      '/images/icon-unlike.png',
    ],
    bigImg: '/images/logo.png', //缩略图
    currentData: 0, //选中缩略图
    watermarkList: [ //水印列表
      '/images/ss-watermark1.png',
      '/images/ss-watermark2.png',
      '/images/ss-watermark3.png',
      '/images/ss-watermark4.png'
    ], 
    watermarkState: 0, //水印状态 0关闭 1打开
    watermarkIndex: 0, //选中的水印下标
  },
  onLoad() {},
  switchImg(e) { //切换缩略图
    this.setData({
      bigImg: e.target.dataset.item,
      currentData: e.target.dataset.current
    })
  },
  deleteImg(e) { //删除某一项
    console.log(e.target.dataset.index)
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

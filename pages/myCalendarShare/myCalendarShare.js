const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    fmurl: ''
  },
  onLoad(options) {
    this.setData({
      fmurl: options.fmurl
    })
  },
  saveImage() {
    my.saveImage({
      url: this.data.fmurl,
      showActionSheet: true,
      success: () => {
        publicFun.showToast("保存成功");
      },
    });
  },
  previewImage() {
    my.previewImage({
      urls: [ this.data.fmurl],
      enablesavephoto: true,
      success: () => {
        publicFun.showToast("保存成功");
      },
    });
  },
});

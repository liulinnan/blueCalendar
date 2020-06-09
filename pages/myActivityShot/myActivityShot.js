const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    uploadStatus: 0, //0未选择 1已选择
    uploadUrl: '', //文件路径
    disabled: false,
  },
  uploadYl() {
    var that = this;
    my.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        console.log(res);
        const path = res.apFilePaths[0];
        //that.uploadFile(path);
        if(res.apFilePaths.length == 1){
          that.setData({
            uploadStatus: 1,
            uploadUrl: path
          });
        }else{
          my.showToast({
            content: '请选择一张照片上传', // 文字内容
          });
        }
      },
    })
  },
  uploadFile() {
    var that = this;
    my.uploadFile({
      url: publicFun.api.activityImg,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      fileType: 'image',
      fileName: 'filename',
      filePath: this.data.uploadUrl,
      formData: {
        uid: app.globalData.userid,
        datetime: publicFun.getTimestamp()
      },
      success: res => {
        let data = JSON.parse(res.data);
        console.log(data);
        if(data.S == 1){
          publicFun.showToast(data.M);
          that.setData({
            uploadStatus: 0,
            uploadUrl: '',
          })
        }else{
          publicFun.showToast(data.M);
        }
      },
      fail: function(res) {
        publicFun.showToast("提交失败")
      },
    });
  },
});

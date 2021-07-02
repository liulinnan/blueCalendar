const app = getApp();
const publicFun = require('/utils/public.js');
Component({
  mixins: [],
  data: {
    //isIphoneX: app.globalData.systemInfo.model.includes('iPhone X'),
    //isIphoneX: app.globalData.systemInfo.model.search('iPhone X') != -1 ? true : false,
    tabbar: {}
  },
  props: {
    optionsData: {}
  },
  didMount() {
    const {optionsData} = this.props;
    this.setData({
      tabbar: optionsData
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    chooseSSImg() {//上传ss
      let that = this;
      if(app.globalData.userid){
        my.chooseImage({
          chooseImage: 1,
          sourceType: ['camera','album'],
          count: 1,
          success: (res) => {
            //console.log(JSON.stringify(res));
            //const path = res.apFilePaths;
            my.compressImage({
              apFilePaths: res.apFilePaths,
              compressLevel: 1,
              success: data => {
                console.log(data.apFilePaths);
                my.navigateTo({
                  url: '/pages/ssUpload/ssUpload?pathArr='+data.apFilePaths+'&key='+that.data.ssKey //水印页面
                  //url: '/pages/ssRelease/ssRelease?pathArr='+data.apFilePaths+'&key='+that.data.ssKey//发布页面
                });
              }
          })
          },
          fail:()=>{
            my.getSetting({
              success: (res) => {
                //console.log(res.authSetting+111);
                if(!res.authSetting.album || !res.authSetting.camera){
                  publicFun.showToast("没有相机或者相册访问权限，请授权", 2000);
                  my.openSetting({
                    success: (res) => {
                      console.log(res.authSetting);
                    }
                  });
                }
              },
            }) 
          }
        })
      }else{
        publicFun.jumpLogin();
      }
    },
  },
});

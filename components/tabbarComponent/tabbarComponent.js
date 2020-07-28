const app = getApp();
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
  methods: {},
});

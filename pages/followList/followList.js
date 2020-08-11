const app = getApp();
const publicFun = require('/utils/public.js');
Page({
  data: {
    followList: [],
  },
  onLoad() {
    this.setData({
      followList: []
    })
    this.getFollowList();
  },
  getFollowList() { //获取关注列表
    var params  = {
      userid: app.globalData.userid
    }
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.followList, params, this, this.successFollow);
  },
  successFollow(res, selfObj) {
    res.L.forEach((followItem) => {
      followItem[followItem.length] = 1;
      selfObj.data.followList.push(followItem);
    });
    selfObj.setData({
      followList:selfObj.data.followList,
    });
    //console.log(selfObj.data.followList);
  },
  followState(e) { //关注状态
    let data = e.target.dataset;
    let params  = {
      userid: app.globalData.userid,
      otheruserid: data.otheruserid
    }
    if(data.state == 1){
      this.unfollowTap(params, data.index);
    }else{
       this.followTap(params, data.index);
    }
  },
  followTap(params, index) { //关注
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.follow, params, this, this.successFollowTap, index);
  },
  successFollowTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.followList[dataParams][6] = 1;
    selfObj.setData({
      followList: selfObj.data.followList
    });
  },
  unfollowTap(params, index) { //取消关注
    my.showLoading();
    publicFun.requestPostApi(publicFun.api.unfollow, params, this, this.successUnfollowTap, index);
  },
  successUnfollowTap(res, selfObj, sourceObj, dataParams) {
    if(res.M){publicFun.showToast(res.M)};
    selfObj.data.followList[dataParams][6] = 0;
    selfObj.setData({
      followList: selfObj.data.followList
    });
  },
  jumpDetails(e) {
    my.navigateTo({ 
      url: '../ssDetails/ssDetails?follow=1&ssUserId='+ e.target.dataset.ssUserId+'&type=1'
    });
  },
});

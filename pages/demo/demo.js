const publicFun = require('/utils/public.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '',
		cWidth: 0,
		cHeight:0,
		mapCtx:{},
		imgFiles:[],
		compressImgs:[],
  },
  onload() {
	// const ctx = my.createCanvasContext('awesomeCanvas')
	// ctx.drawImage('https://img.alicdn.com/tfs/TB1GvVMj2BNTKJjy0FdXXcPpVXa-520-280.jpg', 2, 2, 250, 80)
	// ctx.draw()
  },
  	//选择图片待上传
	ChooseImage() {
		let maxSize = 400;
		let dWidth = my.getSystemInfoSync().windowWidth;
		//console.log(dWidth);
		let that = this;
		my.chooseImage({
			count: 6,
			sizeType:['compressed'],
			sourceType:['album','camera'],
			success:function(res){
				// 返回选定图片的本地文件列表，tempFilePaths可以作为img标签的src列表
				// 当一次选择多张图片的情况
				res.tempFilePaths.forEach(v => {
					that.data.imgFiles.push(v);
					my.getImageInfo({
						src: v,
						success: function(res) {
							console.log(res);
							that.setData({
								cWidth: res.width,
								cHeight: res.height
							});
						}
					});
					publicFun.getLessLimitSizeImage('canvas', v, maxSize, that.data.cWidth, (img) => {
						console.log(img);
						that.data.compressImgs.push(img); 
						that.setData({
							compressImgs: that.data.compressImgs
						})                       
						my.getFileInfo({
							apFilePath: img,
							success:function(res){
								console.log(res);
								console.log('压缩后：'+res.size/1024+'kb')
							}
						})
					})
				});
			},
			fail:function(err){
				console.log(err)
			}
		})
	},
	ChooseImage1() {
		let that = this;
		let limitSize = 200;
		let dWidth = my.getSystemInfoSync().windowWidth;
		let dHeight = my.getSystemInfoSync().windowHeight;
		my.chooseImage({
			count: 6, // 默认9
			sizeType: ['compressed'], // 指定只能为压缩图，首先进行一次默认压缩
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (photo) {
				//-----返回选定照片的本地文件路径列表，获取照片信息-----------
				my.getFileInfo({
					apFilePath: photo.tempFilePaths[0],
					success:function(res){
						console.log(res);
						console.log('压缩前：'+res.size/1024+'kb')
						if(res.size/1024 > limitSize) {
							that.getCompressImg(photo.tempFilePaths[0], dWidth, dHeight);
							console.log("大于");
						}else{
							console.log("小于");
						}
					}
				})
				
			}
		})
	},
	getCompressImg(imgUrl, dWidth, dHeight) {
		let that = this;
		my.getImageInfo({
			src: imgUrl,  
			success: function(res){
				//---------利用canvas压缩图片--------------
				var ratio = 2;
				var canvasWidth = res.width; //图片原始长宽
				var canvasHeight = res.height;

				that.setData({
					cWidth: canvasWidth,
					cHeight: canvasHeight
				})
				console.log(that.data);
				while (canvasWidth > dWidth || canvasHeight > dHeight){// 保证宽高在400以内
					canvasWidth = Math.trunc(res.width / ratio)
					canvasHeight = Math.trunc(res.height / ratio)
					ratio++;
				}
				console.log(canvasWidth, canvasHeight)
				//----------绘制图形并取出图片路径--------------
				var ctx = my.createCanvasContext('canvas');
				ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
				ctx.draw(false, setTimeout(function(){
					ctx.toTempFilePath({
							canvasId: 'canvas',
							x: 0,
							y: 0,
							width: canvasWidth,
							height: canvasHeight,
							quality: 1,
							success: function (res) {
								console.log(res.apFilePath)//最终图片路径
								my.getImageInfo({
									src: res.apFilePath,
									success: function(imageInfo) {
										console.log(imageInfo);
										that.setData({
											cWidth: imageInfo.width*2,
											cHeight: imageInfo.height*2,
											compressImgs: res.apFilePath
										});
									}
								})
								my.getFileInfo({
									apFilePath: res.apFilePath,
									success:function(res){
										console.log(res);
										console.log('压缩后：'+res.size/1024+'kb')
									}
								})
							},
							fail: function (res) {
									console.log(res.errMsg)
							}
					})
				},200))    //留一定的时间绘制canvas
			},
			fail: function(res){
					console.log(res.errMsg)
			},
		})
	}
})
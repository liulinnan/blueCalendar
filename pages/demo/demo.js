Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: ''
  },
  onload() {
	const ctx = my.createCanvasContext('awesomeCanvas')
	ctx.drawImage('https://img.alicdn.com/tfs/TB1GvVMj2BNTKJjy0FdXXcPpVXa-520-280.jpg', 2, 2, 250, 80)
	ctx.draw()
  },
  	//选择图片待上传
	ChooseImage() {
		var _this = this
		my.chooseImage({
			count: 1, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album'], //从相册选择
			success: (res) => {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePaths = res.tempFilePaths;
				this.setData({
					uploadimgcount: tempFilePaths.length,
					alreadyUploadSuccessCount: 0
				});
				for (let item of tempFilePaths) {
					console.log(item)
					let file = {
						reportFileName: "",
						localUrl: item,
						reportFile: ""
					}
          _this.watermark(item);
					//this.uploadimg(item);
				}

				// if (this.data.imgList.length != 0) {
				// 	this.setData({
				// 		imgList: this.data.imgList.concat(res.tempFilePaths)
				// 	})
				// } else {
				// 	this.setData({
				// 		imgList: res.tempFilePaths
				// 	})
				// }
				
			}
		});
	},
	//加水印
	watermark(item) {
		let _this = this
		//获取图片详细信息
		//for (let item of this.data.imgList) {
			my.getImageInfo({
				src: item,
				success: (ress) => {
					console.log("获取图片详情", item)
					console.log("获取详情成功", ress)
					let ctx = my.createCanvasContext('firstCanvas');
					_this.setData({
						canvasHeight: ress.height,
						canvasWidth: ress.width
					})
					//将图片src放到cancas内，宽高为图片大小
					ctx.drawImage(item, 0, 0, 375, 375);
          //ctx.drawImage('http://www.ipe.org.cn/public/static/images/watermark1.png', 2, 2, 76, 76);
					ctx.drawImage('https://img.alicdn.com/tfs/TB1GvVMj2BNTKJjy0FdXXcPpVXa-520-280.jpg', 2, 2, 76, 76);
					ctx.draw(false, function() {
						setTimeout(function() {
							console.log(ctx);
							ctx.toTempFilePath({
								success(resss) {
									console.log(resss);
									_this.setData({
										imgUrl: resss.apFilePath
									})
								},
							});
						}, 600)
					});
				}
			})
		//}
	},
	//上传图片
	uploadimg(localUrl) {
		my.showLoading({
			title: "正在上传图片",
			mask: true
		})
		util.putFile(localUrl).then(res => {
			if (res.statusCode == 200) {
				my.hideLoading();
				let count = this.data.alreadyUploadSuccessCount;
				count = count + 1;
				this.setData({
					alreadyUploadSuccessCount: count
				});
				if (count == this.data.uploadimgcount) {
					my.showToast({
						title: '图片上传成功',
						icon: 'success',
						duration: 1000
					})
				}
				if (JSON.parse(res.data).code == 200) {
					// console.log(111111111,JSON.parse(res.data).data)
					let uploadObj = JSON.parse(res.data).data;
					let arr = []
					arr.push(uploadObj)
					this.setData({
						uploadList: this.data.uploadList.concat(arr)
					})
					my.hideLoading();
					// console.log("uploadList",this.data.uploadList)
				}
			}
		})
	},

 
})
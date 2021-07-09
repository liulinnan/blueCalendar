const app = getApp();
const publicFun = require('/utils/public.js');
Page({
	data: {
	currentYear: new Date().getFullYear(), //当前年份
	currentMonth: new Date().getMonth() + 1, //当前月份
		currentMonthDateLen: 0, // 当月天数
		preMonthDateLen: 0, // 当月中，上月多余天数
		allArr:[], // 当月所有数据
		calendarInfor: '', //月历介绍
		start: '',
		end: '',
		webView: '',
		fmurl: '',
		aqi: {}
	},
	onLoad(options) {
		console.log(options);
		
		this.getAllArr(options.start, options.end);
		if(options.fmurl){
			this.setData({
				webView: '',
				fmurl: options.fmurl,
				start: options.start,
				end: options.end
			});
			this.getSScontent();
		}else{
			this.setData({
				start: options.start,
				end: options.end
			})
		}
	},
	// 获取某年某月总共多少天
	getDateLen(year, month) { 
		let actualMonth = month - 1;
		let timeDistance = +new Date(year, month) - +new Date(year, actualMonth);
		return timeDistance / (1000 * 60 * 60 * 24);
	},
	// 获取某月1号是周几
	getFirstDateWeek(year, month) { 
		return new Date(year, month - 1, 1).getDay()
	},
	// 上月 年、月
	preMonth(year, month) { 
		if (month == 1) {
			return {
				year: --year,
				month: 12
			}
		} else {
			return {
				year: year,
				month: --month
			}
		}
	},
	// 下月 年、月
	nextMonth(year, month) { 
		if (month == 12) {
			return {
				year: ++year,
				month: 1
			}
		} else {
			return {
				year: year,
				month: ++month
			}
		}
	},
	// 获取当月数据，返回数组
	getCurrentArr(start, end){ 
		let currentMonthDateLen = this.getDateLen(this.data.currentYear, this.data.currentMonth) // 获取当月天数
		//let currentMonthDateArr = [] // 定义空数组
		if (currentMonthDateLen > 0) {
			let params = {
				start: start,
				end: end,
				riliid: 0,
				rid: 0,
				userid: app.globalData.userid,
				typeid: 1,
				isbuild: 0,
			}
			
			this.setData({
				currentMonthDateLen
			});
			return new Promise((resolve, reject) => {
				publicFun.requestPostApi(publicFun.api.monthlyCalendar, params, this, this.successCalendarList, resolve);
			})
		}
	},
	// 获取当月中，上月多余数据，返回数组
	getPreArr(){ 
		let preMonthDateLen = this.getFirstDateWeek(this.data.currentYear, this.data.currentMonth) // 当月1号是周几 == 上月残余天数）
					let preMonthDateArr = [] // 定义空数组
		if (preMonthDateLen > 0) {
			let { year, month } = this.preMonth(this.data.currentYear, this.data.currentMonth) // 获取上月 年、月
			let date = this.getDateLen(year, month) // 获取上月天数
			for (let i = 0; i < preMonthDateLen; i++) {
				preMonthDateArr.unshift({ // 尾部追加
											month: 'pre', // 只是为了增加标识，区分当、下月
					date: date
				})
				date--
			}
		}
		this.setData({
			preMonthDateLen
		})
		return preMonthDateArr
	},
	// 获取当月中，下月多余数据，返回数组
	getNextArr() { 
		let nextMonthDateLen = 42 - this.data.preMonthDateLen - this.data.currentMonthDateLen // 下月多余天数
		let nextMonthDateArr = [] // 定义空数组
		if (nextMonthDateLen > 0) {
			for (let i = 1; i <= nextMonthDateLen; i++) {
				nextMonthDateArr.push({
					month: 'next',// 只是为了增加标识，区分当、上月
					date: i
				})
			}
		}
		return nextMonthDateArr
	},
	// 整合当月所有数据
	getAllArr(start, end){ 
		my.showLoading();
		let currentMonthDateLen = this.getDateLen(this.data.currentYear, this.data.currentMonth) // 获取当月天数
		//let currentMonthDateArr = [] // 定义空数组
		if (currentMonthDateLen > 0) {
			let params = {
				start: start,
				end: end,
				riliid: 0,
				rid: 0,
				userid: app.globalData.userid,
				typeid: 1,
				isbuild: 0,
			}
			publicFun.requestPostApi(publicFun.api.monthlyCalendar, params, this, this.successCalendarList)
			this.setData({
				currentMonthDateLen
			});
		}
		// this.getCurrentArr(start, end).then((res) => {
		// 	let preArr = this.getPreArr();
		// 	let currentArr = res;
		// 	let nextArr = this.getNextArr();
		// 	//let allArr = [...preArr, ...currentArr, ...nextArr];
		// 	let allArr = [...preArr, ...currentArr];
		// 	this.setData({
		// 		currentYear: this.data.currentYear,
		// 		currentMonth: this.data.currentMonth,
		// 		allArr: allArr
		// 	})
		// });
	},
	successCalendarList(res, selfObj) {
		let currentMonthDateArr = [] // 定义空数组
		if(res.S == 1){
			for (let i = 0; i < res.L.length; i++) {
				res.L[i].month = 'current'; // 只是为了增加标识，区分上下月
				res.L[i].date = i+1;
				currentMonthDateArr.push(res.L[i]);
			}
			let preArr = selfObj.getPreArr();
			let currentArr = currentMonthDateArr;
			let nextArr = selfObj.getNextArr();
			//let allArr = [...preArr, ...currentArr, ...nextArr];
			let allArr = [...preArr, ...currentArr];
			selfObj.setData({
				currentYear: selfObj.data.currentYear,
				currentMonth: selfObj.data.currentMonth,
				allArr: allArr,
				calendarInfor: res.WZ
			})
			// this.setData({
			// 	allArr: this.data.allArr
			// })
		}
	},
	// 点击 上月
	gotoPreMonth(){ 
		let { year, month } = this.preMonth(this.data.currentYear, this.data.currentMonth)
		let start = publicFun.timeStampChangeDate(new Date(year, month - 1, 1));
		let end = publicFun.timeStampChangeDate(new Date(year, month, 0));
		this.setData({
			currentYear: year,
			currentMonth: month,
			start: start,
			end: end
		});
		this.getAllArr(start, end);
	},
	// 点击 下月
	gotoNextMonth() { 
		let { year, month } = this.nextMonth(this.data.currentYear, this.data.currentMonth)
		let start = publicFun.timeStampChangeDate(new Date(year, month - 1, 1));
		let end = publicFun.timeStampChangeDate(new Date(year, month, 0));
		this.setData({
			currentYear: year,
			currentMonth: month,
			start: start,
			end: end,
			//webView: 'https://www.ipe.org.cn/apphelp/calendar/calendar.html'
		});
		this.getAllArr(start, end);
	},
	screenshot() {
		if(app.globalData.location){
			let data = '?start='+this.data.start+'&end='+this.data.end+'&userid='+app.globalData.userid+'&miyao='+app.getMiYao();
			this.setData({
				webView: 'https://wwwoa.ipe.org.cn/apphelp/calendar/calendar.html' + data
			});
		}else{
			app.getLocation();
		}
	},
	releaseCalendar(start, end) {
		publicFun.showToast("正在发布月历...");
		let params = {
			start: start,
			end: end,
			riliid: 0,
			rid: 0,
			userid: app.globalData.userid,
			typeid: 1,
			isbuild: 1,
		}
		publicFun.requestPostApi(publicFun.api.monthlyCalendar, params, this, this.successGetCalendarId);
	},
	successGetCalendarId(res, selfObj) {
		if(res.S == 1){
			selfObj.subCalendar(res.TempId,res.Rid);
		}
	},
	subCalendar(TempId, riliid) { //发布月历
		let aqi = this.data.aqi;
		let globalData = app.globalData;
		//console.log(aqi)
		var params  = {
		userid: globalData.userid,
		dt: publicFun.getTimestamp(),
		describe: this.data.calendarInfor, //描述
		describe1: '',
		address: globalData.location.address, //地址
		lat: globalData.location.lng, //纬度
		lng: globalData.location.lat, //经度
		province: globalData.location.province, //省
		city: globalData.location.city, //市
		area: globalData.location.district, //区县
		type: 1, //0晒晒，1日历
		airlevel: aqi.A.L ? aqi.A.L : 0, //空气质量级别
		riliid: riliid, //主日历id
		start: this.data.start, //开始时间
		end: this.data.end, //结束时间
		des: this.data.calendarInfor, //日历描述文字
		tempid: TempId, //serRiLiDetail_V4_0 返回的TempId，用户记录状态
		fmurl: this.data.fmurl, //封面
		huancun: '', //缓存名称（ShareList_V4_1返回的Key）
		isbufa: 0, //1补发，0正常发
		rivername: '', //河流名称
		riverdescribe: '', //河流描述
		isbobao: 0, //1显示到播报地图0不显示到播报地图
		aqi: aqi.A.A ? aqi.A.A : 0, //Aqi值
      	temperature: aqi.W.T ? aqi.W.T : 0, //实况温度
      	weatherdes: aqi.W.M ? aqi.W.M : 0, //实况天气（例如：晴，多云 等）
	}
	//console.log(params)
		publicFun.requestPostApi(publicFun.api.ssUpload, params, this, this.successSubSS);
	},
	successSubSS(res, selfObj) {
		if(res.S == 1){
			my.uma.trackEvent('Month_Num');
			my.showToast({
				content: '发布成功',
				duration: 2000,
				success: () => {
					my.redirectTo({
						url: '/pages/myCalendarShare/myCalendarShare?fmurl='+selfObj.data.fmurl
					});
				},
			});
		}else{
			console.log(res.M);
			publicFun.showToast(res.M, 2000);
			selfObj.setData({
				fmurl: ''
			});
		}
	},
	getSScontent(city, latitude, longitude) {//获取默认aqi内容
		let location = app.globalData.location;
		var params  = {
			CityName: location.city ? location.city : city,
			Lat: location.lat ? location.lat : latitude,
			Lng: location.lng ? location.lng : longitude,
		}
		publicFun.requestPostApi(publicFun.api.ssContent, params, this, this.successGetContent);
  	},
	successGetContent(res, selfObj) { 
		if(res.S == 1){
			selfObj.setData({
				aqi: res
			})
			selfObj.releaseCalendar(selfObj.data.start, selfObj.data.end);
		}
	},
});

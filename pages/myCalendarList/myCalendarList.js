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
	danRiLiList: [], //已发布月历列表
	currentActive: null,
	start: 0,
	end: 0
  },
  onLoad() {
		var now = new Date(); //当前日期 
		var nowYear = now.getFullYear(); //当前年 
		var nowMonth = now.getMonth(); //当前月 
		let start = publicFun.timeStampChangeDate(new Date(nowYear, nowMonth, 1));
		let end = publicFun.timeStampChangeDate(new Date(nowYear, nowMonth+1, 0));
		this.getAllArr(start, end, null);
		this.DanRiLiList(start, end);
		this.setData({
			start: start,
			end: end
		})
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
	getCurrentArr(start, end, rid){ 
		let currentMonthDateLen = this.getDateLen(this.data.currentYear, this.data.currentMonth) // 获取当月天数
		//let currentMonthDateArr = [] // 定义空数组
		if (currentMonthDateLen > 0) {
			let params = {
				start: start,
				end: end,
				riliid: 0,
				rid: rid ? rid : 0,
				userid: app.globalData.userid,
				typeid: 1,
				isbuild: 0,
			}
			this.setData({
				currentMonthDateLen
			});
			return new Promise((resolve, reject) => {
				//publicFun.requestPostApi(publicFun.api.monthlyCalendar, params, this, this.successCalendarList, resolve);
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
	getAllArr(start, end, rid){ 
		my.showLoading();
		let currentMonthDateLen = this.getDateLen(this.data.currentYear, this.data.currentMonth) // 获取当月天数
		//let currentMonthDateArr = [] // 定义空数组
		if (currentMonthDateLen > 0) {
			let params = {
				start: start,
				end: end,
				riliid: 0,
				rid: rid ? rid : 0,
				userid: app.globalData.userid,
				typeid: 1,
				isbuild: 0,
			}
			publicFun.requestPostApi(publicFun.api.monthlyCalendar, params, this, this.successCalendarList);
		}
			this.setData({
				currentMonthDateLen
			});
	},
	successCalendarList(res, selfObj, ) {
		let currentMonthDateArr = [] // 定义空数组
		if(res.S == 1){
			//console.log(res.L)
			for (let i = 0; i < res.L.length; i++) {
				res.L[i].month = 'current'; // 只是为了增加标识，区分上下月
				res.L[i].date = i+1;
				currentMonthDateArr.push(res.L[i]);
			}
			//console.log(currentMonthDateArr)
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
			});
		}
	},
	// 点击 上月
	gotoPreMonth(){ 
		let { year, month } = this.preMonth(this.data.currentYear, this.data.currentMonth);
		let start = publicFun.timeStampChangeDate(new Date(year, month - 1, 1));
		let end = publicFun.timeStampChangeDate(new Date(year, month, 0));
		this.setData({
			currentYear: year,
			currentMonth: month,
			start: start,
			end: end
		})
		this.DanRiLiList(start, end);
		this.getAllArr(start, end, null);
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
			end: end
		})
		this.DanRiLiList(start, end);
		this.getAllArr(start, end, null);
	},
	DanRiLiList(start, end) { //获取月份月历下发布过的月历封面列表
		let params = {
			riliid: 0,
			userid: app.globalData.userid,
			typeid: 1,
			start: start,
			end: end,
		}
		publicFun.requestPostApi(publicFun.api.DanRiLiList, params, this, this.successDanRiLiList);
	},
	successDanRiLiList(res, selfObj) {
		//console.log(res);
		if(res.S == 1){
			selfObj.setData({
				danRiLiList: res.L
			})
		}
	},
	seeCalender(e) { //查看当前月历大图
		//console.log(e);
		var imgArr = [];
		let data = e.target.dataset;
		this.setData({
			currentActive: data.current
		});
		imgArr.push(data.item[2]);
		my.previewImage({
			current: 1,
			urls: imgArr,
			enablesavephoto: true
		});
		this.getAllArr(this.data.start, this.data.end, data.rid);
	},
	jumpDetails(e) { //查看某个ss详情
		let data = e.target.dataset; 
		if(data.rid > 0){
			my.navigateTo({
				url: '../myCalendarDetails/myCalendarDetails?start='+this.data.start+'&end='+this.data.end+'&toView='+data.rid
			});
		}
	}
});

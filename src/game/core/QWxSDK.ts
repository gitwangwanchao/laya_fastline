import QShareParam from "../logic/QShareParam";
import QUIMgr from "./QUIMgr";
import QLanguage from "../data/QLanguage";
import QDebug from "../../framework/QDebug";
import QUtil from "../../framework/QUtil";
import QGameConst from "../data/QGameConst";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QCfgMgr from "./QCfgMgr";
import QTipsView from "../view/QTipsView";
// import QGamePlay from "../logic/QGamePlay";
import QSoundMgr from "../core/QSoundMgr";
import QBIEvent from "../data/QBIEvent";
import QMergeData from "../data/QMergeData";
import QSavedDateItem from "../data/QSavedDateItem";

module game.core
{
	export class QWxSDK
	{
		private constructor()
		{
			QEventMgr.instance.register(QEventType.FAKE_SHARE_RETURN, this.fakeShareReturnHandler, this);
			QEventMgr.instance.register(QEventType.UPDATE_SHARE_CONFIG, this.resetWxCfgData, this);
		}

		private static _instance: QWxSDK;
		public static get instance(): QWxSDK
		{
			if (QWxSDK._instance == null)
			{
				QWxSDK._instance = new QWxSDK();

			}
			return QWxSDK._instance;
		}

		public gameConfig:any;

		private fakeShareWaitTime: number = 0;//假分享等待时间

		//分享相关配置
		private dicSharePoint = {};
		private defaultShareUrl: string;
		private defaultShareTitle: string;
		private defaultSharePointId: string;
		private defaultShareSchemeId: string;
		private useDefaultShare: boolean = false;

		private adUnitID_Banner: string = "adunit-1896b0b11c77e456";//Banner广告ID
		private adUnitID_Video: string = "adunit-9d8b35e635f641c9";//视频广告ID
		private jcdlCfg: any;//交叉导流配置
		private cancelShareTxt : string = "您取消了分享，请分享到群！";
		public BannerRefreshCount:any = 3;
		public activeShareInfo = 
		{
			wxActivityId : "",
			memeberCount : 0,
			roomLimit : 0
		}
		private shareConfirmShieldCity : string[];
		private listActiveShare : string[];
		private listFakeShareWaitTime : number;
		private shareFailedToday:string;
		private forceShareFailedProb:number;
		public init(): void
		{
			// GainDiamond : 1,
			// LuckyDraw : 2,
			// DoubleSign: 3,
			// FreeCar: 4,
			// NewCar: 5,
			// SpeedUp: 6,
			// FreeDropCar: 7,
			// FreeDropFive: 8,
			// Revive: 9,
			// ResultReward: 10,
			// FreeGold: 11,
			this.gameConfig = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.ShareCfg];
			this.fakeShareWaitTime = /*QUtil.isBSG() ? this.gameConfig['BSGFakeShareWaitTime'] : */this.gameConfig['FakeShareWaitTime'];
			this.listActiveShare = this.gameConfig.listActiveShare;

			this.dicSharePoint[QGameConst.QShareType.LuckyDraw] = "luckyDraw";
			this.dicSharePoint[QGameConst.QShareType.DoubleSign] = "doubleSign";
			this.dicSharePoint[QGameConst.QShareType.FreeCar] = "freeCar";
			this.dicSharePoint[QGameConst.QShareType.NewCar] = "newCar";
			this.dicSharePoint[QGameConst.QShareType.FreeDropCar] = "freeDropCar";
			this.dicSharePoint[QGameConst.QShareType.Revive] = "revive";
			this.dicSharePoint[QGameConst.QShareType.SpeedUp] = "speedUp";
			this.dicSharePoint[QGameConst.QShareType.FreeDropFive] = "freeDropFive";
			this.dicSharePoint[QGameConst.QShareType.FreeGold] = "freeGold";
			this.dicSharePoint[QGameConst.QShareType.ResultReward] = "resultReward";
			this.dicSharePoint[QGameConst.QShareType.OfflineCoin] = "offlineCoin";
			this.dicSharePoint[QGameConst.QShareType.FreeCash] = "freeCash";
			this.dicSharePoint[QGameConst.QShareType.FanPai] = "fanPai";
			this.dicSharePoint[QGameConst.QShareType.DailyDiamond] = "dailyDiamond";
			this.dicSharePoint[QGameConst.QShareType.oncemore] = "oncemore";			
			this.dicSharePoint[QGameConst.QShareType.AirDrop] = "airDrop";
			this.dicSharePoint[QGameConst.QShareType.showof] = "showof";
			
			this.useDefaultShare = this.gameConfig.SafeMode;
			this.defaultShareUrl = this.gameConfig.defaultShare.url;
			this.defaultShareTitle = this.gameConfig.defaultShare.title;
			this.defaultSharePointId = this.gameConfig.defaultShare.pointId;
			this.defaultShareSchemeId = this.gameConfig.defaultShare.schemeId;

			// this.adUnitID_Banner = this.gameConfig.ADUnitID_Banner;
			// this.adUnitID_Video = this.gameConfig.ADUnitID_Video;

			this.listFakeShareWaitTime = this.gameConfig.listFakeShareWaitTime;

			this.jcdlCfg = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.JCDL];
			this.initShareFailedToday();
		}
		initShareFailedToday() {
			this.forceShareFailedProb = this.gameConfig.force_share_failed_prob||0.3;
			this.shareFailedToday = QSavedDateItem.instance.getItemFromLocalStorage("SHARE_FORCE_FAILED_TODAY","0");
			if(tywx.TuyooSDK.isTodayFirstLogin()){
				this.setShareFailedToday("0");
			}
		};
		setShareFailedToday(flag:string) {
			this.shareFailedToday = flag;
			QSavedDateItem.instance.setItemToLocalStorage("SHARE_FORCE_FAILED_TODAY",flag);
		};

		resetWxCfgData(){
			this.gameConfig = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.ShareCfg];
			this.fakeShareWaitTime = /*QUtil.isBSG() ? this.gameConfig['BSGFakeShareWaitTime'] : */this.gameConfig['FakeShareWaitTime'];
			this.listActiveShare = this.gameConfig.listActiveShare;
			this.useDefaultShare = this.gameConfig.SafeMode;
			this.defaultShareUrl = this.gameConfig.defaultShare.url;
			this.defaultShareTitle = this.gameConfig.defaultShare.title;
			this.defaultSharePointId = this.gameConfig.defaultShare.pointId;
			this.defaultShareSchemeId = this.gameConfig.defaultShare.schemeId;

			// this.adUnitID_Banner = this.gameConfig.ADUnitID_Banner;
			// this.adUnitID_Video = this.gameConfig.ADUnitID_Video;

			this.listFakeShareWaitTime = this.gameConfig.listFakeShareWaitTime;
		}

		//上传玩家云数据
		public setUserCloudStorage(key: string, value: string): void
		{
			if (Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.setUserCloudStorage({
					KVDataList: [
						{ key: key, value: value }
					],

					success: function (res)
					{
						QDebug.log("setUserCloudStorage: " + JSON.stringify(res));
					},
				});
			}
		}

		public isAuditVersion () {
			if (QDebug.isDebug == true){
				return false;
			}
			this.gameConfig = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.ShareCfg];
			return (this.gameConfig.version == tywx.SystemInfo.version);
		}

		public fakeShareLeaveGameTime: number = -1;
		public fakeShareSuccessCallbackHandler: Laya.Handler = null;
		public fakeShareFailCallbackHandler:Laya.Handler = null;
		public fakeShareParam : QShareParam;
		public isShare:any = false;
		//进行一次假分享，如果从离开到返回的时间差超过指定值，则认为分享成功
		public fakeShare(shareParam: QShareParam, caller: any, callback: Function, args: any[] = null, callbackfail:Function = null )
		{
			// if(QDebug.isDebug == false && this.gameConfig.version == tywx.SystemInfo.version){
			// 	callback.apply(this, args);
			// 	return;
			// }
			if (Laya.Browser.onMiniGame)
			{
				// this.showWxLoading("加载中", 1000);
				let date = new Date();
				this.fakeShareLeaveGameTime = Date.parse(date.toString());
				this.fakeShareSuccessCallbackHandler = Laya.Handler.create(caller, callback, args);
				this.fakeShareFailCallbackHandler = Laya.Handler.create(caller, callbackfail, args);
				this.fakeShareParam = shareParam;
				this.share(shareParam);
			}
			else
			{
				//不在微信环境则直接调用成功回调
				callback.apply(this, args);
			}
		}

		//假分享回调
		private fakeShareReturnHandler(): void
		{
			//QGameData.instance.setAllShareTimes();
			if (this.isShare == false) {
				return
			}
			this.isShare = false;
			//只有离开时间有值的时候才生效
			if (this.fakeShareLeaveGameTime == -1) return;

			QDebug.log("fakeShareReturnHandler()");
			
			let fakeShareWaitTime : number = this.fakeShareWaitTime;

			if(!QUtil.isNullOrEmpty(this.fakeShareParam))
			{
				let sharePoint = this.dicSharePoint[this.fakeShareParam.shareType];
				let fakeTime = this.listFakeShareWaitTime;
				if(!QUtil.isNullOrEmpty(fakeTime))
				{
					fakeShareWaitTime = fakeTime;
				}
				
			}
			
			let date = new Date();
			let crtTime = Date.parse(date.toString());
			let dt = crtTime - this.fakeShareLeaveGameTime;
			//检查时间是否错误
			if (dt < 0)
			{
				QDebug.log("fakeShare error: dt = " + dt + " < 0");
			}
			else
			{
				// let allShareTimes = QGameData.instance.allShareTimes-1;

				// if(allShareTimes%this.gameConfig['shareAssignTimesFailOnce'] == 0)
				// {	
				// 	QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:this.gameConfig['shareAssignTimesFailureHint'],delay:1});
				// 	return;
				// }
				//玩家首次分享必定失败，老玩家（次日以后登陆的用户）每日分享有20%几率必定失败，当玩家当日出现必定失败之后当日不会再出现必定失败情况
				let shareFailed = false;
				if(dt < fakeShareWaitTime * 1000){
					shareFailed = true;
				}else if(this.shareFailedToday=="0"){
					if(tywx.TuyooSDK.isNewUser()){
						shareFailed = true
						this.setShareFailedToday("1")
					}else{
						let random = Math.random();
						if(random<=this.forceShareFailedProb){
							shareFailed = true
							this.setShareFailedToday("1")
						}
					}
				}
				var  fakeShareParam = this.fakeShareParam;
				
				//如果时间差达不到配置值则不认为分享成功
				if (shareFailed)
				{
					QDebug.log(`fakeShare fail: dt = ${dt} < ${fakeShareWaitTime}`);
					var self = this;
					Laya.timer.frameOnce(1,this,()=>{
						//QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text : this.gameConfig["shareFailureTextHint"]});
						//QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "分享失败"});
						let obj = {
							title: '提示',
							content: '注意, 不同的好友群才能帮你哦!',
							// showCancel: false,
							cancelText:'取消',
							confirmText:'确定',
							success(res){
								if (res.confirm) {
									console.log('用户点击确定')
									let date = new Date();
									self.fakeShareLeaveGameTime = Date.parse(date.toString());
									self.share(fakeShareParam);
								} else if (res.cancel) {
									console.log('用户点击取消')
									QEventMgr.instance.sendEvent(QEventType.SHARE_FAIL_CALLBACK,res.confirm)
								}
							},
						}
						if(this.fakeShareParam.shareType != QGameConst.QShareType.showof){
							Laya.Browser.window.wx.showModal(obj);
						}
						if (this.fakeShareFailCallbackHandler != null) {
							this.fakeShareFailCallbackHandler.run();
						}
					});
					
					// if (Laya.Browser.onMiniGame)
					// {
					// 	//QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"分享到不同群才可获得奖励哦!"});
					// 	//@ts-ignore
						
					// 	//wx.showModal({ title: "", content: this.gameConfig["shareFailureTextHint"], showCancel: false });
					// }
				}
				else
				{
					QDebug.log(`fakeShare success!`);
					if (this.fakeShareSuccessCallbackHandler != null)
					{
						this.fakeShareSuccessCallbackHandler.run();
						QMergeData.instance.addShareCount();
						//重置数据
					}
				}
			}
		}

		public isCancelShare : boolean = false;

		public share(shareParam: QShareParam): void
		{
			this.isCancelShare = false;

			QDebug.log("share: " + JSON.stringify(shareParam.shareType));
			if (!this.isNetworkConnected())
			{
				return;
			}

			try
			{
				if(Laya.Browser.onMiniGame)
				{
					this.doShare(shareParam);
				}
			}
			catch (err)
			{
				QDebug.E("share exception: " + err);
				Laya.Browser.window.wx.showModal({ title: QLanguage.SHARE_FAIL, duration: 2000 });
			}
		}

		private doShare(shareParam: QShareParam): void
		{
			let url: string = this.defaultShareUrl;
			let title: string = this.defaultShareTitle;
			let sharePointId: string = this.defaultSharePointId;
			let shareSchemeId: string = this.defaultShareSchemeId;
			let sharePointKey: string;

			let msg = tywx.PropagateInterface._cachedShareConfig;

			if (!this.useDefaultShare && !QUtil.isNullOrEmpty(msg))
			{
				sharePointKey = this.dicSharePoint[shareParam.shareType];
				let useActiveShare = false;
				let shareInfo = msg[sharePointKey];
				if (!QUtil.isNullOrEmpty(shareInfo))
				{
					let rate = 100000;
					let random = Math.random() * rate;
					let index = 0;

					let totalWeight = 0;
					for (let i = 0; i < shareInfo.length; i++)
					{
						totalWeight += shareInfo[i].weight
					}

					let sum = 0;
					for (let i = 0; i < shareInfo.length; i++)
					{
						sum += shareInfo[i].weight / totalWeight * rate;
						if (random < sum)
						{
							index = i;
							break;
						}
					}
					url = shareInfo[index].sharePicUrl
					title = shareInfo[index].shareContent
					sharePointId = shareInfo[index].sharePointId
					shareSchemeId = shareInfo[index].shareSchemeId
					QDebug.log("share: " + sharePointKey + "," + shareInfo[index].shareSchemeId);
				}
			}

			if (Laya.Browser.onMiniGame)
			{
				tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserShare, [sharePointId, 1, shareSchemeId]);
				this.isShare = true;
				Laya.Browser.window.wx.shareAppMessage({
					title: title,
					imageUrl: url,
					query: 'inviteCode=' + tywx.UserInfo.userId + '&sourceCode=' + sharePointId + "&inviteName=" + tywx.UserInfo.userName + "&imageType=" + shareSchemeId + "&extraInfo=" + '',
					
					cancel : function(res){
						QDebug.log("=====cancel share=======================");
						QWxSDK.instance.isCancelShare = true;
					},
				});
			}
		}

		//发送消息到开放域/子域
		public sendMsgToSub(strData: string) 
		{
			if (Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.getOpenDataContext().postMessage({
					message: strData,
				})
			}
		}

		private videoShareParam: QShareParam;
		private videoAd: any;
		private hasInitVideoCallback: boolean = false;
		public isVideoPlaying = false;
		private videoSuccessCallbackHandler = null;
		private videoCancelCallbackHandler = null;

		public playVideoAd(shareParam: QShareParam, successCallbackHandler: Laya.Handler = null,failCallBackHander:Laya.Handler = null): void
		{

			if (Laya.Browser.onMiniGame){
				if (!this.isNetworkConnected()) {
					return;
				}
				if (this.isVideoPlaying)
				{
					return;
				}

				if (QUtil.isNullOrEmpty(this.adUnitID_Video))
				{
					return;
				}
			}else if(navigator.platform=='android'){
				if (!tywx.AndroidHelper.isNetConnected()){
					if (failCallBackHander!= null) {
						let isShield = this.isShieldCity();
						failCallBackHander.runWith(isShield);
					}
				}
			}
			try
			{	
				if(Laya.Browser.onMiniGame){
					this.doPlayVideoAd(shareParam, successCallbackHandler, failCallBackHander);
				}else if(navigator.platform=='android'){
					tywx.AndroidHelper.showRewardVideo(successCallbackHandler,failCallBackHander)
				}else if (navigator.platform=='ios') {

				}else {
					if (successCallbackHandler!= null) {
						successCallbackHandler.run();
					}
				}
			}
			catch (err)
			{
				if (failCallBackHander!= null) {
					let isShield = this.isShieldCity();
					failCallBackHander.runWith(isShield);
				}
				this.pushAdVideoError(shareParam.shareType);
				QDebug.E("playVideoAd exception: " + err);
			}
		}

		private doPlayVideoAd(shareParam: QShareParam, successCallbackHandler: Laya.Handler = null, failCallBackHander: Laya.Handler = null): void
		{
			this.isVideoPlaying = true;

			this.videoSuccessCallbackHandler = successCallbackHandler;
			this.videoCancelCallbackHandler = failCallBackHander;
			if (Laya.Browser.onMiniGame)
			{
				// this.showWxLoading();

				this.videoShareParam = shareParam;

				this.videoAd = Laya.Browser.window.wx.createRewardedVideoAd({
					adUnitId: this.adUnitID_Video
				});

				this.videoAd.load()
					.then(() =>
					{
						this.videoAd.show()
							.catch(err =>
							{
								this.pushAdVideoError(shareParam.shareType);
								if (this.videoCancelCallbackHandler!= null) {
									let isShield = this.isShieldCity();
									this.videoCancelCallbackHandler.runWith(isShield);
								}
								QDebug.E("videoAd.onError0000: " + JSON.stringify(err));
							})
					})
					.catch(err =>
					{
						this.pushAdVideoError(shareParam.shareType);
						if (this.videoCancelCallbackHandler!= null) {
							let isShield = this.isShieldCity();
							this.videoCancelCallbackHandler.runWith(isShield);
						}
						QDebug.E("videoAd.onError11111: " + JSON.stringify(err));
					})

				if (!this.hasInitVideoCallback)
				{
					this.hasInitVideoCallback = true;

					this.videoAd.onClose(res =>
					{
						// 小于 2.1.0 的基础库版本，res 是一个 undefined
						var playEnded = (!res || (res && res.isEnded));
						if (playEnded)
						{
							QDebug.D("视频-------正常播放结束，可以下发游戏奖励");
							// 正常播放结束，可以下发游戏奖励
							if (this.videoSuccessCallbackHandler != null) this.videoSuccessCallbackHandler.run();
							if(tywx.clickStatEventType.showRewardVideoSuc){
								tywx.BiLog.clickStat(tywx.clickStatEventType.showRewardVideoSuc,[]);
							}
							this.isVideoPlaying = false;
							QMergeData.instance.addShareCount();
						}
						else
						{
							// 播放中途退出，不下发游戏奖励
							QDebug.D("播放中途退出，不下发游戏奖励");
							this.isVideoPlaying = false;
							if (this.videoCancelCallbackHandler!= null) {
								this.videoCancelCallbackHandler.runWith(0);
							}
							QEventMgr.instance.sendEvent(QEventType.MANUAL_CLOSE_VIDEO_AD, this.videoShareParam);
						}
						QEventMgr.instance.sendEvent(QEventType.PUSH_VIDEO_AD_SUCCESS);
					});

					this.videoAd.onError(err =>
					{
						QDebug.E("onError : " + JSON.stringify(err));
						this.pushAdVideoError(shareParam.shareType);
						this.isVideoPlaying = false;
						if (this.videoCancelCallbackHandler!= null) {
							let isShield = this.isShieldCity();
							this.videoCancelCallbackHandler.runWith(isShield);
						}
					})
				}
			}
			else
			{
				//如果不是微信环境则直接触发回调
				this.videoShareParam = shareParam;
				if (this.videoSuccessCallbackHandler != null) 
				{
					this.videoSuccessCallbackHandler.run();
				}
				this.isVideoPlaying = false;
			}
		}

		private isShieldCity()
		{
			let shieldCityShareTip = QGameData.instance.getShieldCityShareTip();
			let userArea = tywx.UserInfo.userArea || "";
			let shareinfo = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.ShareCfg];
			let shield = shieldCityShareTip.indexOf(userArea) >= 0 && shareinfo.shieldCityOpen;
			let isAuditVersion = QWxSDK.instance.isAuditVersion();
			let onlyVideo = QGameData.instance.getOnlyCanVideo();
			//videofailtoShare 视频拉起失败后是否 调用分享总开关
			return (shield || isAuditVersion || onlyVideo || !shareinfo.videofailtoShare) ? 0 : 1;
		}

		private pushAdVideoError(shareType: number,): void
		{
			QDebug.log("pushAdBVideoError : " + shareType);
			QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text : "当前视频已达到上限!"});
			// this.showWxToast(QLanguage.NO_VIDEO_AD_TRY_LATER);
			this.isVideoPlaying = false;
			//处理视频拉取失败,改为分享
			if(QGameData.instance.isOpenVideoToShare)
			{
				QGameData.instance.setNoVideoToShareWay(1);
			}
		}

		private bannerAd = null;
		private showBannerCount: number = 0;
		public showBannerAd(isScreenWidth: boolean = false): void
		{
			if (Laya.Browser.onMiniGame)
			{
				QDebug.D("showBannerAd-------------------------------------------1");
				if (!QUtil.isNullOrEmpty(this.bannerAd) && this.showBannerCount % this.BannerRefreshCount == 0)
				{
					this.showBannerCount = 0;
					this.bannerAd.destroy();
					this.bannerAd = null;
				}

				this.showBannerCount++;

				let winSize = Laya.Browser.window.wx.getSystemInfoSync();
				let sw = winSize.windowWidth;
				let sh = winSize.windowHeight;

				let bannerWidth = isScreenWidth ? sw : 300;
				let bannerHeight = 80;
				QDebug.D("showBannerAd-------------------------------------------2");
				if (QUtil.isNullOrEmpty(this.bannerAd))
				{
					this.bannerAd = Laya.Browser.window.wx.createBannerAd({
						adUnitId: this.adUnitID_Banner,
						style: {
							left: (sw - bannerWidth) / 2,
							top: (sh - bannerHeight),
							width: bannerWidth,
						}
					})
				}
				QDebug.D("showBannerAd-------------------------------------------3");
				if (!QUtil.isNullOrEmpty(this.bannerAd))
				{
					this.bannerAd.style.left = (sw - bannerWidth) / 2;
					this.bannerAd.style.width = bannerWidth;
					if(tywx.UserInfo.systemType == 2)
					{//iphoneX
						this.bannerAd.style.top = sh - this.bannerAd.style.realHeight - 1;
					}
					else
					{
						this.bannerAd.style.top = sh - this.bannerAd.style.realHeight;
					}

					this.bannerAd.show();

					this.bannerAd.onResize(res =>
					{
						if(tywx.UserInfo.systemType == 2)
						{//iphoneX
							this.bannerAd.style.top = sh - this.bannerAd.style.realHeight - 1;
						}
						else
						{
							this.bannerAd.style.top = sh - this.bannerAd.style.realHeight;
						}
					})

					this.bannerAd.onError(err =>
					{
						QDebug.log("banner error: " + JSON.stringify(err));
					})
				}
			}else if(navigator.platform=='android'){
				tywx.AndroidHelper.showBanner();
			}
		}

		public hideBannerAd(): void
		{
			if (Laya.Browser.onMiniGame)
			{
				if (!QUtil.isNullOrEmpty(this.bannerAd))
				{
					this.bannerAd.hide();
				}
			}else if(navigator.platform=='android'){
				tywx.AndroidHelper.hideBanner();
			}
		}

		public clickAdIcon(appId: string): void
		{
			if (Laya.Browser.onMiniGame)
			{
				this.jcdlCfg = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.JCDL];
				if (QUtil.isNullOrEmpty(this.jcdlCfg))
				{
					return;
				}

				let jsonData = null;
				for(let i = 0; i<this.jcdlCfg.length; i++)
				{
					if(appId == this.jcdlCfg[i].toappid)
					{
						jsonData = this.jcdlCfg[i];
						break;
					}
				}

				if(QUtil.isNullOrEmpty(jsonData))
				{
					return;
				}

				QDebug.log("clickAdIcon: " + jsonData.gameName);

				let icon_id = jsonData.icon_id
				let toappid = jsonData.toappid
				let togame = jsonData.togame
				let skip_type = jsonData.icon_skip_type
				// let topath = jsonData.path
				let topath = `${jsonData.path}_dev_${tywx.BiLog.device_id}_${tywx.UserInfo.userId}`;
				if (jsonData.type == 1) {
					topath = `${jsonData.path}`;
				}
				let second_toappid = jsonData.second_toappid
				let webpage_url = jsonData.webpages[0].webpage_url
				let webpage_id = jsonData.webpages[0].webpage_id
				let config_id = jsonData.webpages[0].config_id

				var bi_paramlist = [icon_id, config_id, webpage_url, toappid, togame, webpage_id, 1];

				//先尝试直接跳转
				if (Laya.Browser.window.wx && Laya.Browser.window.wx.navigateToMiniProgram)
				{
					if (1 == skip_type)
					{
						Laya.Browser.window.wx.navigateToMiniProgram({
							appId: toappid,
							path: topath ? topath : '?from=adcross',
							envVersion: 'release',
							extraData: {
								from: topath ? topath : '?from=adcross',
							},
							success: function (res)
							{

								tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);

								QDebug.log('wx.navigateToMiniProgram success');
								QDebug.log(res);
							},
							fail: function (res)
							{
								tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
								QDebug.log('wx.navigateToMiniProgram fail');
								QDebug.log(res);
							},
							complete: function (res)
							{
								QDebug.log('navigateToMiniProgram ==== complete');
							}
						});

						return;
					}
					else if (2 == skip_type)
					{
						Laya.Browser.window.wx.navigateToMiniProgram({
							appId: second_toappid,
							path: topath ? topath : '?from=adcross',
							envVersion: 'release',
							extraData: {
								from: topath ? topath : '?from=adcross',
							},
							success: function (res)
							{
								tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);
								QDebug.log('wx.navigateToMiniProgram success');
								QDebug.log(res);
							},
							fail: function (res)
							{
								tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
								QDebug.log('wx.navigateToMiniProgram fail');
								QDebug.log(res);
							},
							complete: function (res)
							{
								tywx.AdManager.adNodeObj.resetBtnIcon();
								QDebug.log('navigateToMiniProgram ==== complete');
							}
						});

					}
					else
					{
						console.error('Unsupported skip type! Please Check!');
					}

					return;
				}

				if (!webpage_url)
				{
					return;
				}

				tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickShowQRCode, bi_paramlist);

				if (Laya.Browser.onMiniGame)
				{
					Laya.Browser.window.wx.previewImage({
						current: [webpage_url],
						urls: [webpage_url],
						success: function (res)
						{
							QDebug.log("预览图片成功！");
						},
						fail: function (res)
						{
							QDebug.log("预览图片失败！");
						},
						complete: function (res)
						{
							QDebug.log('预览图片完成');
						},
					});
				}
			}
		}

		public btnGetUserInfo = null;
		public tryGetUserInfo(): void
		{

			let left = 0;//QGameData.instance.wxImpowerBtnX;
			let top = 0;//QGameData.instance.wxImpowerBtnY;

			let width = 0;//QGameData.instance.wxImpowerBtnWidth;
			let height = 0;//QGameData.instance.wxImpowerBtnHeigth;

			if (Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.getSetting({
					success: function (res)
					{
						if (!res.authSetting['scope.userInfo'])
						{
							QWxSDK.instance.btnGetUserInfo = Laya.Browser.window.wx.createUserInfoButton({
								type: 'image',
								image: 'res/Texture/wx_btn_bg.png',
								style: {
									left: left,
									top: top,
									width: width,
									height: height,
									borderRadius: 4
								}
							})
							QWxSDK.instance.btnGetUserInfo.onTap((res) =>
							{
								Laya.Browser.window.wx.getSetting({
									success: function (res)
									{
										if (res.authSetting['scope.userInfo'])
										{
											// console.log("res :  "+JSON.stringify(res));
											QWxSDK.instance.destroyGetUserInfoBtn();
											QWxSDK.instance.getUserInfo(this, function(userInfo : any){
												// console.log("userInfo :  "+JSON.stringify(userInfo));
												//QGameData.instance.setPlayerUserInfo(userInfo);
											})

											//QUIMgr.instance.removeUI(QUIMgr.UI_Main);
											//QUIMgr.instance.createUI(QUIMgr.UI_PkArena);

											//QUtil.biReport(QBIEvent.impowerSuccess);
										}
									}
								})
							})
						}
					},
					fail: function (res)
					{
						QDebug.log("gainUserInfo : fail : " + res);
					}
				});
			}
		}

		public showUserInfoBtn(isShow : boolean)
		{
			if (Laya.Browser.onMiniGame)
			{
				if (!QUtil.isNullOrEmpty(this.btnGetUserInfo))
				{
					if(isShow)
					{
						this.btnGetUserInfo.show();
					}
					else
					{
						this.btnGetUserInfo.hide();
					}
				}
			}
		}

		public destroyGetUserInfoBtn(): void
		{
			if (Laya.Browser.onMiniGame)
			{
				if (!QUtil.isNullOrEmpty(this.btnGetUserInfo))
				{
					this.btnGetUserInfo.destroy();
					this.btnGetUserInfo = null;
				}
			}
		}

		public getUserInfo(caller : any = null, callback : Function = null) : void
		{
			if(Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.getUserInfo({
					success(res) {
						if(callback != null)
						{
							callback.apply(caller, [res.userInfo]);
						}
					}
				})
			}
		}

		public getNetworkType(): void
		{
			if (Laya.Browser.onMiniGame)
			{
				var getNetSuccess = function (res)
				{
					if (res.hasOwnProperty('isConnected'))
					{
						tywx.StateInfo.networkConnected = res.isConnected;
					}
					else if (res.hasOwnProperty('errMsg'))
					{
						tywx.StateInfo.networkConnected = (res.errMsg == 'getNetworkType:ok');
					}

					tywx.StateInfo.networkConnected = (res.networkType != 'none');
					tywx.StateInfo.networkType = res.networkType;//wifi,2g,3g,4g,none,unknown

					QDebug.log("getNetworkType: " + JSON.stringify(res) + " : " + tywx.StateInfo.networkConnected);
				};

				Laya.Browser.window.wx.getNetworkType({
					success: getNetSuccess
				});
			}
		}

		public isNetworkConnected(): boolean
		{
			if (Laya.Browser.onMiniGame)
			{
				if (!tywx.StateInfo.networkConnected)
				{
					//@ts-ignore
					wx.showModal({ title: QLanguage.NETWORK_NOT_CONNECTED, showCancel:false ,duration: 2000 });
				}

				return tywx.StateInfo.networkConnected;
			}

			return true;
		}

		public showWxLoading(title: string = '加载中',hideLoadingTime : number = 2000): void
		{
			if (Laya.Browser.onMiniGame) 
			{
				Laya.Browser.window.wx.showLoading({
					title: title,
					mask: true,
				});

				setTimeout(function ()
				{
					Laya.Browser.window.wx.hideLoading()
				}, hideLoadingTime)
			}
		}

		public showWxToast(title: string)
		{
			if (Laya.Browser.onMiniGame) 
			{
				Laya.Browser.window.wx.showToast({
					title: title,
					duration: 2000
				})
			}
		}

		public showModal(title: string , content : string)
		{
			if(Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.showModal({
					title: title,
					content: content,
					showCancel : false,
				})
			}
		}

		public gc() : void
		{
			if(Laya.Browser.onMiniGame)
			{
				Laya.Browser.window.wx.triggerGC();
			}
		}

		public getMenuButtonBoundingClientRect():number
		{
			let menuBtnInfo;
			if(Laya.Browser.onMiniGame) 
			{
				menuBtnInfo = Laya.Browser.window.wx.getMenuButtonBoundingClientRect();
			}
			
			if(!QUtil.isNullOrEmpty(menuBtnInfo))
			{
				return menuBtnInfo.top;
			}
			else
			{
				return 10;
			}
		}

		public loadSubpackage(handler : Laya.Handler = null) : void
		{
			if(Laya.Browser.onMiniGame && !QUtil.isNullOrEmpty(Laya.Browser.window.wx.loadSubpackage))
			{
				Laya.Browser.window.wx.loadSubpackage({
					name: 'subpackage',
					success(res) {
						QDebug.logError("loadSubpackage success: " + JSON.stringify(res));
						// 分包加载成功后通过 success 回调
						if(!QUtil.isNullOrEmpty(handler)){
							handler.run();
						}
					},
					fail(res) {
					  // 分包加载失败通过 fail 回调
					  Laya.timer.once(1000, QWxSDK.instance, function(){
							QWxSDK.instance.loadSubpackage(handler);
					  })
					}
				})
			}
			else
			{
				if(!QUtil.isNullOrEmpty(handler)){
					handler.run();
				}
			}
		}

		public getSubpackagePath() : string
		{
			return (Laya.Browser.onMiniGame ? "subpackage/" : "");
		}

		public forceUpdate() : void
		{
			if(Laya.Browser.onMiniGame)
			{
				if (typeof(Laya.Browser.window.wx.getUpdateManager) === 'function') {
					const updateManager = Laya.Browser.window.wx.getUpdateManager()
				  
					updateManager.onCheckForUpdate(function (res) {
					  // 请求完新版本信息的回调
					//   console.log(res.hasUpdate)
					})
				  
					updateManager.onUpdateReady(function () {
					  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
					  updateManager.applyUpdate()
					})
				  
					updateManager.onUpdateFailed(function () {
					  // 新的版本下载失败
					})
				  }
			}
		}

		public onStartVibrateShort():void
		{
			if(QSoundMgr.instance.isVibrateOn){
				if(Laya.Browser.onMiniGame)
				{
					Laya.Browser.window.wx.vibrateShort();
				}else if(navigator.platform=='android'){
					tywx.AndroidHelper.startVibrate(100);
				}
			}
		}

		/**
		 * 插屏视频
		 */
		public playInterstitialAd():void {
			if(Laya.Browser.onMiniGame)
			{
				if (Laya.Browser.window.wx.createInterstitialAd){
					var interstitialAd = Laya.Browser.window.wx.createInterstitialAd({
						adUnitId: 'adunit-181a0fb7ca77b6c4'
						})
					interstitialAd.show().catch((err) => {
						// console.error(err)
					})
				}
			}
		}
	}
}

export default game.core.QWxSDK;
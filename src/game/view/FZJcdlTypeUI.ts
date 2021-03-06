import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUtils from "../../framework/FZUtils";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZWechat from "../core/FZWechat";
import FZDebug from "../../framework/FZDebug";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZUIManager from "../core/FZUIManager";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZMergeDateManager from "../data/FZMergeDateManager";


namespace game.view
{
    export class FZJcdlTypeUI extends FZBaseUI
    {
        public  JcdlSliderType : number = 0;
        public  JcdlPageType : number = 1;
        public  JcdlSingleType : number = 2;
        
        public jcdlView : FZJcdlTypeUI;  // 滚动导流 
        public residentView : FZJcdlTypeUI; // 常驻导流

        private static _instance : FZJcdlTypeUI;
        public static get instance() : FZJcdlTypeUI
        {
            if(this._instance == null)
            {
                this._instance = new FZJcdlTypeUI();
            }
            return this._instance;
		}

        // 创建 导流
        public create(param : any) : void
        {
            if(FZUtils.isNullOrEmpty(this.jcdlView))
            {
                this.jcdlView = new FZJcdlTypeUI();
                this.jcdlView.start();
                this.jcdlView.iconTimestamp = Math.sqrt(Math.random());
            }
            let scene = this.jcdlView.scene;
            scene.visible = true;
            Laya.stage.addChild(scene);

            this.jcdlView.setParam(param);
        }

        // 创建 主界面 常驻导流
        public createResident(param : any) : void
        {
            if(FZUtils.isNullOrEmpty(this.residentView))
            {
                this.residentView = new FZJcdlTypeUI();
                this.residentView.start();
                this.residentView.iconTimestamp = Math.sqrt(Math.random());
            }
            let scene = this.residentView.scene;
            scene.visible = true;
            if (FZUIManager.instance.longScreen()) {
                Laya.timer.once(20, this, () => {
                    this.residentView.scene.y -= 100;
                });
            }

            Laya.stage.addChild(scene);

            this.residentView.setParam(param);
        }

        public scene : ui.view.JcdTypelViewUI;

        public iconTimestamp : number;
        private jcdlCfg :any = null; 
        private showJcdlCfg = [];
        private showJcdlCfgObj = {};  //交叉导流对象
        private jcdlCfgArr = [];
        private jcdlType : number = 0;

        private controlStartX:number=0;
		private controlStartY:number=0; 
		private controlEndX:number=0;
        private controlEndY:number=0;
        private value : number = 0;
        private slideTime : number = 0;
        private stopTime : number = 2500;
        private maxValue : number = 0;
        private sliderSpeed : number = 20;

        private jcdlX : number = 0;
        private jcdlY : number = 0;

        private jdclSingleIndex : number = 1;

        //交叉导流显示类型 (0:不显示  1:显示)  Ps: 用于筛选配置表内显示的交叉导流
        private noShowJcdl : number = 0;
        private showJcdl : number = 1;

        //头像红点显示类型 (0:不显示  1:显示)
        private noShowRedDot : number = 0;
        private showRedDot : number = 1;

        private pageJcdlPopupX : number = 0;

        //检测是否划出屏幕
        private mouseIsLeaveScreen : boolean = true;
        public clickAppID: "";  //本次试玩的游戏ID

        public init()
        {
            this.scene = new ui.view.JcdTypelViewUI();
            this.showJcdlCfg = FZGameData.instance.getJcdlDataList();
        }

        private defaultListBgY : number;
        private defaultListJcdlY : number;
        public setParam(param : any):void
        {
            this.jcdlType = param.type;
            if(this.jcdlType == 0) // 底部滚动
            {
                this.scene.JcdlSlideBox.visible = true;
                this.scene.JcdlPageBox.visible = false;
                this.scene.JcdlSingleBox.visible = false;
                this.scene.JcdlResidentBox.visible = false;
                this.scene.JcdlPopUpBox.visible = false;

                this.scene.listJcdl.hScrollBarSkin = "";
                this.scene.listJcdl.renderHandler = new Laya.Handler(this,this.slideListJcdlHandle);
                this.scene.listJcdl.array = this.showJcdlCfg;

                this.maxValue = this.scene.listJcdl.scrollBar.max;
                this.slideTime = this.maxValue*this.sliderSpeed;
    
                this.scene.listJcdl.on(Laya.Event.MOUSE_DOWN,this,this.onClickSlideListJcdlDown);
                this.scene.listJcdl.on(Laya.Event.MOUSE_UP,this,this.onClickSlideListJcdlUp);
                if(this.showJcdlCfg.length > 5)
                {
                    Laya.timer.once(this.stopTime,this,this.slideListJcdlRightAni);
                }

                if(FZ.UserInfo.systemType == 2)
                {
                    if(FZUtils.isNullOrEmpty(this.defaultListJcdlY))
                    {
                        this.defaultListBgY = this.scene.listBg.y;
                        this.defaultListJcdlY = this.scene.listJcdl.y;
                    }
                    this.scene.listBg.y = this.defaultListBgY - 20;
                    this.scene.listJcdl.y = this.defaultListJcdlY - 20;
                }
            }
            else if(this.jcdlType == 1)  // 抽屉
            {
                this.jcdlY = param.jcdlY;

                // this.scene.JcdlSlideBox.visible = false; 
                this.scene.JcdlPageBox.visible = true;
                this.scene.JcdlSingleBox.visible = false;
                this.scene.JcdlPopUpBox.visible = false;

                // this.updatePageNotice();
                this.scene.jcdl_page_notice.visible = true;
                this.scene.listPageJcdl.vScrollBarSkin = "";
                this.scene.listPageJcdl.renderHandler = new Laya.Handler(this,this.pageListJcdlHandle);
                this.scene.listPageJcdl.array = this.showJcdlCfg;

                this.scene.btnShowJcdl.on(Laya.Event.CLICK,this,this.onClickBtnShowJcdl);
            }
            else if(this.jcdlType == 2)  //单个滚动
            {
                this.jcdlX = param.jcdlX;
                this.jcdlY = param.jcdlY;
                
                this.scene.JcdlSlideBox.visible = false;
                this.scene.JcdlPageBox.visible = false;
                this.scene.JcdlResidentBox.visible = false;
                this.scene.JcdlSingleBox.visible = true;
                this.scene.JcdlPopUpBox.visible = false;
                
                this.scene.btnSingleJcdlIcon.pos(this.jcdlX,this.jcdlY);

                this.JcdlSingleInfo();
                Laya.timer.loop(1500,this,this.JcdlSingleInfo);
            } else if( this.jcdlType == 3 )  // 常驻导流( 2 个 )
            {
                this.scene.JcdlSlideBox.visible = false;
                this.scene.JcdlPageBox.visible = false;
                this.scene.JcdlSingleBox.visible = false;
                this.scene.JcdlResidentBox.visible = true;
                this.scene.JcdlPopUpBox.visible = false;
                this.JcdlResidentList();
            }else if( this.jcdlType == 4){  //弹窗交叉导流
                FZ.BiLog.clickStat(FZ.clickStatEventType.moreGameOpen,[]);  //成功打开试玩游戏界面打点
                FZDebug.D("FZMergeDateManager.instance.getPopJcdlCfg() = "+ JSON.stringify(FZMergeDateManager.instance.getPopJcdlCfg()));
                this.scene.listPopJcdl.vScrollBarSkin = "";
                this.scene.listPopJcdl.array = FZMergeDateManager.instance.getPopJcdlCfg();
                this.scene.listPopJcdl.renderHandler = new Laya.Handler(this,this.popListJcdlHandle);
                
                this.scene.JcdlSlideBox.visible = false;
                this.scene.JcdlPageBox.visible = false;
                this.scene.JcdlSingleBox.visible = false;
                this.scene.JcdlResidentBox.visible = false;
                this.scene.jcdl_black_bg.visible = true;
                this.scene.JcdlPopUpBox.visible = true;
                FZUtils.doUIPopAnim(this.scene.popUpWindow);
    
                this.scene.popJcdlClose.on(Laya.Event.CLICK,this,this.onClickBtnPopJcdlClose);  //关闭弹窗
                this.scene.jcdl_black_bg.on(Laya.Event.CLICK,this,this.onClickBlackBg);  //蒙版
            }
        }

        public registerEvent(){
            FZEventManager.instance.register(FZEvent.WX_ON_SHOW, this.onShow, this);  //返回游戏监听
            FZEventManager.instance.register(FZEvent.JCDL_SUCCESS, this.updateClickAppID, this);  //成功试玩监听
            FZEventManager.instance.register(FZEvent.JCDL_CAN_CLICK, this.updateClick, this);
        }

        public unregisterEvent(){
            FZEventManager.instance.unregister(FZEvent.WX_ON_SHOW, this.onShow, this);
            FZEventManager.instance.unregister(FZEvent.JCDL_SUCCESS, this.updateClickAppID, this);
        }

        /**
         * 回到游戏时调用
         */
        public onShow(){
            let newTime = new Date().getTime();
            if(FZMergeDateManager.instance.toOtherGame){
                if(this.judgePlayTime(newTime)){
                    FZMergeDateManager.instance.changePopJcdlCfg(this.clickAppID);
                    //设置奖励信息
                    let param = {
                        itemType: 2,
                        itemDes: "钻石x50",
                        itemValue: 50,
                        getType: 1
                    }
                    FZUIManager.instance.createUI(FZUIManager.UI_CongratulationGet, param);  //获得奖励弹窗
                    FZ.BiLog.clickStat(FZ.clickStatEventType.moreGameSuccess,[]);  //成功试玩并领取奖励打点
                    
                    var dayFresh = FZSaveDateManager.instance.getItemFromLocalStorage("MORE_GAME_DAY_FRESH", "1");
                    if (FZMergeDateManager.instance.getPopJcdlCfg().length == 0) {
                        if(dayFresh == "1"){
                            FZMergeDateManager.instance.fleshPopJcdl();
                            FZSaveDateManager.instance.setItemToLocalStorage("MORE_GAME_DAY_FRESH", "0");
                        }
                        this.scene.day_fresh.visible = false;
                        this.onClickBtnPopJcdlClose();
                    }else{
                        this.updatePopJcdlShow();
                    }
                }else{
                    Laya.timer.once(1000, this, function(){
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text: "注意！试玩需超过20秒"});
                    });
                }
                FZMergeDateManager.instance.toOtherGame = false;
            }
        }
        
        /**
         * 更新点击的appId
         * @param param appId
         */
        public updateClickAppID(param){
            this.clickAppID = param;
        }

        /**
         * 更新弹窗导流显示
         */
        public updatePopJcdlShow(){
            this.scene.listPopJcdl.array = FZMergeDateManager.instance.getPopJcdlCfg();
            this.scene.listPopJcdl.refresh();
        }

        //  注释原因 ： 暂时用不到
        // /**
        //  * 将数组类型转换成对象
        //  */
        // public arrayToObj(arr: any[]){
        //     var obj = {};
        //     for(let i = 0; i < arr.length; i++){
        //         obj[i + ""] = arr[i];
        //     }
        //     return obj;
        // }

        //---------------------------------SliderListJcdl---------------------------------------
        /**
         * 更新抽屉导流的红点提示
         */
        public updatePageNotice(){
            let flag = FZSaveDateManager.instance.getItemFromLocalStorage("JCDL_PAGE_NOTICE", "true");
            if(flag == "true"){
                this.scene.jcdl_page_notice.visible = true;
            }else{
                this.scene.jcdl_page_notice.visible = false;
            }
        }

        /**
         * 关闭弹窗导流
         */
        private onClickBtnPopJcdlClose(){
            Laya.timer.once(100, this, function(){
                this.scene.jcdl_black_bg.visible = false;  //关闭蒙版
            });
            FZUtils.doUICloseAnim(this.scene.popUpWindow);
            this.remove();
        }

        private onClickSlideListJcdlDown(e:Laya.Event):void
        {
            this.controlStartX = e.stageX;
            this.controlStartY = e.stageY;

            Laya.timer.clearAll(this);

            Laya.timer.once(this.stopTime,this,()=>{
                if(this.mouseIsLeaveScreen)
                {
                    let listValue = this.scene.listJcdl.scrollBar.value;
                    if(listValue > (this.maxValue*0.5))
                    {
                        let aniTime = this.sliderSpeed*listValue;
                        this.slideListJcdlLeftAni(aniTime);
                    }
                    else
                    {
                        let aniTime =this.sliderSpeed*(this.maxValue - listValue);
                        this.slideListJcdlRightAni(aniTime);
                    }
                }
            });
        }

        private onClickSlideListJcdlUp(e:Laya.Event):void
        {
            this.mouseIsLeaveScreen = false;

            this.controlEndX=e.stageX;
            this.controlEndY=e.stageY;

            let value = this.scene.listJcdl.scrollBar.value;
            if(this.controlStartX-this.controlEndX>10)
            {
                let aniTime = this.sliderSpeed*value;
                Laya.timer.once(this.stopTime,this,this.slideListJcdlLeftAni,[aniTime]);
            }
            else
            {
                let aniTime =this.sliderSpeed*(this.maxValue - value);
                Laya.timer.once(this.stopTime,this,this.slideListJcdlRightAni,[aniTime]);
            }
        }

        private slideListJcdlRightAni(aniTime : number = this.slideTime):void
        {
            let value =this.maxValue-this.scene.listJcdl.scrollBar.value;
            Laya.Tween.to(this.scene.listJcdl.scrollBar,{value:this.maxValue},aniTime,Laya.Ease.linearInOut);
            Laya.timer.once(aniTime+this.stopTime,this,this.slideListJcdlLeftAni);
        }

        private slideListJcdlLeftAni(aniTime : number = this.slideTime):void
        {
            Laya.Tween.to(this.scene.listJcdl.scrollBar,{value:0},aniTime,Laya.Ease.linearInOut);
            Laya.timer.once(aniTime+this.stopTime,this,this.slideListJcdlRightAni);
        }

        private popListJcdlHandle(item,index){
            var jcdlCfgArr = FZMergeDateManager.instance.getPopJcdlCfg()[index];
            
            if (FZUtils.isNullOrEmpty(jcdlCfgArr)){
                item.visible = false;
                return;
            }
            let imgListPopJcdlIcon = item.getChildByName("imgListPopJcdlIcon");
            let lblListPopJcdlIcon = item.getChildByName("lblListPopJcdlIcon");
            let imgPopHint = item.getChildByName("imgPopHint");
            let try_game = item.getChildByName("try_game");
            imgListPopJcdlIcon.skin = jcdlCfgArr.icon_url[0] + "?v=" + this.iconTimestamp;
            lblListPopJcdlIcon.changeText(jcdlCfgArr.gameName);
            try_game.off(Laya.Event.CLICK,this,this.onClickBtnTryGame);
            try_game.on(Laya.Event.CLICK, this, this.onClickBtnTryGame, [index,try_game]);  //on的参数必须是以数组的形式传递的
            // FZUIManager.instance.RegisterBtnClickWithAnim(try_game, this, this.onClickBtnTryGame, [index]);
        }

        /**
         * 更新试玩按钮的可点击控制
         */
        public updateClick(){
            this.noClick = false;
        }

        public noClick = false;
        /**
         * 点击试玩按钮
         * @param param 试玩的游戏ID
         */
        public onClickBtnTryGame(index,try_game){
            FZUtils.playBtnScaleAni(try_game);
            //防止连续点击
            if(this.noClick){
                return;
            }
            this.noClick = true;
            Laya.timer.once(2000, this, function(){
                this.noClick = false;
            });
            let toappid =  FZMergeDateManager.instance.getPopJcdlCfg()[index]["toappid"];
            this.clickAdIcon(toappid);
            if(toappid == "wx79ade44c39cefc7f")
            {
                //FZUtils.biReport(QBIEvent.clickJCDLGame);
            }
            FZDebug.log("onClickBtnJcdlIcon: " + FZMergeDateManager.instance.getPopJcdlCfg()[index]["togame"]);
        }

        /**
         * 导流的跳转
         * @param appId
         */
        public clickAdIcon(appId){
            if (Laya.Browser.onMiniGame)
			{
				this.jcdlCfg = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.JCDL];
				if (FZUtils.isNullOrEmpty(this.jcdlCfg))
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

				if(FZUtils.isNullOrEmpty(jsonData))
				{
					return;
				}

				FZDebug.log("clickAdIcon: " + jsonData.gameName);

				let icon_id = jsonData.icon_id
				let toappid = jsonData.toappid
				let togame = jsonData.togame
				let skip_type = jsonData.icon_skip_type
				// let topath = jsonData.path
				let topath = `${jsonData.path}_dev_${FZ.BiLog.device_id}_${FZ.UserInfo.userId}`;
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

								FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);

								FZDebug.log('wx.navigateToMiniProgram success');
                                FZDebug.log(res);
                                FZMergeDateManager.instance.toOtherGame = true;  //记录从弹窗导流进入其他游戏的状态
                                let time = FZGameData.instance.setMoreGameTime();
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_SUCCESS, appId);  //试玩成功事件
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_CAN_CLICK);
							},
							fail: function (res)
							{
								FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
								FZDebug.log('wx.navigateToMiniProgram fail');
                                FZDebug.log(res);
                                FZMergeDateManager.instance.toOtherGame = false;
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_CAN_CLICK);
							},
							complete: function (res)
							{
								FZDebug.log('navigateToMiniProgram ==== complete');
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
								FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);
								FZDebug.log('wx.navigateToMiniProgram success');
                                FZDebug.log(res);
                                FZMergeDateManager.instance.toOtherGame = true;  //记录从弹窗导流进入其他游戏的状态
                                let time = FZGameData.instance.setMoreGameTime();
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_SUCCESS, appId);  //试玩成功事件+
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_CAN_CLICK);
							},
							fail: function (res)
							{
								FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
								FZDebug.log('wx.navigateToMiniProgram fail');
                                FZDebug.log(res);
                                FZMergeDateManager.instance.toOtherGame = false;
                                FZEventManager.instance.sendEvent(FZEvent.JCDL_CAN_CLICK);
							},
							complete: function (res)
							{
								FZ.AdManager.adNodeObj.resetBtnIcon();
								FZDebug.log('navigateToMiniProgram ==== complete');
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

				FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickShowQRCode, bi_paramlist);

				if (Laya.Browser.onMiniGame)
				{
					Laya.Browser.window.wx.previewImage({
						current: [webpage_url],
						urls: [webpage_url],
						success: function (res)
						{
							FZDebug.log("预览图片成功！");
						},
						fail: function (res)
						{
							FZDebug.log("预览图片失败！");
						},
						complete: function (res)
						{
							FZDebug.log('预览图片完成');
						},
					});
				}
			}
        }

        /**
         * 判断试玩时间是否超过20s
         * @param param 当前时间
         */
        public judgePlayTime(param: any){
            let time = FZGameData.instance.getMoreGameTime();
            let playTime = FZGameData.instance.moreGameAwardTime | 20;
            if(param - time >= playTime * 1000){
                return true;
            }else{
                return false;
            }
        }
        
        private slideListJcdlHandle(item,index):void
        {
            this.value = this.scene.listJcdl.scrollBar.value;
            let imgJcdlIcon = item.getChildByName("imgJcdlIcon");
            let lblJcdlName = item.getChildByName("lblJcdlName");
            let imgHintRedDot = item.getChildByName("imgHintRedDot");
            let jcdlPoint = item.getChildByName("jcdl_point");  // 获取右上角 热门/爆款 角标 

            imgJcdlIcon.skin = this.showJcdlCfg[index].icon_url[0] + "?v=" + this.iconTimestamp;
            lblJcdlName.changeText(this.showJcdlCfg[index].gameName);

            let isShowRedDot = (this.showJcdlCfg[index]["red_point"] == this.showRedDot);
            imgHintRedDot.visible = isShowRedDot;
            
            var randomNum =  Math.floor( Math.random() * 2 ) + 1;
            if( randomNum == 1 ){  //  热门
                jcdlPoint.skin = "ui_common/jcdl_point1.png";
            } else if( randomNum == 2 ){  // 爆款 
                jcdlPoint.skin = "ui_common/jcdl_point2.png";
            } else { 
                jcdlPoint.skin = "ui_common/jcdl_point1.png";
            }

            imgJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIcon,[index]);
        }

        //---------------------------------PageListJcdl---------------------------------------
        /**
         * 抽屉出现时的萌版
         */
        public onClickBlackBg(){
            return;
        }
        
        public pageJcdlOpenCtr = "open";
        public mainMoving = false;    // 避免连续点击
        private onClickBtnShowJcdl():void
        {
            if(this.pageJcdlOpenCtr == "open"){
                FZSaveDateManager.instance.setItemToLocalStorage("JCDL_PAGE_NOTICE", "false");
                // this.updatePageNotice();
                this.scene.jcdl_page_notice.visible = false;
                // 避免重复点击按钮
                if( this.mainMoving == true ){
                    return;
                }
                this.mainMoving = true;

                this.scene.jcdl_black_bg.on(Laya.Event.CLICK,this,this.onClickBlackBg);  //蒙版
                this.scene.jcdl_black_bg.visible = true;
                this.scene.shou_jcdl_btn.skin = "ui_common/jcdl_page_btn_close.png"
                this.pageJcdlOpenCtr = "close";
                Laya.Tween.to(this.scene.pageJcdl, {x: 195}, 500, Laya.Ease.elasticInOut);
                // 避免重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once(500 , this , function(){
                    this.mainMoving = false;
                })
            }else if(this.pageJcdlOpenCtr == "close"){
                // 避免重复点击按钮
                if( this.mainMoving == true ){
                    return;
                }
                this.mainMoving = true;

                this.scene.jcdl_black_bg.visible = false;
                this.scene.shou_jcdl_btn.skin = "ui_common/jcdl_page_btn_open.png"
                this.pageJcdlOpenCtr = "open";
                Laya.Tween.to(this.scene.pageJcdl, {x: 759}, 500, Laya.Ease.elasticInOut);
                // 避免重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once(500 , this , function(){
                    this.mainMoving = false;
                })
            }
        }

        private pageListJcdlHandle(item,index):void
        {
            let imgListJcdlIcon = item.getChildByName("imgListJcdlIcon");
            let lblListJcdlIcon = item.getChildByName("lblListJcdlIcon");

            imgListJcdlIcon.skin = this.showJcdlCfg[index].icon_url[0] + "?v=" + this.iconTimestamp;
            lblListJcdlIcon.changeText(this.showJcdlCfg[index].gameName);

            let isShowRedDot = (this.showJcdlCfg[index]["red_point"] == this.showRedDot);

            imgListJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIcon,[index]);
        }   

        
        //---------------------------------SingleJcdl---------------------------------------
        /**
         * 交叉导流信息循环
         */
        private JcdlSingleInfo():void
        {
            if( this.jdclSingleIndex != 1 ){
                this.scene.btnSingleJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIcon,[this.jdclSingleIndex]);
                this.scene.imgSingleJcdlIcon.skin = this.showJcdlCfg[this.jdclSingleIndex].icon_url[0]+ "?v=" + this.iconTimestamp;
                this.scene.lblSingleJcdlName.changeText(this.showJcdlCfg[this.jdclSingleIndex].gameName);
            }
            
            if(this.jdclSingleIndex == (this.showJcdlCfg.length-1))
            {
                this.jdclSingleIndex = 1; // 跳过第一二个
            }

            this.jdclSingleIndex++;
        }

        /**
        *   交叉导流 - 常驻导流列表
        */
        private JcdlResidentList(): void
        {
            // 常驻导流列表 - 第一位  [0]
            this.scene.permanent1.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIcon,[0]);
            this.scene.imgSingleJcdlIcon1.skin = this.showJcdlCfg[0].icon_url[0]+ "?v=" + this.iconTimestamp;
            this.scene.lblSingleJcdlName1.changeText(this.showJcdlCfg[0].gameName);
                
            // 常驻导流列表 - 第二位  [1]
            this.scene.permanent2.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIcon,[1]);
            this.scene.imgSingleJcdlIcon2.skin = this.showJcdlCfg[1].icon_url[0]+ "?v=" + this.iconTimestamp;
            this.scene.lblSingleJcdlName2.changeText(this.showJcdlCfg[1].gameName);
        }

        public onClickBtnJcdlIcon(iconIndex : number):void
        {
            let toappid =  this.showJcdlCfg[iconIndex]["toappid"];
            FZWechat.instance.clickAdIcon(toappid);

            if(toappid == "wx79ade44c39cefc7f")
            {
                //FZUtils.biReport(QBIEvent.clickJCDLGame);
            }

            FZDebug.log("onClickBtnJcdlIcon: " + this.showJcdlCfg[iconIndex]["togame"])
        }

        public remove() : void
        {
            if(!FZUtils.isNullOrEmpty(this.jcdlView))
            {
                this.jcdlView.scene.visible = false;
                Laya.stage.removeChild(this.jcdlView.scene);
                this.jcdlView.doDestroy();
            }

            if(!FZUtils.isNullOrEmpty(this.residentView))
            {
                this.residentView.scene.visible = false;
                Laya.stage.removeChild(this.residentView.scene);
                this.residentView.doDestroy();
            }
        }

        // 只进行清除 滚动导流
        public removeRollBanner() : void
        {
            if(!FZUtils.isNullOrEmpty(this.jcdlView))
            {
                this.jcdlView.scene.visible = false;
                Laya.stage.removeChild(this.jcdlView.scene);
                this.jcdlView.doDestroy();
            }
        }

        // 用于Ui场景切换时候  是否进行隐藏  ( 关闭显示  )
        public closeShow() : void
        {
            // 主界面 滚动导流 控制
            if(!FZUtils.isNullOrEmpty(this.jcdlView))
            {
                Laya.timer.clearAll(this);
                this.jcdlView.scene.visible = false;
            }

            // 主界面 常驻导流 控制
            if(!FZUtils.isNullOrEmpty(this.residentView))
            {
                Laya.timer.clearAll(this);
                this.residentView.scene.visible = false;
            }
        }
        // ( 打开显示  )
        public openShow() : void
        {
             // 主界面 常驻导流 控制
             if(!FZUtils.isNullOrEmpty(this.residentView))
             {
                 this.residentView.scene.visible = true;
             }

            // 主界面 滚动导流 控制
            if(!FZUtils.isNullOrEmpty(this.jcdlView))
            {
                // 根据目前空投 是否存在 , 以控制 是否显示 滚动导流
                if(this.jcdlType == 2)
                {
                    Laya.timer.loop(1500,this,this.JcdlSingleInfo);
                }
                this.jcdlView.scene.visible = true;
            }
        }

        public doDestroy():void
        {
            Laya.timer.clearAll(this);

            // if(this.jcdlType == FZJcdlTypeUI.JcdlPageType && this.scene.pageJcdl.x == 0)
            // if(this.jcdlType == 1 && this.scene.pageJcdl.x == 0)
            // {
            //     this.onClickBtnShowJcdl();
            // }
        }
    }
}
export default game.view.FZJcdlTypeUI;
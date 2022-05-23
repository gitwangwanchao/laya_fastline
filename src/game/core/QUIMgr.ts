import QUtil from "../../framework/QUtil";
import QBaseUI from "./QBaseUI";
import QDebug from "../../framework/QDebug";
import QLoadingView from "../view/QLoadingView";
import QMainView from "../view/QMainView";
import QGainCarDiaog from "../view/QGainCarDiaog";
import QLevelUpView from "../view/QLevelUpView";
// import QGameView3DTest from "../view/QGameView3DTest";
import QTipsView from "../view/QTipsView";
import QAddRevenueDialog from "../view/QAddRevenueDialog";
import QBeOfflineDialog from "../view/QBeOfflineDialog";
import QShopDialog from "../view/QShopDialog";
import QGameView from "../view/QGameView";
import QSetting from "../view/QSetting";
import QFreeLevelUp from "../view/QFreeLevelUp";
import QFreeGoldGet from "../view/QFreeGoldGet"
import QDrawerDialog from "../view/QDrawerDialog"
import QSelectView from "../view/QSelectView"
import QSignInDialog from "../view/QSignInDialog"
// import QDropBoxDialog from "../view/QDropBoxDialog"
import QLuckyGuy from "../view/QLuckyRotaryTableNew"
import QCongratulationGety from "../view/QCongratulationGetView";
import QSupplyTips from "../view/QSupplyTips";
import QCheckPointChooseDialog from "../view/QCheckPointChooseDialog";
import QGameResurrectView from "../view/QGameResurrectView";
import QGameEndingView from "../view/QGameEndingView";
// import QDollarExchangeView from "../view/QDollarExchangeView";
import QGameLoading from "../view/QGameLoading";
import QGameGuide from "../view/QGameGuide";
import QWeaponLevelUpView from "../view/QWeaponLevelUpView";
import QWeaponLockedNoticeView from "../view/QWeaponLockedNoticeView";
import QWeaponUnlockNoticeView from "../view/QWeaponUnlockNoticeView";
import QAdManager from "./QAdManager";
import QWxSDK from "./QWxSDK";

import QJcdlTypeView from "../../game/view/QJcdlTypeView";
import QCfgMgr from "./QCfgMgr";
import QGameConst from "../data/QGameConst";
import QGameData from "../data/QGameData";
import QDailyDiamond from "../view/PopupWindow/QDailyDiamond";
import QOnlineGift from "../view/QOnlineGift";
import QSceneMgr from "./QSceneMgr";

/**
 * UI管理器
 */
namespace game.core
{
    export class QUIMgr
    {
        private constructor() { }

        private static _instance: QUIMgr;
        public static get instance(): QUIMgr
        {
            if (this._instance == null)
            {
                this._instance = new QUIMgr();
                this._instance.registerEvent();
            }
            return this._instance;
        }
        /**
         * 添加监听事件
         */
        private registerEvent(): void
        {
        }
        /**
         * 删除监听事件
         */
        private unregisterEvent(): void
        {
        }

        public init(): void
        {
            
        }
        // UI ID
        public static UI_Loading : number = 0;
        public static UI_Main: number = 1;
        public static UI_GainCar:number = 2; // 合成新车 
        public static UI_LevelUp:number = 3; // 升级
        public static UI_GameView3DTest:number = 4; // 游戏
        
        public static UI_Tip:number = 5; // 提示
        public static UI_AddRevenueDialog:number = 6;// 加速
        public static UI_BeOffline:number = 7;// 离线界面 
        public static UI_ShopDialog:number = 8; // 商店
        public static UI_GameView:number = 9; // 游戏

        public static UI_Setting:number = 10; // 设置
        public static UI_FreeLeveUp:number = 11; // 免费升级
        public static UI_FreeGoldGet:number = 12; // 免费金币
        public static UI_DrawerDialog:number = 13; // 抽屉 
        public static UI_SelectView:number = 14; // 赛车选择 
        public static UI_SignInDialog:number = 15; // 签到 
        // public static UI_DropBoxDialog:number = 16; // 空投包
        public static UI_LuckyGuy:number = 17; // 转盘
        public static UI_CongratulationGet:number = 18; // 恭喜获得
        public static UI_Supply_Tips: number = 20;
        public static UI_CheckPointChoose: number = 22;
        public static UI_GameResurrectView: number = 23; // 复活界面
        public static UI_GameEndingView: number = 24; // 结算界面
        public static UI_DollarExchangeView: number = 25; // 美元兑换 
        public static UI_QGameLoadingView: number = 26; // 游戏过场
        public static UI_WeaponLevelUpView: number = 27; // 武器升级 
        public static UI_GameGuideView: number = 28;
        public static UI_WeaponUnlockNoticeView: number = 29;
        public static UI_WeaponLockedNoticeView: number = 30;
        public static UI_DailyDiamondView: number = 31; // 每日奖励
        public static UI_OnlineGift: number = 32;  //在线宝箱
        
        private dicUI: { [key: number]: QBaseUI } = {};
        private waitUI = [];
        private waitUiParam = [];

        public longScreen(){
            let _window_screen_width = Laya.Browser.onMiniGame ? Laya.Browser.window.screen.availWidth : Laya.Browser.window.screen.width;
            let _window_screen_height = Laya.Browser.onMiniGame ? Laya.Browser.window.screen.availHeight : Laya.Browser.window.screen.height;
            let cur_bi = _window_screen_width/_window_screen_height;
            let base_bi = 375/667;
            return cur_bi < base_bi;
        }

        addWaitUI(uiName: number, param: any = null){
            this.waitUI.push(uiName);
            this.waitUiParam.push(param);
        }

        popWaitUI(){
            this.createUI(this.waitUI.pop(), this.waitUiParam.pop());
        }

        public uiIsActive(uiName): boolean{
            return (this.dicUI[uiName] && this.dicUI[uiName].getActive());
        }

        /**
         * 创建UI
         * @param uiName 
         * @param param 
         */
        public createUI(uiName: number, param: any = null): QBaseUI
        {
            // 判断当前界面是否显示banner
            if(this.isShowBannerUI(uiName))
			{
                if(!this.containsShowBannerUIInStack())
                {
                    Laya.timer.frameOnce(2, this, function(){
                        // 显示banner
                        if (uiName == QUIMgr.UI_FreeGoldGet) {
                            if (QGameConst.QCurrencyType.dollar == param) {
                                QWxSDK.instance.showBannerAd();
                            }else {
                                // 屏蔽城市
                                let userArea = tywx.UserInfo.userArea || "";
                                let shareinfo = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.ShareCfg];
                                QDebug.D("手机城市1----------------------" + userArea);
                                QDebug.D("手机城市2----------------------" + JSON.stringify(shareinfo.bannerLimitCity));
                                let shield = shareinfo.bannerLimitCity.indexOf(userArea) >= 0 && shareinfo.shieldCityOpen;
                                let isAuditVersion = QWxSDK.instance.isAuditVersion();
                                if (isAuditVersion == false && shield == false) {
                                    QWxSDK.instance.showBannerAd();
                                }
                            }
                        }else {
                            QWxSDK.instance.showBannerAd();
                        }
                    })
                }
            }
            else
            {
                if (uiName != QUIMgr.UI_Tip) {
                    // 隐藏banner
                    QWxSDK.instance.hideBannerAd();
                }
            }
            if (this.isShowExChangeUI(uiName) && !this.containsShowExChangeUI()){
                QJcdlTypeView.instance.openShow();
            } else {
                // 其余界面下 显示 导流
                if (uiName != QUIMgr.UI_DrawerDialog &&uiName != QUIMgr.UI_Tip && uiName != QUIMgr.UI_GameGuideView) {
                    QJcdlTypeView.instance.closeShow();
                }
            }
            if (this.dicUI[uiName] == null)
            {
                switch (uiName)
                {
                    case QUIMgr.UI_Main:
                        this.dicUI[uiName] = new QMainView();
                        break;
                    case QUIMgr.UI_Loading:
                        this.dicUI[uiName] = new QLoadingView();
                        break;
                    case QUIMgr.UI_GainCar:
                        this.dicUI[uiName] = new QGainCarDiaog();
                        break;
                    case QUIMgr.UI_LevelUp:
                        if (this.dicUI[QUIMgr.UI_GainCar]) {
                            this.addWaitUI(QUIMgr.UI_LevelUp);
                            return;
                        } else {
                            this.dicUI[uiName] = new QLevelUpView();
                        }
                        break;
                    case QUIMgr.UI_GameView3DTest:
                        // this.dicUI[uiName] = new QGameView3DTest();
                        break;     
                    case QUIMgr.UI_Tip:  
                        this.dicUI[uiName] = new QTipsView();
                        break;              
                    case QUIMgr.UI_AddRevenueDialog:
                        this.dicUI[uiName] = new QAddRevenueDialog();
                        break; 
                    case QUIMgr.UI_BeOffline:
                        this.dicUI[uiName] = new QBeOfflineDialog();
                        break; 
                    case QUIMgr.UI_ShopDialog: 
                        this.dicUI[uiName] = new QShopDialog();
                        break; 
                    case QUIMgr.UI_GameView: 
                        this.dicUI[uiName] = new QGameView ();
                        break;  
                    case QUIMgr.UI_Setting: 
                        this.dicUI[uiName] = new QSetting ();
                        break;    
                    case QUIMgr.UI_FreeLeveUp: 
                        this.dicUI[uiName] = new QFreeLevelUp ();
                        break;     
                    case QUIMgr.UI_FreeGoldGet: 
                        this.dicUI[uiName] = new QFreeGoldGet ();
                        break;     
                    case QUIMgr.UI_DrawerDialog: 
                        this.dicUI[uiName] = new QDrawerDialog ();
                        break;
                    case QUIMgr.UI_SelectView:
                        this.dicUI[uiName] = new QSelectView ();
                        break;
                    case QUIMgr.UI_SignInDialog:
                        this.dicUI[uiName] = new QSignInDialog ();
                        break;
                    case QUIMgr.UI_LuckyGuy:
                        this.dicUI[uiName] = new QLuckyGuy ();
                        break;
                    case QUIMgr.UI_CongratulationGet:
                        this.dicUI[uiName] = new QCongratulationGety ();
                        break;
                    case QUIMgr.UI_Supply_Tips:
                        this.dicUI[uiName] = new QSupplyTips ();
                        break;
                    case QUIMgr.UI_CheckPointChoose:
                        this.dicUI[uiName] = new QCheckPointChooseDialog ();
                        break;
                    case QUIMgr.UI_GameResurrectView:
                        this.dicUI[uiName] = new QGameResurrectView ();
                        break;
                    case QUIMgr.UI_GameEndingView:
                        this.dicUI[uiName] = new QGameEndingView ();
                        break;
                    case QUIMgr.UI_OnlineGift:
                        this.dicUI[uiName] = new QOnlineGift ();
                        break;
                    // case QUIMgr.UI_DollarExchangeView:
                    //     this.dicUI[uiName] = new QDollarExchangeView ();
                    //     break;
                    case QUIMgr.UI_QGameLoadingView:
                        this.dicUI[uiName] = new QGameLoading();
                        break;
                    case QUIMgr.UI_GameGuideView:
                        this.dicUI[uiName] = new QGameGuide();
                        break;
                    case QUIMgr.UI_WeaponLevelUpView:
                        this.dicUI[uiName] = new QWeaponLevelUpView();
                        break;
                    case QUIMgr.UI_WeaponUnlockNoticeView:
                        this.dicUI[uiName] = new QWeaponUnlockNoticeView();
                        break;
                    case QUIMgr.UI_WeaponLockedNoticeView:
                        this.dicUI[uiName] = new QWeaponLockedNoticeView();
                        break;
                    case QUIMgr.UI_DailyDiamondView:
                        this.dicUI[uiName] = new QDailyDiamond()
                        break;    
                }
                this.dicUI[uiName].start();
            }
            if(this.isShow3DInStack(uiName) == true) {
                QSceneMgr.instance.setActive(false);
            }
            try
            {
                this.dicUI[uiName].setParam(param);
            }
            catch(e)
            {
                QDebug.log(e);
            }
            

            if (!QUtil.isNullOrEmpty(this.dicUI[uiName]))
            {
                this.dicUI[uiName].setActive(true);
            }
            return this.dicUI[uiName];
        }
        //获取指定弹窗显隐
        public getDialogActive(uiName:number)
        {
            if (QUtil.isNullOrEmpty(this.dicUI[uiName])){
                return false
            }else{
                return  this.dicUI[uiName].getActive()
            }
        }
        //设置指定弹窗显隐
        public setDialogActive(uiName:number,active:boolean)
        {
            if (!QUtil.isNullOrEmpty(this.dicUI[uiName])){
                this.dicUI[uiName].setActive(active);
            }
        }
        /**
         * 删除UI (隐藏 or 销毁)
         * @param uiName 
         * @param isDestroy 
         */
        public removeUI(uiName: number, isDestroy: boolean = true): void
        {
            if (!QUtil.isNullOrEmpty(this.dicUI[uiName]))
            {
                if(this.isShow3DInStack(uiName) == true) {
                    QSceneMgr.instance.setActive(true);
                }
                if (isDestroy)
                {
                    this.dicUI[uiName].destroy();
                    this.dicUI[uiName] = null;
                }
                else
                {
                    this.dicUI[uiName].setActive(false);
                }
                if (uiName != QUIMgr.UI_Tip && this.waitUI.length) {
                    this.popWaitUI();
                }
                // 判断banner
                if(this.isShowBannerUI(uiName) && !this.containsShowBannerUIInStack())
				{
					QWxSDK.instance.hideBannerAd();
                }
                if (!this.containsShowExChangeUI())
				{
                    QJcdlTypeView.instance.openShow();   
                }
                
            }
        }
        /**
         * 删除 所有UI
         * @param exceptUIName 
         */
        public removeAllUI(exceptUIName : string = null): void
        {
            let key: any;
            for (key in this.dicUI)
            {
                if(key != exceptUIName)
                {
                    QUIMgr.instance.removeUI(key);
                }
            }
        }
        /**
         * UI 控件显示特效
         * @param box 
         * @param handler 
         */
        public doUIPopAnim(box : any, handler:Laya.Handler = null)
		{
			box.scale(0, 0);
			Laya.Tween.to(box, {scaleX : 1, scaleY : 1}, 300, Laya.Ease.backOut, handler);
        }
        /**
         * 判断当前界面是否显示banner
         * @param uiName 
         */
        public isShowBannerUI(uiName) : boolean
		{
			switch(uiName)
			{
                case QUIMgr.UI_WeaponUnlockNoticeView:
                case QUIMgr.UI_AddRevenueDialog:
                case QUIMgr.UI_OnlineGift:
                case QUIMgr.UI_SignInDialog:
                case QUIMgr.UI_Setting:
                case QUIMgr.UI_ShopDialog:
                case QUIMgr.UI_GainCar:
                case QUIMgr.UI_FreeGoldGet:
                case QUIMgr.UI_CongratulationGet:
                case QUIMgr.UI_DailyDiamondView:
                    return true;
				default:
					break;
			}
			return false;
        }

          /**
         * 判断当前界面是否显示
         * @param uiName 
         */
        public isShowExChangeUI(uiName) : boolean
		{
			switch(uiName)
			{
                case QUIMgr.UI_Main:
                // case QUIMgr.UI_AddRevenueDialog:
                // case QUIMgr.UI_LuckyGuy:
                // case QUIMgr.UI_SignInDialog:
                // case QUIMgr.UI_Setting:
                // // case QUIMgr.UI_GameEndingView:
                // case QUIMgr.UI_GainCar:
                // case QUIMgr.UI_FreeGoldGet:
                // case QUIMgr.UI_CongratulationGet:
                // case QUIMgr.UI_WeaponLevelUpView:
                // case QUIMgr.UI_WeaponUnlockNoticeView:
                // case QUIMgr.UI_WeaponLockedNoticeView:

                    return true;
				default:
					break;
			}
			return false;
        };

        public containsShowExChangeUI() : boolean
		{
			let uiName;
			for(uiName in this.dicUI)
			{
                if (this.dicUI[uiName]) {
                    if (uiName != QUIMgr.UI_Main && uiName != QUIMgr.UI_DrawerDialog){
                        return true
                    }
                }
			}
			return false;
        }
        
        /**
         * 判断bannner是否已经显示
         */
		public containsShowBannerUIInStack() : boolean
		{
			let uiName;
			for(uiName in this.dicUI)
			{
				switch(uiName)
				{

                    case QUIMgr.UI_ShopDialog:
                    case QUIMgr.UI_AddRevenueDialog:
                    case QUIMgr.UI_LuckyGuy:
                    case QUIMgr.UI_SignInDialog:
                    case QUIMgr.UI_Setting:
                    // case QUIMgr.UI_GameEndingView:
                    case QUIMgr.UI_GainCar:
                    case QUIMgr.UI_FreeGoldGet:
                    case QUIMgr.UI_CongratulationGet:
                    case QUIMgr.UI_WeaponUnlockNoticeView:
                    case QUIMgr.UI_DailyDiamondView:

                        return true;
					default:
						break;
				}
			}

			return false;
        }
        /**
         * 按钮 点击动画
         * @param btn 
         * @param caller 
         * @param listener 
         * @param args 
         */
        public RegisterBtnClickWithAnim (btn, caller, listener, args) 
        {
            //如果没有设置中心点，则先把控件的中心点设置为中间
            if (isNaN(btn.anchorX)) {
                btn.anchorX = 0.5;
                btn.x += btn.width * btn.scaleX * 0.5;
            }
            if (isNaN(btn.anchorY)) {
                btn.anchorY = 0.5;
                btn.y += btn.height * btn.scaleY * 0.5;
            }
            var oldSX = btn.scaleX;
            var oldSY = btn.scaleY;
            var factor = 0.95;
            var end = false;
            //缩小
            btn.on(Laya.Event.MOUSE_DOWN, this, function () {
                Laya.Tween.to(btn, { scaleX: oldSX * factor, scaleY: oldSY * factor }, 50, Laya.Ease.expoInOut);
                end = false;
            });
            //放大
            //增加一个移出回调，防止鼠标在按下状态移出，然后在外面抬起，导致放大动画无法触发
            btn.on(Laya.Event.MOUSE_OUT, this, function () {
                if (!end) {
                    Laya.Tween.to(btn, { scaleX: oldSX, scaleY: oldSY }, 200, Laya.Ease.expoInOut);
                    end = true;
                }
            });
            btn.on(Laya.Event.MOUSE_UP, this, function (caller, args) {
                if (!end) {
                    Laya.Tween.to(btn, { scaleX: oldSX, scaleY: oldSY }, 200, Laya.Ease.expoInOut);
                    // 播放 音效
                    end = true;
                }
            }, [caller, args]);

            //按下回调
            return btn.on(Laya.Event.CLICK, this, function (caller, args) {
                    listener.apply(caller, args);
                    // 播放 音效
            }, [caller, args]);
        };
        /**
         * 弹窗动作
         * @param box 
         */
        public static DoUIAnim_DialogPop(box: any)
		{
			//如果没有设置中心点则，先把控件的中心点设置为中间
			if(isNaN(box.anchorX))
			{
				box.anchorX = 0.5;
				box.x += box.width * box.scaleX * 0.5;
			}
			if(isNaN(box.anchorY))
			{
				box.anchorY = 0.5;
				box.y += box.height * box.scaleY * 0.5;
            }
            box.visible = true;
			let oldSX = box.scaleX;
			let oldSY = box.scaleY;
			box.scale(oldSX * 0.8, oldSY * 0.8);
			Laya.Tween.to(box, { scaleX: oldSX, scaleY: oldSY }, 200, Laya.Ease.expoInOut);
        }
        /**
         * 关闭 弹窗
         * @param box 
         */
        public static DoUIAnim_DialogClose(box: any)
		{
            box.visible = false;
        }
        

        /**
         * 合成界面
         * 隐藏3D模型
         */
        public isShow3DInStack(uiName) : boolean
		{
            switch(uiName)
            {
                case QUIMgr.UI_ShopDialog:
                case QUIMgr.UI_AddRevenueDialog:
                case QUIMgr.UI_LuckyGuy:
                case QUIMgr.UI_SignInDialog:
                case QUIMgr.UI_Setting:
                case QUIMgr.UI_WeaponLevelUpView:
                case QUIMgr.UI_DailyDiamondView:
                case QUIMgr.UI_OnlineGift:
                case QUIMgr.UI_SelectView:
                    return true;
                default:
                    break;
            }
			return false;
        }
    }
}

export default game.core.QUIMgr;
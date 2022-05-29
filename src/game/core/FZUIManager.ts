import FZUtils from "../../framework/FZUtils";
import FZDebug from "../../framework/FZDebug";
import FZLoadingUI from "../view/FZLoadingUI";
import FZMainUI from "../view/FZMainUI";
import FZGetCarDialog from "../view/FZGetCarDialog";
import FZLevelUpUI from "../view/FZLevelUpUI";
import FZCommonTipsUI from "../view/FZCommonTipsUI";
import FZRevenueDialog from "../view/FZRevenueDialog";
import FZOfflineDialog from "../view/FZOfflineDialog";
import FZStoreUI from "../view/FZStoreUI";
import FZGameUI from "../view/FZGameUI";
import FZSettingUI from "../view/FZSettingUI";
import FZLevelUp from "../view/FZLevelUp";
import FZFreeGold from "../view/FZFreeGold"
import FZDrawerDialog from "../view/FZDrawerDialog"
import FZSelectUI from "../view/FZSelectUI"
import FZSiginInUI from "../view/FZSiginInUI"
import FZLuckyRotaryUI from "../view/FZLuckyRotaryUI"
import QCongratulationGety from "../view/FZGongXingHuoDeUI";
import FZSupplyTipUI from "../view/FZSupplyTipUI";
import FZCheckPointDialog from "../view/FZCheckPointDialog";
import FZGameResurrectUI from "../view/FZGameResurrectUI";
import FZGameOverUI from "../view/FZGameOverUI";
import FZGameJiaZaiUI from "../view/FZGameJiaZaiUI";
import FZGameGuide from "../view/FZGameGuide";
import FZWeaponLevelUpUI from "../view/FZWeaponLevelUpUI";
import FZWeaponNoticeUI from "../view/FZWeaponNoticeUI";
import FZWeaponNotNoticeUI from "../view/FZWeaponNotNoticeUI";
import FZGameStatus from "../data/FZGameStatus";
import FZDailyDiamond from "../view/PopupWindow/FZDailyDiamond";
import FZOnlineGiftUI from "../view/FZOnlineGiftUI";
import FZWechat from "../core/FZWechat";
import FZBaseUI from "../core/FZBaseUI";
import FZCfgManager from "../core/FZCfgManager";
/**
 * UI管理器
 */
namespace game.core
{
    export class FZUIManager
    {
        private constructor() { }

        private static _instance: FZUIManager;
        public static get instance(): FZUIManager
        {
            if (this._instance == null)
            {
                this._instance = new FZUIManager();
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
        public static UI_FZGameJiaZaiUI: number = 26; // 游戏过场
        public static UI_WeaponLevelUpView: number = 27; // 武器升级 
        public static UI_GameGuideView: number = 28;
        public static UI_WeaponUnlockNoticeView: number = 29;
        public static UI_WeaponLockedNoticeView: number = 30;
        public static UI_DailyDiamondView: number = 31; // 每日奖励
        public static UI_OnlineGift: number = 32;  //在线宝箱
        
        private dicUI: { [key: number]: FZBaseUI } = {};
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
        public createUI(uiName: number, param: any = null): FZBaseUI
        {
            // 判断当前界面是否显示banner
            if(this.isShowBannerUI(uiName))
			{
                if(!this.containsShowBannerUIInStack())
                {
                    Laya.timer.frameOnce(2, this, function(){
                        // 显示banner
                        if (uiName == FZUIManager.UI_FreeGoldGet) {
                            if (FZGameStatus.QCurrencyType.dollar == param) {
                                FZWechat.instance.showBannerAd();
                            }else {
                                // 屏蔽城市
                                let userArea = FZ.UserInfo.userArea || "";
                                let shareinfo = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.ShareCfg];
                                FZDebug.D("手机城市1----------------------" + userArea);
                                FZDebug.D("手机城市2----------------------" + JSON.stringify(shareinfo.bannerLimitCity));
                                let shield = shareinfo.bannerLimitCity.indexOf(userArea) >= 0 && shareinfo.shieldCityOpen;
                                let isAuditVersion = FZWechat.instance.isAuditVersion();
                                if (isAuditVersion == false && shield == false) {
                                    FZWechat.instance.showBannerAd();
                                }
                            }
                        }else {
                            FZWechat.instance.showBannerAd();
                        }
                    })
                }
            }
            else
            {
                if (uiName != FZUIManager.UI_Tip) {
                    // 隐藏banner
                    FZWechat.instance.hideBannerAd();
                }
            }
            if (this.dicUI[uiName] == null)
            {
                switch (uiName)
                {
                    case FZUIManager.UI_Main:
                        this.dicUI[uiName] = new FZMainUI();
                        break;
                    case FZUIManager.UI_Loading:
                        this.dicUI[uiName] = new FZLoadingUI();
                        break;
                    case FZUIManager.UI_GainCar:
                        this.dicUI[uiName] = new FZGetCarDialog();
                        break;
                    case FZUIManager.UI_LevelUp:
                        if (this.dicUI[FZUIManager.UI_GainCar]) {
                            this.addWaitUI(FZUIManager.UI_LevelUp);
                            return;
                        } else {
                            this.dicUI[uiName] = new FZLevelUpUI();
                        }
                        break;   
                    case FZUIManager.UI_Tip:  
                        this.dicUI[uiName] = new FZCommonTipsUI();
                        break;              
                    case FZUIManager.UI_AddRevenueDialog:
                        this.dicUI[uiName] = new FZRevenueDialog();
                        break; 
                    case FZUIManager.UI_BeOffline:
                        this.dicUI[uiName] = new FZOfflineDialog();
                        break; 
                    case FZUIManager.UI_ShopDialog: 
                        this.dicUI[uiName] = new FZStoreUI();
                        break; 
                    case FZUIManager.UI_GameView: 
                        this.dicUI[uiName] = new FZGameUI ();
                        break;  
                    case FZUIManager.UI_Setting: 
                        this.dicUI[uiName] = new FZSettingUI ();
                        break;    
                    case FZUIManager.UI_FreeLeveUp: 
                        this.dicUI[uiName] = new FZLevelUp ();
                        break;     
                    case FZUIManager.UI_FreeGoldGet: 
                        this.dicUI[uiName] = new FZFreeGold ();
                        break;     
                    case FZUIManager.UI_DrawerDialog: 
                        this.dicUI[uiName] = new FZDrawerDialog ();
                        break;
                    case FZUIManager.UI_SelectView:
                        this.dicUI[uiName] = new FZSelectUI ();
                        break;
                    case FZUIManager.UI_SignInDialog:
                        this.dicUI[uiName] = new FZSiginInUI ();
                        break;
                    case FZUIManager.UI_LuckyGuy:
                        this.dicUI[uiName] = new FZLuckyRotaryUI ();
                        break;
                    case FZUIManager.UI_CongratulationGet:
                        this.dicUI[uiName] = new QCongratulationGety ();
                        break;
                    case FZUIManager.UI_Supply_Tips:
                        this.dicUI[uiName] = new FZSupplyTipUI ();
                        break;
                    case FZUIManager.UI_CheckPointChoose:
                        this.dicUI[uiName] = new FZCheckPointDialog ();
                        break;
                    case FZUIManager.UI_GameResurrectView:
                        this.dicUI[uiName] = new FZGameResurrectUI ();
                        break;
                    case FZUIManager.UI_GameEndingView:
                        this.dicUI[uiName] = new FZGameOverUI ();
                        break;
                    case FZUIManager.UI_OnlineGift:
                        this.dicUI[uiName] = new FZOnlineGiftUI ();
                        break;
                    // case FZUIManager.UI_DollarExchangeView:
                    //     this.dicUI[uiName] = new QDollarExchangeView ();
                    //     break;
                    case FZUIManager.UI_FZGameJiaZaiUI:
                        this.dicUI[uiName] = new FZGameJiaZaiUI();
                        break;
                    case FZUIManager.UI_GameGuideView:
                        this.dicUI[uiName] = new FZGameGuide();
                        break;
                    case FZUIManager.UI_WeaponLevelUpView:
                        this.dicUI[uiName] = new FZWeaponLevelUpUI();
                        break;
                    case FZUIManager.UI_WeaponUnlockNoticeView:
                        this.dicUI[uiName] = new FZWeaponNotNoticeUI();
                        break;
                    case FZUIManager.UI_WeaponLockedNoticeView:
                        this.dicUI[uiName] = new FZWeaponNoticeUI();
                        break;
                    case FZUIManager.UI_DailyDiamondView:
                        this.dicUI[uiName] = new FZDailyDiamond()
                        break;    
                }
                this.dicUI[uiName].start();
            }
            // if(this.isShow3DInStack(uiName) == true) {
            //     FZSceneManager.instance.setActive(false);
            // }
            try
            {
                this.dicUI[uiName].setParam(param);
            }
            catch(e)
            {
                FZDebug.log(e);
            }
            

            if (!FZUtils.isNullOrEmpty(this.dicUI[uiName]))
            {
                this.dicUI[uiName].setActive(true);
            }
            return this.dicUI[uiName];
        }
        //获取指定弹窗显隐
        public getDialogActive(uiName:number)
        {
            if (FZUtils.isNullOrEmpty(this.dicUI[uiName])){
                return false
            }else{
                return  this.dicUI[uiName].getActive()
            }
        }
        //设置指定弹窗显隐
        public setDialogActive(uiName:number,active:boolean)
        {
            if (!FZUtils.isNullOrEmpty(this.dicUI[uiName])){
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
            if (!FZUtils.isNullOrEmpty(this.dicUI[uiName]))
            {
                // if(this.isShow3DInStack(uiName) == true) {
                //     FZSceneManager.instance.setActive(true);
                // }
                if (isDestroy)
                {
                    this.dicUI[uiName].destroy();
                    this.dicUI[uiName] = null;
                }
                else
                {
                    this.dicUI[uiName].setActive(false);
                }
                if (uiName != FZUIManager.UI_Tip && this.waitUI.length) {
                    this.popWaitUI();
                }
                // 判断banner
                if(this.isShowBannerUI(uiName) && !this.containsShowBannerUIInStack())
				{
					FZWechat.instance.hideBannerAd();
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
                    FZUIManager.instance.removeUI(key);
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
                case FZUIManager.UI_WeaponUnlockNoticeView:
                case FZUIManager.UI_AddRevenueDialog:
                case FZUIManager.UI_OnlineGift:
                case FZUIManager.UI_SignInDialog:
                case FZUIManager.UI_Setting:
                case FZUIManager.UI_ShopDialog:
                case FZUIManager.UI_GainCar:
                case FZUIManager.UI_FreeGoldGet:
                case FZUIManager.UI_CongratulationGet:
                case FZUIManager.UI_DailyDiamondView:
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
                case FZUIManager.UI_Main:
                // case FZUIManager.UI_AddRevenueDialog:
                // case FZUIManager.UI_LuckyGuy:
                // case FZUIManager.UI_SignInDialog:
                // case FZUIManager.UI_Setting:
                // // case FZUIManager.UI_GameEndingView:
                // case FZUIManager.UI_GainCar:
                // case FZUIManager.UI_FreeGoldGet:
                // case FZUIManager.UI_CongratulationGet:
                // case FZUIManager.UI_WeaponLevelUpView:
                // case FZUIManager.UI_WeaponUnlockNoticeView:
                // case FZUIManager.UI_WeaponLockedNoticeView:

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
                    if (uiName != FZUIManager.UI_Main && uiName != FZUIManager.UI_DrawerDialog){
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

                    case FZUIManager.UI_ShopDialog:
                    case FZUIManager.UI_AddRevenueDialog:
                    case FZUIManager.UI_LuckyGuy:
                    case FZUIManager.UI_SignInDialog:
                    case FZUIManager.UI_Setting:
                    // case FZUIManager.UI_GameEndingView:
                    case FZUIManager.UI_GainCar:
                    case FZUIManager.UI_FreeGoldGet:
                    case FZUIManager.UI_CongratulationGet:
                    case FZUIManager.UI_WeaponUnlockNoticeView:
                    case FZUIManager.UI_DailyDiamondView:

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
                case FZUIManager.UI_ShopDialog:
                case FZUIManager.UI_AddRevenueDialog:
                case FZUIManager.UI_LuckyGuy:
                case FZUIManager.UI_SignInDialog:
                case FZUIManager.UI_Setting:
                case FZUIManager.UI_WeaponLevelUpView:
                case FZUIManager.UI_DailyDiamondView:
                case FZUIManager.UI_OnlineGift:
                case FZUIManager.UI_SelectView:
                    return true;
                default:
                    break;
            }
			return false;
        }
    }
}

export default game.core.FZUIManager;
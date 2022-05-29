import FZEventManager from "../../framework/FZEventManager";
import FZGameStatus from "../data/FZGameStatus";
import FZEvent from "../data/FZEvent";
import FZResManager from "./FZResManager";
import FZUIManager from "./FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZCfgManager from "./FZCfgManager";
import FZGameData from "../data/FZGameData";
import FZSoundManager from "./FZSoundManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZWechat from "../core/FZWechat";
import FZSceneManager from "./FZSceneManager";
import FZUtils from "../../framework/FZUtils";

/**
 * 游戏管理
 */
namespace game.core
{
    export class FZGameManager
    {
        private constructor() { }

        private static _instance: FZGameManager;
        public static get instance(): FZGameManager
        {
            if (this._instance == null)
            {
                this._instance = new FZGameManager();
                this._instance.registerEvent();
            }
            return this._instance;
        }
        /**
         * 加载监听
         */
        private registerEvent(): void
        {
            FZEventManager.instance.register(FZEvent.RES_LOAD_FINISHED, this.resLoadFinishedHandler, this);

            if (Laya.Browser.onMiniGame) {
                let wx = Laya.Browser.window.wx;
                wx && wx.onShow(this.onShow);
                wx && wx.onHide(this.onHide);
            }else {
                Laya.stage.on(Laya.Event.BLUR, this, this.onHide);
                Laya.stage.on(Laya.Event.FOCUS, this, this.onShow);
            }
            //监听前台事件
			FZ.NotificationCenter.listen(FZ.EventType.GAME_SHOW, () =>
			{
                FZEventManager.instance.sendEvent(FZEvent.FAKE_SHARE_RETURN);
			}, this);

			// //监听后台事件
			// FZ.NotificationCenter.listen(FZ.EventType.GAME_HIDE, () =>
			// {
            //     FZEventManager.instance.sendEvent(FZEvent.GAME_HIDE);
            //     // FZWechat.instance.gc();
			// }, this);
        }
        /**
         * 删除监听
         */
        private unregisterEvent(): void
        {
            FZEventManager.instance.unregister(FZEvent.RES_LOAD_FINISHED, this.resLoadFinishedHandler, this);
        }

        public onShow(){
            // console.log("Laya.Browser.window.wx onShow");
            FZEventManager.instance.sendEvent(FZEvent.WX_ON_SHOW);
        }

        public onHide(){
            // console.log("Laya.Browser.window.wx onHide");
            FZEventManager.instance.sendEvent(FZEvent.WX_ON_HIDE);
        }
        /**
         * 初始化
         */
        public init(): void
        {
            Laya.loader.on(Laya.Event.ERROR, this, this.loadOnError);
            Laya.loader.retryNum = FZGameStatus.LoadRetryNum;
            Laya.loader.retryDelay = FZGameStatus.LoadRetryDelay;
            FZResManager.instance.loadLoadingRes();
            FZ.BiLog.clickStat(FZ.clickStatEventType.startLoadingRes,[]);
            
            // if (FZGameData.instance.useLocalRes == false) {
            //     Laya.URL.basePath = FZGameStatus.DownloadUrl;
            // }
        }

        private loadedResType: number = 0;
        /**
         * 判断资源是否加载完成
         * @param resType 
         */
        private isResLoadFinished(resType)
        {
            return (this.loadedResType & resType) != 0;
        }
        /**
         * 进入游戏流程
         * @param resType 
         */
        private resLoadFinishedHandler(resType: number): void
        {
            if (resType == FZGameStatus.QResType.LoadingViewRes)
            {
                FZUIManager.instance.createUI(FZUIManager.UI_Loading);
                // FZWechat.instance.loadSubpackage(Laya.Handler.create(this, function(){
				// 	FZEventManager.instance.sendEvent(FZEvent.RES_LOAD_FINISHED, FZGameStatus.QResType.Subpackage);
                // }));
                FZEventManager.instance.sendEvent(FZEvent.RES_LOAD_FINISHED, FZGameStatus.QResType.Subpackage);  //分包加载
            }
            else if (resType == FZGameStatus.QResType.Subpackage)
            {
                // this.loadSubpackage();
                FZResManager.instance.loadRes();
            }
            else if (resType == FZGameStatus.QResType.UIRes) {
                FZEventManager.instance.sendEvent(FZEvent.GAME_ENTER_HALL, 3);
                FZ.BiLog.clickStat(FZ.clickStatEventType.onloadRes,[]);
                FZCfgManager.instance.loadAllCfg();
                FZSoundManager.instance.loadSound();
            }
            else if (resType == FZGameStatus.QResType.Config)
            {
                FZEventManager.instance.sendEvent(FZEvent.GAME_ENTER_HALL, 4);
                // FZSceneManager.instance.loadScene();
                // 初始化sdk
                FZWechat.instance.init();
            }
            this.loadedResType |= resType;
            FZDebug.log("=====resLoadFinishedHandler: " + resType + ", " + this.loadedResType);
            if (this.isResLoadFinished(FZGameStatus.QResType.Config)  //配置加载
                && this.isResLoadFinished(FZGameStatus.QResType.UIRes)  //UI资源加载
                && this.isResLoadFinished(FZGameStatus.QResType.Font)  //字体加载
                && this.isResLoadFinished(FZGameStatus.QResType.Sound))  //音效加载
                // && this.isResLoadFinished(FZGameStatus.QResType.GarageScene))  //车底盘场景加载
            {
                FZDebug.log("=====加载完成: ");
                FZEventManager.instance.sendEvent(FZEvent.GAME_ENTER_HALL, 5);
                FZGameData.instance.loadResFinished = true;
                //FZSoundManager.instance.playSfx(FZSoundManager.Click);
            }
        }
        /**
         *分包加载
         */
        private loadSubpackage(){
            if (Laya.Browser.onMiniGame){
                var loadTask = Laya.Browser.window.wx.loadSubpackage({
                    name: 'subpackages', // name 可以填 name 或者 root
                    success: function(res) {
                        // 分包加载成功后通过 success 回调
                        FZResManager.instance.loadRes();
                    },
                    fail: function(res) {
                        Laya.timer.once(500, this, function(){
                            FZGameManager.instance.loadSubpackage();
                        })
                    }
                })
                loadTask.onProgressUpdate(res => {
                    FZDebug.D("分包下载进度百分比 = " + res.progress);
                    FZDebug.D("已经下载的数据长度，单位 = " + res.totalBytesWritten);
                    FZDebug.D("预期需要下载的数据总长度，单位 = " + res.totalBytesExpectedToWrite);
                })
            }else {
                FZResManager.instance.loadRes();
            }
        }

        /**
         * 加载失败
         * @param err 
         */
		private loadOnError(err : string) : void 
		{
            FZDebug.log("加载失败：" + err);
        }
        
    }
}

export default game.core.FZGameManager;
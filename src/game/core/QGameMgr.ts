import QEventMgr from "../../framework/QEventMgr";
import QGameConst from "../data/QGameConst";
import QEventType from "../data/QEventType";
import QResMgr from "./QResMgr";
import QUIMgr from "./QUIMgr";
import QDebug from "../../framework/QDebug";
import QCfgMgr from "./QCfgMgr";
import QGameData from "../data/QGameData";
import QSoundMgr from "./QSoundMgr";
import QSavedDateItem from "../data/QSavedDateItem";
import QMergeData from "../data/QMergeData";
import QWxSDK from "../core/QWxSDK";
import QSceneMgr from "./QSceneMgr";
import QUtil from "../../framework/QUtil";

/**
 * 游戏管理
 */
namespace game.core
{
    export class QGameMgr
    {
        private constructor() { }

        private static _instance: QGameMgr;
        public static get instance(): QGameMgr
        {
            if (this._instance == null)
            {
                this._instance = new QGameMgr();
                this._instance.registerEvent();
            }
            return this._instance;
        }
        /**
         * 加载监听
         */
        private registerEvent(): void
        {
            QEventMgr.instance.register(QEventType.RES_LOAD_FINISHED, this.resLoadFinishedHandler, this);

            if (Laya.Browser.onMiniGame) {
                let wx = Laya.Browser.window.wx;
                wx && wx.onShow(this.onShow);
                wx && wx.onHide(this.onHide);
            }else {
                Laya.stage.on(Laya.Event.BLUR, this, this.onHide);
                Laya.stage.on(Laya.Event.FOCUS, this, this.onShow);
            }
            //监听前台事件
			tywx.NotificationCenter.listen(tywx.EventType.GAME_SHOW, () =>
			{
                QEventMgr.instance.sendEvent(QEventType.FAKE_SHARE_RETURN);
			}, this);

			// //监听后台事件
			// tywx.NotificationCenter.listen(tywx.EventType.GAME_HIDE, () =>
			// {
            //     QEventMgr.instance.sendEvent(QEventType.GAME_HIDE);
            //     // QWxSDK.instance.gc();
			// }, this);
        }
        /**
         * 删除监听
         */
        private unregisterEvent(): void
        {
            QEventMgr.instance.unregister(QEventType.RES_LOAD_FINISHED, this.resLoadFinishedHandler, this);
        }

        public onShow(){
            // console.log("Laya.Browser.window.wx onShow");
            QEventMgr.instance.sendEvent(QEventType.WX_ON_SHOW);
        }

        public onHide(){
            // console.log("Laya.Browser.window.wx onHide");
            QEventMgr.instance.sendEvent(QEventType.WX_ON_HIDE);
        }
        /**
         * 初始化
         */
        public init(): void
        {
            Laya.loader.on(Laya.Event.ERROR, this, this.loadOnError);
            Laya.loader.retryNum = QGameConst.LoadRetryNum;
            Laya.loader.retryDelay = QGameConst.LoadRetryDelay;
            QResMgr.instance.loadLoadingRes();
            tywx.BiLog.clickStat(tywx.clickStatEventType.startLoadingRes,[]);
            
            // if (QGameData.instance.useLocalRes == false) {
            //     Laya.URL.basePath = QGameConst.DownloadUrl;
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
            if (resType == QGameConst.QResType.LoadingViewRes)
            {
                QUIMgr.instance.createUI(QUIMgr.UI_Loading);
                // QWxSDK.instance.loadSubpackage(Laya.Handler.create(this, function(){
				// 	QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Subpackage);
                // }));
                QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Subpackage);  //分包加载
            }
            else if (resType == QGameConst.QResType.Subpackage)
            {
                // this.loadSubpackage();
                QResMgr.instance.loadRes();
            }
            else if (resType == QGameConst.QResType.UIRes) {
                QEventMgr.instance.sendEvent(QEventType.GAME_ENTER_HALL, 3);
                tywx.BiLog.clickStat(tywx.clickStatEventType.onloadRes,[]);
                QCfgMgr.instance.loadAllCfg();
                QSoundMgr.instance.loadSound();
            }
            else if (resType == QGameConst.QResType.Config)
            {
                QEventMgr.instance.sendEvent(QEventType.GAME_ENTER_HALL, 4);
                QSceneMgr.instance.loadScene();
                // 初始化sdk
                QWxSDK.instance.init();
            }
            this.loadedResType |= resType;
            QDebug.log("=====resLoadFinishedHandler: " + resType + ", " + this.loadedResType);
            if (this.isResLoadFinished(QGameConst.QResType.Config)  //配置加载
                && this.isResLoadFinished(QGameConst.QResType.UIRes)  //UI资源加载
                && this.isResLoadFinished(QGameConst.QResType.Font)  //字体加载
                && this.isResLoadFinished(QGameConst.QResType.Sound)  //音效加载
                && this.isResLoadFinished(QGameConst.QResType.GarageScene))  //车底盘场景加载
            {
                QDebug.log("=====加载完成: ");
                QEventMgr.instance.sendEvent(QEventType.GAME_ENTER_HALL, 5);
                QGameData.instance.loadResFinished = true;
                //QSoundMgr.instance.playSfx(QSoundMgr.Click);
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
                        QResMgr.instance.loadRes();
                    },
                    fail: function(res) {
                        Laya.timer.once(500, this, function(){
                            QGameMgr.instance.loadSubpackage();
                        })
                    }
                })
                loadTask.onProgressUpdate(res => {
                    QDebug.D("分包下载进度百分比 = " + res.progress);
                    QDebug.D("已经下载的数据长度，单位 = " + res.totalBytesWritten);
                    QDebug.D("预期需要下载的数据总长度，单位 = " + res.totalBytesExpectedToWrite);
                })
            }else {
                QResMgr.instance.loadRes();
            }
        }

        /**
         * 加载失败
         * @param err 
         */
		private loadOnError(err : string) : void 
		{
            QDebug.log("加载失败：" + err);
        }
        
    }
}

export default game.core.QGameMgr;
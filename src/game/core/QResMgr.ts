import Handler = Laya.Handler;
import QEventMgr from "../../framework/QEventMgr";
import QGameConst from "../data/QGameConst";
// import QSceneMgr from "./QSceneMgr";
import QEventType from "../data/QEventType";
import QDebug from "../../framework/QDebug";
import QHttp from "../../framework/QHttp";
import QUIMgr from "./QUIMgr";
import QGameMgr from "./QGameMgr";
import QGameData from "../data/QGameData";
import QSavedDateItem from "../data/QSavedDateItem";
import QUtil from "../../framework/QUtil";
import QCfgMgr from "./QCfgMgr";
import QAdManager from "./QAdManager";
// import QWxSDK from "./QWxSDK";

namespace game.core
{
    export class QResMgr
    {
        private constructor() {}
        private static _instance : QResMgr;
        public static get instance() : QResMgr
        {
            if(this._instance == null)
            {
                this._instance = new QResMgr();
                this._instance.registerEvent();
            }
            return this._instance;
        }
        public LOAD_MAP_RES = [];
        public RES_MAIN :number = 0;
        public RES_GAME :number = 0;
        private registerEvent() : void
        {
            
        }

        private unregisterEvent() : void
        {
        }


        public ATLAS_LOADING : string = "res/atlas/ui_loading.atlas";
        /**
         * 加载Loading 资源
         */
        public loadLoadingRes():void
        {
            Laya.loader.load([
                //资源路径
                this.ATLAS_LOADING,
            ],Laya.Handler.create(this,this.completeHandler,[QGameConst.QResType.LoadingViewRes]));
        }
        
        /**
         * 加载图片资源
         */
		public loadRes() : void
		{
            QEventMgr.instance.sendEvent(QEventType.GAME_ENTER_HALL,1);
            // 本地版本
            var version = QSavedDateItem.instance.getItemFromLocalStorage("GAME_DOWNLOAD_VERSION", "1.0.0");
            //微信小游戏
            if (Laya.Browser.onMiniGame) {
                // 判断版本
                if(tywx.SystemInfo.version != version) {
                    // 开启下载zip
                    if (QDebug.isDebug == true) {
                        this.downLoadZip(QGameConst.DownloadUrl + "test.zip");
                    }else {
                        this.downLoadZip(QGameConst.DownloadUrl + tywx.SystemInfo.version + ".zip"); 
                    }
                }else {
                    this.downLoadEnd();
                }
            } else {
               this.downLoadEnd();
            }
        }
        public downloadTask:any = undefined;
        public downLoadZip(url)
        {
            tywx.BiLog.clickStat(tywx.clickStatEventType.downZipStart,[]);
            tywx.SystemInfo.isDownZip = true;
            var that = this;
            var data = new Date().getTime();
            QUtil.downloadFile(url,function(){
                QDebug.D("下载-解压完成后，修改本地版本号");
                //下载-解压完成后，修改本地版本号
                QSavedDateItem.instance.setItemToLocalStorage("GAME_DOWNLOAD_VERSION", tywx.SystemInfo.version);
                that.downLoadEnd();
            },function(){
                QEventMgr.instance.sendEvent(QEventType.GAME_DOWN_RESET);
                if (QDebug.isDebug == true) {
                    that.downLoadZip(QGameConst.DownloadUrl + "test.zip?" +  data);
                }else {
                    that.downLoadZip(QGameConst.DownloadUrl + tywx.SystemInfo.version + ".zip?" +  data); 
                }
            })
        }

        public downLoadEnd() {
            QEventMgr.instance.sendEvent(QEventType.GAME_ENTER_HALL,2);
            this.loadFontRes();
            // QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, [QGameConst.QResType.Font]);
            this.loadOnlineRes();
        }


        private startIndex:number = 2;
        private loadFontCount:number = 2;
        private hasLoadedFontCount : number = 0;
        /**
         * 加载 fnt 资源
         */
        public loadFontRes():void 
        {
            let prefix = "" ; //判断是否分包 QWxSDK.instance.getSubpackagePath();
            if (Laya.Browser.onMiniGame) {
                prefix = Laya.Browser.window.wx.env.USER_DATA_PATH+"/v" + tywx.SystemInfo.version + "/";
            }
            for (let i = this.startIndex; i < this.startIndex+this.loadFontCount; i++)
            {
                let bitmapFont: Laya.BitmapFont = new Laya.BitmapFont();
                bitmapFont.loadFont(prefix + "res/font/font1_"+i+".fnt", Laya.Handler.create(this, function(index){
                    Laya.Text.registerBitmapFont("font1_"+i,bitmapFont);
                    QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, [QGameConst.QResType.Font]);
                },[3]));
            }
            QDebug.D("加载FontRes----------------------1");
        }
        /**
         * 加载除Loading之外资源
         * 判断是否分包
         */
        private loadOnlineRes() : void
		{
            QDebug.D("资源加载-------------------------------------------");
            let prefix = "";//QWxSDK.instance.getSubpackagePath();
            var path  = "";
            if (Laya.Browser.onMiniGame) {
                prefix = Laya.Browser.window.wx.env.USER_DATA_PATH+"/v" + tywx.SystemInfo.version + "/"; ////tywx.wxFileUtil.getCacheFilePath() + "/";
                path = "subpackages/";
            }
            let listRes = [
                prefix + "res/atlas/ui_main.atlas",
                prefix + "res/atlas/ui_car_main.atlas",
                prefix + "res/atlas/ui_aircraft.atlas",
                prefix + "res/atlas/ui_common.atlas",
                prefix + "res/atlas/ui_game.atlas",
                prefix + "res/atlas/ui_car.atlas",
                prefix + "res/atlas/ui_bullet.atlas",
                prefix + "res/atlas/ui_ani.atlas",
                prefix + "res/atlas/ui_weapons.atlas",
                // -----------------------------------游戏资源--
                prefix + "res/atlas/ui_boss.atlas",
                prefix + "res/atlas/ui_effect.atlas",
                "res/Texture/game_loading_1.png",
                "res/Texture/game_stop.png",
                "res/Texture/guide_tip.png",
                "res/Texture/main_bg.jpg",
                "res/Texture/new_rotary_go.png",
                "res/Texture/new_rotary_table_0.png",
                "res/Texture/ui_icon_gold_sb.png",
                "res/Texture/weapon_car_pos.png",
                "res/Texture/dia_bg2.png"
            ]
            QDebug.D("资源加载----------------------------------------prefix---" + prefix);
            this.RES_MAIN = 1;
            var self = this;
            if(Laya.Browser.onMiniGame){
                let fsm = Laya.Browser.window.wx.getFileSystemManager();
                fsm.access({path: listRes[0], success: function(){
                    Laya.loader.load(listRes, Laya.Handler.create(self, self.completeHandler, [QGameConst.QResType.UIRes]),null);
                }, fail:function(){
                    // 当前文件不存在
                    if (QDebug.isDebug == true) {
                        this.downLoadZip(QGameConst.DownloadUrl + "test.zip");
                    }else {
                        self.downLoadZip(QGameConst.DownloadUrl + tywx.SystemInfo.version + ".zip"); 
                    }
                }});
            }else {
                Laya.loader.load(listRes, Laya.Handler.create(self, self.completeHandler, [QGameConst.QResType.UIRes]),null);
                // Laya.Loader.ATLAS
            }
        }
        /**
         * 资源加载完成后 发送加载完成事件
         * @param resType 
         */
        private completeHandler(resType : number) : void
		{
            QDebug.D("资源加载完成后-------------------------------------------");
            QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, resType);
        }
        
    }
}

export default game.core.QResMgr;
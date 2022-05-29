import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZSoundManager from "../core/FZSoundManager";
import FZResManager from "../core/FZResManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZSceneManager from "../core/FZSceneManager";
import FZGameData from "../data/FZGameData";
import FZWechat from "../core/FZWechat";

namespace game.view
{
    export class FZGameJiaZaiUI extends FZBaseUI
    {
        public scene: ui.view.GameLoadingUI ;
        public RES_MAIN:string = "main"; 
        public RES_GAME:string = "game"; 
        public RES_GROUP:string = "";
        public listResMain:any = null;
        public prefix:any = null;
        public path:any = null;
        public init():void
        {
            this.scene = new ui.view.GameLoadingUI();
            this.scene.zOrder = 10000;
            this.prefix = "";//FZWechat.instance.getSubpackagePath();
            this.path = "";
            if (Laya.Browser.onMiniGame) {
                this.prefix = Laya.Browser.window.wx.env.USER_DATA_PATH+"/v" + FZ.SystemInfo.version + "/"; ////FZ.wxFileUtil.getCacheFilePath() + "/";
                this.path = "subpackages/"
            }
            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_MOVE, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_OUT, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_UP, this, this.onMouseDown);
        }
        public onMouseDown() {

        }
        public gameValue:any = null;
        public setParam(value){
            // 根据进入不同的场景 , 决定是否显示 "载入中.."
            if( value == "main" ){  
                this.scene.loadingText.visible = false;
            } else if( value == "game" ){
                this.scene.loadingText.visible = true;
            }
            this.gameValue = value;
            this.onGameStart();
        }

        public initRes(){
            var map_index = FZGameData.instance.getCheckPointData().map;
            this.RES_GROUP = this.gameValue;
            this.listResMain =[
                // this.prefix + "res/atlas/ui_bullet.atlas",
                // this.prefix + "res/atlas/ui_car.atlas",
                this.prefix + "res/atlas/ui_boss.atlas",
                this.prefix + "res/atlas/ui_effect.atlas",
                // this.prefix + "res/atlas/ui_game.atlas",
            ]
            if (this.gameValue == this.RES_GAME) {   
                this.loadmap(map_index);   
            }else {
                this.onEnterHall();
            }
        }
        /**
         * 
         * @param index 加载地图
         */
        public loadmap(index:any) {
            if (FZResManager.instance.LOAD_MAP_RES.indexOf("ui_map/P_Road_0"+index+"_1.jpg") == -1) {
                for (var i = FZResManager.instance.LOAD_MAP_RES.length -1; i >=0; i-- ){
                    Laya.loader.clearRes(FZResManager.instance.LOAD_MAP_RES[i]);
                    Laya.loader.clearRes("ui_map/P_Road_0"+ i +"_2.jpg");
                }
                FZResManager.instance.LOAD_MAP_RES.push("ui_map/P_Road_0"+index+"_1.jpg");

                let mapIndex = (index == 6 || index == 7) ? 1 : 2;
                // 未加载过
                Laya.loader.load([
                    //资源路径
                        "ui_map/P_Road_0"+index+"_1.jpg",
                        "ui_map/P_Road_0"+index+"_"+mapIndex+".jpg",
                    ],Laya.Handler.create(this,this.completemapHandler));
            }else {
                this.completemapHandler();
            }
        }
        public completemapHandler()
        {
            this.onEnterGame();
        }
        
        public onEnterHall():void
        {
            FZUIManager.instance.removeUI(FZUIManager.UI_GameView);
            FZUIManager.instance.removeUI(FZUIManager.UI_GameEndingView);
            this.completeHandler(this.RES_GROUP);
        }
        public onEnterGame():void
        {
            //1.清空场景内存
            // FZSceneManager.instance.setActive(false);
            FZUIManager.instance.removeUI(FZUIManager.UI_DrawerDialog);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_REMOVE_CAR_UI);
            FZUIManager.instance.removeUI(FZUIManager.UI_Main);
           
            if (FZResManager.instance.RES_GAME == 0) {
                FZResManager.instance.RES_GAME = 1;
                this.onLoadRes();
            }else {
                this.completeHandler(this.RES_GROUP);
            }
        }

        public onLoadRes(){
            Laya.timer.frameOnce(5, this ,function(){
                Laya.loader.load(this.listResMain, Laya.Handler.create(this, this.completeHandler, [this.RES_GROUP]),null,Laya.Loader.ATLAS,0,false,this.RES_GROUP);
            })
        }
        public completeHandler(value){
            if (value == this.RES_GAME) {
                FZUIManager.instance.createUI(FZUIManager.UI_GameView);
                FZMergeDateManager.instance.enterGame();
            }else {
                FZUIManager.instance.createUI(FZUIManager.UI_Main); 
            }
            Laya.timer.frameOnce(60, this, function(){
                if (value == this.RES_MAIN){
                    if (FZGameData.instance.check_point > 3) {
                        if(FZGameData.instance.getInterstitialAdCount() > 0) {
                            FZWechat.instance.playInterstitialAd();
                            FZGameData.instance.addInterstitialAdCount();
                        }
                    }
                }
                this.onGameEnd();
            })
        }
        /**
         * 开始
         */
        public onGameStart(){
            this.scene.img_bg.x = -1200;
            this.scene.box_car.scale(2,2);
            this.scene.box_car.alpha = 0;
            Laya.Tween.to(this.scene.img_bg, {x : -125}, 400, null, Laya.Handler.create(this, function(){
            }));
            Laya.Tween.to(this.scene.box_car, {scaleX:1, scaleY:1, alpha:1}, 300, null, Laya.Handler.create(this, function(){
                Laya.timer.frameOnce(2, this, function(){
                    this.initRes();
                })
            }));
            
        }
        /**
         * 结束
         */
        public onGameEnd() {
            Laya.Tween.to(this.scene.box_car, {scaleX:2, scaleY:2, alpha:0}, 300, null, Laya.Handler.create(this, function(){
                Laya.Tween.to(this.scene.img_bg, {x : -1200}, 600, null, Laya.Handler.create(this, function(){
                    FZUIManager.instance.removeUI(FZUIManager.UI_FZGameJiaZaiUI);
                    FZEventManager.instance.sendEvent(FZEvent.EVNET_ENTER_GAME);
                }));
            }));
        }

        public clearRes(){
            // Laya.loader.clearRes();
        }
    }
}
export default game.view.FZGameJiaZaiUI;
import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZGameStatus from "../data/FZGameStatus";
import FZDebug from "../../framework/FZDebug";
import FZUIManager from "../core/FZUIManager";
import FZGameData from "../data/FZGameData";
import FZUtils from "../../framework/FZUtils";
import QBIEvent from "../data/QBIEvent";
import FZResManager from "../core/FZResManager";
import FZSoundManager from "../core/FZSoundManager";
import FZSceneManager from "../core/FZSceneManager";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
// import FZWechat from "../core/FZWechat";
/**
 * 加载界面
 */
namespace game.view
{
    export class FZLoadingUI extends FZBaseUI
    {
        public scene : ui.view.LoadingViewUI;

        private progress : number = 0;
        private rotation : number = 0;
        private timecount: number = 0;

        private minWidth:number = 1;
        private maxWidth:number = 586;
        public tipslist:any = ["Tips：合成车辆等级越高，车辆伤害和护甲越大!",
            "Tips：游戏失败时可以选择升级武器或合成更高等级的车辆!",
            "Tips：观看视频可以获取双倍离线收益哦!",
            // "Tips：合成6级以上的战车会有空投箱奖励!",
            "Tips：使用氮气可以拥有更好的游戏体验感!",
            "Tips：攻击血包车可以获得血量奖励哦!",
            "Tips：观看视频可以获得一次复活机会!",
            "Tips：每日签到可以获取丰厚钻石!",
            "Tips：美钞可以升级武器，使武器强化!",
            "Tips：钻石可以购买更高的车辆哦!",
            "Tips：通过40关后可以解锁无人机!",
            "Tips：观看视频获得幸运转盘抽奖机会!",
            "Tips：观看视频可以领取每日钻石!",
            "Tips：击败BOSS获得丰厚美钞奖励!"
            ];
        public loadTips :any = [
            "加载资源中...", // 微信下载
            "加载资源中....", // 下载zip 
            "加载配置文件中...",// 加载res资源
            "初始化数据中...", // 加载 配置文件
            "初始化场景中...", // 加载 场景 3d
            "初始化场景中....", // 加载完成跳转主界面
        ]
        public tips_index:number = 0;
        public registerEvent() : void
		{
            // lab_progress_text
            FZEventManager.instance.register(FZEvent.GAME_HIDE, this.gameHideHandler, this);
            FZEventManager.instance.register(FZEvent.GAME_DOWN_RESET, this.setProgress, this);  //资源重新加载完成
            FZEventManager.instance.register(FZEvent.GAME_ENTER_HALL, this.setTips, this);  //显示加载提示
		}

		public unregisterEvent() : void
		{
            FZEventManager.instance.unregister(FZEvent.GAME_HIDE, this.gameHideHandler, this);
            FZEventManager.instance.unregister(FZEvent.GAME_DOWN_RESET, this.setProgress, this);
            FZEventManager.instance.unregister(FZEvent.GAME_ENTER_HALL, this.setTips, this);
        }

        /**
         * 显示加载提示
         * @param index
         */
        public setTips(index){
            this.tips_index = Math.min(this.loadTips.length-1,index);
            if (FZUtils.isNullOrEmpty(this.loadTips[this.tips_index])== true || this.scene == undefined|| this.scene.lab_progress_text == undefined) {
                return;
            }
            Laya.timer.frameOnce(1, this, function(){
                this.scene.lab_progress_text.text = this.loadTips[this.tips_index];
            })
            
        }
        public setProgress():void
        {
            this.progress = 0;
        }
        private stayTime : number = 0;
        public init():void
        {
            // TODO 测试
            if (Laya.Browser.onMiniGame && !FZDebug.customWxDebug){
                FZDebug.setDebug(false);
            }else {
                FZDebug.setDebug(true);
            }
            if (FZDebug.isDebug == true) {
                // Laya.Stat.show();

            }
            if (!Laya.ClassUtils.getClass('Laya.Text') ) {
                Laya.ClassUtils.regClass('Laya.Text',Laya.Text);
            }
            this.scene = new ui.view.LoadingViewUI();
            // if (FZUIManager.instance.longScreen()) {
            //     this.scene.loading_view_bg.height = Laya.stage.height;
            //     this.scene.loading_view_bg.width = Laya.stage.height*0.556;
            //     this.scene.loading_view_bg.x = 0.5*Laya.stage.width;
            // }else{
            //     this.scene.loading_view_bg.width = Laya.stage.width;
            //     this.scene.loading_view_bg.height = Laya.stage.width*1.8;
            //     this.scene.loading_view_bg.x = 0.5*Laya.stage.width;
            // }
            var _height = Laya.stage.height;//Laya.Render.canvas.getAttribute("height");
            // this.scene.loading_view_bg_1.height = _height*0.5;
            // this.scene.loading_view_bg_1.y = _height*0.75;
            // this.scene.loading_view_bg_2.height = _height*0.5;
            // this.scene.loading_view_bg_2.y = _height*0.25;
            this.scene.loading_view.y = _height*0.05;
            
            this.scene.lblVersion.text = "v"+tywx.SystemInfo.version;  //版本号
            
            this.stayTime = Laya.timer.currTimer;
            Laya.timer.loop(1000,this,this.loadingTimeCount);  //loading时长打点
            Laya.timer.loop(17, this, this.doProgress);  //进度条
            this.loadStay();
            Laya.timer.loop(3000, this, this.loadStay);  //tips文案
            this.setTips(0);
            
        }
        private loadingTimeCount():void
        {
            this.timecount++;
            if(tywx.clickStatEventType.loadingDuration[this.timecount+'']){//loading时长打点
                tywx.BiLog.clickStat(tywx.clickStatEventType.loadingDuration[this.timecount+''],[]);
            }
        }

        private stayIndex : number = 0;
        private loadStay() : void
        {
            this.stayIndex = Math.round(Math.random()*(this.tipslist.length-1));
            this.scene.lab_tips.text = this.tipslist[this.stayIndex];   
        }
        
        private deltaTime : number = 0.017;
        private progressLimit : number = 0.8;

        /**
         * 进度条
         */
        private doProgress() : void
        {
            if(this.progress < this.progressLimit)
            {//进度模拟
                if(FZGameData.instance.loadResFinished){
                    this.progress += this.deltaTime * 1;
                }else {
                    this.progress += this.deltaTime * 0.3;
                }
            }
            else if(FZGameData.instance.loadResFinished)
            {//资源加载成功
                this.progress += this.deltaTime * 1;
            }
            else
            {//未加载完成
                if(this.progress < 0.98)
                {
                    this.progress += this.deltaTime * 0.01;
                }
            }
            // 586
            
            this.scene.panel_node.width = Math.max(1, this.maxWidth*this.progress);
            this.scene.img_falg.x = Math.max(1, this.maxWidth*this.progress);    
            this.scene.img_car.x = 82 + Math.max(1, this.maxWidth*this.progress);
            // this.scene.loading_bar.width = Math.max(5, this.maxWidth*this.progress);
            this.scene.lblProgress.text = Math.ceil(this.progress*100)+"%";

            if(this.progress >= 1)
            {
                tywx.BiLog.clickStat(tywx.clickStatEventType.loadingResSuc,[]);
                FZUIManager.instance.removeUI(FZUIManager.UI_Loading, true);
                FZSceneManager.instance.startGame();
                // tywx.SystemInfo.isNewUser = true;
                var falg = FZSaveDateManager.instance.getItemFromLocalStorage("ISNEWUSER", "0");
                if(tywx.SystemInfo.isNewUser == true &&  falg == "0"){
                    var map_index = FZGameData.instance.getCheckPointData().map;
                    this.loadmap(map_index);
                }else {
                    FZUIManager.instance.createUI(FZUIManager.UI_Main);
                }
            }
        }
        public loadmap(index:any) {
            if (FZResManager.instance.LOAD_MAP_RES.indexOf("ui_map/P_Road_0"+index+"_1.jpg") == -1) {
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
        public completemapHandler() {
            FZSceneManager.instance.setActive(false);
            FZResManager.instance.RES_GAME = 1;
            FZUIManager.instance.createUI(FZUIManager.UI_GameView);
            FZMergeDateManager.instance.enterGame();
            FZEventManager.instance.sendEvent(FZEvent.EVNET_ENTER_GAME);
        }

        loadGameSceneFinished():void 
        {
            // var gameScene = Laya.loader.getRes("unity/LayaScene_gamesingle_garage/Conventional/gamesingle_garage.ls") as Laya.Scene3D;
            // Laya.stage.addChild(gameScene);
        }

        public onDestroy():void
        {
            Laya.timer.clear(this, this.doProgress);
            Laya.timer.clear(this, this.loadStay);
            Laya.timer.clear(this,this.loadingTimeCount);
            Laya.loader.clearTextureRes(FZResManager.instance.ATLAS_LOADING);
            tywx.BiLog.clickStat(tywx.clickStatEventType.loadingTimeCount,[this.timecount]);//上传loading界面累计时长
        }

        private gameHideHandler() : void
        {
            
        }
    }
}
export default game.view.FZLoadingUI;
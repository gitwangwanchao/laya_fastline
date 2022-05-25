import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
namespace fastline.view
{
    export class FZMapUI extends Laya.Script{
        public time_d:any = 1/60;
        public map_speed:any  = 0;
        public perRoadLength:any = 0;
        public posHeight:any = 2400;
        public uiComponent: Laya.UIComponent;
        public state:any = 0;
        public run_distance:any = 0; // 游戏运行距离
        public run_distance_m: any = 1000; // 游戏出怪距离
        public run_number:any = 0; // 游戏出怪次数
        public game_running:boolean = false; 
        public gameEnemyOver:boolean = false;
        public updateTime:number = 1;
        public MapCount = 0;
        public onStart(): void
        {
            this.state = 0;
            this.uiComponent = this.owner as Laya.Box;
            this.uiComponent.mouseEnabled = true;
            this.uiComponent.mouseThrough = true;
            this.init();
            // this.registerEvent();
        }
        public registerEvent():void
        {
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_START, this.onGameStart, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_RUNNING, this.onGameRunning, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_STOP, this.onGameStop, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_ENEMY_OVER, this.onGameEnemyOver, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_WIN, this.onGameWin, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_FAIL, this.onGameFail, this);  
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT, this.onPlaySprint, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT_CANNEL, this.onPlaySprintCannel, this);   
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_RESURRECT_MAP, this.onGameResurrect, this);  
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_OVER, this.OnKill, this);   
            
            
        }
        public unregisterEvent():void
        {
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_START, this.onGameStart, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_RUNNING, this.onGameRunning, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_STOP, this.onGameStop, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_ENEMY_OVER, this.onGameEnemyOver, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_WIN, this.onGameWin, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT, this.onPlaySprint, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT_CANNEL, this.onPlaySprintCannel, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_FAIL, this.onGameFail, this);  
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_RESURRECT_MAP, this.onGameResurrect, this);   
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_OVER, this.OnKill, this);
        }
        public OnKill() : void
        {
            this.unregisterEvent();
            Laya.timer.clearAll(this);
        }
        public map_index:any = 1;
        public  map_1 :any =[];
        public  map_2 :any =[];
        public init():void
        {
            this.map_speed = FZGameData.instance.map_speed;
            this.perRoadLength = (this.uiComponent.getChildByName("img_bg_1") as Laya.Image).height;
            this.map_index = FZGameData.instance.getCheckPointData().map;
            this.completeHandler();
            for (var i = 0; i < 3; i++) {
                var index = i + 1;
                var child = this.uiComponent.getChildByName("img_bg_"+ index) as Laya.Image;
                child.y = this.posHeight -  i * this.perRoadLength;
                this.map_1.push(child);
            }
            for ( var i = 1; i <= 3; i++) {
                var child = this.uiComponent.getChildByName("box_cover").getChildByName("img_cover_"+ i) as Laya.Image;
                child.y = this.posHeight -  (i -1)* this.perRoadLength;
                this.map_2.push(child);
            }
            // Laya.timer.frameLoop(2, this, this.onUpdatePos);
        }
        public completeHandler(){
            var ___index =0;
            for (var i = 0; i < 3; i++) {
                var index = i + 1;
                var child = this.uiComponent.getChildByName("img_bg_"+ index) as Laya.Image;
                ___index = i*2;

                let mapIndex = (this.map_index == 6 || this.map_index == 7) ? 1 : 2;
                (child.getChildByName("map_" + (___index + 1))as Laya.Image).skin =  "ui_map/P_Road_0"+this.map_index+"_1.jpg";
                if (___index+2 == 6) {
                    (child.getChildByName("map_" + (___index + 2))as Laya.Image).skin =  "ui_map/P_Road_0"+this.map_index+"_"+mapIndex+".jpg";
                }else {
                    (child.getChildByName("map_" + (___index + 2))as Laya.Image).skin =  "ui_map/P_Road_0"+this.map_index+"_1.jpg";
                }
            }
        }
        public onGameStart():void 
        {
            this.state = 1;
            this.game_running = true;
            this.gameEnemyOver = false;
            this.run_distance = 0; // 游戏运行距离
            this.run_number = 0; // 游戏出怪次数
            this.map_speed = FZGameData.instance.map_speed;
        }
        public onPlaySprint():void 
        {
            if (this.owner){
                Laya.Tween.to(this.owner, {scaleX:0.8, scaleY:0.8},300);
                this.map_speed = FZGameData.instance.getMapSpeed();
            }
            // this.run_distance_m = 3000;
        }
        public onPlaySprintCannel():void 
        {
            if (this.owner){
                Laya.Tween.to(this.owner, {scaleX:1, scaleY:1},300);
                this.map_speed = FZGameData.instance.getMapSpeed();
            }
            // this.run_distance_m = 1000;
        }
        public speed_dis:number =0;
        public onUpdate():void{
            if (this.state != 1) {
                return;
            }
            // FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE);
            FZGameData.instance.UpdatePos();
            this.speed_dis = this.map_speed * FZGameData.instance.getGameTime();
            this.run_distance += this.speed_dis; // 距离增加
            for (var i = 0; i < 3; i++){ 
                this.map_1[i].y += this.speed_dis;
                this.map_2[i].y += this.speed_dis;
                if (this.map_1[i].y >4500){
                    this.map_1[i].y -= 3*this.perRoadLength; 
                }
                if (this.map_2[i].y >4500){
                    this.map_2[i].y -= 3*this.perRoadLength; 
                }
            }
            this.creatEnemy();
        }
        public creatEnemy() {
            if (this.gameEnemyOver == false && this.game_running == true && Math.floor(this.run_distance/this.run_distance_m) != this.run_number) {
                this.run_number = Math.floor(this.run_distance/this.run_distance_m);
                // 出怪
                Laya.timer.frameOnce(1,this, function(){
                    FZGameData.instance.onCreateWaveEnemy();
                });
            }
        }
        public onGameRunning():void
        {
            if (this.gameEnemyOver== false) {
                this.game_running = true;   
            }
        }
        public onGameStop():void
        {
            if (this.gameEnemyOver== false) {
                this.game_running = false;
            }
        }
        public onGameEnemyOver():void
        {
            this.gameEnemyOver = true;
        }
        /**
         * 游戏胜利
         */
        public onGameWin():void
        {
            // Laya.Tween.to(this.owner, {scaleX:1, scaleY:1},300);
            this.state = 0;
        }

        /**
         * 游戏结束
         */
        public onGameFail():void
        {
            this.state = 0;
        }
        /**
         * 复活
         */
        public onGameResurrect():void
        {
            this.state = 1;
            this.game_running = false;
            this.map_speed = FZGameData.instance.map_speed;
            Laya.timer.once(1000, this, function() {
                this.game_running = true;
            })
        }
    }
}
export default fastline.view.FZMapUI;
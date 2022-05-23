import QBaseNode from "../core/QBaseNode";
import { ui } from "../../ui/layaMaxUI";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QGameData from "../data/QGameData";
import QDebug from "../../framework/QDebug";
import QUtil from "../../framework/QUtil";
/**
 * 游戏银币
 */
namespace game.view
{
    export class QObstaclesNode extends QBaseNode 
    {
        public scene : ui.view.ObstaclesNodeUI;
        public speed:number = 0;
        public state:number = 0;
        public Id :number = 0;
        public registerEvent():void
        {
            // QEventMgr.instance.register(QEventType.MAIN_VIEW_UPDATE ,this.UpdatePos,this);     
            // QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_JUDGE_BULLET_POS, this.Hit, this);
            // QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_RESURRECT, this.onGameResurrect, this);
            // QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_OVER,this.onGameOver,this);
        }
        public unregisterEvent():void
        {
            // QEventMgr.instance.unregister(QEventType.MAIN_VIEW_UPDATE ,this.UpdatePos,this);     
            // QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_JUDGE_BULLET_POS, this.Hit, this);
            // QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_RESURRECT, this.onGameResurrect, this);
            // QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_OVER,this.onGameOver,this);
        }

        public setId(id:number) {
            this.Id = id;
        }
/**
         * 刷新位置
         */
        public box_posit:any = null;
        public onUpdateBoxPosit(){
            this.box_posit.x = this.scene.x  - this.scene.width/2 + this.scene.img_obstacles_box.x;
            if (this.state == 1){
                this.box_posit.y = this.scene.y - this.scene.height + this.scene.img_obstacles_box.y;
            }else {
                this.box_posit.y = -2200;
                this.box_posit.x = -1000;
            }
        }
        public init() {
            this.scene = new ui.view.ObstaclesNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 5;
            this.box_posit = {};
            this.box_posit.width = this.scene.img_obstacles_box.width;
            this.box_posit.height = this.scene.img_obstacles_box.height;
        }
        /**
         *  结束子弹
         */
        public onkill():void{
            this.state = 0;
            QDebug.D("障碍物销毁----------------------------------------------------");
            this.onUpdateBoxPosit();
            Laya.timer.clearAll(this);
            this.scene.visible = false;
        }
        
        /**
         * 获得位置信息
         */
        // public pos_data:any = {};
        // public getPos():any {
        //     if (this.state != 1 || this.scene == null || this.scene.x == null){
        //         return null;
        //     }
        //     this.pos_data.x = this.scene.x - this.scene.width/2 + this.scene.img_obstacles_box.x;
        //     if (this.state == 1){
        //         this.pos_data.y = this.scene.y - this.scene.height + this.scene.img_obstacles_box.y;
        //     }else {
        //         this.pos_data.y = -1200;
        //     }
        //     this.pos_data.width = this.scene.img_obstacles_box.width;
        //     this.pos_data.height = this.scene.img_obstacles_box.height;
        //     return this.pos_data;
        // }
        /**
         * 开始移动
         */
        public startMove(pos):void 
        {
            QDebug.D("开始移动-----障碍物--------------------------");
            this.scene.visible = true;
            this.scene.img_obstacles_box.visible = true;
            this.scene.img_obs.visible = true;
            this.scene.x = pos.x;
            this.scene.y = pos.y;
            this.state = 1;
            this.onUpdateBoxPosit();
        }
        /**
         * 刷新位置
         */
        private UpdatePos() {
            if (this.state == 1 || this.state == 2) {
                this.scene.y += QGameData.instance.getMapSpeed() * QGameData.instance.getGameTime();
                this.onUpdateBoxPosit();
            }
        }
        /**
         * 移出屏幕
         */
        public onJudgeOutScreen(){
            if (this.state != 0 && this.scene.y - this.scene.height  >= QGameData.instance.getQPlayerCarPos().y + 400) {
                // QDebug.D("障碍物 移出屏幕------------------------------------");
                QGameData.instance.killObstaclesPoolList(this);
            }
        }
        /**
         * 安全距离 
         */
        public isSafeDistance() {
            // QDebug.D("障碍物 安全距离------------------------------------" + this.scene.y);
            if (this.scene.y - this.scene.height > 220) {
                return 1;
            }
            return 0;
        }
        public playFireAnimation() :void
        {
            this.state = 2;
            this.onUpdateBoxPosit();
            this.scene.ani1.play(0,false);
            this.scene.img_obstacles_box.visible = false;
            // this.scene.img_obs.visible = false;
            // var self = this;
            // Laya.timer.once(1000, this, function(){
            //     QGameData.instance.killObstaclesPoolList(self);
            // })            
        }
        /**
         * 碰撞
         * @param params 
         */
        public Hit(param:any){
            if (this.state == 2 || this.state == 0 || this.scene.visible == false) {
                return;
            } 
            if (QGameData.instance.StateSprint == true) {
                this.playFireAnimation();
                return;
            }
        }
        /**
         * 游戏结束
         */
        public onGameOver() {
            if (this.scene.visible == true && this.state != 0) {
                QGameData.instance.killObstaclesPoolList(this);
            }
        }

        /**
         * 玩家复活
         */
        public onGameResurrect() {
            if (this.scene.visible == true && this.state == 1) {
                this.playFireAnimation();
            }
        }
    }
}
export default game.view.QObstaclesNode;
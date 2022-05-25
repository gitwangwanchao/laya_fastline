import FZBaseNode from "../core/FZBaseNode";
import { ui } from "../../ui/layaMaxUI";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZGameData from "../data/FZGameData";
import FZDebug from "../../framework/FZDebug";
import FZUtils from "../../framework/FZUtils";
/**
 * 游戏道具
 */
namespace game.view
{
    export class FZItemsUI extends FZBaseNode 
    {
        public scene : ui.view.ProbsNodeUI;
        public probs_state: number = 0;
        public m_type:string = "Probs";
        public m_id:number = 0;
        public speedx:number = 2;
        public speedy:number = 10;
        public speedy_a:number = 0.6;
        public speedy_m:number = 0;
        public speedx_m:number = 0;
        public item_path:string = null; 
        public item_type:number = 0;     // 1 冲刺 2 增加弹道
        public item_data:any = null;
        public registerEvent():void
        {
            
        }
        public unregisterEvent():void
        {
            
        }
         /**
         * 刷新位置
         */
        public box_posit:any ={};
        public onUpdateBoxPosit(){
            this.box_posit.x =  this.scene.x - this.scene.width/2;
            if (this.probs_state == 1 ) {
                this.box_posit.y = this.scene.y - this.scene.height/2;
            } else {
                this.box_posit.y = -200;
            }
        }

        public init() {
            this.scene = new ui.view.ProbsNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 11;
            this.probs_state = 0;
            this.box_posit = {};
            this.box_posit.width = this.scene.width;
            this.box_posit.height = this.scene.height;
        }
        public setParam(param:any) {
            this.item_data = param;
            this.item_path = param.item_path;
            this.item_type = param.item_type; 
            this.scene.item_icon.skin = param.item_path;
            this.scene.item_icon_shadow.skin = param.item_path;
        }
        // public pos_data:any ={};
        // public getPos():any
        // {
        //     this.pos_data.x = this.scene.x - this.scene.width/2;
        //     if (this.probs_state == 1 ) {
        //         this.pos_data.y = this.scene.y - this.scene.height/2;
        //     } else {
        //         this.pos_data.y = -200;
        //     }
        //     this.pos_data.width = this.scene.width;
        //     this.pos_data.height = this.scene.height;
        //     return this.pos_data;
        // }
        /**
         *  结束子弹
         */
        public onkill():void{
          
            this.scene.visible = false;
            this.probs_state = 0;
        }
        
        /**
         * 开始移动
         */
        public startMove(value:any, id :number):void 
        {
            this.scene.item_icon_shadow.filters = [FZGameData.instance.blackFilter];
            this.m_type += id;
            this.m_id = id;
            this.scene.visible = true;
            this.scene.x = value.x;
            this.scene.y = value.y;        
            this.probs_state = 1;
            var count = Math.round(Math.random()*4 + 3);
            var flag = Math.round(Math.random());
            this.speedx = count;
            this.speedx_m = count;
            if (flag == 0) {
                this.speedx = - count;
            }
            var count_y = Math.round(Math.random()*5+15);
            this.speedy = -count_y;
            this.speedy_m = -count_y;
            this.onUpdateBoxPosit();
        }
        /**
         * 游戏死亡
         */
        public onGameFail() 
        {
            Laya.timer.clearAll(this);
        }
        /**
         * 游戏结束
         */
        public onGameOver() {
            FZGameData.instance.killProbsPoolList(this);
        }

        //移动        自己做条件判断停止frameLoop
        public speed_w :number = 0;
        private UpdatePos() {
            if (this.probs_state != 1){
                return
            }
            this.speed_w = this.speedy * FZGameData.instance.getGameTime();
            this.scene.y += this.speed_w;
            this.speedy += this.speedy_a * FZGameData.instance.getGameTime();
            this.speedy = Math.min(this.speedy, FZGameData.instance.map_speed + 3);
            this.scene.x += this.speedx* FZGameData.instance.getGameTime();
            if (this.scene.x <= 50 || this.scene.x >= 700) {
                this.speedx = - this.speedx;
            }
            this.onUpdateBoxPosit();
            
        }
        /**
         * 判断是否移出屏幕 
         */
        public onJudgeOutScreen(){
            if(this.probs_state != 1) {
                return
            }
            if (this.scene.y >= FZGameData.instance.getFZPlayerUIPos().y + 300) {
                this.probs_state = 0;
                this.onUpdateBoxPosit();
                FZGameData.instance.killProbsPoolList(this);
            }
        }
        
        /**
         * 判断 车是否碰到
         */
        public onHit() :void
        {
            if (this.probs_state != 1) {
                return;
            }  
            // 吃掉道具
            this.probs_state = 0;
            this.onUpdateBoxPosit();
            // 冲刺 增加弹道
            FZGameData.instance.killProbsPoolList(this);
            if (this.item_data.probs_type == 1) {
                if(this.item_data.item_type == 4 ) {
                    // 播放加血动画
                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_PLAY_EFFECT,this.item_data);
                } else {
                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_PLAY_EFFECT,this.item_data);

                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_ITME_EFFECT,this.item_data);
                }   
            }
        }
    }
}
export default game.view.FZItemsUI;
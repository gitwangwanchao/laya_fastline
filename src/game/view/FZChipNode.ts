import FZBaseNode from "../core/FZBaseNode";
import { ui } from "../../ui/layaMaxUI";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZGameData from "../data/FZGameData";
import FZDebug from "../../framework/FZDebug";
import FZUtils from "../../framework/FZUtils";
import FZSoundManager from "../core/FZSoundManager";
/**
 * 游戏银币
 */
namespace game.view
{
    export class FZChipNode extends FZBaseNode 
    {
        public scene : ui.view.GameCoinNodeUI;
        public probs_state: number = 0;
        public m_type:string = "Coin";
        public m_id:number = 0;
        public TIME:number = 1;
        public end_p:any = {x:0, y:0};
        public endx:number = 0;
        public endy:number = 0;
        public speed:number = 500; 
        public item_data :any = null;
        public roat:number = 0;
        public registerEvent():void
        {
            // FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_OVER, this.onGameOver, this);
        }
        public unregisterEvent():void
        {
            // FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_OVER, this.onGameOver, this);
        }
        public init() {
            this.scene = new ui.view.GameCoinNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 1100;
            this.probs_state = 0;
        }
        public onGameOver() {
            if (this.probs_state != 0 && this.scene.visible == true) {
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_WEAPONS_COIN);
                FZGameData.instance.killCoinPoolList(this);
            }
        }
        /**
         *  结束子弹
         */
        public onkill():void{
            Laya.timer.clearAll(this);
            this.scene.visible = false;
            this.probs_state = 0;
        }
        setParam(value:any) {
            this.item_data = value;
            this.scene.item_icon_shadow.skin = this.item_data.item_path;
            this.scene.item_icon.skin = this.item_data.item_path;
            this.scene.item_icon_shadow.filters = [FZGameData.instance.blackFilter];
        }
        public MoveRotation:number = 0;
        /**
         * 开始移动
         */
        public startMove(value:any, id :number, end:any):void 
        {
            var index = Math.round(Math.random());
            if (index == 0) {
                this.roat = 1;
            }else {
                this.roat = -1;
            }
            this.scene.rotation = 0;
            this.end_p = (this.scene.parent as Laya.Sprite).globalToLocal(new Laya.Point(end.x, end.y)); //FZUtils.globalToLocal(this.end_p,this.scene);;
            this.m_type += id;
            this.m_id = id;
            this.scene.visible = true;
            this.scene.x = value.x;
            this.scene.y = value.y;

            this.probs_state = 1;
            this.m_t = 0;
            this.MoveRotation = 0;
            if (this.m_id %8 == 0) {
                this.MoveRotation = 45;
            } else if (this.m_id %8 == 1) {
                this.MoveRotation = 90;
            } else if (this.m_id %8 == 2) {
                this.MoveRotation = 135;
            } else if (this.m_id %8 == 3) {
                this.MoveRotation = 180;
            } else if (this.m_id %8 == 4) {
                this.MoveRotation = 225;
            } else if (this.m_id %8 == 5) {
                this.MoveRotation = 270;
            }else if (this.m_id %8 == 6) {
                this.MoveRotation = 315;
            }else if (this.m_id %8 == 7) {
                this.MoveRotation = 0;
            }
            this.endx = this.scene.x - Math.sin(this.MoveRotation * (Math.PI/180))*300;
            this.endy = this.scene.y + Math.cos(this.MoveRotation * (Math.PI/180))*300;
            Laya.timer.frameLoop(1, this, this.UpdatePos);
        }
        
        private counts = 0.018;
        private m_t = 0;
        // //移动        自己做条件判断停止frameLoop
        private UpdatePos() {
            if( ! this.scene ){
                return;
            }
            if (this.probs_state != 1){
                return
            }
            this.m_t += this.counts; //* FZGameData.instance.getGameTime();
            this.m_t = Math.min(1, this.m_t);
            this.scene.rotation += this.roat;
            var endx = this.scene.x/2;
            var endy = this.scene.y;
            if (this.m_id % 3== 0){
                endx = this.scene.x + 50;
                endy = this.scene.y + 20;
            }else if (this.m_id % 3== 1) {
                endx = this.scene.x;
                endy = this.scene.y + 20;
            }
            var point = this.bezier(this.m_t, this.scene.x, this.scene.y, this.endx, this.endy, this.end_p.x, this.end_p.y);
            this.scene.x = point.x
            this.scene.y = point.y;
            
            if (this.m_t == 1) {
                this.probs_state = 0;
                Laya.timer.clearAll(this);
                Laya.timer.frameOnce(1, this, function() {
                    if(this.item_data.item_type == 5 ) {
                        // 钻石
                        FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.getDiamond);
                        FZGameData.instance.checkpoint_diamond += this.item_data.amount1;
                    }else if(this.item_data.item_type == 6 ) {
                        // 美钞
                        FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.getMoney);
                        FZGameData.instance.checkpoint_dollars += this.item_data.amount1;
                    }
                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_WEAPONS_COIN);
                    FZGameData.instance.killCoinPoolList(this);
                });
            }
        }
        // //t->(0,1)  stx:起始位置     kongzhiX：拉力点   endX ：终点
        private bezier(t: number, stx: number = 0, stY: number = 0, kongzhiX: number, kongzhiY: number, endX: number, endY: number): any {
            var tem = 1 - t;
            var tx = tem * tem  * stx + 2 * t * tem * kongzhiX + t * t * endX
            var ty = tem * tem * stY + 2 * t * tem * kongzhiY + t * t * endY
            return { x: tx, y: ty };//返回坐标位置
        }
        
    }
}
export default game.view.FZChipNode;
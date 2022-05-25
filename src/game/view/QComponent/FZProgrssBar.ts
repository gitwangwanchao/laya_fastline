import FZBaseNode from "../../core/FZBaseNode";
import { ui } from "../../../ui/layaMaxUI";
import FZEventManager from "../../../framework/FZEventManager";
import FZEvent from "../../data/FZEvent";
import FZGameData from "../../data/FZGameData";
import FZDebug from "../../../framework/FZDebug";
/**
 * 主场景
 */
namespace game.view
{
    export class FZProgrssBar extends FZBaseNode
    {   
        
        public scene : ui.view.ItemProgressBarNodeUI;
        private _angle = 0;
        private tween1: laya.utils.Tween;
        private tweenTime: number;  //以秒为单位
        private startAngle: number;  //圆的初始角度
        private endAngle: number;  //圆的初始角度
        public NodeId:number = -1;
        public state:number = 0;  
        public speed :number =0;
        public item_data:any = null;
        constructor() {
            super();
            this.registerEvent();
            this.init();
        }
        public registerEvent():void
        {
            FZEventManager.instance.register(FZEvent.GAME_VIEW_BOSS_OVER, this.onPlayerFail, this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_WIN,this.onPlayerFail,this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);  
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_OVER,this.destroy,this);
        }
        public unregisterEvent():void
        {
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_BOSS_OVER, this.onPlayerFail, this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_WIN,this.onPlayerFail,this);
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);  
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_OVER,this.destroy,this);
        }
        public destroy() : void
        {
            this.unregisterEvent();
            this.scene.offAll(Laya.Event.CLICK);
			Laya.timer.clearAll(this);
            this.parentNode.removeChild(this.scene);
            this.scene.destroy();
        }
        public init() 
        {
            this.scene = new ui.view.ItemProgressBarNodeUI();
            this.startAngle = -90;  //从顶部开始
            this.endAngle = 0;
            this.scene.visible = false;
        }
        /**
         * 隐藏
         */
        public onKill() {
            Laya.timer.clearAll(this);
            this.state = 0;
            FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_ITME_EFFECT_REMOVE, this);
            this.scene.visible = false;
            if (this.item_data.item_type == 1) {
                FZGameData.instance.setMapSpeed(FZGameData.instance.map_speed_normal);
                FZGameData.instance.onChangeStateSprint(false);
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT_CANNEL);
            } else if (this.item_data.item_type == 2) {
                FZGameData.instance.StateBallistic = false;
            } else if (this.item_data.item_type == 3) {
                FZGameData.instance.DollarDouble = 1;
            }
            this.item_data = null;
        }
        /**
         * 设置位置
         */
        public setPos(param: any) {
            this.scene.x = param.posx;
            this.scene.y = param.posy;
        }
        /**
         * 开始
         * @param value 
         */
        public timecount:any =0;
        public setParam(value:any) {
            this.scene.visible = true;
            this.item_data = value;
            this.tweenTime = this.item_data.time *1000; //10秒倒计时
            this.state = 1;
            // this.speed = 360 / (this.tweenTime*10);
            this.scene.x = value.pos.posx;
            this.scene.y = value.pos.posy;
            this._angle = 0;
            this.scene.img_progress.skin = value.progress_skin;
            this.scene.img_item_1.skin = value.progress_path;
            if (this.item_data.item_type == 1) {
                // 氮气
                FZGameData.instance.setMapSpeed(FZGameData.instance.map_speed_sprint);
                FZGameData.instance.onChangeStateSprint(true);
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_PLAY_SPRINT);
            } else if (this.item_data.item_type == 2) {
                // 弹道
                FZGameData.instance.StateBallistic = true;
            } else if (this.item_data.item_type == 3) {
                // 美钞翻倍
                FZGameData.instance.DollarDouble = 2;
            }
            this.scene.lab_name.text = this.item_data.item_name;
            Laya.timer.clearAll(this);
            this.timecount= 0;
            Laya.timer.loop(50, this, this.onUpdate);
        }
        public isJudgeType(value:number) :any{
            return value == this.item_data.item_type;
        }
        public onUpdate() {
            if (this.state == 1 && this.scene.visible == true) {
                this.drawPie();
            }
        }

        public drawPie() {
            this.timecount += 50;
            this.scene.img_progress.width = Math.max(1,(this.tweenTime - this.timecount)/this.tweenTime * 75);
            if (this.tweenTime <= this.timecount) {
                this.onKill();
                return;
            }
        }
        /**
         * 玩家死亡
         */
        public onPlayerFail() {
            if (this.state == 1 && this.scene.visible == true) {
                this.onKill();
            }
        }
    }
}
export default game.view.FZProgrssBar;
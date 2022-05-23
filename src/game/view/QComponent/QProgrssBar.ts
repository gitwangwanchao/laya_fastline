import QBaseNode from "../../core/QBaseNode";
import { ui } from "../../../ui/layaMaxUI";
import QEventMgr from "../../../framework/QEventMgr";
import QEventType from "../../data/QEventType";
import QGameData from "../../data/QGameData";
import QDebug from "../../../framework/QDebug";
/**
 * 主场景
 */
namespace game.view
{
    export class QProgrssBar extends QBaseNode
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
            QEventMgr.instance.register(QEventType.GAME_VIEW_BOSS_OVER, this.onPlayerFail, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_WIN,this.onPlayerFail,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);  
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_OVER,this.destroy,this);
        }
        public unregisterEvent():void
        {
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_BOSS_OVER, this.onPlayerFail, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_WIN,this.onPlayerFail,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);  
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_OVER,this.destroy,this);
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
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_ITME_EFFECT_REMOVE, this);
            this.scene.visible = false;
            if (this.item_data.item_type == 1) {
                QGameData.instance.setMapSpeed(QGameData.instance.map_speed_normal);
                QGameData.instance.onChangeStateSprint(false);
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_PLAY_SPRINT_CANNEL);
            } else if (this.item_data.item_type == 2) {
                QGameData.instance.StateBallistic = false;
            } else if (this.item_data.item_type == 3) {
                QGameData.instance.DollarDouble = 1;
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
                QGameData.instance.setMapSpeed(QGameData.instance.map_speed_sprint);
                QGameData.instance.onChangeStateSprint(true);
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_PLAY_SPRINT);
            } else if (this.item_data.item_type == 2) {
                // 弹道
                QGameData.instance.StateBallistic = true;
            } else if (this.item_data.item_type == 3) {
                // 美钞翻倍
                QGameData.instance.DollarDouble = 2;
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
export default game.view.QProgrssBar;
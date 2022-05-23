import QBaseNode from "../../core/QBaseNode";
import { ui } from "../../../ui/layaMaxUI";
import QEventMgr from "../../../framework/QEventMgr";
import QEventType from "../../data/QEventType";
import QGameData from "../../data/QGameData";
import QDebug from "../../../framework/QDebug";
import QUtil from "../../../framework/QUtil";
import QSoundMgr from "../../core/QSoundMgr";

/**
 * 子弹
 */
namespace game.view
{
    export class QBulletEffect extends QBaseNode
    {
        public scene : ui.view.BulletEffectNodeUI;
        public registerEvent():void {
                 
        }
        public unregisterEvent():void
        {
        }
        public init() 
        {
            this.scene = new ui.view.BulletEffectNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 100;
            this.speed = 0;
            this.m_type = 0;
        }
        public speed:any = 0;
        public m_type:any = 1;
        public playExplosion(params:any):void
        {
            this.scene.visible = true;
            this.scene.img_effect.scaleX = 1;
            this.scene.img_effect.scaleY = 1;
            this.scene.x = params.x;
            this.scene.y = params.y;
            this.m_type = params.type;
            this.speed = QGameData.instance.getMapSpeed() - 4;
            if (params.type == 1) {
                this.scene.ani1.play(0,false);
                Laya.timer.once(300, this, function(){
                    QGameData.instance.killEffectPool(this);
                })
            }else if (params.type == 2) {
                this.scene.img_effect.scaleX = 0.5;
                this.scene.img_effect.scaleY = 0.5;
                this.scene.ani2.play(0,false);
                Laya.timer.once(1000, this, function(){
                    QGameData.instance.killEffectPool(this);
                })
            }else if (params.type == 3 || params.type == 4) {
                // QDebug.D("敌人爆炸-----------" + this.m_type);
                if(params.type == 4){
                    this.speed = QGameData.instance.getMapSpeed() 
                }
                this.scene.ani2.play(0,false);
                Laya.timer.once(1000, this, function(){
                    QGameData.instance.killEffectPool(this);
                })
                Laya.timer.loop(17,this, this.UpdatePos);
            }
        }
        public onkill(){
            Laya.timer.clearAll(this);
            this.scene.visible = false;
            this.m_type = 1;
        }
        public UpdatePos(){
            if (this.scene.visible == false || this.m_type != 3)
            {
                return;
            }
            // QDebug.D("特效类型-----------" + this.m_type);
            this.scene.y += this.speed * QGameData.instance.getGameTime();
            // QDebug.D("特效类型-------this.scene.y----" + this.scene.y);
        }
    }
}
export default game.view.QBulletEffect;
import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QSequence from "../../framework/QSequence";

namespace game.view
{
    export class QSupplyTips extends QBaseUI
    {
        private sequence : QSequence;
        public scene : ui.view.SupplyTipsUI;
        private supplyDes : Laya.Image;

        private desAdd:string = "ui_main/supply_desc0.png"
        private desBoxIcon:string = "ui_main/supply_desc1.png"
        private buffAdd:string = "ui_main/type_jinbi.png"
        private carBoxIcon:string = "ui_main/typeBox_2.png"

        private supplycfg : any;
        public init():void
        {
            this.scene = new ui.view.SupplyTipsUI();
            this.scene.ani1.play(0,false)
        }

        /**@override */
        public setParam(param: any)
        {
            let tipsSkin = param == 1 ? this.desAdd:this.desBoxIcon;
            this.scene.supplyTips.skin = tipsSkin;
            
            let iconSkin = param == 1 ? this.buffAdd:this.carBoxIcon;
            this.scene.imgCarIcon.skin = iconSkin
            let delay = 3;

            if(this.sequence != null)
            {
                this.sequence.destroy();
            }
            this.sequence = QSequence.create();
            
            this.sequence.add(delay, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_Supply_Tips);
            }, this)

            this.sequence.start();
        }
        public doDestroy():void
        {
            if(this.sequence != null)
			{
				this.sequence.destroy();
			}
        }
    }
}export default game.view.QSupplyTips;
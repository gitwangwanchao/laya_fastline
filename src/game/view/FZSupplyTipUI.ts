import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import FZSequence from "../../framework/FZSequence";

namespace game.view
{
    export class FZSupplyTipUI extends FZBaseUI
    {
        private sequence : FZSequence;
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
            this.sequence = FZSequence.create();
            
            this.sequence.add(delay, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_Supply_Tips);
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
}export default game.view.FZSupplyTipUI;
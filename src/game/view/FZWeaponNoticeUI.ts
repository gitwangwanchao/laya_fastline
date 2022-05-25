import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZGameStatus from "../data/FZGameStatus";
import FZGameData from "../data/FZGameData";
import FZCfgManager from "../core/FZCfgManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import QBIEvent from "../data/QBIEvent";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZSoundManager from "../core/FZSoundManager";

namespace game.view
{
    export class FZWeaponNoticeUI extends FZBaseUI
    {
        public scene:ui.view.WeaponLockedNoticeViewUI;

        private param: string;

        public registerEvent() : void
        {
        }

        public unregisterEvent() : void   
        {
        }

        public init():void
        {
            this.scene = new ui.view.WeaponLockedNoticeViewUI();
            this.scene.zOrder = 999;
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnGo, this, this.onClickBtnGo, ["btnGo"]);

            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            if (FZUIManager.instance.longScreen()) {
                this.scene.btnClose.y+=70;
                this.scene.title_uav.y+=70;
                this.scene.title_weapons.y+=70;
            }
        }

        /**@override */
        public setParam(param)
        {
            this.param = param;
            
            this.scene.deputy_icon.visible = (param == "deputy");
            this.scene.uav_icon.visible = (param == "uav");
            let idx = (param == "uav") ? 1 : 2;
            let name = (param == "uav") ? "无人机" : "副武器";
            if(idx == 1)
            {
                this.scene.title_uav.visible = true;
                this.scene.title_weapons.visible = false;
            }
            else
            {
                this.scene.title_uav.visible = false;
                this.scene.title_weapons.visible = true;
            }
            this.scene.lblDes.text = "马上去升级"+name+"?";
        }

        private onClickClose() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponLockedNoticeView);
        }

        private onClickBtnGo()
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            
            FZUIManager.instance.createUI(FZUIManager.UI_WeaponLevelUpView, this.param);
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponLockedNoticeView);
        }
    }
}
export default game.view.FZWeaponNoticeUI;
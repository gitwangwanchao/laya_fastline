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
    export class FZWeaponNotNoticeUI extends FZBaseUI
    {
        public scene:ui.view.WeaponUnlockNoticeViewUI;

        private gameConfig:any
        private carConfig:any
        private gold_count:number = 0;

        public registerEvent() : void
        {
        }

        public unregisterEvent() : void   
        {
        }

        public init():void
        {
            this.scene = new ui.view.WeaponUnlockNoticeViewUI();

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnGoMerge, this, this.onClickBtnGoMerge, ["btnGoMerge"]);

            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
        }

        /**@override */
        public setParam(param)
        {
            this.scene.box_car.visible = false;
            this.scene.box_checkpoint.visible = false;
            let skin = (param.value == "uav") ? "ui_main/uav_unlock_icon.png" : "ui_main/deputy_unlock_icon.png";
            let level = (param.value == "uav") ? FZGameData.instance.getUAVWeaponOpenPoint() : FZGameData.instance.getDeputyWeaponOpenPoint();
            let name = (param.value == "uav") ? "无人机" : "副武器";
            
            this.scene.weapon_icon.skin = skin;
            this.scene.lab_btn_merage.text = "去合成";
            if(param.value == "uav") {
                this.scene.box_checkpoint.visible = true;
                this.scene.hecheng.text = "通过";
                this.scene.lblValue.text = level+"关";
                this.scene.lblDes.text = "后解锁";
                this.scene.lab_btn_merage.text = "去闯关";
            }else {
                this.scene.box_car.visible = true;
                this.scene.car_hecheng.text = "合成";
                this.scene.car_lblValue.text = level+"级";
                this.scene.car_lblDes.text = "车辆解锁"+name;
            }
        }

        private onClickClose() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_WeaponUnlockNoticeView);
            });
            FZEventManager.instance.sendEvent(FZEvent.ON_UPDATE_WEAPONLEVEL_UI);
        }

        private onClickBtnGoMerge()
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);            
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponLevelUpView);
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponUnlockNoticeView);
        }
    }
}
export default game.view.FZWeaponNotNoticeUI;
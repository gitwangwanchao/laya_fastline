import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QDebug from "../../framework/QDebug";
import QGameConst from "../data/QGameConst";
import QGameData from "../data/QGameData";
import QCfgMgr from "../core/QCfgMgr";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QBIEvent from "../data/QBIEvent";
import QMergeData from "../data/QMergeData";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QSoundMgr from "../core/QSoundMgr";

namespace game.view
{
    export class QWeaponUnlockNoticeView extends QBaseUI
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

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnGoMerge, this, this.onClickBtnGoMerge, ["btnGoMerge"]);

            QUtil.doUIPopAnim(this.scene.AnchorCenter);
        }

        /**@override */
        public setParam(param)
        {
            this.scene.box_car.visible = false;
            this.scene.box_checkpoint.visible = false;
            let skin = (param.value == "uav") ? "ui_main/uav_unlock_icon.png" : "ui_main/deputy_unlock_icon.png";
            let level = (param.value == "uav") ? QGameData.instance.getUAVWeaponOpenPoint() : QGameData.instance.getDeputyWeaponOpenPoint();
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_WeaponUnlockNoticeView);
            });
            QEventMgr.instance.sendEvent(QEventType.ON_UPDATE_WEAPONLEVEL_UI);
        }

        private onClickBtnGoMerge()
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);            
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponLevelUpView);
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponUnlockNoticeView);
        }
    }
}
export default game.view.QWeaponUnlockNoticeView;
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
    export class QWeaponLockNoticeView extends QBaseUI
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
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnGo, this, this.onClickBtnGo, ["btnGo"]);

            QUtil.doUIPopAnim(this.scene.AnchorCenter);
            if (QUIMgr.instance.longScreen()) {
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponLockedNoticeView);
        }

        private onClickBtnGo()
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            
            QUIMgr.instance.createUI(QUIMgr.UI_WeaponLevelUpView, this.param);
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponLockedNoticeView);
        }
    }
}
export default game.view.QWeaponLockNoticeView;
import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QUIMgr from "../core/QUIMgr";
import QDebug from "../../framework/QDebug";
import QSavedDateItem from "../data/QSavedDateItem";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QSoundMgr from "../core/QSoundMgr";

namespace game.view
{
    export class QCheckPointChooseDialog extends QBaseUI
    {
        public scene: ui.view.CheckPointChooseDialogUI ;

        private soundState: string;
        private vibrateState: string;
        
        public init():void
        {
            this.scene = new ui.view.CheckPointChooseDialogUI();
            
            this.scene.maskBg.on(Laya.Event.CLICK, this, this.onClickBtnClose, ["maskBg"]);

            let maxCheckPoint = QGameData.instance.getMaxCheckPoint();
            for (let i = 0; i < 5; i++) {
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene["point_icon_"+i], this, this.onClickChoose, [i]);
                this.scene["point_lbl_"+i].text = (maxCheckPoint-(4-i)).toString();
            }

            this.scene.ani_zhankai.play(0, false);
        }

        private onClickChoose (param){
            let maxCheckPoint = QGameData.instance.getMaxCheckPoint();
            QGameData.instance.setCheckPoint(maxCheckPoint-(4-param));
            QEventMgr.instance.sendEvent(QEventType.GAME_UPDATE_POINT_SHOW);
            QUIMgr.instance.removeUI(QUIMgr.UI_CheckPointChoose);
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            tywx.BiLog.clickStat(tywx.clickStatEventType.selectNumberOfLevels,[maxCheckPoint-(4-param)]);
        }

        private onClickBtnClose():void
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUIMgr.instance.removeUI(QUIMgr.UI_CheckPointChoose);
        }
    }
}
export default game.view.QCheckPointChooseDialog;
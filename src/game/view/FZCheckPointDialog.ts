import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZSoundManager from "../core/FZSoundManager";

namespace game.view
{
    export class FZCheckPointDialog extends FZBaseUI
    {
        public scene: ui.view.CheckPointChooseDialogUI ;

        private soundState: string;
        private vibrateState: string;
        
        public init():void
        {
            this.scene = new ui.view.CheckPointChooseDialogUI();
            
            this.scene.maskBg.on(Laya.Event.CLICK, this, this.onClickBtnClose, ["maskBg"]);

            let maxCheckPoint = FZGameData.instance.getMaxCheckPoint();
            for (let i = 0; i < 5; i++) {
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene["point_icon_"+i], this, this.onClickChoose, [i]);
                this.scene["point_lbl_"+i].text = (maxCheckPoint-(4-i)).toString();
            }

            this.scene.ani_zhankai.play(0, false);
        }

        private onClickChoose (param){
            let maxCheckPoint = FZGameData.instance.getMaxCheckPoint();
            FZGameData.instance.setCheckPoint(maxCheckPoint-(4-param));
            FZEventManager.instance.sendEvent(FZEvent.GAME_UPDATE_POINT_SHOW);
            FZUIManager.instance.removeUI(FZUIManager.UI_CheckPointChoose);
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZ.BiLog.clickStat(FZ.clickStatEventType.selectNumberOfLevels,[maxCheckPoint-(4-param)]);
        }

        private onClickBtnClose():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUIManager.instance.removeUI(FZUIManager.UI_CheckPointChoose);
        }
    }
}
export default game.view.FZCheckPointDialog;
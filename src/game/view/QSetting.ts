import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QUIMgr from "../core/QUIMgr";
import QDebug from "../../framework/QDebug";
import QSavedDateItem from "../data/QSavedDateItem";
import QSoundMgr from "../core/QSoundMgr";
import QSceneMgr from "../core/QSceneMgr";

var userName = "";

namespace game.view
{
    export class QSetting extends QBaseUI
    {
        public scene: ui.view.SettingUI ;

        private soundState: string;
        private vibrateState: string;
        
        public init():void
        {
            this.scene = new ui.view.SettingUI();
            QUtil.doUIPopAnim(this.scene.AnchorCenter);

            this.soundState = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SETTING_SOUND_STATE", "open");
            this.vibrateState = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SETTING_VIBRATW_STATE", "open");
            
            this.scene.sound_checkBox.selected = this.soundState == "open";
            this.scene.vibrate_checkBox.selected = this.vibrateState == "open";
            
            this.scene.sound_checkBox.on("change", this, this.onClickCheckBox, ["sound_checkBox"]);
            this.scene.vibrate_checkBox.on("change", this, this.onClickCheckBox, ["vibrate_checkBox"]);

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.copyIDBtn, this, this.onCopyClick, ["copyIDBtn"]);

            this.scene.user_id.text = String(tywx.UserInfo.userId);

            let nameStr = this.getNewNameStr(userName ? userName : tywx.UserInfo.userName);
            this.scene.user_name.text = nameStr;
            this.scene.changeNameBtn.off(Laya.Event.CLICK,this,this.changeNameOkClick);
            this.scene.changeNameBtn.on(Laya.Event.CLICK,this,this.changeNameClick);
            this.scene.lbl_bbh_value.text = tywx.SystemInfo.version;
        }

        private onClickCheckBox (checkBoxName){
            QDebug.D("checkBox name = " + checkBoxName);
            
            let checkBox = this.scene[checkBoxName];
            QDebug.D("checkBox selected = " + checkBox.selected);  
            let tag = (checkBox.selected) ? "open" : "close";
            if (checkBoxName == "sound_checkBox") {
                QSoundMgr.instance.setSoundOpen(tag);
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SETTING_SOUND_STATE", tag);
            } else if (checkBoxName == "vibrate_checkBox") {
                QSoundMgr.instance.setVibrateOpen(tag);
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SETTING_VIBRATW_STATE", tag);
            }

            tywx.BiLog.clickStat(tywx.clickStatEventType.clickOnTheSoundSwitch,[]);
        }

        private onClickBtnClose():void
        {
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_Setting);
            });
        }
        private onCopyClick():void
        {
            
        }

        private changeNameClick(): void{
            this.scene.user_name.visible = false;
            this.scene.name_inPut.visible = true;
            this.scene.lbl_btn.text = "确定";
            this.scene.changeNameBtn.off(Laya.Event.CLICK,this,this.changeNameClick);
            this.scene.changeNameBtn.on(Laya.Event.CLICK,this,this.changeNameOkClick);
        }

        private changeNameOkClick(): void{
            this.scene.user_name.visible = true;
            this.scene.name_inPut.visible = false;
            this.scene.lbl_btn.text = "修改";
            this.scene.changeNameBtn.off(Laya.Event.CLICK,this,this.changeNameOkClick);
            this.scene.changeNameBtn.on(Laya.Event.CLICK,this,this.changeNameClick);
            if(this.scene.name_inPut.text != ""){
                userName = this.scene.name_inPut.text;
                this.scene.user_name.text = this.getNewNameStr(userName);
                
                if(tywx.UserInfo.userName != this.scene.name_inPut.text){
                    tywx.BiLog.clickStat(tywx.clickStatEventType.modifyTheNickname,[]);
                }
            }
        }

        private detectionOfName(name): boolean{
            if(name == "" || name.length > 15){
                return false;
            }
            return true;
        }

        private getNewNameStr (nameStr) {
            let len = 0;
            let newName = "";
            for (let i = 0; i < nameStr.length; i++) {
                let str = nameStr.charAt(i);
                if (str.match(/[^\x00-\xff]/ig) != null) {
                    len+=2;
                } else {
                    len+=1;
                }
                if (len <= 12) {
                    newName+=str;
                }
            }

            if (newName.length == nameStr.length) {
                return newName;
            }
            return newName+"...";
        }
    }
}
export default game.view.QSetting;
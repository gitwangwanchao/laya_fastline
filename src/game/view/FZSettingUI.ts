import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZSceneManager from "../core/FZSceneManager";

var userName = "";

namespace game.view
{
    export class FZSettingUI extends FZBaseUI
    {
        public scene: ui.view.SettingUI ;

        private soundState: string;
        private vibrateState: string;
        
        public init():void
        {
            this.scene = new ui.view.SettingUI();
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);

            this.soundState = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SETTING_SOUND_STATE", "open");
            this.vibrateState = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SETTING_VIBRATW_STATE", "open");
            
            this.scene.sound_checkBox.selected = this.soundState == "open";
            this.scene.vibrate_checkBox.selected = this.vibrateState == "open";
            
            this.scene.sound_checkBox.on("change", this, this.onClickCheckBox, ["sound_checkBox"]);
            this.scene.vibrate_checkBox.on("change", this, this.onClickCheckBox, ["vibrate_checkBox"]);

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.copyIDBtn, this, this.onCopyClick, ["copyIDBtn"]);

            this.scene.user_id.text = String(FZ.UserInfo.userId);

            let nameStr = this.getNewNameStr(userName ? userName : FZ.UserInfo.userName);
            this.scene.user_name.text = nameStr;
            this.scene.changeNameBtn.off(Laya.Event.CLICK,this,this.changeNameOkClick);
            this.scene.changeNameBtn.on(Laya.Event.CLICK,this,this.changeNameClick);
            this.scene.lbl_bbh_value.text = FZ.SystemInfo.version;
        }

        private onClickCheckBox (checkBoxName){
            FZDebug.D("checkBox name = " + checkBoxName);
            
            let checkBox = this.scene[checkBoxName];
            FZDebug.D("checkBox selected = " + checkBox.selected);  
            let tag = (checkBox.selected) ? "open" : "close";
            if (checkBoxName == "sound_checkBox") {
                FZSoundManager.instance.setSoundOpen(tag);
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SETTING_SOUND_STATE", tag);
            } else if (checkBoxName == "vibrate_checkBox") {
                FZSoundManager.instance.setVibrateOpen(tag);
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SETTING_VIBRATW_STATE", tag);
            }

            FZ.BiLog.clickStat(FZ.clickStatEventType.clickOnTheSoundSwitch,[]);
        }

        private onClickBtnClose():void
        {
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_Setting);
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
                
                if(FZ.UserInfo.userName != this.scene.name_inPut.text){
                    FZ.BiLog.clickStat(FZ.clickStatEventType.modifyTheNickname,[]);
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
export default game.view.FZSettingUI;
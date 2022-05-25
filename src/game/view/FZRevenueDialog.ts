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
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZAdManager from "../core/FZAdManager";
import FZSaveDateManager from "../data/FZSaveDateManager";

namespace game.view
{
    export class FZRevenueDialog extends FZBaseUI
    {
        public scene : ui.view.AddRevenueDialogUI;
        private costType:number;
        private costNum:number;

        private maxTime = 200*13;
        private speed_time:number = 0;
        private addDiamondTime:number = 60;
        private addShareTime:number = 60;

        public registerEvent() : void
        {
            
        }

        public unregisterEvent() : void   
        {
            
        }

        public init():void
        {
            this.scene = new ui.view.AddRevenueDialogUI();

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickBtnClose, ["btnClose"]);
            // FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnSpeedUp, this, this.onClickBtnSpeedUp, ["btnSpeedUp"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnShare, this, this.onClickBtnShare, ["btnShare"]);

            this.share_info = FZCfgManager.instance.getShareCfg();
            this.addDiamondTime = this.share_info.revenueSpeed_time_diamond;
            this.addShareTime = this.share_info.revenueSpeed_time_free;
            this.maxTime = Math.max(this.addDiamondTime, this.addShareTime) * 13;

            let time_str:string = "00:00";
            this.speed_time =  Math.ceil(FZMergeDateManager.instance.getTempSpeedTime()/1000);
            if (this.speed_time >= 60) {
                let min = Math.floor(this.speed_time/60);
                let sec = this.speed_time%60;
                let min_str = (min >= 10) ? min+"" : "0"+min;
                let sec_str = (sec >= 10) ? sec+"" : "0"+sec;
                time_str = min_str + ":" + sec_str;
            } else if (this.speed_time >= 0){
                time_str = (this.speed_time >= 10) ? "00:" + this.speed_time : "00:0" + this.speed_time;
                time_str = "00:" + this.speed_time;
            }

            this.scene.time_pro.value = this.speed_time/this.maxTime;
            this.scene.pro_lbl.text = (this.speed_time != 0) ? time_str : "00:00";
            this.scene.time_pro.changeHandler = Laya.Handler.create(this, this.proChangeHandler, ["time_pro"]);
            if (this.speed_time > 0) {
                Laya.timer.loop(1000, this, this.onChange);
            }

            let isShare = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            // this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
            this.scene.free_type_icon.visible = false;

            this.scene.lbl_diamond_cost.text = this.share_info.speedCost;
            this.scene.lbl_diamond_time.text = "加速"+this.addDiamondTime+"秒";
            this.scene.lbl_free_time.text = "加速"+this.addShareTime+"秒";

            // this.scene.free_type_icon.visible = false;
            this.scene.lbl_free_time.visible = false;
            this.scene.lab_free.visible = false;
            
            var flag =  parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            
            if (flag == 0) {
                this.scene.lab_free.visible = true;
            }else {
                this.scene.free_type_icon.visible = true;
                this.scene.lbl_free_time.visible = true;
            }

            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            // this.scene.ani1.play(0, false);
            this.showNeedleAct();
        }
        private showNeedleAct():void{
            Laya.Tween.to(this.scene.needle,{rotation:30},1600,Laya.Ease.elasticOut,null,200);
        }
        private onChange (): void {
            if (this.speed_time <= 0) {
                this.scene.time_pro.value = 0;
                Laya.timer.clear(this, this.onChange);
                return;
            }

            this.speed_time-=1;
            let time_str:string = "00:00";
            if (this.speed_time >= 60) {
                let min = Math.floor(this.speed_time/60);
                let sec = this.speed_time%60;
                let min_str = (min >= 10) ? min+"" : "0"+min;
                let sec_str = (sec >= 10) ? sec+"" : "0"+sec;
                time_str = min_str + ":" + sec_str;
            } else if (this.speed_time >= 0){
                time_str = (this.speed_time >= 10) ? "00:" + this.speed_time : "00:0" + this.speed_time;
            }
            this.scene.pro_lbl.text = time_str;
            this.scene.time_pro.value = this.speed_time/this.maxTime;
        }

        private proChangeHandler(){

        }

        private onClickBtnClose():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_AddRevenueDialog);
            });
        }
        public share_info:any =null;
        //花费钻石加速
        // private onClickBtnSpeedUp():void
        // {
        //     FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
        //     var game_diamond = FZMergeDateManager.instance.getGameDiamond();
            
        //     if (game_diamond < this.share_info.speedCost) {
        //         FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text:"钻石不足"});
        //         return;
        //     }
        //     //
        //     FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text:"加速时间累计成功"})
        //     FZMergeDateManager.instance.addGameSpeedTime(2,this.addDiamondTime);
        //     FZMergeDateManager.instance.addGameDiamond(-this.share_info.speedCost);
        //     this.resetProShow()
        //     tywx.BiLog.clickStat(tywx.clickStatEventType.userDiamondQuicken,[]);
        // }

        //分享
        private onClickBtnShare():void
        {
            var that = this;
            //TODO
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            var flag =  parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            if(flag == 0) {
                if(this.scene&&this.scene.free_type_icon){
                    this.scene.free_type_icon.visible = true;
                }
                this.scene.lbl_free_time.visible = true;
                this.scene.lab_free.visible = false;
                this.shareCallBack();
                FZSaveDateManager.instance.setItemToLocalStorage("SHOP_FREE_SPEED", "1");
                return;
            }

            var that = this;
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.SpeedUp;
            var isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self: any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(self: any){
                    that.shareCallBack();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, that, function(self: any){
                            self.shareCallBack();
                        }, [that]);
                    }else{
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        shareCallBack(){
            if (this.scene == null) {
                return;
            }
            let isShare = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare == 1 ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text:"加速时间累计成功"});
            FZDebug.D("加速---------------------------------------------------");
            FZDebug.D("加速--------------------------------------------------- = " + this.addShareTime);
            FZMergeDateManager.instance.addGameSpeedTime(5, this.addShareTime);
            this.resetProShow();
            tywx.BiLog.clickStat(tywx.clickStatEventType.userShareOrVideoQuicken,[]);
        }

        resetProShow(){
            this.speed_time =  Math.ceil(FZMergeDateManager.instance.getTempSpeedTime()/1000);
            if (this.scene.time_pro.value == 0) {
                this.onChange();
                Laya.timer.loop(1000, this, this.onChange);
            }
        }
    }
}
export default game.view.FZRevenueDialog;
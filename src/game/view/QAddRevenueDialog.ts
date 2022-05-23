import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QSoundMgr from "../core/QSoundMgr";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QAdManager from "../core/QAdManager";
import QSavedDateItem from "../data/QSavedDateItem";

namespace game.view
{
    export class QAddRevenueDialog extends QBaseUI
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

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickBtnClose, ["btnClose"]);
            // QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnSpeedUp, this, this.onClickBtnSpeedUp, ["btnSpeedUp"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnShare, this, this.onClickBtnShare, ["btnShare"]);

            this.share_info = QCfgMgr.instance.getShareCfg();
            this.addDiamondTime = this.share_info.revenueSpeed_time_diamond;
            this.addShareTime = this.share_info.revenueSpeed_time_free;
            this.maxTime = Math.max(this.addDiamondTime, this.addShareTime) * 13;

            let time_str:string = "00:00";
            this.speed_time =  Math.ceil(QMergeData.instance.getTempSpeedTime()/1000);
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

            let isShare = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            // this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
            this.scene.free_type_icon.visible = false;

            this.scene.lbl_diamond_cost.text = this.share_info.speedCost;
            this.scene.lbl_diamond_time.text = "加速"+this.addDiamondTime+"秒";
            this.scene.lbl_free_time.text = "加速"+this.addShareTime+"秒";

            // this.scene.free_type_icon.visible = false;
            this.scene.lbl_free_time.visible = false;
            this.scene.lab_free.visible = false;
            
            var flag =  parseInt(QSavedDateItem.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            
            if (flag == 0) {
                this.scene.lab_free.visible = true;
            }else {
                this.scene.free_type_icon.visible = true;
                this.scene.lbl_free_time.visible = true;
            }

            QUtil.doUIPopAnim(this.scene.AnchorCenter);
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_AddRevenueDialog);
            });
        }
        public share_info:any =null;
        //花费钻石加速
        // private onClickBtnSpeedUp():void
        // {
        //     QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
        //     var game_diamond = QMergeData.instance.getGameDiamond();
            
        //     if (game_diamond < this.share_info.speedCost) {
        //         QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"钻石不足"});
        //         return;
        //     }
        //     //
        //     QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"加速时间累计成功"})
        //     QMergeData.instance.addGameSpeedTime(2,this.addDiamondTime);
        //     QMergeData.instance.addGameDiamond(-this.share_info.speedCost);
        //     this.resetProShow()
        //     tywx.BiLog.clickStat(tywx.clickStatEventType.userDiamondQuicken,[]);
        // }

        //分享
        private onClickBtnShare():void
        {
            var that = this;
            //TODO
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            var flag =  parseInt(QSavedDateItem.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            if(flag == 0) {
                if(this.scene&&this.scene.free_type_icon){
                    this.scene.free_type_icon.visible = true;
                }
                this.scene.lbl_free_time.visible = true;
                this.scene.lab_free.visible = false;
                this.shareCallBack();
                QSavedDateItem.instance.setItemToLocalStorage("SHOP_FREE_SPEED", "1");
                return;
            }

            var that = this;
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.SpeedUp;
            var isShare = QGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                QWxSDK.instance.fakeShare(param, this, function(self: any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(self: any){
                    that.shareCallBack();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        QWxSDK.instance.fakeShare(param, that, function(self: any){
                            self.shareCallBack();
                        }, [that]);
                    }else{
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        shareCallBack(){
            if (this.scene == null) {
                return;
            }
            let isShare = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare == 1 ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"加速时间累计成功"});
            QDebug.D("加速---------------------------------------------------");
            QDebug.D("加速--------------------------------------------------- = " + this.addShareTime);
            QMergeData.instance.addGameSpeedTime(5, this.addShareTime);
            this.resetProShow();
            tywx.BiLog.clickStat(tywx.clickStatEventType.userShareOrVideoQuicken,[]);
        }

        resetProShow(){
            this.speed_time =  Math.ceil(QMergeData.instance.getTempSpeedTime()/1000);
            if (this.scene.time_pro.value == 0) {
                this.onChange();
                Laya.timer.loop(1000, this, this.onChange);
            }
        }
    }
}
export default game.view.QAddRevenueDialog;
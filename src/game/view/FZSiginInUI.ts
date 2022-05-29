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
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZSceneManager from "../core/FZSceneManager";
namespace game.view
{
    export class FZSiginInUI extends FZBaseUI
    {
        public scene : ui.view.SignInDialogUI;
        public siginCfg: {};
        public sigined: boolean = false;
        public sigin_days: number = 0;
        public weekStartDate: number;
        public siginBehaviorData: {};

        public registerEvent() : void
        {
            // 监听刷新金币
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            // 刷新钻石
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }

        public unregisterEvent() : void   
        {
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }
        /**
         * 刷新金币
         */
        onUpdateGameGold():void 
        {
            var str =  FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;
        }
        /**
         * 刷新钻石
         */
        private onUpdareDiamond():void
        {
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
        }

        public init():void
        {
            this.scene = new ui.view.SignInDialogUI();

            let isAuditVersion = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_get_free, this, this.onClickBtnGetFree, ["btn_get_free"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_get_video, this, this.onClickBtnGetVideo, ["btn_get_video"]);

            this.onUpdateGameGold();
            this.onUpdareDiamond();

            let new_date = new Date();
            
            /*let date = new_date.getDate()   //一月中的某一天(1-31)
            let day = (new_date.getDay() == 0) ? 6 : new_date.getDay() - 1;    //一周中的某一天(0-6) 0-周日
            this.weekStartDate = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_WEEK_START_DATE", "0"));
            this.siginBehaviorData = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0};
            if (!this.weekStartDate || (day == 0 && date != this.weekStartDate)) {    //新的一周
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_WEEK_START_DATE", date+"")
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData));
            } else {
                this.siginBehaviorData = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData)));
            }*/

            let date_str = new_date.toLocaleDateString();
            let local_date_str = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DATE", "0");
            this.sigined = (local_date_str == date_str);
            this.sigin_days = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS", "0"));
     
            if (local_date_str != date_str && this.sigin_days == 7) {
                this.sigin_days = 0;
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_DAYS", "0")
            }

            this.siginCfg = FZCfgManager.instance.getSiginCfg();
            this.showSiginInfo();

            FZUtils.doUIPopAnim(this.scene.AnchorCenter);  //弹窗出现动画更改
            // this.scene.ani1.play(0, false);  //弹窗出现的缓动动画

            if (FZUIManager.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.box_title.y += 70;
                    // this.scene.sign_bg.y += 70;
                });
            }
            if(FZ.clickStatEventType.openSignPanel){
                FZ.BiLog.clickStat(FZ.clickStatEventType.openSignPanel,[]);
            }

            // 延迟 "普通领取" 出现  = 签到 - ( 延迟出现 )
            this.scene.btn_get_free.visible = false;
            var delayTime = FZGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            if(this.sigined == false) {
                Laya.timer.once( delayTime , this , function(){ 
                    this.scene.btn_get_free.visible = true;  
                    FZUtils.doUIPopAnim(this.scene.btn_get_free);
                })
            }
        }

        private showSiginInfo(){
            for (let i = 0; i < 7; i++) {
                var ____index = i+1;
                let info = this.siginCfg[____index + ""];

                let sigine_day_btn = "btn_day_"+i;
                let sigined_day_name = "lbl_day_"+i;
                let sigined_icon_name = "sign_finished_"+i;
                let can_sigin_img = "can_sign_"+i;

                if (i < this.sigin_days) {
                    this.scene[sigined_day_name].text = "已领取";
                    this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = true);
                    //this.scene[sigine_day_btn].skin = "ui_main/sign_day_btn_1.png";
                    this.scene[can_sigin_img].visible = false;
                    this.scene[sigine_day_btn].alpha = 0.5
                } else if (i == this.sigin_days && !this.sigined) {
                    this.scene[sigined_day_name].text = "可领取";
                    this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = false);
                    // this.scene[sigine_day_btn].skin = "ui_main/sign_day_btn_2.png";
                    this.scene[can_sigin_img].visible = true;
                    this.scene[sigine_day_btn].alpha = 1
                } else {
                    this.scene[sigined_day_name].text = "第"+(i+1)+"天";
                    this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = false);
                    //this.scene[sigine_day_btn].skin = "ui_main/sign_day_btn_1.png";
                    this.scene[can_sigin_img].visible = false;
                    this.scene[sigine_day_btn].alpha = 1
                }

                let reward_count = "lbl_reward_count_"+i;
                this.scene[reward_count].text = "x"+info.reward;
            }

            this.scene.btn_get_free.visible = !this.sigined;
            this.scene.btn_get_video.visible = !this.sigined;
            this.scene.lbl_des_signed_0.visible = this.sigined;
            this.scene.lbl_des_signed_1.visible = this.sigined;

            /*for (let i = 1; i <= 7; i++) {
                let info = this.siginCfg[i];

                let sigined_day_name = "lbl_day_"+(i-1);
                if (this.siginBehaviorData[i]) {
                    this.scene[sigined_day_name].text = "已领取";
                } else {
                    let new_date = new Date();
                    let day = (new_date.getDay() == 0) ? 6 : new_date.getDay() - 1;    //一周中的某一天(0-6) 0-周日
                    this.scene[sigined_day_name].text = ((day+1) == i) ? "可领取" : "第"+i+"天";
                }

                let count_name = "lbl_reward_count_"+(i-1);
                this.scene[count_name].text = info.reward;
                
                let sigined_icon_name = "sign_finished_"+(i-1);
                this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = !!this.siginBehaviorData[i]);
            }*/
        }

        private onClickBtnClose(){
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_SignInDialog);
            });
        }

        private onClickBtnGetFree () {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            this.onSigin("free");
        }

        private onClickBtnGetVideo () {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let isShare = FZGameData.instance.getShareOrVideo();
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.DoubleSign;
            // if (isShare == 1){
            //     // 分享
            //     FZWechat.instance.fakeShare(param, this, function(self : any){
            //         self.onSigin("video");
            //     }, [this])
            // } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.onSigin("video");
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        if(this.scene&&this.scene.free_type_icon){
                            this.scene.free_type_icon.skin = "ui_common/free_share_icon.png";
                        }
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.onSigin("video");
                        }, [this])
                    }else if (value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            // }
        }

        private onSigin(tag: string){
            if (this.scene == null) {
                return;
            }
            if(tag == "free"&&FZ.clickStatEventType.normalSignReward){
                FZ.BiLog.clickStat(FZ.clickStatEventType.normalSignReward,[]);
            }else if(tag == "video"&&FZ.clickStatEventType.doubleSignReward){
                FZ.BiLog.clickStat(FZ.clickStatEventType.doubleSignReward,[]);
            }

            this.scene.btn_get_free.visible = false;
            this.scene.btn_get_video.visible = false;
            this.scene.lbl_des_signed_0.visible = true;
            this.scene.lbl_des_signed_1.visible = true;

            let sigined_day_name = "lbl_day_"+this.sigin_days;
            let sigined_icon_name = "sign_finished_"+this.sigin_days;
            let can_sigin_img = "can_sign_"+this.sigin_days;
            let sigine_day_btn = "btn_day_"+this.sigin_days;
            let lbl_reward_count = "lbl_reward_count_"+this.sigin_days;
            this.scene[sigined_day_name].text = "已领取";
            this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = true);
            this.scene[can_sigin_img].visible = false;
            //this.scene[sigine_day_btn].skin = "ui_main/sign_day_btn_1.png";
            var ___days = this.sigin_days+1
            let reward = (tag == "free") ? this.siginCfg[___days + ""].reward : this.siginCfg[___days].multiple_reward;
            FZMergeDateManager.instance.addGameDiamond(reward);
            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得钻石"+ reward});

            this.sigin_days++;
            if (this.sigin_days==7){
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_DAYS_GREATER_7", "1");
            }
            

            FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_DAYS", this.sigin_days.toString());

            let new_date = new Date();
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_DATE", new_date.toLocaleDateString());

            /*
            let day = (new_date.getDay() == 0) ? 6 : new_date.getDay() - 1;    //一周中的某一天(0-6) 0-周日
            if (!!this.siginBehaviorData[day+1]) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text:"今日已签到"})
                return;
            }

            let sigined_icon_name = "sign_finished_"+day;
            this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = true);
            let sigined_day_name = "lbl_day_"+day;
            this.scene[sigined_day_name].text = "已领取";

            this.siginBehaviorData[day+1] = 1;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData));*/

            FZEventManager.instance.sendEvent(FZEvent.MAIN_UPDATE_SIGIN_NOTICE);

            if(tag == "free")
            {
                FZGameData.instance.playResFlyAni(this.scene[lbl_reward_count],this.scene.title_diamond,{type: 2,countType: 0}, this.OpenGetWard.bind(this));
                FZ.BiLog.clickStat(FZ.clickStatEventType.successComDailyCheck,[]);
            }
            else
            {
                FZGameData.instance.playResFlyAni(this.scene[lbl_reward_count],this.scene.title_diamond,{type: 2,countType: 1}, this.OpenGetWard.bind(this));
                FZ.BiLog.clickStat(FZ.clickStatEventType.successDoubleDailyCheck,[]);

            }
        }   
        /**
         * 打开再来一份
         */
        private OpenGetWard()
        {
            FZUIManager.instance.addWaitUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.diamond);
            FZUIManager.instance.removeUI(FZUIManager.UI_SignInDialog);
        }
    }
}
export default game.view.FZSiginInUI;
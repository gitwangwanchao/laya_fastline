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
import QSavedDateItem from "../data/QSavedDateItem";
import QSoundMgr from "../core/QSoundMgr";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QSceneMgr from "../core/QSceneMgr";
namespace game.view
{
    export class QSignInDialog extends QBaseUI
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
            QEventMgr.instance.register(QEventType.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            // 刷新钻石
            QEventMgr.instance.register(QEventType.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }

        public unregisterEvent() : void   
        {
            QEventMgr.instance.unregister(QEventType.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            QEventMgr.instance.unregister(QEventType.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }
        /**
         * 刷新金币
         */
        onUpdateGameGold():void 
        {
            var str =  QUtil.formatNumberStr(QMergeData.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;
        }
        /**
         * 刷新钻石
         */
        private onUpdareDiamond():void
        {
            var count = QMergeData.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = QUtil.formatNumberStr(count+"");
        }

        public init():void
        {
            this.scene = new ui.view.SignInDialogUI();

            let isAuditVersion = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_get_free, this, this.onClickBtnGetFree, ["btn_get_free"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_get_video, this, this.onClickBtnGetVideo, ["btn_get_video"]);

            this.onUpdateGameGold();
            this.onUpdareDiamond();

            let new_date = new Date();
            
            /*let date = new_date.getDate()   //一月中的某一天(1-31)
            let day = (new_date.getDay() == 0) ? 6 : new_date.getDay() - 1;    //一周中的某一天(0-6) 0-周日
            this.weekStartDate = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_WEEK_START_DATE", "0"));
            this.siginBehaviorData = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0};
            if (!this.weekStartDate || (day == 0 && date != this.weekStartDate)) {    //新的一周
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_WEEK_START_DATE", date+"")
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData));
            } else {
                this.siginBehaviorData = JSON.parse(QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData)));
            }*/

            let date_str = new_date.toLocaleDateString();
            let local_date_str = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_DATE", "0");
            this.sigined = (local_date_str == date_str);
            this.sigin_days = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS", "0"));
     
            if (local_date_str != date_str && this.sigin_days == 7) {
                this.sigin_days = 0;
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_DAYS", "0")
            }

            this.siginCfg = QCfgMgr.instance.getSiginCfg();
            this.showSiginInfo();

            QUtil.doUIPopAnim(this.scene.AnchorCenter);  //弹窗出现动画更改
            // this.scene.ani1.play(0, false);  //弹窗出现的缓动动画

            if (QUIMgr.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.box_title.y += 70;
                    // this.scene.sign_bg.y += 70;
                });
            }
            if(tywx.clickStatEventType.openSignPanel){
                tywx.BiLog.clickStat(tywx.clickStatEventType.openSignPanel,[]);
            }

            // 延迟 "普通领取" 出现  = 签到 - ( 延迟出现 )
            this.scene.btn_get_free.visible = false;
            var delayTime = QGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            if(this.sigined == false) {
                Laya.timer.once( delayTime , this , function(){ 
                    this.scene.btn_get_free.visible = true;  
                    QUtil.doUIPopAnim(this.scene.btn_get_free);
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_SignInDialog);
            });
        }

        private onClickBtnGetFree () {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            this.onSigin("free");
        }

        private onClickBtnGetVideo () {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let isShare = QGameData.instance.getShareOrVideo();
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.DoubleSign;
            // if (isShare == 1){
            //     // 分享
            //     QWxSDK.instance.fakeShare(param, this, function(self : any){
            //         self.onSigin("video");
            //     }, [this])
            // } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.onSigin("video");
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        if(this.scene&&this.scene.free_type_icon){
                            this.scene.free_type_icon.skin = "ui_common/free_share_icon.png";
                        }
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.onSigin("video");
                        }, [this])
                    }else if (value == 0) {
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            // }
        }

        private onSigin(tag: string){
            if (this.scene == null) {
                return;
            }
            if(tag == "free"&&tywx.clickStatEventType.normalSignReward){
                tywx.BiLog.clickStat(tywx.clickStatEventType.normalSignReward,[]);
            }else if(tag == "video"&&tywx.clickStatEventType.doubleSignReward){
                tywx.BiLog.clickStat(tywx.clickStatEventType.doubleSignReward,[]);
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
            QMergeData.instance.addGameDiamond(reward);
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得钻石"+ reward});

            this.sigin_days++;
            if (this.sigin_days==7){
                QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_DAYS_GREATER_7", "1");
            }
            

            QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_DAYS", this.sigin_days.toString());

            let new_date = new Date();
            QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_DATE", new_date.toLocaleDateString());

            /*
            let day = (new_date.getDay() == 0) ? 6 : new_date.getDay() - 1;    //一周中的某一天(0-6) 0-周日
            if (!!this.siginBehaviorData[day+1]) {
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"今日已签到"})
                return;
            }

            let sigined_icon_name = "sign_finished_"+day;
            this.scene[sigined_icon_name] && (this.scene[sigined_icon_name].visible = true);
            let sigined_day_name = "lbl_day_"+day;
            this.scene[sigined_day_name].text = "已领取";

            this.siginBehaviorData[day+1] = 1;
            QSavedDateItem.instance.setItemToLocalStorage("GAME_SIGIN_BEHAVIOR_DATA", JSON.stringify(this.siginBehaviorData));*/

            QEventMgr.instance.sendEvent(QEventType.MAIN_UPDATE_SIGIN_NOTICE);

            if(tag == "free")
            {
                QGameData.instance.playResFlyAni(this.scene[lbl_reward_count],this.scene.title_diamond,{type: 2,countType: 0}, this.OpenGetWard.bind(this));
                tywx.BiLog.clickStat(tywx.clickStatEventType.successComDailyCheck,[]);
            }
            else
            {
                QGameData.instance.playResFlyAni(this.scene[lbl_reward_count],this.scene.title_diamond,{type: 2,countType: 1}, this.OpenGetWard.bind(this));
                tywx.BiLog.clickStat(tywx.clickStatEventType.successDoubleDailyCheck,[]);

            }
        }   
        /**
         * 打开再来一份
         */
        private OpenGetWard()
        {
            QUIMgr.instance.addWaitUI(QUIMgr.UI_FreeGoldGet,QGameConst.QCurrencyType.diamond);
            QUIMgr.instance.removeUI(QUIMgr.UI_SignInDialog);
        }
    }
}
export default game.view.QSignInDialog;
import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZSoundManager from "../core/FZSoundManager";
import FZGameData from "../data/FZGameData";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";

namespace game.view
{
    export class FZGongXingHuoDeUI extends FZBaseUI
    {
        public scene: ui.view.CongratulationGetViewUI ;

        private itemType: number = 1;       //1-金币  2-钻石  3-赛车
        private getType: number = 1;        //1-直接获得  2-分享或视频
        private getValue: number = 0;
        private guideState:boolean=false;
        
        public init():void
        {
            this.scene = new ui.view.CongratulationGetViewUI();
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            this.scene.ani1.play(0, true);
            this.scene.zOrder = 6;
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickBtnClsoe, ["btnClose"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnConfirm, this, this.onClickBtnConfirm, ["btnConfirm"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnVideo, this, this.onClickBtnConfirm, ["btnVideo"]);

            if (FZUIManager.instance.longScreen()) {
                this.scene.btnClose.y+=70;
                this.scene.title_img.y+=70;
            }
            
            // 延迟关闭按钮出现 - ( 延迟出现 )
            this.scene.btnClose.visible = false;
            var delayTime = FZGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            Laya.timer.once( delayTime , this , function(){ 
                this.scene.btnClose.visible = true;  
            })
        }

        /*
         * itemType 0-转盘奖励倍数  1-金币  2-钻石  3-美钞
         * itemDes
         * itemValue
         * getType  1-直接获得  2-分享或视频
        */
        public setParam(param: any):void
        {
            let iconType = {0: "ui_main/show_get_times_3.png", 1: "ui_main/ui_icon_golds.png",2: "ui_main/rotary_icon_4.png",3: "ui_game/game_dollar.png"};
            let icon_skin = iconType[param.itemType];
            if (param.itemType == 0) {
                icon_skin = (param.itemValue == 3) ? icon_skin : "ui_main/show_get_times_6.png"
                //翻倍奖励的时候图片位置适配
                this.scene.item_icon.scale(0.8, 0.8);
                this.scene.item_icon.y -= 50;
            }else{
                this.scene.item_icon.scale(1, 1);
                this.scene.item_icon.y = 480;
            }
            this.scene.item_icon.skin = icon_skin;
            this.scene.item_name.text = param.itemDes;
            
            this.scene.dia_tip.visible = param.itemType == 2;
            this.itemType = param.itemType;
            this.getType = param.getType;
            this.getValue = param.itemValue;

            this.scene.btnConfirm.visible = (this.getType == 1);
            this.scene.btnVideo.visible = (this.getType == 2);

            this.guideState = FZGameData.instance.newPlayerGudieStep(null)==FZGameStatus.NumForGuide.synthetic&&FZGameData.instance.getMaxCheckPoint()<3;
            if(this.guideState){
                this.scene.guide_click.visible = true;
                this.scene.guide_hand.visible = true;
                this.scene.guide_ani.play(0,true);
            }
            

            if (this.getType == 2) {
                let isShare = FZGameData.instance.getShareOrVideo();
                if(this.scene&&this.scene.free_type_icon){
                    this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
                }
            }
        }
        public onDestroy() : void{
            if(this.guideState){
                // FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
                FZEventManager.instance.sendEvent(FZEvent.CONTIMUE_GUIDE_ENTER);
            }
        }
        private onClickBtnClsoe():void
        {
            if(this.scene.guide_click.visible){
                this.scene.guide_click.visible = false;
                this.scene.guide_hand.visible = false;
                this.scene.guide_ani.gotoAndStop(0);
            }
            if (this.getType == 1 && (this.itemType == 1 || this.itemType == 2)) {
                if (this.itemType == 1) {
                    FZMergeDateManager.instance.addGameGold(this.getValue+"");
                } else {
                    FZMergeDateManager.instance.addGameDiamond(this.getValue);
                }
                FZEventManager.instance.sendEvent(FZEvent.GAME_FLYRES_CTRL,{target: this.scene.item_icon, itemType: this.itemType});
            }
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_CongratulationGet);
            });
        }

        private onClickBtnConfirm():void
        {
            if(this.scene.guide_click.visible){
                this.scene.guide_click.visible = false;
                this.scene.guide_hand.visible = false;
                this.scene.guide_ani.gotoAndStop(0);
            }
            if (this.getType == 1) {
                if(this.itemType == 1 || this.itemType == 2 || this.itemType == 3) {
                    if (this.itemType == 1) {
                        FZMergeDateManager.instance.addGameGold(this.getValue+"");
                    } else if(this.itemType == 2){
                        FZMergeDateManager.instance.addGameDiamond(this.getValue);
                    }else{  //美钞
                        FZGameData.instance.addWeaponsCoin(this.getValue);
                    }
                    FZEventManager.instance.sendEvent(FZEvent.GAME_FLYRES_CTRL, {target: this.scene.item_icon, itemType: this.itemType});
                }
                FZUtils.doUICloseAnim(this.scene.AnchorCenter);
                Laya.timer.once(310, this, function(){
                    FZUIManager.instance.removeUI(FZUIManager.UI_CongratulationGet);
                });
            } 
            else {
                let param = FZShareInfo.create();
                param.shareType = FZGameStatus.FZShareType.LuckyDraw;
                var isShare = FZGameData.instance.getShareOrVideo();
                if (isShare){
                    // 分享
                    FZWechat.instance.fakeShare(param, this, function(self: any){
                        self.successGet();
                    }, [this])
                } else {
                    // 视频
                    FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                        this.successGet();
                    }), Laya.Handler.create(this, function(value){
                        if(Laya.Browser.onMiniGame&&value == 1){
                            FZWechat.instance.fakeShare(param, this, function(self: any){
                                this.successGet();
                            }, [this]);
                        }else{
                            FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                        }
                    }));
                }
            }
        }

        successGet(){
            switch (this.itemType) {
                case 0:     //转盘翻倍
                    FZEventManager.instance.sendEvent(FZEvent.UPDATE_NEXT_REWARD_TIMES, this.getValue);
                    break;
                case 1:     //金币
                    FZMergeDateManager.instance.addGameGold(this.getValue+"");
                    if (this.scene) {
                        FZEventManager.instance.sendEvent(FZEvent.GAME_FLYRES_CTRL, {target: this.scene.item_icon, itemType: 1});
                    }
                    return;
                case 2:     //钻石              
                    FZMergeDateManager.instance.addGameDiamond(this.getValue);
                    if (this.scene) {
                        FZEventManager.instance.sendEvent(FZEvent.GAME_FLYRES_CTRL, {target: this.scene.item_icon, itemType: 2});  
                    }
                    break;
                case 3:     //赛车
                    FZEventManager.instance.sendEvent(FZEvent.GAME_ADD_ITEM_CAR_COUNT, this.getValue);
                    break;
            }
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_CongratulationGet);
            });
        }
    }
}
export default game.view.FZGongXingHuoDeUI;
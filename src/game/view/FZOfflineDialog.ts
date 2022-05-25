import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZGameStatus from "../data/FZGameStatus";
import FZGameData from "../data/FZGameData";
import FZCfgManager from "../core/FZCfgManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import QBIEvent from "../data/QBIEvent";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZSoundManager from "../core/FZSoundManager";

namespace game.view
{
    export class FZOfflineDialog extends FZBaseUI
    {
        public scene:ui.view.BeOfflineDialogUI;
        private gameConfig:any
        private carConfig:any
        private gold_count:number = 0;

        public registerEvent() : void
        {
            // FZEventManager.instance.register(FZEvent.PUSH_VIDEO_AD_FAIL, this.videoInequacyToShare, this);
        }

        public unregisterEvent() : void   
        {
            // FZEventManager.instance.unregister(FZEvent.PUSH_VIDEO_AD_FAIL, this.videoInequacyToShare, this);
        }

        public init():void
        {
            this.scene = new ui.view.BeOfflineDialogUI();
            this.scene.zOrder = 2000;

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnGet, this, this.onClickBtnAward, ["btnGet"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnDouble, this, this.onClickBtnAwardDouble, ["btnClose"]);
            
            var isShare = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);  // 弹窗动画效果更改

            // 延迟 "普通领取"  离线收益 - ( 延迟出现 )
            this.scene.btnGet.visible = false;
            var delayTime = FZGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            Laya.timer.once( delayTime , this , function(){ 
                this.scene.btnGet.visible = true;
                FZUtils.doUIPopAnim(this.scene.btnGet);
            });
            // this.scene.btnDoubleMove.play(0, false);  //按钮出现的缓动动画
        }

        /**@override */
        public setParam(param: any)
        {
            FZDebug.D("离线-------------------------   " + JSON.stringify(param));
            this.gold_count = Math.floor(param.gold);
            
            this.refreshUI()
        }

        private refreshUI()
        {
            
            this.scene.lblCoinCount.text = "+"+ FZUtils.formatNumberStr(this.gold_count + "")
            // this.scene.lblMaxDes.visible = true;
            //this.scene.lblMaxDes.text = "离线奖励上限为"+ FZCfgManager.instance.getOffLineEarningsTime()+ "小时";
        }

        private onClickClose() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_BeOffline);
            });
        }

        private onClickBtnAward()
		{
            FZMergeDateManager.instance.addGameGold(this.gold_count + "");
            FZUIManager.instance.removeUI(FZUIManager.UI_BeOffline);
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.siginGetDiamond);
            FZGameData.instance.playResFlyAni(null,null,{type: 1,countType: 0},null);
            tywx.BiLog.clickStat(tywx.clickStatEventType.getCommonOffLineAward,[]);
        }

        private onClickBtnAwardDouble()
        {
            //TODO
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.OfflineCoin;
            let isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, ()=>{
                    this.shareCallBack();
                }),Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this])
                    }else if(value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        public shareCallBack(){
            //若成功
            var gold = this.gold_count * 2;
            FZMergeDateManager.instance.addGameGold(gold + "");
            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得金币"+ FZUtils.formatNumberStr(this.gold_count*2 + "")});
            FZUIManager.instance.removeUI(FZUIManager.UI_BeOffline);
            FZGameData.instance.playResFlyAni(null,null,{type: 1,countType: 1},null);
            tywx.BiLog.clickStat(tywx.clickStatEventType.getDoubleOffLineAward,[]);
        }

        public doDestroy():void
        {

        }

        // private videoInequacyToShare(shareType:any):void
        // {
        //     if(!FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.GameConfig].SafeMode && shareType.shareType== FZGameStatus.FZShareType.OfflineCoin)
        //     {
        //         let shareParam = FZShareInfo.create();
        //         shareParam.shareType = FZGameStatus.FZShareType.OfflineCoin;
        //         FZWechat.instance.fakeShare(shareParam,this,()=>
        //         {
        //             this.onSuccessGet();
        //         });
        //     }
        // }

        public onSuccessGet():void
        {
            //视频具体给多少金币待定TODO
            // FZGameData.instance.addCoin(this.coin);
            // FZUIManager.instance.removeUI(FZUIManager.UI_CommonPage,true);
            // FZUIManager.instance.createUI(FZUIManager.UI_SimpleDialog,
            // {
            //     coinNum:FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.GameConfig].LackofCoin_FixedValue,
            //     caller:this,
            //     closeCallback:()=>{
            //         FZUIManager.instance.removeUI(FZUIManager.UI_SimpleDialog,true);
            //     }
            // })
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.siginGetDiamond);
        }
    }
}
export default game.view.FZOfflineDialog;
import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QDebug from "../../framework/QDebug";
import QGameConst from "../data/QGameConst";
import QGameData from "../data/QGameData";
import QCfgMgr from "../core/QCfgMgr";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QBIEvent from "../data/QBIEvent";
import QMergeData from "../data/QMergeData";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QSoundMgr from "../core/QSoundMgr";

namespace game.view
{
    export class QBeOfflineDialog extends QBaseUI
    {
        public scene:ui.view.BeOfflineDialogUI;
        private gameConfig:any
        private carConfig:any
        private gold_count:number = 0;

        public registerEvent() : void
        {
            // QEventMgr.instance.register(QEventType.PUSH_VIDEO_AD_FAIL, this.videoInequacyToShare, this);
        }

        public unregisterEvent() : void   
        {
            // QEventMgr.instance.unregister(QEventType.PUSH_VIDEO_AD_FAIL, this.videoInequacyToShare, this);
        }

        public init():void
        {
            this.scene = new ui.view.BeOfflineDialogUI();
            this.scene.zOrder = 2000;

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnGet, this, this.onClickBtnAward, ["btnGet"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnDouble, this, this.onClickBtnAwardDouble, ["btnClose"]);
            
            var isShare = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            QUtil.doUIPopAnim(this.scene.AnchorCenter);  // 弹窗动画效果更改

            // 延迟 "普通领取"  离线收益 - ( 延迟出现 )
            this.scene.btnGet.visible = false;
            var delayTime = QGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            Laya.timer.once( delayTime , this , function(){ 
                this.scene.btnGet.visible = true;
                QUtil.doUIPopAnim(this.scene.btnGet);
            });
            // this.scene.btnDoubleMove.play(0, false);  //按钮出现的缓动动画
        }

        /**@override */
        public setParam(param: any)
        {
            QDebug.D("离线-------------------------   " + JSON.stringify(param));
            this.gold_count = Math.floor(param.gold);
            
            this.refreshUI()
        }

        private refreshUI()
        {
            
            this.scene.lblCoinCount.text = "+"+ QUtil.formatNumberStr(this.gold_count + "")
            // this.scene.lblMaxDes.visible = true;
            //this.scene.lblMaxDes.text = "离线奖励上限为"+ QCfgMgr.instance.getOffLineEarningsTime()+ "小时";
        }

        private onClickClose() {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_BeOffline);
            });
        }

        private onClickBtnAward()
		{
            QMergeData.instance.addGameGold(this.gold_count + "");
            QUIMgr.instance.removeUI(QUIMgr.UI_BeOffline);
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.siginGetDiamond);
            QGameData.instance.playResFlyAni(null,null,{type: 1,countType: 0},null);
            tywx.BiLog.clickStat(tywx.clickStatEventType.getCommonOffLineAward,[]);
        }

        private onClickBtnAwardDouble()
        {
            //TODO
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.OfflineCoin;
            let isShare = QGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                QWxSDK.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, ()=>{
                    this.shareCallBack();
                }),Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this])
                    }else if(value == 0) {
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        public shareCallBack(){
            //若成功
            var gold = this.gold_count * 2;
            QMergeData.instance.addGameGold(gold + "");
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得金币"+ QUtil.formatNumberStr(this.gold_count*2 + "")});
            QUIMgr.instance.removeUI(QUIMgr.UI_BeOffline);
            QGameData.instance.playResFlyAni(null,null,{type: 1,countType: 1},null);
            tywx.BiLog.clickStat(tywx.clickStatEventType.getDoubleOffLineAward,[]);
        }

        public doDestroy():void
        {

        }

        // private videoInequacyToShare(shareType:any):void
        // {
        //     if(!QCfgMgr.instance.dicConfig[QGameConst.QCfgType.GameConfig].SafeMode && shareType.shareType== QGameConst.QShareType.OfflineCoin)
        //     {
        //         let shareParam = QShareParam.create();
        //         shareParam.shareType = QGameConst.QShareType.OfflineCoin;
        //         QWxSDK.instance.fakeShare(shareParam,this,()=>
        //         {
        //             this.onSuccessGet();
        //         });
        //     }
        // }

        public onSuccessGet():void
        {
            //视频具体给多少金币待定TODO
            // QGameData.instance.addCoin(this.coin);
            // QUIMgr.instance.removeUI(QUIMgr.UI_CommonPage,true);
            // QUIMgr.instance.createUI(QUIMgr.UI_SimpleDialog,
            // {
            //     coinNum:QCfgMgr.instance.dicConfig[QGameConst.QCfgType.GameConfig].LackofCoin_FixedValue,
            //     caller:this,
            //     closeCallback:()=>{
            //         QUIMgr.instance.removeUI(QUIMgr.UI_SimpleDialog,true);
            //     }
            // })
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.siginGetDiamond);
        }
    }
}
export default game.view.QBeOfflineDialog;
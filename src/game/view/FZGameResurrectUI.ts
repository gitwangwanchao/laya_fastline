
import FZBaseUI from "../core/FZBaseUI";
import FZSoundManager from "../core/FZSoundManager";
import FZUIManager from "../core/FZUIManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZGameStatus from "../data/FZGameStatus";
import { ui } from "../../ui/layaMaxUI";
import FZGameData from "../data/FZGameData";
import FZUtils from "../../framework/FZUtils";

namespace game.view
{
    export class FZGameResurrectUI extends FZBaseUI
    {
        public scene: ui.view.GameResurrectViewUI ;
        public VideoTime :any = 3;
        private freeResurrect:boolean = false;
        private nowCheckPoint:number;
        public init():void
        {
            this.scene = new ui.view.GameResurrectViewUI();

            if(FZUIManager.instance.longScreen()){
                this.scene.box_resurrect.y += 70
                if(FZGameData.instance.getCheckPoint() < 3){
                    this.scene.box_resurrect.y += 140;
                }
            }
            this.nowCheckPoint = FZGameData.instance.getCheckPoint()
            this.VideoTime = 3;
            this.onVideoTime();
            if(this.nowCheckPoint>2){
                Laya.timer.loop(1000, this, this.onVideoTime)
            }else{
                this.scene.label_time.visible = false;
                this.freeResurrect = true;
            }
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_resurrect, this, this.startResurrect,[]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_free, this, this.shareCallBack,[]);
            // this.scene.btn_cancel.visible = false;
            // FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_cancel, this, this.onClose,[]);  
            FZUtils.doUIPopAnim(this.scene.box_resurrect);
        }
        public setParam(param){
            this.scene.btn_resurrect.visible = false;
            this.scene.btn_free.visible = false;
            let stepIdx  = FZGameData.instance.newPlayerGudieStep(null);
            if(stepIdx   == 1||this.freeResurrect){
                this.scene.btn_free.visible = true;
                this.scene.btn_free.y -= 150;
            }else{
                this.scene.btn_resurrect.visible = true;
                var isShare = FZGameData.instance.getShareOrVideo();
                this.scene.img_share.skin = isShare ?  "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            }
        }
        /**
         * 复活界面倒计时
         */
        public onVideoTime(){
            if (this.VideoTime == -1) {
                Laya.timer.clear(this, this.onVideoTime);
                this.onClose();
                // 失败界面
                return;
            }
            if(this.scene&&this.scene.label_time){
                this.scene.label_time.text = this.VideoTime + "";
            }
            this.VideoTime -= 1;
        }

        
        /**
         * 复活按钮
         */
        public startResurrect() {
            Laya.timer.clear(this, this.onVideoTime);
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.Revive;
            var isShare = FZGameData.instance.getShareOrVideo();
            var self = this;
            if(isShare == true) {
                FZWechat.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this], function() {
                    if(self) {
                        FZEventManager.instance.register(FZEvent.SHARE_FAIL_CALLBACK,self.shareFailCallBack,self)
                        // // 分享失败
                        // Laya.timer.loop(1000, self, self.onVideoTime);
                    }
                })
            }else {
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this], function() {
                            if(self) {
                                FZEventManager.instance.register(FZEvent.SHARE_FAIL_CALLBACK,self.shareFailCallBack,self)
                                // // 分享失败
                                // Laya.timer.loop(1000, self, self.onVideoTime);
                            }
                        })
                    }else if (value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                        // 视频取消
                        Laya.timer.loop(1000, self, self.onVideoTime);
                    }
                }));
            }
        }

        public shareFailCallBack(){
            // 分享失败
            FZEventManager.instance.unregister(FZEvent.SHARE_FAIL_CALLBACK,this.shareFailCallBack,this)
            Laya.timer.loop(1000, this, this.onVideoTime);
        }
        public onClose(){
            Laya.timer.clearAll(this);
            FZUIManager.instance.removeUI(FZUIManager.UI_GameResurrectView);
            FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_RESURRECT_FAIL);
        }

        public shareCallBack(){
            Laya.timer.clearAll(this);
            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "复活成功"});
            FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_RESURRECT_START)
            FZUIManager.instance.removeUI(FZUIManager.UI_GameResurrectView);
            let gq = Number(FZGameData.instance.getCheckPoint());
            FZ.BiLog.clickStat(FZ.clickStatEventType.successRevive,[gq]);
            FZGameData.instance.game_revive_times++;
        }
    
    }
    
    
}
export default game.view.FZGameResurrectUI;
import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZAdManager from "../core/FZAdManager";
import FZGameData from "../data/FZGameData";
import FZSaveDateManager from "../data/FZSaveDateManager";


namespace game.view
{
    export class FZFreeGold extends FZBaseUI
    {
        public scene: ui.view.FreeGoldGetUI;

        public carConfig: any;
        public freeValue: string;
        public freeGetCount: number = 0;
        
        public resType: number;
        public dollarGetCount: number = 0;
        public dollarValue: number;
        
        public init():void
        {
            this.scene = new ui.view.FreeGoldGetUI();
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            // this.scene.ani1.play(0, false);
        }

        public setParam(param: any): void{
            var isShare = FZGameData.instance.getShareOrVideo();
            if(this.scene&&this.scene.free_type_icon){
                this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            }
            this.resType = param;

            this.scene.dollar_img.visible = false;
            this.scene.gold_img.visible   = false;
            this.scene.diamond_img.visible   = false;

            // 延迟关闭按钮出现 - ( 延迟出现 )
            this.scene.btn_close.visible = false;  // 关闭按钮初始 关闭
            // this.scene.bg_image.y =300;
            var delayTime = FZGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            Laya.timer.once( delayTime , this , function(){
                this.scene.btn_close.visible = true;  
            })

            if(param == FZGameStatus.QCurrencyType.gold){
                this.scene.gold_img.visible = true;
                this.scene.type_tip.text    = "快来领取海量金币!";
                this.scene.lbl_title.text   = "免费金币";
                this.getGoldFuc();
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideo, ["btn_video"]);
            }
            if(param == FZGameStatus.QCurrencyType.dollar){
                this.scene.dollar_img.visible = true;
                this.scene.type_tip.text    = "快来领取海量美钞!";
                this.scene.lbl_title.text   = "免费美钞";
                this.getDollarFuc();
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideo, ["btn_video"]);
            }
            if (param == FZGameStatus.QCurrencyType.diamond) {
                if(this.scene&&this.scene.free_type_icon){
                    this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
                }
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideoAgain, []);
                this.scene.diamond_img.visible   = true;
                this.scene.type_tip.text    = "快来领取海量钻石!";
                this.scene.lbl_title.text   = "再来一份惊喜?";
                this.getDiamondFuc();

                // 延迟关闭按钮出现 - ( 延迟出现 )
                this.scene.btn_close.visible = false;
                var delayTime = FZGameData.instance.delay_show_time;
                if( ! delayTime ){
                    delayTime = 2000;
                }
                var self = this;
                Laya.timer.once(delayTime, this, function(){
                    self.scene.btn_close.visible = true;
                    FZUtils.doUIPopAnim(self.scene.btn_close);
                });
            }
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_game, this, this.onClickBtnGame, ["btn_game"]);
            if(this.resType == FZGameStatus.QCurrencyType.gold&&FZ.clickStatEventType.freeGoldPanel){
                FZ.BiLog.clickStat(FZ.clickStatEventType.freeGoldPanel,[]);
            }else if(this.resType == FZGameStatus.QCurrencyType.dollar&&FZ.clickStatEventType.freeCashpanel){
                FZ.BiLog.clickStat(FZ.clickStatEventType.freeCashpanel,[]);
            }
        }
        /**
         * 刷新界面
         */
        // 钻石
        public diamondValue:number = 0;
        private getDiamondFuc() 
        {
            var sigin_days = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS", "0"));
            var sigin_data = FZCfgManager.instance.getSiginCfg();
            this.diamondValue = sigin_data[sigin_days+""].reward;
            this.scene.lbl_gold.text = FZUtils.formatNumberStr(this.diamondValue + "");
        }

        private getGoldFuc()
        {
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let freeGoldDate = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_FREE_GOLD_GET_DATE", "0");
            if (date_str != freeGoldDate) {
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_DATE", date_str);
                this.freeGetCount = 0;
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_COUNT", "0");
            } else {
                this.freeGetCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_FREE_GOLD_GET_COUNT", "0"));
            }

            let curCarMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();
            let unLockCoinLevel = curCarMaxLevel;
            this.carConfig = FZCfgManager.instance.getRoadsideCarList();
            for(let key in this.carConfig){
                if (this.carConfig[key].level == curCarMaxLevel) {
                    unLockCoinLevel = this.carConfig[key]["unlock_buy_gold_level"];
                    break;
                }
            }

            this.freeValue = FZMergeDateManager.instance.getCarBuyPrice(unLockCoinLevel);
            if (this.freeGetCount < 3) {

            } else if (this.freeGetCount < 6){
                this.freeValue = FZUtils.bigDivide(this.freeValue,2 + "");
            } else {
                this.freeValue = FZUtils.bigDivide(this.freeValue,3+"");
            }
            this.scene.lbl_gold.text = FZUtils.formatNumberStr(this.freeValue);
        }

        private getDollarFuc()
        {

            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let freeDollarDate = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_FREE_DOLLAR_GET_DATE", "0");
            if(freeDollarDate != date_str){
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_DATE", date_str);
                this.dollarGetCount = 0;
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", "0");
            }else{
                this.dollarGetCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", "0"));
            }
            let lv = FZGameData.instance.getCheckPoint();
            let gqInfo = FZCfgManager.instance.getCheckPoint(lv);
            let times  = FZMergeDateManager.instance.getFreeDollarTimes(this.dollarGetCount);
            
            this.dollarValue = Math.ceil(gqInfo.dropCash * times);
            this.scene.lbl_gold.text = FZUtils.formatNumberStr(this.dollarValue + "");
            //FZUtils.formatNumberStr(gqInfo.dropCash)
            if(times<=1){
                // this.scene.y-=150;
                // this.scene.bg_image.height +=150;
                // this.scene.btn_video.skin = "ui_common/common_btn_green.png";
                // this.scene.btn_game.skin = "ui_main/common_btn_yellow.png";
                this.scene.btn_game.visible = true;
                // this.scene.bg_image.y = 100;
            }
        }

        private onClickBtnClose():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_FreeGoldGet);
            });
        }
        private onClickBtnGame():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);     
            FZUIManager.instance.removeUI(FZUIManager.UI_FreeGoldGet);       
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponLevelUpView);
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponUnlockNoticeView);
        }

        private onClickBtnVideo():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            if(this.resType == FZGameStatus.QCurrencyType.gold){
                param.shareType = FZGameStatus.FZShareType.FreeGold;
            }
            if(this.resType == FZGameStatus.QCurrencyType.dollar){
                param.shareType = FZGameStatus.FZShareType.FreeCash
            }
            var isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
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
            if(this.resType == FZGameStatus.QCurrencyType.gold){
                if(FZ.clickStatEventType.getFreeGoldSuc){
                    FZ.BiLog.clickStat(FZ.clickStatEventType.getFreeGoldSuc,[]);
                }
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_COUNT", (this.freeGetCount+1).toString());
                FZMergeDateManager.instance.addGameGold(this.freeValue.toString());
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得金币"+ FZUtils.formatNumberStr(this.freeValue + "")});
                FZEventManager.instance.sendEvent(FZEvent.FREE_GET_GOLD);
                FZUIManager.instance.removeUI(FZUIManager.UI_FreeGoldGet);
                FZGameData.instance.playResFlyAni(null,null,{type: 1,countType: 0},null);
            }
            if(this.resType == FZGameStatus.QCurrencyType.dollar){
                if(FZ.clickStatEventType.getFreeCashSuc){
                    FZ.BiLog.clickStat(FZ.clickStatEventType.getFreeCashSuc,[]);
                }
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", (this.dollarGetCount+1).toString());
                FZGameData.instance.addWeaponsCoin(this.dollarValue);
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得美钞"+ this.dollarValue});
                FZUIManager.instance.removeUI(FZUIManager.UI_FreeGoldGet);
                //FZGameData.instance.playResFlyAni(null,null,{type: 0,countType: 0},null);
                //飞资源的动画
                FZEventManager.instance.sendEvent(FZEvent.GAME_LVUPFLYRES_CTRL, {itemType: 0,countType: 1});
            }
            if(this.resType == FZGameStatus.QCurrencyType.diamond){
                if(FZ.clickStatEventType.getOneMoreGift){
                    FZ.BiLog.clickStat(FZ.clickStatEventType.getOneMoreGift,[]);
                }
                FZMergeDateManager.instance.addGameDiamond(this.diamondValue);
                FZGameData.instance.playResFlyAni(null,null,{type: 2,countType: 0},null);
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得钻石"+ this.diamondValue});
                FZUIManager.instance.removeUI(FZUIManager.UI_FreeGoldGet);   
            }
        }

        /**
         * 再来一份 只播视频
         */
        public onClickBtnVideoAgain() {
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.oncemore;
            // 视频
            FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
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
}
export default game.view.FZFreeGold;
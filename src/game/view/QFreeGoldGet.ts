import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QUIMgr from "../core/QUIMgr";
import QDebug from "../../framework/QDebug";
import QSoundMgr from "../core/QSoundMgr";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QAdManager from "../core/QAdManager";
import QGameData from "../data/QGameData";
import QSavedDateItem from "../data/QSavedDateItem";


namespace game.view
{
    export class QFreeGoldGet extends QBaseUI
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
            QUtil.doUIPopAnim(this.scene.AnchorCenter);
            // this.scene.ani1.play(0, false);
        }

        public setParam(param: any): void{
            var isShare = QGameData.instance.getShareOrVideo();
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
            var delayTime = QGameData.instance.delay_show_time;
            if( ! delayTime ){
                delayTime = 2000;
            }
            Laya.timer.once( delayTime , this , function(){
                this.scene.btn_close.visible = true;  
            })

            if(param == QGameConst.QCurrencyType.gold){
                this.scene.gold_img.visible = true;
                this.scene.type_tip.text    = "快来领取海量金币!";
                this.scene.lbl_title.text   = "免费金币";
                this.getGoldFuc();
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideo, ["btn_video"]);
            }
            if(param == QGameConst.QCurrencyType.dollar){
                this.scene.dollar_img.visible = true;
                this.scene.type_tip.text    = "快来领取海量美钞!";
                this.scene.lbl_title.text   = "免费美钞";
                this.getDollarFuc();
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideo, ["btn_video"]);
            }
            if (param == QGameConst.QCurrencyType.diamond) {
                if(this.scene&&this.scene.free_type_icon){
                    this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
                }
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onClickBtnVideoAgain, []);
                this.scene.diamond_img.visible   = true;
                this.scene.type_tip.text    = "快来领取海量钻石!";
                this.scene.lbl_title.text   = "再来一份惊喜?";
                this.getDiamondFuc();

                // 延迟关闭按钮出现 - ( 延迟出现 )
                this.scene.btn_close.visible = false;
                var delayTime = QGameData.instance.delay_show_time;
                if( ! delayTime ){
                    delayTime = 2000;
                }
                var self = this;
                Laya.timer.once(delayTime, this, function(){
                    self.scene.btn_close.visible = true;
                    QUtil.doUIPopAnim(self.scene.btn_close);
                });
            }
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_game, this, this.onClickBtnGame, ["btn_game"]);
            if(this.resType == QGameConst.QCurrencyType.gold&&tywx.clickStatEventType.freeGoldPanel){
                tywx.BiLog.clickStat(tywx.clickStatEventType.freeGoldPanel,[]);
            }else if(this.resType == QGameConst.QCurrencyType.dollar&&tywx.clickStatEventType.freeCashpanel){
                tywx.BiLog.clickStat(tywx.clickStatEventType.freeCashpanel,[]);
            }
        }
        /**
         * 刷新界面
         */
        // 钻石
        public diamondValue:number = 0;
        private getDiamondFuc() 
        {
            var sigin_days = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS", "0"));
            var sigin_data = QCfgMgr.instance.getSiginCfg();
            this.diamondValue = sigin_data[sigin_days+""].reward;
            this.scene.lbl_gold.text = QUtil.formatNumberStr(this.diamondValue + "");
        }

        private getGoldFuc()
        {
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let freeGoldDate = QSavedDateItem.instance.getItemFromLocalStorage("GAME_FREE_GOLD_GET_DATE", "0");
            if (date_str != freeGoldDate) {
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_DATE", date_str);
                this.freeGetCount = 0;
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_COUNT", "0");
            } else {
                this.freeGetCount = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("GAME_FREE_GOLD_GET_COUNT", "0"));
            }

            let curCarMaxLevel = QMergeData.instance.getCarMaxLevel();
            let unLockCoinLevel = curCarMaxLevel;
            this.carConfig = QCfgMgr.instance.getRoadsideCarList();
            for(let key in this.carConfig){
                if (this.carConfig[key].level == curCarMaxLevel) {
                    unLockCoinLevel = this.carConfig[key]["unlock_buy_gold_level"];
                    break;
                }
            }

            this.freeValue = QMergeData.instance.getCarBuyPrice(unLockCoinLevel);
            if (this.freeGetCount < 3) {

            } else if (this.freeGetCount < 6){
                this.freeValue = QUtil.bigDivide(this.freeValue,2 + "");
            } else {
                this.freeValue = QUtil.bigDivide(this.freeValue,3+"");
            }
            this.scene.lbl_gold.text = QUtil.formatNumberStr(this.freeValue);
        }

        private getDollarFuc()
        {

            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let freeDollarDate = QSavedDateItem.instance.getItemFromLocalStorage("GAME_FREE_DOLLAR_GET_DATE", "0");
            if(freeDollarDate != date_str){
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_DATE", date_str);
                this.dollarGetCount = 0;
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", "0");
            }else{
                this.dollarGetCount = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", "0"));
            }
            let lv = QGameData.instance.getCheckPoint();
            let gqInfo = QCfgMgr.instance.getCheckPoint(lv);
            let times  = QMergeData.instance.getFreeDollarTimes(this.dollarGetCount);
            
            this.dollarValue = Math.ceil(gqInfo.dropCash * times);
            this.scene.lbl_gold.text = QUtil.formatNumberStr(this.dollarValue + "");
            //QUtil.formatNumberStr(gqInfo.dropCash)
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_FreeGoldGet);
            });
        }
        private onClickBtnGame():void
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);     
            QUIMgr.instance.removeUI(QUIMgr.UI_FreeGoldGet);       
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponLevelUpView);
            QUIMgr.instance.removeUI(QUIMgr.UI_WeaponUnlockNoticeView);
        }

        private onClickBtnVideo():void
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            if(this.resType == QGameConst.QCurrencyType.gold){
                param.shareType = QGameConst.QShareType.FreeGold;
            }
            if(this.resType == QGameConst.QCurrencyType.dollar){
                param.shareType = QGameConst.QShareType.FreeCash
            }
            var isShare = QGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                QWxSDK.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this])
            } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
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
            if(this.resType == QGameConst.QCurrencyType.gold){
                if(tywx.clickStatEventType.getFreeGoldSuc){
                    tywx.BiLog.clickStat(tywx.clickStatEventType.getFreeGoldSuc,[]);
                }
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_GOLD_GET_COUNT", (this.freeGetCount+1).toString());
                QMergeData.instance.addGameGold(this.freeValue.toString());
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得金币"+ QUtil.formatNumberStr(this.freeValue + "")});
                QEventMgr.instance.sendEvent(QEventType.FREE_GET_GOLD);
                QUIMgr.instance.removeUI(QUIMgr.UI_FreeGoldGet);
                QGameData.instance.playResFlyAni(null,null,{type: 1,countType: 0},null);
            }
            if(this.resType == QGameConst.QCurrencyType.dollar){
                if(tywx.clickStatEventType.getFreeCashSuc){
                    tywx.BiLog.clickStat(tywx.clickStatEventType.getFreeCashSuc,[]);
                }
                QSavedDateItem.instance.setItemToLocalStorage("GAME_FREE_DOLLAR_GET_COUNT", (this.dollarGetCount+1).toString());
                QGameData.instance.addWeaponsCoin(this.dollarValue);
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得美钞"+ this.dollarValue});
                QUIMgr.instance.removeUI(QUIMgr.UI_FreeGoldGet);
                //QGameData.instance.playResFlyAni(null,null,{type: 0,countType: 0},null);
                //飞资源的动画
                QEventMgr.instance.sendEvent(QEventType.GAME_LVUPFLYRES_CTRL, {itemType: 0,countType: 1});
            }
            if(this.resType == QGameConst.QCurrencyType.diamond){
                if(tywx.clickStatEventType.getOneMoreGift){
                    tywx.BiLog.clickStat(tywx.clickStatEventType.getOneMoreGift,[]);
                }
                QMergeData.instance.addGameDiamond(this.diamondValue);
                QGameData.instance.playResFlyAni(null,null,{type: 2,countType: 0},null);
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得钻石"+ this.diamondValue});
                QUIMgr.instance.removeUI(QUIMgr.UI_FreeGoldGet);   
            }
        }

        /**
         * 再来一份 只播视频
         */
        public onClickBtnVideoAgain() {
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.oncemore;
            // 视频
            QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
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
}
export default game.view.QFreeGoldGet;
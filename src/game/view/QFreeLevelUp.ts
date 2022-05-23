import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QUIMgr from "../core/QUIMgr";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QSavedDateItem from "../data/QSavedDateItem";
import QSoundMgr from "../core/QSoundMgr";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QGameData from "../data/QGameData";
namespace game.view
{
    export class QFreeLevelUp extends QBaseUI
    {
        public scene: ui.view.FreeLevelUpUI;
        private param:any;
        private curCarInfo:any;
        private nextCarInfo:any;
        
        public init():void
        {
            this.scene = new ui.view.FreeLevelUpUI();
            QUtil.doUIPopAnim(this.scene.AnchorCenter);

            var isShare = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";

            this.scene.car_lvUp.play(0, true);

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_Close, this, this.onClickBtnClose, ["btn_Close"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_Video, this, this.onClickBtnVideo, ["btn_Video"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_Confirm, this, this.onClickBtnConfirm, ["btn_Confirm"]);
            if (QUIMgr.instance.longScreen()) {
                this.scene.btn_Close.y+=70;
                this.scene.title_img.y+=70;
            }
        }

        public setParam(param) {
            this.param = param;
            let index = param.index;
            let data = param.data;

            let curCarLevel = data.level;
            this.curCarInfo = QCfgMgr.instance.getCarInfoById(curCarLevel);
            this.scene.imgCurCarIcon.skin = this.curCarInfo.path;
            this.scene.lblCurCarName.text = this.curCarInfo.name+"";
            this.scene.lblCurCarLv.text = "Lv."+ this.curCarInfo.level;

            let nextCarLevel = curCarLevel+data.needLeveUp;
            this.nextCarInfo = QCfgMgr.instance.getCarInfoById(nextCarLevel);
            this.scene.imgLvUpCarIcon.skin = this.nextCarInfo.path;
            this.scene.lblNextCarName.text = this.nextCarInfo.name +"";
            this.scene.lblNextCarLv.text = "Lv."+ this.nextCarInfo.level;
        }

        private onClickBtnClose(){
            let index = this.param.index;
            let data = this.param.data;

            this.updateData(index, data);

            let time = new Date().getTime();
            QSavedDateItem.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);

            QUIMgr.instance.removeUI(QUIMgr.UI_FreeLeveUp);
        }

        private onClickBtnConfirm():void
        {
            var game_diamond = QMergeData.instance.getGameDiamond();
            if (game_diamond < 3) {
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text:"钻石不足"});
                return;
            }
            //
            QMergeData.instance.addGameDiamond(-3);
            //
            let index = this.param.index;
            let data = this.param.data;
            data.level+=data.needLeveUp;
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);

            this.updateData(index, data);

            let time = new Date().getTime();
            QSavedDateItem.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");

            QUIMgr.instance.removeUI(QUIMgr.UI_FreeLeveUp);
        }
        private onClickBtnVideo():void 
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.NewCar;
            
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
            let index = this.param.index;
            let data = this.param.data;
            data.level+=data.needLeveUp;
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            this.updateData(index, data);
            let time = new Date().getTime();
            QSavedDateItem.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");
            QUIMgr.instance.removeUI(QUIMgr.UI_FreeLeveUp);
        }

        private updateData(index, data):void{
            // 修改车位数据
            QMergeData.instance.changeCarSlotData(index, data);
            // 增加车辆的购买次数
            QMergeData.instance.addBuyCarCount(data.level, QGameConst.QMoneyType.Coin);
            //更新车的位置
            QEventMgr.instance.sendEvent(QEventType.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": index});
            // 刷新最新购买车
            QEventMgr.instance.sendEvent(QEventType.MAIN_VIEW_UPDATE_BUY_CAR);
        }
    }
}
export default game.view.QFreeLevelUp;
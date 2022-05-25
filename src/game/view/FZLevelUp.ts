import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZGameData from "../data/FZGameData";
namespace game.view
{
    export class FZLevelUp extends FZBaseUI
    {
        public scene: ui.view.FreeLevelUpUI;
        private param:any;
        private curCarInfo:any;
        private nextCarInfo:any;
        
        public init():void
        {
            this.scene = new ui.view.FreeLevelUpUI();
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);

            var isShare = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";

            this.scene.car_lvUp.play(0, true);

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_Close, this, this.onClickBtnClose, ["btn_Close"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_Video, this, this.onClickBtnVideo, ["btn_Video"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_Confirm, this, this.onClickBtnConfirm, ["btn_Confirm"]);
            if (FZUIManager.instance.longScreen()) {
                this.scene.btn_Close.y+=70;
                this.scene.title_img.y+=70;
            }
        }

        public setParam(param) {
            this.param = param;
            let index = param.index;
            let data = param.data;

            let curCarLevel = data.level;
            this.curCarInfo = FZCfgManager.instance.getCarInfoById(curCarLevel);
            this.scene.imgCurCarIcon.skin = this.curCarInfo.path;
            this.scene.lblCurCarName.text = this.curCarInfo.name+"";
            this.scene.lblCurCarLv.text = "Lv."+ this.curCarInfo.level;

            let nextCarLevel = curCarLevel+data.needLeveUp;
            this.nextCarInfo = FZCfgManager.instance.getCarInfoById(nextCarLevel);
            this.scene.imgLvUpCarIcon.skin = this.nextCarInfo.path;
            this.scene.lblNextCarName.text = this.nextCarInfo.name +"";
            this.scene.lblNextCarLv.text = "Lv."+ this.nextCarInfo.level;
        }

        private onClickBtnClose(){
            let index = this.param.index;
            let data = this.param.data;

            this.updateData(index, data);

            let time = new Date().getTime();
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);

            FZUIManager.instance.removeUI(FZUIManager.UI_FreeLeveUp);
        }

        private onClickBtnConfirm():void
        {
            var game_diamond = FZMergeDateManager.instance.getGameDiamond();
            if (game_diamond < 3) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text:"钻石不足"});
                return;
            }
            //
            FZMergeDateManager.instance.addGameDiamond(-3);
            //
            let index = this.param.index;
            let data = this.param.data;
            data.level+=data.needLeveUp;
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);

            this.updateData(index, data);

            let time = new Date().getTime();
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");

            FZUIManager.instance.removeUI(FZUIManager.UI_FreeLeveUp);
        }
        private onClickBtnVideo():void 
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.NewCar;
            
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
            let index = this.param.index;
            let data = this.param.data;
            data.level+=data.needLeveUp;
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            this.updateData(index, data);
            let time = new Date().getTime();
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", time+"");
            FZUIManager.instance.removeUI(FZUIManager.UI_FreeLeveUp);
        }

        private updateData(index, data):void{
            // 修改车位数据
            FZMergeDateManager.instance.changeCarSlotData(index, data);
            // 增加车辆的购买次数
            FZMergeDateManager.instance.addBuyCarCount(data.level, FZGameStatus.QMoneyType.Coin);
            //更新车的位置
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": index});
            // 刷新最新购买车
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_BUY_CAR);
        }
    }
}
export default game.view.FZLevelUp;
import FZBaseUI from "../../core/FZBaseUI";
import { ui } from "../../../ui/layaMaxUI";
import FZUtils from "../../../framework/FZUtils";
import FZSaveDateManager from "../../data/FZSaveDateManager";
import FZUIManager from "../../core/FZUIManager";
import FZGameData from "../../data/FZGameData";
import FZShareInfo from "../../logic/FZShareInfo";
import FZGameStatus from "../../data/FZGameStatus";
import FZWechat from "../../core/FZWechat";
import FZEventManager from "../../../framework/FZEventManager";
import FZEvent from "../../data/FZEvent";
import FZSoundManager from "../../core/FZSoundManager";
import FZMergeDateManager from "../../data/FZMergeDateManager";
import FZCfgManager from "../../core/FZCfgManager";
namespace game.view
{
    export class FZDailyDiamond extends FZBaseUI
    {
        public scene: ui.view.DailydiamondUI;

        public isShare:boolean = false;
        public diamond_count:any = 100;
        public dailyDiamondCount:number = 0;
        public carCfg:any ={};
        public CarMaxLevel:number =0;
        public awardcfg :any = [[10,0.5],[25,0.33],[40,0.25],[50, 0.17]];
        public init():void
        {
            this.scene = new ui.view.DailydiamondUI();

            if (FZUIManager.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.box_title.y += 70;
                });
            }
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);  // 弹窗动画更改
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onBtnClick,[]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose,[]);

            // this.scene.ani1.play(0, false);  //弹窗出现的缓动动画
            
        }
        public setParam(param: any): void{
            this.dailyDiamondCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("DailyDiamond","5"));
            this.CarMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();
            this.carCfg = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.GameConfig]['carCfg'];
            var factor = 0;
            for(let j = 0;j<this.awardcfg.length;j++)
            {
                if(this.CarMaxLevel <= this.awardcfg[j][0])
                {
                    factor = this.awardcfg[j][1];
                    break;
                }
            }
            if (this.CarMaxLevel>2) {
                var count = FZCfgManager.instance.getCarInfoById(this.CarMaxLevel-2).buy_diamond;
                this.diamond_count = Math.max(Math.ceil(count*factor), 10);
            }else {
                this.diamond_count = 10;
            }
            this.onUpdateUI();
        }
        public onUpdateUI() {
            var d_count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(d_count+"");
            var str =  FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;            
            if (this.dailyDiamondCount == 0) {
                this.scene.btn_video.disabled = true;
            }else {
                this.scene.btn_video.disabled = false;
            }
            this.scene.lab_count.text = this.dailyDiamondCount + "";
            this.scene.lbl_gold.text = this.diamond_count + "";
            this.isShare = FZGameData.instance.getShareOrVideo();
            // this.scene.free_type_icon.skin = this.isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            if(this.scene&&this.scene.free_type_icon){
                this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
            }

        }
        public onBtnClick() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.DailyDiamond;
            var isShare = FZGameData.instance.getShareOrVideo();
            // if (isShare == 1){
            //     // 分享
            //     FZWechat.instance.fakeShare(param, this, function(self : any){
            //         self.shareCallBack();
            //     }, [this])
            // } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack();
                }),Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        if(this.scene&&this.scene.free_type_icon){
                            this.scene.free_type_icon.skin = "ui_common/free_share_icon.png";
                        }
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this])
                    }else if(value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            // }
        }
        /**
         * 视频分享返回
         */
        public shareCallBack() {
            if (this.scene == null) {
                return
            }
            this.dailyDiamondCount -= 1;
            FZSaveDateManager.instance.setItemToLocalStorage("DailyDiamond",this.dailyDiamondCount + "");
            FZMergeDateManager.instance.addGameDiamond(this.diamond_count);
            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得钻石"+ this.diamond_count});
            FZGameData.instance.playResFlyAni(this.scene.diamond_img,null,{type: 2,countType: 0},null);
            this.onUpdateUI();
            FZEventManager.instance.sendEvent(FZEvent.UPDATE_DAILY_DIAMOND_RED_POINT);
        }
        /**
         * 关闭按钮
         */
        public onClickBtnClose() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_DailyDiamondView);
            });
        }
    }
}
export default game.view.FZDailyDiamond;
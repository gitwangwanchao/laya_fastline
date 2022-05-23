import QBaseUI from "../../core/QBaseUI";
import { ui } from "../../../ui/layaMaxUI";
import QUtil from "../../../framework/QUtil";
import QSavedDateItem from "../../data/QSavedDateItem";
import QUIMgr from "../../core/QUIMgr";
import QGameData from "../../data/QGameData";
import QShareParam from "../../logic/QShareParam";
import QGameConst from "../../data/QGameConst";
import QWxSDK from "../../core/QWxSDK";
import QEventMgr from "../../../framework/QEventMgr";
import QEventType from "../../data/QEventType";
import QSoundMgr from "../../core/QSoundMgr";
import QMergeData from "../../data/QMergeData";
import QCfgMgr from "../../core/QCfgMgr";
namespace game.view
{
    export class QDailyDiamond extends QBaseUI
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

            if (QUIMgr.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.box_title.y += 70;
                });
            }
            QUtil.doUIPopAnim(this.scene.AnchorCenter);  // 弹窗动画更改
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_video, this, this.onBtnClick,[]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose,[]);

            // this.scene.ani1.play(0, false);  //弹窗出现的缓动动画
            
        }
        public setParam(param: any): void{
            this.dailyDiamondCount = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("DailyDiamond","5"));
            this.CarMaxLevel = QMergeData.instance.getCarMaxLevel();
            this.carCfg = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.GameConfig]['carCfg'];
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
                var count = QCfgMgr.instance.getCarInfoById(this.CarMaxLevel-2).buy_diamond;
                this.diamond_count = Math.max(Math.ceil(count*factor), 10);
            }else {
                this.diamond_count = 10;
            }
            this.onUpdateUI();
        }
        public onUpdateUI() {
            var d_count = QMergeData.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = QUtil.formatNumberStr(d_count+"");
            var str =  QUtil.formatNumberStr(QMergeData.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;            
            if (this.dailyDiamondCount == 0) {
                this.scene.btn_video.disabled = true;
            }else {
                this.scene.btn_video.disabled = false;
            }
            this.scene.lab_count.text = this.dailyDiamondCount + "";
            this.scene.lbl_gold.text = this.diamond_count + "";
            this.isShare = QGameData.instance.getShareOrVideo();
            // this.scene.free_type_icon.skin = this.isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            if(this.scene&&this.scene.free_type_icon){
                this.scene.free_type_icon.skin = "ui_main/com_icon_0.png";
            }

        }
        public onBtnClick() {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.DailyDiamond;
            var isShare = QGameData.instance.getShareOrVideo();
            // if (isShare == 1){
            //     // 分享
            //     QWxSDK.instance.fakeShare(param, this, function(self : any){
            //         self.shareCallBack();
            //     }, [this])
            // } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack();
                }),Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        if(this.scene&&this.scene.free_type_icon){
                            this.scene.free_type_icon.skin = "ui_common/free_share_icon.png";
                        }
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this])
                    }else if(value == 0) {
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
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
            QSavedDateItem.instance.setItemToLocalStorage("DailyDiamond",this.dailyDiamondCount + "");
            QMergeData.instance.addGameDiamond(this.diamond_count);
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得钻石"+ this.diamond_count});
            QGameData.instance.playResFlyAni(this.scene.diamond_img,null,{type: 2,countType: 0},null);
            this.onUpdateUI();
            QEventMgr.instance.sendEvent(QEventType.UPDATE_DAILY_DIAMOND_RED_POINT);
        }
        /**
         * 关闭按钮
         */
        public onClickBtnClose() {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUtil.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_DailyDiamondView);
            });
        }
    }
}
export default game.view.QDailyDiamond;
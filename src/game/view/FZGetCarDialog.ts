import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZGameData from "../data/FZGameData";
import FZDebug from "../../framework/FZDebug";
import FZSceneManager from "../core/FZSceneManager";

namespace game.view
{
    export class FZGetCarDialog extends FZBaseUI
    {
        public scene: ui.view.FZGetCarDialogUI;
        private carInfo:any;
        public carMaxLv: number;
        private baseMainWeaponData: any;

        private mianWeaponLevel: number = 1;

        private showOpenDeputy: boolean = false;
        private showOpenUav: boolean = false;

        public registerEvent() : void
        {
            // 监听刷新金币
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            // 刷新钻石
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }

        public unregisterEvent() : void   
        {
            if (this.partIns){
                this.partIns.destroy();
                this.partIns = null;
            }
            Laya.timer.clearAll(this);
            this.scene_bg.destroy();
            // FZSceneManager.instance.uiScene.active = false;
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            
        }
        /**
         * 刷新金币
         */
        onUpdateGameGold():void 
        {
            var str =  FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;
        }
        /**
         * 刷新钻石
         */
        private onUpdareDiamond():void
        {
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
        }
        public scene_bg:any = null;
        public init():void
        {
            
            this.scene_bg = new Laya.Image();
			this.scene_bg.skin = "ui_main/com_dialog_bgMask.png";
			this.scene_bg.width = 2357;
			this.scene_bg.height = 3786;
            this.scene_bg.centerX = 0.5;
            this.scene_bg.centerY = 0.5;
            this.scene_bg.alpha = 0.9;
            Laya.stage.addChild(this.scene_bg);
            this.scene_bg.zOrder = 10;
            
            // if(FZSceneManager.instance.uiScene != null) {
            //     Laya.stage.addChild(FZSceneManager.instance.uiScene);
            //     FZSceneManager.instance.uiScene.zOrder = 10;
            //     FZSceneManager.instance.uiScene.updateZOrder();
            // }
            this.scene = new ui.view.FZGetCarDialogUI();
            this.scene.zOrder = 10;
            this.scene.updateZOrder();
            let curMaxLevel = this.carMaxLv = FZMergeDateManager.instance.getCarMaxLevel();
            this.carInfo = FZCfgManager.instance.getCarInfoById(curMaxLevel);
            this.baseMainWeaponData = FZCfgManager.instance.getBaseMainWeapons();
            this.mianWeaponLevel = FZGameData.instance.getMainWeaponLevel();

            let carBattleData = FZCfgManager.instance.getCarInfoById(curMaxLevel);
            let mainWeaponData = FZCfgManager.instance.getMainWeapons(carBattleData.mainWeaponId);

            // FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            var old_path = FZCfgManager.instance.getCarInfoById(curMaxLevel-1).path;
            this.scene.imgCarIcon_1.skin = old_path;
            this.scene.imgCarIcon_2.skin = old_path;
            this.scene.imgCarIcon_3.skin = this.carInfo.path;

            this.scene.lblCarName.text = this.carInfo.name +" lv."+ this.carInfo.level;

            this.scene.lblHurtNum.changeText((this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + mainWeaponData.sDps) * 3+"");
            this.scene.lblArmorNum.changeText(carBattleData.carHp+"");

            if(this.carMaxLv==2){//新解锁2级车时，更改按钮内容
                this.scene.confirm_img.visible = false;
                this.scene.confirm_lbl.text = '领取';
                this.scene.confirm_lbl.y = 75;
            }
            
            let uavWeaponOpen = FZGameData.instance.getUAVWeaponOpenPoint();
            let deputyWeaponOpen = FZGameData.instance.getDeputyWeaponOpenPoint();
            this.showOpenDeputy = this.carInfo.level == deputyWeaponOpen;
            // this.showOpenUav = this.carInfo.level == uavWeaponOpen
            this.scene.lbl_lock_weapon.visible = (this.showOpenDeputy || this.showOpenUav);
            if (this.scene.lbl_lock_weapon.visible) {
                this.scene.lbl_lock_weapon.text = (this.carInfo.level == uavWeaponOpen) ? "恭喜解锁无人机！" : "恭喜解锁副武器！";
            }

            if (this.showOpenDeputy) {
                //第一次开启副武器
                FZ.BiLog.clickStat(FZ.clickStatEventType.unlockingSecondaryWeapon,[]);
            } else if (this.showOpenUav) {
                //第一次开启无人机
                FZ.BiLog.clickStat(FZ.clickStatEventType.unlockingUav,[]);
            }

            // this.scene.lblManipulation.text = "操控+"+ Math.floor(this.carInfo.desccontrol*100) +"%";
            /*this.scene.btnVideo.visible = false;
            this.scene.img_diamond.visible = false;
            this.scene.text_add_diamond.visible = false;
            if (this.carInfo.share_diamond != 0) {
                this.scene.btnVideo.visible = true;
                this.scene.img_diamond.visible = true;
                this.scene.text_add_diamond.visible = true;
                this.scene.text_add_diamond.text = "x" + this.carInfo.share_diamond;
            }*/

            //合成新车时播放的动画
            this.scene.box_btn.visible = false;
            this.scene.btn_close.visible = false;
            var carImage1X = 375;
            Laya.timer.once(1, this, function(){
                this.scene.hebing.play(0, false);
            })
            Laya.timer.frameOnce(60, this, function(){
                var partPath = "particle/particle2.part";
                Laya.loader.load(partPath, Laya.Handler.create(this, this.onAssetsLoaded), null, Laya.Loader.JSON);
                // FZSceneManager.instance.uiScene.active = true;
                
            })
            this.moveLevelUp();  //按钮和升级文案出现的缓动动画
            this.newCarGuide();

            Laya.timer.once(3000, this, function(){
                this.scene.btn_close.visible = true;
            })
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.unlock);
            FZ.BiLog.clickStat(FZ.clickStatEventType.unlockNewCar,[this.carMaxLv]);  //合成新车打点
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnConfirm, this, this.onClickBtnConfirm, ["btnConfirm"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnVideo, this, this.onClickBtnVideo, ["btnVideo"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickClose,[]);

            this.onUpdateGameGold();
            this.onUpdareDiamond();

            var isShare = FZGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";

            if (FZUIManager.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.title_img.y += 70;
                    this.scene.box_title.y += 70;
                });
            }
        }
        public partIns:any = null;
        public onAssetsLoaded(settings){
            var  Particle2D = Laya.Particle2D;
            // 创建 Particle2D 实例
            this.partIns = new Particle2D(settings);
            Laya.stage.addChild(this.partIns);
            this.partIns.zOrder = 20;
            this.partIns.updateZOrder();
            // 开始发射粒子
            this.partIns.emitter.start();
            // 播放
            this.partIns.play();
            this.partIns.scaleX = 1.5;
            this.partIns.scaleY = 1.5;
            this.partIns.x = Laya.stage.width / 2;
            this.partIns.y = Laya.stage.height / 3;
            Laya.timer.once(2000, this, function(){
                this.partIns.destroy();
                this.partIns = null;
            });
        }
        /**
         * 合成新车的新手引导
         */
        public newCarGuide(){
            if(this.carMaxLv==2){//新解锁2级车时，直接领取
                Laya.timer.once(2100, this, function(){
                    this.scene.guide_hand.visible = true;
                    this.scene.guide_click.visible = true;
                    this.scene.guide_hand_ani.play(0, true);
                });
            }
        }
        /**
         * 按钮和升级文案出现的缓动动画
         */
        public moveLevelUp(){
            Laya.timer.once(1000, this, function(){
                this.scene.box_btn.visible = true;
                this.scene.aniMove.play(0, false);
            });
        }

        public onClickClose(){
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);   
            this.openShareCallBack();
        }
        private onClickBtnConfirm():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);   
            if(this.carMaxLv==2){//新解锁2级车时，直接领取
                this.scene.guide_hand.visible = false;
                this.scene.guide_click.visible = false;
                // this.scene.guide_hand_ani.gotoAndStop(0);
                this.openShareCallBack();
                FZ.BiLog.clickStat(FZ.clickStatEventType.finishMergeNewCarGuide, []);
                return;
            }
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.showof;
            FZWechat.instance.fakeShare(param, this, function(self : any){
                self.openShareCallBack();
            }, [this], function(self:any){
                self.openShareCallBack();
            })
        }
        /**
         * 分享返回
         */
        public openShareCallBack() {
            if (FZMergeDateManager.instance.showWeaponOpenNotice && (this.showOpenDeputy || this.showOpenUav)) {
                // 显示副武器或无人机跳转提示
                let param = this.showOpenDeputy ? "deputy" : "uav"
                FZUIManager.instance.createUI(FZUIManager.UI_WeaponLockedNoticeView, param);
            } else {
                if (this.carInfo.diamond || this.carInfo.share_diamond) {
                    let itemVaule = this.carInfo.diamond || this.carInfo.share_diamond;
                    let getType = this.carInfo.diamond ? 1 : 2;
                    let param = {
                        itemType: 2,
                        itemDes: "钻石x"+itemVaule,
                        itemValue: itemVaule,
                        getType: getType
                    };
                    FZUIManager.instance.createUI(FZUIManager.UI_CongratulationGet, param);
                }   
            }
            FZUIManager.instance.removeUI(FZUIManager.UI_GainCar);
        }
        private onClickBtnVideo():void 
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.FreeCar;
            
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
                }), Laya.Handler.create(this, function(value){
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
            if (this.carInfo.share_diamond != 0) {
                FZMergeDateManager.instance.addGameDiamond(this.carInfo.share_diamond);
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text: "获得钻石"+ this.carInfo.share_diamond});
                FZGameData.instance.playResFlyAni(this.scene.img_diamond,this.scene.title_diamond,{type: 2,countType: 0},this.hide.bind(this));
                if(this.carMaxLv == 2)
                {
                    // FZ.BiLog.clickStat(FZ.clickStatEventType.getFirstCarDiamond,[]);

                }
            }
            else{
                this.hide();
            }           
        }

        public hide(){
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUIManager.instance.removeUI(FZUIManager.UI_GainCar);
        }
    }
}
export default game.view.FZGetCarDialog;
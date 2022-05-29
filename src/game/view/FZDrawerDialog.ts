import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZCfgManager from "../core/FZCfgManager";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZHttps from "../../framework/FZHttps";
import FZWechat from "../core/FZWechat";

namespace game.view
{
    export class FZDrawerDialog extends FZBaseUI
    {
        public scene : ui.view.DrawerDialogUI;
        private drawer_state:boolean = false;
        public index___:number = 0;
        public registerEvent() : void
        {
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_CLOSE_DRAWER, this.closeDrawer, this);
            FZEventManager.instance.register(FZEvent.MAIN_UPDATE_SIGIN_NOTICE, this.updateSiginNotice, this);
            // 每日钻石监听
            FZEventManager.instance.register(FZEvent.UPDATE_DAILY_DIAMOND_RED_POINT, this.updateBoxDiamondNotice, this);
        }

        public unregisterEvent() : void   
        {
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_CLOSE_DRAWER, this.closeDrawer, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_UPDATE_SIGIN_NOTICE, this.updateSiginNotice, this);
            FZEventManager.instance.unregister(FZEvent.UPDATE_DAILY_DIAMOND_RED_POINT, this.updateBoxDiamondNotice, this);
        }

        private removeDestroy () {
            Laya.timer.once(1, this, this.destroy);
        }
        
        public init():void
        {
            this.scene = new ui.view.DrawerDialogUI();
            this.scene.mouseThrough = true;
            
            this.scene.btn_cleanAccount.visible = FZDebug.isDebug;
            this.scene.btn_addlevel_1.visible = FZDebug.isDebug;
            this.scene.btn_addlevel_10.visible = FZDebug.isDebug;
            this.scene.btn_addlevel_100.visible = FZDebug.isDebug;
            this.scene.btn_addlevel_101.visible = FZDebug.isDebug;
            this.scene.btn_add_doller.visible = FZDebug.isDebug;
            this.scene.btn_addlevel_200.visible = FZDebug.isDebug;
            
            let isAuditVersion = FZWechat.instance.isAuditVersion();
            this.scene.btn_set.visible = !isAuditVersion;

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_drawer, this, this.onBtnClick, ["btn_drawer"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_set, this, this.onBtnClick, ["btn_set"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_sign, this, this.onBtnClick, ["btn_sign"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_cleanAccount, this, this.onBtnClick, ["btn_cleanAccount"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_revenue, this, this.onBtnClick, ["btn_revenue"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_box_diamond, this, this.onBtnClick, ["btn_box_diamond"]);

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_1, this, this.onBtnAddLevelClick, ["1"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_10, this, this.onBtnAddLevelClick, ["10"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_100, this, this.onBtnAddLevelClick, ["100"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_101, this, this.onBtnAddLevelClick, ["101"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_200, this, this.onBtnAddLevelClick, ["200"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_add_doller, this, this.onBtnDollerClick, []);

            this.updateSiginNotice();
            // if (FZUIManager.instance.longScreen()) {  //长屏手机适配
            //     Laya.timer.once(20, this, () => {
            //         this.scene.btn_drawer.y += 70;
            //     });
            // }
            this.closeDrawer();
            Laya.timer.loop(1000, this, this.onUpdateSpeed);

            var flag =  parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            this.scene.revenue_notice_img.visible = flag == 0 ? true : false;
            this.updateBoxDiamondNotice();
        }

        /**
         * 更新签到的红点提示
         */
        updateSiginNotice(){
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let local_date_str = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DATE", "0");
            this.scene.sigin_notice_img.visible = !(local_date_str == date_str);
            this.updateBtnNotice();
        }

        /** 
         * 更新加速红点提示
        */
        public onUpdateSpeed(){
            var time = Math.ceil(FZMergeDateManager.instance.getTempSpeedTime() / 1000);
            var speed = FZMergeDateManager.instance.getTempSpeed();
            this.scene.revenue_notice_img.visible = time == 0 ? true : false;
            this.updateBtnNotice();
        }


        /**
         * 更新每日钻石红点提示
         */
        public updateBoxDiamondNotice(){
            var count = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("DailyDiamond","5"));
            var time = FZSaveDateManager.instance.getItemFromLocalStorage("DailyDiamondTime","0");
            var new_time = new Date().toLocaleDateString();
            if (time != new_time) {
                count = 5;
                FZSaveDateManager.instance.setItemToLocalStorage("DailyDiamond","5");
                FZSaveDateManager.instance.setItemToLocalStorage("DailyDiamondTime",new_time);
            }
            if (count > 0) {
                this.scene.imgRedD.visible = true;
                this.scene.lab_img_red_d.text = count + "";
            }else {
                this.scene.imgRedD.visible = false;
            }
            this.updateBtnNotice();
        }
        
        /**
         * 更新抽屉按钮的红点提示
         */
        public updateBtnNotice(){
            this.scene.notice_img.visible = this.scene.sigin_notice_img.visible || this.scene.revenue_notice_img.visible || this.scene.imgRedD.visible;
        }
        


        public closeDrawer(){
            if (this.drawer_state) {
                this.drawer_state = false;
                this.scene.bg_drawer.x = -144;
                this.scene.btn_drawer.skin = "ui_main/main_darwer_btn.png";
            }
        }

        public openDrawer(){
            if (!this.drawer_state) {
                this.drawer_state = true;
                this.scene.bg_drawer.x = 0;  
                this.scene.btn_drawer.skin = "ui_main/main_darwer_btn_1.png"; 
            }
        }

        private onBtnClick (param) {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            switch (param) {
                case "btn_drawer":
                    this.drawer_state ? this.closeDrawer() : this.openDrawer();
                    break;
                case "btn_set":
                    FZUIManager.instance.createUI(FZUIManager.UI_Setting);
                    this.closeDrawer();
                    break;
                case "btn_sign":
                    FZUIManager.instance.createUI(FZUIManager.UI_SignInDialog);
                    this.closeDrawer();
                    break;
                case "btn_cleanAccount":
                    new FZHttps().get("game/delUserInfo",this,this.cleanAccountSuccess,null);
                    break;
                case "btn_revenue": {
                    FZUIManager.instance.createUI(FZUIManager.UI_AddRevenueDialog);
                    this.closeDrawer();
                    break;
                }
                case "btn_box_diamond": {
                    FZUIManager.instance.createUI(FZUIManager.UI_DailyDiamondView);
                }
            }
        }
        
        cleanAccountSuccess (e) {
            let dt = e.data;
            // console.log("clean data dt == ", dt);
            if(e.state == 200){
                FZMergeDateManager.instance.clearAccount = true;
                Laya.LocalStorage.clear();
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "清除账号成功，请刷新游戏"});
            }
        }

        public onBtnAddLevelClick(param){
            switch (param) {
                case "1":
                    FZGameData.instance.setCheckPoint(Math.min(FZGameData.instance.check_point + 1));
                    break;
                case "10":
                    FZGameData.instance.setCheckPoint(Math.min(FZGameData.instance.check_point + 10,1000));
                    break;
                case "100":
                    FZGameData.instance.setCheckPoint(Math.min(FZGameData.instance.check_point + 100, 1000));
                    break;
                case "101":
                    var level = Math.max(FZGameData.instance.check_point - 100,1);
                    FZGameData.instance.setCheckPoint(level);
                    break;    
                case "200":
                    this.addCount();
                    break;    
            }
        }

        public addCount() {
            this.index___ += 1;
            var info = FZCfgManager.instance.getCarInfoById(40);
            var buy_gold = Math.floor(info.buy_gold * Math.pow(info.add_gold, this.index___)) + "";
            var gold = FZUtils.scienceNum(buy_gold);
            this.scene.btn_addlevel_text.text = FZUtils.formatNumberStr(gold);
        }
        public onBtnDollerClick() {
            FZGameData.instance.addWeaponsCoin(10000000);  // 增加美钞 
            FZMergeDateManager.instance.addGameGold("10000000000000000000000");  // 增加金币
            FZMergeDateManager.instance.addGameDiamond(100000000); // 增加钻石 
        }
    }
}
export default game.view.FZDrawerDialog;
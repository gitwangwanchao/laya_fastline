import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QSavedDateItem from "../data/QSavedDateItem";
import QSoundMgr from "../core/QSoundMgr";
import QHttp from "../../framework/QHttp";
import QWxSDK from "../core/QWxSDK";
import QJcdlTypeView from "../../game/view/QJcdlTypeView";

namespace game.view
{
    export class QDrawerDialog extends QBaseUI
    {
        public scene : ui.view.DrawerDialogUI;
        private drawer_state:boolean = false;
        public index___:number = 0;
        public registerEvent() : void
        {
            QEventMgr.instance.register(QEventType.MAIN_VIEW_CLOSE_DRAWER, this.closeDrawer, this);
            QEventMgr.instance.register(QEventType.MAIN_UPDATE_SIGIN_NOTICE, this.updateSiginNotice, this);
            // 每日钻石监听
            QEventMgr.instance.register(QEventType.UPDATE_DAILY_DIAMOND_RED_POINT, this.updateBoxDiamondNotice, this);
        }

        public unregisterEvent() : void   
        {
            QEventMgr.instance.unregister(QEventType.MAIN_VIEW_CLOSE_DRAWER, this.closeDrawer, this);
            QEventMgr.instance.unregister(QEventType.MAIN_UPDATE_SIGIN_NOTICE, this.updateSiginNotice, this);
            QEventMgr.instance.unregister(QEventType.UPDATE_DAILY_DIAMOND_RED_POINT, this.updateBoxDiamondNotice, this);
        }

        private removeDestroy () {
            Laya.timer.once(1, this, this.destroy);
        }
        
        public init():void
        {
            this.scene = new ui.view.DrawerDialogUI();
            this.scene.mouseThrough = true;
            
            this.scene.btn_cleanAccount.visible = QDebug.isDebug;
            this.scene.btn_addlevel_1.visible = QDebug.isDebug;
            this.scene.btn_addlevel_10.visible = QDebug.isDebug;
            this.scene.btn_addlevel_100.visible = QDebug.isDebug;
            this.scene.btn_addlevel_101.visible = QDebug.isDebug;
            this.scene.btn_add_doller.visible = QDebug.isDebug;
            this.scene.btn_addlevel_200.visible = QDebug.isDebug;
            
            let isAuditVersion = QWxSDK.instance.isAuditVersion();
            this.scene.btn_set.visible = !isAuditVersion;

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_drawer, this, this.onBtnClick, ["btn_drawer"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_set, this, this.onBtnClick, ["btn_set"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_sign, this, this.onBtnClick, ["btn_sign"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_cleanAccount, this, this.onBtnClick, ["btn_cleanAccount"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_revenue, this, this.onBtnClick, ["btn_revenue"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_box_diamond, this, this.onBtnClick, ["btn_box_diamond"]);

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_1, this, this.onBtnAddLevelClick, ["1"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_10, this, this.onBtnAddLevelClick, ["10"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_100, this, this.onBtnAddLevelClick, ["100"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_101, this, this.onBtnAddLevelClick, ["101"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_addlevel_200, this, this.onBtnAddLevelClick, ["200"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_add_doller, this, this.onBtnDollerClick, []);

            this.updateSiginNotice();
            // if (QUIMgr.instance.longScreen()) {  //长屏手机适配
            //     Laya.timer.once(20, this, () => {
            //         this.scene.btn_drawer.y += 70;
            //     });
            // }
            this.closeDrawer();
            Laya.timer.loop(1000, this, this.onUpdateSpeed);

            var flag =  parseInt(QSavedDateItem.instance.getItemFromLocalStorage("SHOP_FREE_SPEED", "0"));
            this.scene.revenue_notice_img.visible = flag == 0 ? true : false;
            this.updateBoxDiamondNotice();
        }

        /**
         * 更新签到的红点提示
         */
        updateSiginNotice(){
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let local_date_str = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SIGIN_DATE", "0");
            this.scene.sigin_notice_img.visible = !(local_date_str == date_str);
            this.updateBtnNotice();
        }

        /** 
         * 更新加速红点提示
        */
        public onUpdateSpeed(){
            var time = Math.ceil(QMergeData.instance.getTempSpeedTime() / 1000);
            var speed = QMergeData.instance.getTempSpeed();
            this.scene.revenue_notice_img.visible = time == 0 ? true : false;
            this.updateBtnNotice();
        }


        /**
         * 更新每日钻石红点提示
         */
        public updateBoxDiamondNotice(){
            var count = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("DailyDiamond","5"));
            var time = QSavedDateItem.instance.getItemFromLocalStorage("DailyDiamondTime","0");
            var new_time = new Date().toLocaleDateString();
            if (time != new_time) {
                count = 5;
                QSavedDateItem.instance.setItemToLocalStorage("DailyDiamond","5");
                QSavedDateItem.instance.setItemToLocalStorage("DailyDiamondTime",new_time);
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
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            switch (param) {
                case "btn_drawer":
                    this.drawer_state ? this.closeDrawer() : this.openDrawer();
                    break;
                case "btn_set":
                    QUIMgr.instance.createUI(QUIMgr.UI_Setting);
                    this.closeDrawer();
                    break;
                case "btn_sign":
                    QUIMgr.instance.createUI(QUIMgr.UI_SignInDialog);
                    this.closeDrawer();
                    break;
                case "btn_cleanAccount":
                    new QHttp().get("game/delUserInfo",this,this.cleanAccountSuccess,null);
                    break;
                case "btn_revenue": {
                    QUIMgr.instance.createUI(QUIMgr.UI_AddRevenueDialog);
                    this.closeDrawer();
                    break;
                }
                case "btn_box_diamond": {
                    QUIMgr.instance.createUI(QUIMgr.UI_DailyDiamondView);
                }
            }
        }
        
        cleanAccountSuccess (e) {
            let dt = e.data;
            // console.log("clean data dt == ", dt);
            if(e.state == 200){
                QMergeData.instance.clearAccount = true;
                Laya.LocalStorage.clear();
                QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text : "清除账号成功，请刷新游戏"});
            }
        }

        public onBtnAddLevelClick(param){
            switch (param) {
                case "1":
                    QGameData.instance.setCheckPoint(Math.min(QGameData.instance.check_point + 1));
                    break;
                case "10":
                    QGameData.instance.setCheckPoint(Math.min(QGameData.instance.check_point + 10,1000));
                    break;
                case "100":
                    QGameData.instance.setCheckPoint(Math.min(QGameData.instance.check_point + 100, 1000));
                    break;
                case "101":
                    var level = Math.max(QGameData.instance.check_point - 100,1);
                    QGameData.instance.setCheckPoint(level);
                    break;    
                case "200":
                    this.addCount();
                    break;    
            }
        }

        public addCount() {
            this.index___ += 1;
            var info = QCfgMgr.instance.getCarInfoById(40);
            var buy_gold = Math.floor(info.buy_gold * Math.pow(info.add_gold, this.index___)) + "";
            var gold = QUtil.scienceNum(buy_gold);
            this.scene.btn_addlevel_text.text = QUtil.formatNumberStr(gold);
        }
        public onBtnDollerClick() {
            QGameData.instance.addWeaponsCoin(10000000);  // 增加美钞 
            QMergeData.instance.addGameGold("10000000000000000000000");  // 增加金币
            QMergeData.instance.addGameDiamond(100000000); // 增加钻石 
        }
    }
}
export default game.view.QDrawerDialog;
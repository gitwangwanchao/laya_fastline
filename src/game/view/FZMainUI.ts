import FZBaseUI from "../core/FZBaseUI";

import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSlotNode from "./FZSlotNode";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZGameData from "../data/FZGameData";
import FZSoundManager from "../core/FZSoundManager";
import FZSceneManager from "../core/FZSceneManager";
import FZHttps from "../../framework/FZHttps";
import { ui } from "../../ui/layaMaxUI";
import FZWechat from "../core/FZWechat";
import FZGameGuide from "./FZGameGuide";
import FZConst from "../../framework/FZConst";
import FZShareInfo from "../logic/FZShareInfo";

import FZResManager from "../core/FZResManager";
import FZJcdlTypeUI from "../../game/view/FZJcdlTypeUI";


/**
 * 主场景
 */
namespace game.view
{
    export class FZMainUI extends FZBaseUI
    {
        public scene: ui.view.MainViewUI;
        private touch: boolean = false;
        private pos_list: any;
        private gold: number = 0;
        public buy_car_info: any = {};
        public last_exp = 0;// 上次经验

        //软引导触发状态 0无引导 1买车 2商店 3合成 数值越大优先级越高 否则就会别打的替代
        public softGuideType: number  = 0;
        public softCanBuyCar: boolean = false;
        public syntheticTimes: number = 3;
        public runSoftGuide: boolean = false;

        private curItemBoxType: number = 0;
        private itemBoxCarCount: number = 0;

        private partSp_0: laya.particle.Particle2D;
        private partSp_1: laya.particle.Particle2D;
        private partSp_2: laya.particle.Particle2D;
        private earning: boolean = false;

        private shopFreeCarindex: number = -1;

        public speedCountDownTimeSp: any;
        public startAngle: number = 0;

        public WeaponFullLevel: boolean = false; //所有武器是否全部满级

        public unlockDeputy = "false"; //解锁副武器
        //解锁无人机
        public unlockUav1 = "false";
        public unlockUav2 = "false";
        public unlockUav3 = "false";
        public unlockUav4 = "false";
        public unlockUav5 = "false";

        public getGiftTimes = "0";

        public jcdlListData : any = null ;  // 交叉导流 列表
        public jdclSingleIndex : number = 0; // 交叉导流循环 坐标
        public jdclSingleIndex_down : number = 1; //  第二个 交叉导流循环 坐标  （ 默认从第二位开始 )
        public jdclList_middle : number = 4; // 记录交叉导流列表中间值
        public iconTimestamp : number;      // 交叉导流(使用的随机数)
        public haveMoveInTrash : boolean = false;  // 是否 移动进过垃圾桶
        public delHandGuide : number = 3;      // 删除车辆引导的手移动次数
        public handInGuide : boolean = false;  // 是否 正在进行 手指移动
        public tweenHand : any = null;   // 删除车辆引导 缓动存储

        public check_time = 0;  //宝箱倒计时的时间
        public checkGift = false;
        private guideBtnInfo:any;//引导按钮数据
        private carSlotList:any = [];//车辆存表

        public listUAVData: Array<any> = new Array<any>();  //无人机配置

        public showJcdlCfg;
        public jcdlCanPlay;

        // 加载监听 自动调用（具体实现请查看 FZBaseUI）
        public registerEvent(): void
        {
            // 监听钞票
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateMoney, this);
            // 监听刷新金币
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD, this.onUpdateGameGold, this);
            // 监听 选中状态
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_SELECTED, this.onSelectedCar, this);
            // 刷新车位
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_CAR_SLOT, this.onUpdateCarSlot, this);
            // 刷新经验
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_EXPERIENCE, this.onUpdateExperience, this);
            // 更新金币速率
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GOLD_SPEED, this.onUpdateGoldSpeed, this);
            // 升级
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_LEVEL, this.onUpLevel, this);
            // 合成新车
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_MERGE_NEW_CAR, this.onCreateGainCarDiaog, this);
            // 刷新钻石
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND, this.onUpdareDiamond, this);
            // 刷新价格
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_CHANGE_PRICE, this.onChangePrice, this);
            // 刷新最优车
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_BUY_CAR, this.onUpdateBuyCar, this);
            // 更改当前使用赛车
            // FZEventManager.instance.register(FZEvent.GAME_CHANGE_CUR_USE_CAR, this.changeCurUseCar, this);
            // 增加空投车数量
            FZEventManager.instance.register(FZEvent.GAME_ADD_ITEM_CAR_COUNT, this.addItemCarCount, this);
            // 刷新关卡显示
            FZEventManager.instance.register(FZEvent.GAME_UPDATE_POINT_SHOW, this.showPointInfo, this);

            FZEventManager.instance.register(FZEvent.UPDATE_SHARE_CONFIG, this.updateShareConfig, this);

            FZEventManager.instance.register(FZEvent.GAME_FLYRES_CTRL,this.flyResAni, this);

            FZEventManager.instance.register(FZEvent.WX_ON_SHOW, this.onShow, this);
            FZEventManager.instance.register(FZEvent.WX_ON_HIDE, this.onHide, this);

            FZEventManager.instance.register(FZEvent.SOFT_GUIDE_INTERVENTION, this.resetSoftGuide, this);

            FZEventManager.instance.register(FZEvent.MAIN_REFRESH_LUCKY_RED_POINT, this.refreshLuckyRedHint, this);
            //  在线宝箱获取成功 监听
            FZEventManager.instance.register(FZEvent.GET_GIFT_SUCCESS, this.getGiftSuccess, this);
            //  删除车辆新手引导 监听
            FZEventManager.instance.register(FZEvent.DELETE_CAR_TRASH_GUIDE, this.deleteCarGuideStart, this);
            //  删除车辆新手引导 状态变化
            FZEventManager.instance.register(FZEvent.DELETE_CAR_TRASH_STATE, this.freshTrashState, this);
            //  继续游戏进入引导
            FZEventManager.instance.register(FZEvent.CONTIMUE_GUIDE_ENTER,this.checkGuideStep, this);

            // FZEventManager.instance.register(FZEvent.WEAPON_GUIDE, this.weapomGuide, this);
            //  开始强制引导配合监听
            FZEventManager.instance.register(FZEvent.FORCE_GUIDE_START,this.startForceGuide, this);
            //  强制引导结束监听
            FZEventManager.instance.register(FZEvent.GAME_GUIDE_CTRL,this.releaseForceGuide, this);
            // 开启空投动作
            FZEventManager.instance.register(FZEvent.MAIN_OPEN_AIRDROP,this.openAirDrop, this);

            FZEventManager.instance.register(FZEvent.CLOSE_AIRDROP, this.closeAirDrop, this)

            FZEventManager.instance.register(FZEvent.UPDATE_AIRDROP_RED_NUM, this.upDateAirDrop, this);
            FZEventManager.instance.register(FZEvent.FRESHAIRDROPSTATE, this.freshAirDropState, this);

            //试玩次数刷新监听
            FZEventManager.instance.register(FZEvent.MORE_GAME_NUM, this.updateMoreGameNotice, this);

        }
        // 移除监听
        public unregisterEvent(): void
        {
            FZEventManager.instance.unregister(FZEvent.FRESHAIRDROPSTATE, this.freshAirDropState, this);
            FZEventManager.instance.unregister(FZEvent.UPDATE_AIRDROP_RED_NUM, this.upDateAirDrop, this);
            FZEventManager.instance.unregister(FZEvent.CLOSE_AIRDROP, this.closeAirDrop, this)
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateMoney, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD, this.onUpdateGameGold, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_SELECTED, this.onSelectedCar, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_CAR_SLOT, this.onUpdateCarSlot, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_EXPERIENCE, this.onUpdateExperience, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GOLD_SPEED, this.onUpdateGoldSpeed, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_LEVEL, this.onUpLevel, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_MERGE_NEW_CAR, this.onCreateGainCarDiaog, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND, this.onUpdareDiamond, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_CHANGE_PRICE, this.onChangePrice, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_BUY_CAR, this.onUpdateBuyCar, this);
            // FZEventManager.instance.unregister(FZEvent.GAME_CHANGE_CUR_USE_CAR, this.changeCurUseCar, this);
            FZEventManager.instance.unregister(FZEvent.GAME_ADD_ITEM_CAR_COUNT, this.addItemCarCount, this);
            FZEventManager.instance.unregister(FZEvent.GAME_UPDATE_POINT_SHOW, this.showPointInfo, this);
            FZEventManager.instance.unregister(FZEvent.UPDATE_SHARE_CONFIG, this.updateShareConfig, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_REFRESH_LUCKY_RED_POINT, this.refreshLuckyRedHint, this);

            FZEventManager.instance.unregister(FZEvent.GAME_FLYRES_CTRL,this.flyResAni, this);
            FZEventManager.instance.unregister(FZEvent.SOFT_GUIDE_INTERVENTION, this.resetSoftGuide, this);
            FZEventManager.instance.unregister(FZEvent.DELETE_CAR_TRASH_GUIDE, this.deleteCarGuideStart, this);
            FZEventManager.instance.unregister(FZEvent.DELETE_CAR_TRASH_STATE, this.freshTrashState, this);

            FZEventManager.instance.unregister(FZEvent.CONTIMUE_GUIDE_ENTER,this.checkGuideStep, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_OPEN_AIRDROP,this.openAirDrop, this);

            // FZEventManager.instance.unregister(FZEvent.WEAPON_GUIDE, this.weapomGuide, this);


            FZEventManager.instance.unregister(FZEvent.FORCE_GUIDE_START,this.startForceGuide, this);
            FZEventManager.instance.unregister(FZEvent.GAME_GUIDE_CTRL,this.releaseForceGuide, this);

            this.scene.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);

            FZEventManager.instance.unregister(FZEvent.WX_ON_SHOW, this.onShow, this);
            FZEventManager.instance.unregister(FZEvent.WX_ON_HIDE, this.onHide, this);
            // FZEventManager.instance.unregister(FZEvent.UVA_CAN_CHOOSE,this.leveUpNoticeCtr, this);
            FZEventManager.instance.unregister(FZEvent.MORE_GAME_NUM, this.updateMoreGameNotice, this);

            FZJcdlTypeUI.instance.remove();
        }
        /**
         * 武器升级引导时将红点层级提高
         */
        // public weapomGuide(param){
        //     this.scene.img_levelUp_notice.zOrder = param;
        //     console.log("武器升级引导");
        //     console.log(param);
        // }

        onShow()
        {

        }

        onHide()
        {

        }

        public onDestroy()
        {
            // 设置
            Laya.timer.clear(this, this.giftAlready);
            Laya.timer.clear(this,this.JcdlSingleInfo); // 清理 交叉导流定时器
            // this.stopResidentRollBanner(); // 清理常驻导流循环 定时器
            if( this.tweenHand  ){  // 清理 引导删除车辆 缓动
                Laya.Tween.clear( this.tweenHand );
                this.tweenHand = null;
            }
        }
        public init(): void
        {
            this.scene = new ui.view.MainViewUI();
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_shop, this, this.onBtnClick, ["btn_shop"]);
            // FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_time, this, this.onBtnClick, ["btn_time"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_car_list, this, this.onBtnClick, ["btn_car_list"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_start_game, this, this.onBtnClick, ["btn_start_game"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.sprte_change_car, this, this.onBtnClick, ["sprte_change_car"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_add_diamond, this, this.onBtnClick, ["btn_add_diamond"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_rotaryTable, this, this.onBtnClick, ["btn_rotaryTable"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_levelUp, this, this.onBtnClick, ["btn_levelUp"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.dropBox, this, this.onBtnClick, ["air_drop_box"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_more_game, this, this.onBtnClick, ["btn_more_game"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_online_gift, this, this.onBtnClick, ["btn_online_gift"]);

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.img_clean, this, this.onBtnClick, ["img_clean"]);

            // this.scene.item_box.on(Laya.Event.CLICK, this, this.onClickItemBox);
            this.scene.pre_point_bg.on(Laya.Event.CLICK, this, this.onClickPointBg, ["pre"]);
            this.scene.cur_point_bg.on(Laya.Event.CLICK, this, this.onClickPointBg, ["cur"]);
            this.scene.next_point_bg.on(Laya.Event.CLICK, this, this.onClickPointBg, ["next"]);

            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);

            let isAuditVersion = FZWechat.instance.isAuditVersion();
            this.scene.btn_shop.visible = !isAuditVersion;

            // 初始化金币
            var str = FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold());
            this.scene.lab_game_gold.text = str;
            this.resetGoldLabPos();

            this.showJcdlCfg = FZGameData.instance.getJcdlDataList();
            this.jcdlCanPlay = this.canPlay(this.showJcdlCfg);
            //  在线宝箱零点刷新
            this.isSameday();
            //  在线宝箱出现倒计时
            this.onlineGiftTime();

            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let local_date_str = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_DATE", "0");
            if (local_date_str == "0") {
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_DATE", date_str);
                local_date_str = date_str;
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", "5");
            }
            if (date_str != local_date_str) {
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_DATE", date_str);
                var count = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", "5"));
                var shareinfo:any = FZCfgManager.instance.getShareCfg();
                if (shareinfo.luckTableParam) {
                    count += shareinfo.luckTableParam.baseCount;
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", count + "");
                }
            }

            // 刷新钞票
            this.onUpdateMoney();
            // 刷新钻石
            this.onUpdareDiamond();
            // 刷新金币速率
            this.onUpdateGoldSpeed();
            // 刷新经验
            this.onUpdateExperience();
            // 初始化车
            this.initCarSlot();

            // 更新最优车辆购买方案
            this.onUpdateBuyCar();
            // 刷新车位
            this.onUpdateCarSlot();
            //刷新试玩次数显示
            this.updateMoreGameNotice();


            //商城免费车检查
            if (FZMergeDateManager.instance.hasShopFreeCar) {
                this.checkShopFreeCarTag();
            }

            /*this.startAngle = 0;
            let sp = new Laya.Sprite();
            this.speedCountDownTimeSp = sp.graphics.drawPie(0,0,90,0,this.startAngle,"#c87943");
            sp.rotation = -90;
            sp.x = this.scene.countDown_bg.width/2;
            sp.y = this.scene.countDown_bg.height/2;
            this.scene.countDown_bg.mask = sp;*/

            Laya.timer.loop(1000, this, this.loopHandler);

            Laya.timer.loop(5000, this, () => {
                FZMergeDateManager.instance.saveAllLocalData();
            });


            // 检查 是否处于删除车辆引导状态
            this.judgeDelGuideByMain();

            //  检测是否可以掉落 空投道具
            this.scene.airDropByBox.visible = false;
            if (FZMergeDateManager.instance.showItemBox) {
                this.freshAirDropState();
            }
            // 随机免费车
            if (FZMergeDateManager.instance.showRandomCar) {
                Laya.timer.once(FZMergeDateManager.instance.BOX_TIME, this, this.onRandomCar);
            }

            FZSceneManager.instance.setActive(true);

            if (FZUIManager.instance.longScreen()) {
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.box_title.y += 70;
                    // this.scene.box_online_gift.y -= 70;
                    FZGameData.instance.initTitlePos(this.scene.title_diamond,this.scene.title_gold);
                });
            }
            this.scene.img_levelUp_notice.visible = false;

            this.refreshLuckyRedHint();
            if (FZGameData.instance.OpenUav == true){
                FZUIManager.instance.createUI(FZUIManager.UI_WeaponLockedNoticeView, "uav");
                FZGameData.instance.OpenUav = false;
            }

            if(FZGameData.instance.getMaxCheckPoint()<3){
                this.scene.permanent1.visible = false;
                this.scene.permanent2.visible = false;
                this.scene.btnSingleJcdlIcon.visible = false;
                // this.scene.btn_levelUp.visible = false;
            }
            FZSceneManager.instance.initUIEffect();
            tywx.BiLog.clickStat(tywx.clickStatEventType.onloadMainScene,[]);

            this.getUavLockPoint();  //获取无人机的解锁关卡限制
        }

        /**
         * 判断导流是否能够试玩
         */
        public canPlay(param){
            let arr = [];
            for(let i = 0; i < param.length; i++){
                if(param[i].can_play == 1){
                    arr.push(param[i]);
                }
            }
            return arr;
        }

        /**
         * 数据回来 刷新UI
         */
        public UpdateUI(){
             // 刷新钞票
             this.onUpdateMoney();
             // 刷新钻石
             this.onUpdareDiamond();
             // 刷新金币速率
             this.onUpdateGoldSpeed();
             // 刷新经验
             this.onUpdateExperience();
             // 更新最优车辆购买方案
             this.onUpdateBuyCar();
             // 刷新车位
             this.onUpdateCarSlot();
             // 加速
            //  this.onUpdateSpeed();
        }

        public flyResAni(param){
            if (FZUIManager.instance.uiIsActive(FZUIManager.UI_LuckyGuy))
                return;

            let itemType = param.itemType;
            let target = param.target;
            switch(itemType)
            {
                case 1:
                    FZGameData.instance.playResFlyAni(target,this.scene.title_gold,{type: 1,countType: 0},null);
                    break;
                case 2:
                    FZGameData.instance.playResFlyAni(target,this.scene.title_diamond,{type: 2,countType: 0},null);
                    break;
            }
        }

    //  -------------------------------      交叉导流    Begin       ------------------------------
        // 设置 交叉导流读取的信息
        // setStateToJCDL(){
        //     // this.scene.btnSingleJcdlIcon.visible = false; // 起始不显示 滚动导流
        //     FZJcdlTypeUI.instance.remove();
        //     this.jcdlListData = FZGameData.instance.getJcdlDataList();  // 获取交叉导流的数值信息
        //     this.iconTimestamp = Math.sqrt(Math.random());
        //
        //     this.jdclList_middle =  Math.floor( this.jcdlListData.length / 2 );  // 获取配置 中间值
        //     this.jdclSingleIndex =  this.jdclList_middle;
        //
        // }

        // 【常驻导流】 -  创建   交叉导流
        // createResidentBanner(){
        //     try{
        //         if( ! this.jcdlListData || ! this.jcdlListData[0] ){
        //             return;
        //         }
        //         // 常驻导流列表 - 跟随配置
        //         this.scene.permanent2.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[0]);
        //         this.scene.imgSingleJcdlIcon2.skin = this.jcdlListData[0].icon_url[0]+ "?v=" + this.iconTimestamp;
        //         this.scene.lblSingleJcdlName2.changeText(this.jcdlListData[0].gameName);
        //     } catch(e) {
        //
        //     }
        // }

        // 【常驻“滚动导流】 - 创建 常驻滚动导流
        // private createResidentRoll() : void {
        //     this.scene.jcdlRollShake_down.play(0,true);
        //     this.JcdlResidentSingleInfo();
        //     Laya.timer.loop(4000,this,this.JcdlResidentSingleInfo);
        // }

        //  停止 常驻滚动导流
        // private stopResidentRollBanner() : void {
        //     this.scene.jcdlRollShake_down.stop();
        //     this.scene.permanent1.rotation = 0;
        //     Laya.timer.clear(this,this.JcdlResidentSingleInfo);
        //  }

        // 常驻滚动导流 - 底部    ( 循环 前半部分 )
        private JcdlResidentSingleInfo() : void {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex_down] ){
                    return;
                }
                this.scene.permanent1.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex_down]);
                this.scene.imgSingleJcdlIcon1.skin = this.jcdlListData[this.jdclSingleIndex_down].icon_url[0]+ "?v=" + this.iconTimestamp;
                this.scene.lblSingleJcdlName1.changeText(this.jcdlListData[this.jdclSingleIndex_down].gameName);
                this.jdclSingleIndex_down++;
                if(this.jdclSingleIndex_down == this.jdclList_middle)
                {
                    this.jdclSingleIndex_down = 1;
                }
            } catch(e){

            }
        }

        //【空投箱 “滚动" 导流】 - 创建 滚动导流
        // private createRollBanner() : void {
        //     // this.scene.btnSingleJcdlIcon.visible = true;
        //     this.scene.jcdlRollShake.play(0,true);
        //     this.JcdlSingleInfo();
        //     Laya.timer.loop(4000,this,this.JcdlSingleInfo);
        // }

        //  停止 滚动导流
        // private stopRollBanner() : void {
        //     this.scene.jcdlRollShake.stop();
        //     this.scene.btnSingleJcdlIcon.rotation = 0;
        //     Laya.timer.clear(this,this.JcdlSingleInfo);
        //     // this.scene.btnSingleJcdlIcon.visible = false;
        // }

        // 执行 交叉导流信息循环   ( 循环 后半部分 )
        private JcdlSingleInfo():void
        {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex] ){
                    return;
                }
                this.scene.btnSingleJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex]);
                this.scene.imgSingleJcdlIcon.skin = this.jcdlListData[this.jdclSingleIndex].icon_url[0]+ "?v=" + this.iconTimestamp;
                // this.scene.btnSingleJcdlIcon.visible = true;
                this.scene.lblSingleJcdlName.changeText(this.jcdlListData[this.jdclSingleIndex].gameName);
                this.jdclSingleIndex++;
                if(this.jdclSingleIndex == this.jcdlListData.length)
                {
                    this.jdclSingleIndex = this.jdclList_middle;  //  回到中间值
                }
            } catch(e){

            }
        }

        // 交叉导流 按下执行事件
        private onClickBtnJcdlIconByMain(iconIndex : number):void
        {
            let toappid =  this.jcdlListData[iconIndex]["toappid"];
            FZWechat.instance.clickAdIcon(toappid);
        }
    //  -------------------------------      交叉导流    End       ------------------------------

    //  -------------------------------      删除车辆引导    Begin     ------------------------------
        public isInJudge = false; // 是否正在 最初始判断操作
        /*
         *  删除车辆引导 (起始位置)
         */
        public deleteCarGuideStart(){
            if( ! this.scene ){
                return;
            }
            if( FZGameData.instance.deleteCarGuide == "Close" ){  // 引导次数达到上限
                return;
            }
            this.isInJudge = true; // 正在等待加入车辆
            // 添加最后一辆车 需要加入时间,为了避免,延迟执行
            var self = this;
            Laya.timer.once( 1000 , self , function (){  // 若有可以合成车辆 不执行引导
                var isCanOpen = self.judgeIsCanCompound();
                this.isInJudge = false; // 加入完成,取消标志

                if( isCanOpen == 1 ){  // 不满足开启引导
                    self.trashChangeState("close");
                    FZGameData.instance.setDeCarGuideState("NoGuide");
                    return;
                } else {  // 可以开启引导
                    // 开启垃圾桶 引导效果
                    self.trashChangeState("open");
                    // 设置目前处于 引导状态
                    FZGameData.instance.setDeCarGuideState("InGuide");
                }
            })
        }

        /*
         *   判断是否有可以合成车辆
         *   若有可以合成车辆 停止引导
         */
        judgeIsCanCompound(){
            if( ! this.scene ){
                return 1; // 不满足开启引导
            }
            var curCarData = FZMergeDateManager.instance.getCarSlotData(); // 当前场上车辆等级
            if( ! curCarData ){
                return 1; // 不满足开启引导
            }
            if(FZMergeDateManager.instance.JudgeSolt() == -1){  // 判断场上车辆已满
                for( var i = 0 ; i < 12 ; i++ ){
                    for ( var j = i+1 ; j < 12 ; j++  ){
                       if( curCarData[i + ""].level == curCarData["" + j].level ){
                          return 1; // 有可以合成车辆,不开启引导
                       }
                    }
                }
                return 0; // 没有可以合成车辆 可以开启引导
            }
            return 1; // 车辆未满,不执行引导
        }

        // 加载主界面下 判断是否引导状态
        judgeDelGuideByMain(){
            if ( ! this.scene || FZGameData.instance.deleteCarGuide == "Close" ){
                return;
            }

            // 若有可以合成车辆 不执行引导
            var isCanOpen = this.judgeIsCanCompound();
            if( isCanOpen == 1 ){
                this.trashChangeState("close");
                FZGameData.instance.setDeCarGuideState("NoGuide");
                return;
            }
            this.isInJudge = false; // 取消限制标志

            // 是引导状态 , 开启背景光效
            if( FZGameData.instance.delCarGuideState == "InGuide" ){
                this.trashChangeState("open");
            } else {  // 关闭背景光效
                this.trashChangeState("close");
            }
        }

        // 引导中 , 车辆移入,停止光效 / 移出时,继续光效
        freshTrashState(state){
            if ( FZGameData.instance.delCarGuideState != "InGuide" || FZGameData.instance.deleteCarGuide == "Close") {
                return;
            }
            if( state == "IN" ){  // 移入
                this.trashChangeState("close");
            } else if( state == "OUT" ){  // 移出
                this.trashChangeState("open");
            } else if( state == "SELL" ){ // 成功出售车辆
                this.trashChangeState("close");
                FZGameData.instance.setDeCarGuideState("NoGuide"); // 本次引导结束
                this.deleteChangeState(); // 刷新引导次数状态
            } else if( state == "FULL" ){ // 满车提示 后引导
                this.clickBuyCarInGuide();
            } else if( state == "MERGE" ){ // 合成新车,停止本次引导  (不刷新引导次数)
                this.trashChangeState("close");
                FZGameData.instance.setDeCarGuideState("NoGuide"); // 本次引导结束
            } else if( state == "HAND" ){ // 点击车,判断是否终止引导
                if( this.handInGuide ){
                    if( this.tweenHand  ){
                        Laya.Tween.clear( this.tweenHand );  // 若是处于 手引导中 , 则中断引导
                        this.tweenHand = null;
                        this.scene.guideDelCarHand.visible = false;
                        this.handInGuide = false;
                    }
                }
            }
        }

        // 引导期间 , 玩家点击垃圾桶  (button点击)
        clickTrashInGuide(){
            if( ! this.scene ){
                return;
            }
            // 点击时 ( 满车 / 引导 )状态 / 引导次数没有上限
            if ( FZMergeDateManager.instance.JudgeSolt() == -1  && FZGameData.instance.delCarGuideState == "InGuide" && FZGameData.instance.deleteCarGuide != "Close") {
                // 正在初始化引导
                if( this.isInJudge == true ){
                    return;
                }
                // 是否小手引导 /  与其他小手引导冲突
                if( this.handInGuide || FZGameData.instance.isHandGuideFix ){
                    return;
                }
                this.autoGuideMinCarDel();
            }
        }

        // 引导期间 , 玩家点击购买车辆
        clickBuyCarInGuide(){
            if( ! this.scene ){
                return;
            }

            // 点击时 若属于引导 / 次数没有上限
            if ( FZGameData.instance.delCarGuideState == "InGuide" && FZGameData.instance.deleteCarGuide != "Close" ) {
                // 正在初始化引导
                if( this.isInJudge == true ){
                    return;
                }
                if( this.handInGuide || FZGameData.instance.isHandGuideFix ){
                    return;
                }
                this.autoGuideMinCarDel();
            }
        }

        /*
         *  引导删除车辆
         *  触发条件 : 点击 垃圾桶 / 点击购买车辆
         *  判断 等级最低 & 距离最近 的车 引导玩家删除
         */
        autoGuideMinCarDel(){
            var minLevel = [];  // 最小等级车辆的数组
            var carGuideIndex = 0; // 最终需要引导车的下坐标
            var curCarData = FZMergeDateManager.instance.getCarSlotData(); // 当前场上车辆等级
            if( ! curCarData ){
                return;
            }
            // ------------------------  autoGuideMinCarDel 内的 匿名函数 Begin   ------------------------
            //   **  计算 最小等级 车辆所对应的下坐标 ( 数目 >= 1 )
            var calMinCarList = function(){
                var index = 0;  // 记录 最小等级车
                var indexArr = []; // 记录 最小等级车的位置 ( 可能有多个 )
                var noSuitArr = []; // 不满足情况,返回这个空数组
                for( var i = 0 ; i < 12 ; i++ ){
                    if( ! curCarData[i + ""].level ){
                        return noSuitArr; // 车辆并不满,返回空数组
                    }
                    if( curCarData[i+""].level < curCarData[index+""].level ){
                        index = i;
                        indexArr = []; // 有新的最小值,清零数组
                    }
                    if( curCarData[i+""].level == curCarData[index + ""].level ){
                        indexArr.push( i );
                    }
                }
                if( indexArr.length != 0 ){
                    return indexArr;
                }
                return noSuitArr; // 车辆并不满,返回空数组
            }

            // 计算 建议删除的最近车辆
            var calRemoveIndex = function(minArr){
                /*
                 *   对于12个车位,以0-11的位置顺序
                 *   求所有符合的下坐标中 距离最近的
                 *   而以 最近坐标中 , 以左下角为起点,右划线区分距离列表等级 。
                 *   其中以 = 2 的列表中,取列表中上部  /  = 3 的列表,取列表中间数值 / 左下角+右上角为边界值(=1)
                 */
                var posHeadArr = [8,4,0,1,2,3]; // 列表的头部值
                var matrixIndex = []; // 获取划分区间
                var corIndex    = []; // 顺序存储的车辆坐标

                for( var i = 0 ; i < minArr.length ; i++ ){
                   if( minArr[i] == posHeadArr[0] ){  // 最近边界值
                       return posHeadArr[0];
                   }

                   if( minArr[i] == posHeadArr[5] ){  // 最远的边界值
                       continue; // 舍弃这个最远的数值
                   }

                    // 根据得到(剩下)的数值进行 判断
                    var subNum = 0;
                    if( minArr[i] > 4 ){ // 使用减去的值匹配( 区间之间的数值差值都为5 )
                        subNum = minArr[i] - 5;
                        if( subNum > 4 ){
                            subNum = subNum - 5;
                        } else if( subNum < 0 ){ // 数值越界
                            return posHeadArr[0];// 返回最近的位置
                        }
                    } else {
                        subNum =  minArr[i];  // 使用原始数值
                    }

                    for( var j = 1 ; j < 5 ; j++ ){  // 对比数值
                       if( posHeadArr[j] == subNum ){
                          matrixIndex.push( j );
                          corIndex.push( minArr[i] );  // 这里是按照顺序存入
                       }
                    }
                }
                if( matrixIndex.length == 0 || corIndex.length == 0 ){  //数组为空,传入数值不正确
                    return posHeadArr[0];// 返回最近的位置
                }
                // 返回的区间值 选取最适合的数值
                var _area = 0;
                var _areaArr = [];
                for( var k = 0; k < matrixIndex.length; k++ ){
                    if( matrixIndex[k] < matrixIndex[_area] ){
                        _area = k;
                        _areaArr = [];
                    }
                    if( matrixIndex[k] == matrixIndex[_area] ){
                        _areaArr.push( k );
                    }
                }
                if( _areaArr.length == 0 ){ // 数值出界
                    return posHeadArr[0];// 返回默认值
                } else if(  _areaArr.length == 1 ){ // 只有一个最小的数值
                    return corIndex[_areaArr[0]]; // 返回最小的数值
                } else if( _areaArr.length == 2 ){  // 同一列表 两位取其上
                    return corIndex[_areaArr[0]];
                } else if( _areaArr.length == 3 ){  // 三位取其中
                    return corIndex[_areaArr[1]];
                }
            }

            //  根据引导车辆 坐标值 得到对应的坐标位置
            var calGuideCarPos = function(guideIndex){
                var rowPosList =  [ 30 , 215 , 395 , 580 ]; // X 固定坐标值
                var linePosList = [ 757 , 901 , 1054 ]; // Y 固定坐标数值
                var lineIndex = 0; // 得到的列的坐标

                if( guideIndex < 4 ){ // 第一行 ( 0 , 1 , 2 , 3 )
                    return { xPos : rowPosList[guideIndex] , yPos : linePosList[0] };
                } else if( guideIndex < 8 && guideIndex >= 4 ){  // 第二行 ( 4 , 5 , 6 , 7 )
                    lineIndex = guideIndex - 4;
                    return { xPos : rowPosList[lineIndex] , yPos : linePosList[1] };
                } else if( guideIndex < 12 && guideIndex >= 8 ){  // 第三行 ( 8 , 9 , 10 , 11 )
                    lineIndex = guideIndex - 8;
                    return { xPos : rowPosList[lineIndex] , yPos : linePosList[2] };
                }
            }

            /*
             *  手指 移动引导玩家删除车辆
             *  @param moveTime = 移动的次数 , handTime = 设定移动的总次数 , handX(Y) - 手的坐标位置
             */
            var self = this;
            var handGuideMove = function( handTime , handX , handY ){
                if( handTime <= 0 ){  // 次数结束
                    self.handInGuide = false;
                    self.tweenHand = null ;
                    self.scene.guideDelCarHand.visible = false;
                    return;
                }
                self.handInGuide = true; // 正在进行 手指引导
                // 获取垃圾桶 位置信息
                var trashX = self.scene.img_clean.x ;
                var trashY = self.scene.img_clean.y + Math.floor(self.scene.img_clean.height / 2);
                self.scene.guideDelCarHand.visible = true;
                self.scene.guideDelCarHand.x = handX ;
                self.scene.guideDelCarHand.y = handY ;
                self.scene.guideDelCarHand.zOrder = 50;
                self.scene.guideDelCarHand.updateZOrder();

                self.tweenHand = Laya.Tween.to(self.scene.guideDelCarHand, { x: trashX, y: trashY }, 1800, null, Laya.Handler.create(self, function ()
                {
                    self.scene.guideDelCarHand.visible = false;
                    Laya.timer.once( 1000 , self , function(){
                        handGuideMove( --handTime , handX , handY );
                    })
                }), 0, true, true);
            }
            // ------------------------  autoGuideMinCarDel 内的 匿名函数 End   ------------------------
            // 1 : 获取到 车辆最小等级 的数组
            var minLevel = calMinCarList();
            if( minLevel.length == 0 ){ // 信息不正确,不继续进行
                return;
            }
            for( var i = 0 ; i < minLevel.length ; i++ ){ // 信息不正确(数组必为递增)
                if( minLevel[i] < minLevel[0] ){
                    return;
                }
            }
            // 2 : 返回引导车辆的 坐标数值
            if( minLevel.length == 1 ){  // 只有一个数值 , 直接判定为引导的车
                carGuideIndex =  minLevel[0];
            } else if(minLevel.length > 1){ // 拥有多个数值
                var guideRemoveIndex = calRemoveIndex(minLevel);
                if( guideRemoveIndex < 0 || guideRemoveIndex >= 12 ){  // 数值越界,使用默认值
                    guideRemoveIndex = 0;
                }
                carGuideIndex = guideRemoveIndex;
            }
            // 3 : // 引导车辆的坐标信息
            var guideCarPos =  calGuideCarPos( carGuideIndex );
            if( ! guideCarPos.xPos || ! guideCarPos.yPos ){ // 数值错误,使用默认值
                guideCarPos = { xPos : 30 , yPos :757 };
            }
            // 4 : 手指移动引导
            var handX = guideCarPos.xPos + Math.floor(this.scene.sprite_pos0.width / 2);
            var handY = guideCarPos.yPos + Math.floor( this.scene.sprite_pos0.height );
            handGuideMove ( this.delHandGuide , handX , handY );
        }

        //  更改 垃圾桶提示 动画状态
        private trashChangeState(param){
            if( param == "open" ){
                this.scene.bg_flash_trash.visible = true;
                this.scene.trash_bgAni.play(0,true);  // 垃圾桶 背部炫光
                this.scene.trash_scaleAni.play(0,true); // 垃圾桶 大小缩放
            } else if( param == "close" ){
                this.scene.trash_bgAni.stop();
                this.scene.bg_flash_trash.visible = false;
                this.scene.trash_scaleAni.stop();
            }
        }

        // 刷新 删除车辆引导的次数
        private deleteChangeState(){
            var curTime = FZGameData.instance.deleteCarGuide;
            if( curTime == "First" ){
                FZGameData.instance.setDeleteCarGuideTime("Second");
            } else if( curTime == "Second" ){
                FZGameData.instance.setDeleteCarGuideTime("Close");
            }
        }



        //  -------------------------------      空投功能    Begin     ------------------------------
          // 判断是否掉落空投
          judgeCanDrop() : boolean {
            let curMaxCheckPoint = FZGameData.instance.getCheckPoint();  // 获取目前解锁的最高关卡
            let maxCarLevel = FZMergeDateManager.instance.getCarMaxLevel();     // 获取 最高等级车辆信息
            if( ! curMaxCheckPoint || ! maxCarLevel ){
                return false;
            }
            if( curMaxCheckPoint < 3 ||  maxCarLevel < 2 ){  // 不满足掉落空投 ( 关卡解锁>=3 / 解锁车等级>=2)
                return false;
            }
            return true;
        }
         /*
         *  空投目前的状态判断 ( 主场景加载的时候 进入这里判断 )
         */
        freshAirDropState(){
            if( ! this.judgeCanDrop() ) {  // 判断不能掉落空投
                return;
            }
            //1 判断当前玩家车辆最高等级 30级之前降落到停车位 30级之后降临到原先的位置
            if(FZMergeDateManager.instance.CarMaxLevel <= FZMergeDateManager.instance.AirDropLevel) {
                // 降临到停车位
                let curMaxCheckPoint = FZGameData.instance.getCheckPoint();  // 获取目前解锁的最高关卡
                if( curMaxCheckPoint >= 3 ){  // 如果为第三关( 两关的引导结束,解锁第三关 ) 立即出现空投
                    if(FZGameData.instance.newPlayerGudieStep(null) >= FZGameStatus.NumForGuide.weaponUpdate && FZGameData.instance.airDrop_promptly_show && FZGameData.instance.airDrop_promptly_show == "false" ){
                        FZDebug.D("第一次显示空投箱-----------------");
                        // 出现空投onCreateAirDrop
                        FZMergeDateManager.instance.createAirDrop();
                        FZGameData.instance.setAirDropInstance("true"); // 使用过空投,设置状态
                        return
                    }
                    // 判断 空投是否显示
                    if(FZMergeDateManager.instance.AirDropIsOpen == 2) {
                        // 空投状态  0 显示未开启 1 显示已开启  2 未显示空投 3 停车位已满
                        FZMergeDateManager.instance.initAirDropTime();
                    }
                    if(FZMergeDateManager.instance.AirDropIsOpen == 0 && FZMergeDateManager.instance.AirDropCount > 0) {
                        if (FZMergeDateManager.instance.judgeCarSlotDataAirdrop() == -1 ){
                            FZMergeDateManager.instance.createAirDrop();
                        }
                    }
                    if (FZMergeDateManager.instance.AirDropIsOpen == 1){
                        FZMergeDateManager.instance.onCreateAirDrop();
                    }
                }
            } else {
                // 判断 空投是否显示
                if(FZMergeDateManager.instance.AirDropIsOpen == 0 || FZMergeDateManager.instance.AirDropIsOpen == 1) {
                    if (FZMergeDateManager.instance.judgeCarSlotDataAirdrop() == -1){
                        // 首先判断停车位是否空投箱
                        // 显示空投
                        if (FZMergeDateManager.instance.AirDropIsOpen == 1){
                            this.scene.dropBox.skin = "ui_main/airDropBox_1.png";
                        }else {
                            this.scene.dropBox.skin = "ui_main/airDropBox.png";
                        }
                        this.scene.airDropByBox.visible = true;
                        this.onShowAirDrop();
                        if (FZMergeDateManager.instance.AirDropIsOpen == 1){
                            FZMergeDateManager.instance.onCreateAirDrop();
                        }
                    }
                }else{
                    if(FZMergeDateManager.instance.AirDropIsOpen == 2) {
                        FZMergeDateManager.instance.initAirDropTime();
                    }
                }
            }
        }
        /**
         * 显示空投 （30级后 显示空投箱）
         */
        public onShowAirDrop() {
            this.scene.dropBox.visible = true; //  显示 空投箱子
            this.scene.airDropDialog.visible = false; // 气泡信息 处于关闭状态
            Laya.timer.once(3000, this, function(){
                this.scene.shakeDropOnce.play(0,true);
            })
            this.scene.dropNumLabel.text = FZMergeDateManager.instance.AirDropCount + "";  // 显示空投剩余的数量
        }



        //  显示已经存在有 空投
        // existAirDropShow(){
        //     this.scene.dropBox.visible = true; //  显示 空投箱子
        //     this.scene.airDropDialog.visible = false; // 气泡信息 处于关闭状态
        //     Laya.timer.once(3000, this, function(){
        //         this.scene.shakeDropOnce.play(0,true);
        //     })
        //     var stringNum = FZSaveDateManager.instance.getItemFromLocalStorage("AIR_DROP_CAR_NUM", "12"); // (string)
        //     var haveCarNum = 0;
        //     if( typeof stringNum == 'string' ){
        //         haveCarNum = this.switchToNumber(stringNum);
        //     } else {
        //         haveCarNum = stringNum;
        //     }
        //     this.scene.dropNumLabel.text = haveCarNum + "";  // 显示空投剩余的数量
        // }

        /**
         *   开启新空投 ( 新的空投掉落 )
         */
        openAirDrop() : void{
            if( this.judgeCanDrop() &&  FZMergeDateManager.instance.CarMaxLevel >= FZMergeDateManager.instance.AirDropLevel){
                if( ! this.scene ){
                    return;
                }
                FZDebug.D("显示空投 ----------------------------------------1");
                // tywx.BiLog.clickStat(tywx.clickStatEventType.ShowAirDrop,[]);
                this.scene.airDropByBox.visible = true;
                if (FZMergeDateManager.instance.AirDropIsOpen == 1){
                    this.scene.dropBox.skin = "ui_main/airDropBox_1.png";
                }else {
                    this.scene.dropBox.skin = "ui_main/airDropBox.png";
                }
                this.scene.shakeDropOnce.stop();  // 停止空投动画
                // 空投 显示的报警动画
                this.scene.airDropFly.visible = false;
                this.scene.dropBox.visible = false;
                this.scene.airDropDialog.visible = false;
                this.scene.airDropWarn.visible = true;
                this.scene.airWarnAni.play();  // 报警动画
                FZDebug.D("显示空投 ----------------------------------------2");
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.boss);
                //  出现 空投
                var stopAnim = function():void{
                    FZDebug.D("显示空投 ----------------------------------------3");
                    FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.airdrop);
                    this.scene.airWarnAni.stop();
                    this.scene.airDropWarn.visible = false;
                    this.scene.airDropFly.visible = true;  // 切换显示 空投箱子(降落伞)
                    this.scene.airDropFlyAni.play(0, false);
                    Laya.timer.once(1200, this, function(){ // ( 帧/帧率) x 1000
                        this.scene.dropBox.visible = true; //  显示 空投箱子
                        Laya.timer.once(1200, this, function(){
                            this.scene.airDropFly.visible = false; //  降落伞 消失
                        })
                    });
                    Laya.timer.once(5000, this, function(){
                        this.scene.shakeDropOnce.play(0,true);
                    })
                    this.scene.dropNumLabel.text = FZMergeDateManager.instance.AirDropCount + "";
                }
                Laya.timer.once(3000, this, stopAnim);
            }
        }

        /**
         *   点击空投箱子的事件 触发
         */
        airDropClick(){
            // if( FZMergeDateManager.instance.JudgeSolt() == -1){
            //     FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
            //     this.clickBuyCarInGuide(); // 空投也可以 触发车辆新手引导
            //     return false;
            // }
            if (FZMergeDateManager.instance.AirDropIsOpen == 0) {
                this.startPullVideo();
            }else {
                if( FZMergeDateManager.instance.JudgeSolt() == -1){
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
                }
            }
        }

        //  执行拉起视频 / 分享
        startPullVideo(){
            tywx.BiLog.clickStat(tywx.clickStatEventType.shareVideoGetAirdropPackage,[]);  //视频或者分享打开空投打点
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.AirDrop;
            var isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack({isFree : false});
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack({isFree : false});
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack({isFree : false});
                        }, [this])
                    }else if(value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }
         /**
         * 空投返回
         */

        public shareCallBack(param){
            if(!param.isFree){  //分享或者视频打开空投打点
                tywx.BiLog.clickStat(tywx.clickStatEventType.shareVideoGetAirdropPackage,[]);
            }
            tywx.BiLog.clickStat(tywx.clickStatEventType.OpenAirDropSuc,[]);  //打开空投打点
            FZMergeDateManager.instance.setAirDropOpenState(1,{x:this.scene.positionBox.x - 50, y :this.scene.positionBox.y});
            if(FZMergeDateManager.instance.JudgeSolt() == -1) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
                this.scene.shakeDropOnce.stop();        // 气泡的时候 不进行抖动
                this.scene.airClickBox.rotation = 0;    // 动作回归原始位置
                this.scene.airDropDialog.visible = true;
                this.scene.airDropDialog.alpha = 1;
                this.scene.airDropDialogAni.play(); // 气泡隐藏动画
                Laya.timer.once(1200, this, function(){
                    this.scene.airDropDialogAni.stop();
                    this.scene.airDropDialog.visible = false; // 气泡提示关闭
                    this.scene.shakeDropOnce.play(0,true);  // 气泡消失 继续抖动
                })
                this.scene.ani_airdrop_open.play(0,false);
            }else {
                this.scene.ani_airdrop_open.play(0,false);
                FZMergeDateManager.instance.onCreateAirDrop();
            }
        }
        /**
         * 刷新红点数量
         */
        public upDateAirDrop(){
            this.scene.dropNumLabel.text = FZMergeDateManager.instance.AirDropCount + "";
        }
        /**
         * 关闭空投
         */
        public closeAirDrop(){
            this.scene.airDropByBox.visible = false;
        }
        //  -------------------------------      空投功能  end-----------------------------------------------
        checkPopSignUi(): boolean {
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            let sign_date_str = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DATE", "0");
            let sigin_days = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS", "0"));
            var flag = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DAYS_GREATER_7", "0");
            sigin_days = (sign_date_str != date_str && sigin_days == 7) ? 0 : sigin_days;
            if(tywx.StateInfo.debugMode)
                alert("自动弹出签到 date_str:"+date_str+'sign_date_str:'+sign_date_str+'sigin_days:'+sigin_days+'flag:'+flag)

            var state = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SIGIN_DATE_STATE", "0");
            if(state == "0"){
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_SIGIN_DATE_STATE", "1");
            }else {
                if (date_str != sign_date_str) {
                    FZUIManager.instance.createUI(FZUIManager.UI_SignInDialog);
                    return true;
                }
            }
            return;

        }

        checkGuideStep(){
            if(FZGameData.instance.getMaxCheckPoint()>3) return false;
            let stepIdx  = FZGameData.instance.newPlayerGudieStep(null);
            if(stepIdx >= 0){
                let stepData = {
                    nArr:[],
                    key:[],
                    perform:[],
                    handRotate: "up",
                }
                switch(stepIdx + 1){
                    case FZGameStatus.NumForGuide.enterGame:
                            stepData.nArr.push([this.scene.btn_start_game]);
                            stepData.key = [1];
                            stepData.perform = [
                                FZGameStatus.NumForGuide.enterGame
                            ];
                    break;

                    case FZGameStatus.NumForGuide.getResult:
                            FZGameData.instance.newPlayerGudieStep(FZGameStatus.NumForGuide.getResult);
                            stepIdx = FZGameStatus.NumForGuide.getResult;
                    case FZGameStatus.NumForGuide.buyCar:
                    case FZGameStatus.NumForGuide.synthetic:
                            stepData.nArr.push([this.scene.btn_car_list]);
                            stepData.nArr.push([this.scene["sprite_pos" + 0],this.scene["sprite_pos" + 1]]);
                            stepData.key = [1,2];
                            stepData.perform = [
                                FZGameStatus.NumForGuide.buyCar,
                                FZGameStatus.NumForGuide.synthetic,
                            ];
                    break;
                    case FZGameStatus.NumForGuide.enterGameAgain:
                            stepData.nArr.push([this.scene.btn_start_game]);
                            stepData.key = [1];
                            stepData.perform = [FZGameStatus.NumForGuide.enterGameAgain];
                    break;
                    case FZGameStatus.NumForGuide.weaponUpdate:
                        stepData.nArr.push([this.scene.btn_levelUp]);
                        stepData.key = [1];
                        stepData.perform = [FZGameStatus.NumForGuide.weaponUpdate];
                    break;
                    case FZGameStatus.NumForGuide.allStep:
                        FZGameData.instance.newPlayerGudieStep(FZGameStatus.NumForGuide.allStep);
                        return false;
                }
                let guideMgr = FZUIManager.instance.createUI(FZUIManager.UI_GameGuideView);
                guideMgr.createForcedGuide(stepData,stepIdx + 1);
                return true;
            }
            // else{
            //     let lvUp = FZGameData.instance.getLvUpGuideTouch(null);
            //     this.scene.lvUp_hand.visible = lvUp == 0;
            // }
        }

        //买车软引导
        public checkBuyGuide () {
            return;
            if(FZMergeDateManager.instance.getCarMaxLevel()>=7)
            {
                Laya.timer.clear(this,this.buyGuideTimeCheck);
                return;
            }

            let isShow = false;
            if(this.softCanBuyCar && this.softGuideType == 0)
            {
                let carData = FZMergeDateManager.instance.getCarSlotData();
                let inMap   = 0;
                for(let key in carData){
                    if(carData[key]){
                        inMap++;
                    }
                    if(!carData[key]){
                        break;
                    }
                }
                isShow = inMap < 12;
            }
            if(isShow){
                this.scene.carList_hand.visible = true;
                FZGameData.instance.isHandGuideFix = true;
                this.softGuideType = FZGameStatus.softGuidePriority.buyCar;
            }
            else
            {
                FZMergeDateManager.instance.resetBuyGuideTime();
            }
        }
        //合成车软引导
        public syntheticGuide () {
            return;
            //7级之后不再引导
            if(FZMergeDateManager.instance.getCarMaxLevel()>=7)
            {
                Laya.timer.clear(this,this.syntheticTimeCheck);
                return;
            }
            let info = FZMergeDateManager.instance.getSameCarInMap();
            if(info.canIdx.length)
            {
                let guideMgr = FZUIManager.instance.createUI(FZUIManager.UI_GameGuideView);
                this.softGuideType = FZGameStatus.softGuidePriority.synthetic;
                let param = {
                    nArr: [this.scene["sprite_pos" + info.canIdx[0][0]], this.scene["sprite_pos" + info.canIdx[0][1]]],
                    key : 2,
                    hand: this.scene.synthetic_hand,
                }
                guideMgr.createSoftGuide(param);
            }
            this.syntheticTimes = 3;
        }

        public setActive(isActive: boolean): void
        {
            this.scene.visible = isActive;

            this.initUI();
        }

        loopHandler()
        {
            // this.onUpdateSpeed();
            this.onUpdateGoldSpeed();
            this.checkWeaponLevelUpTag();
            this.checkLuckyRotaryCount();
            if (FZMergeDateManager.instance.hasShopFreeCar) {
                this.checkShopFreeCarTag();
            }
        }

        checkAutoPopUi(){
            if (FZMergeDateManager.instance.IsFirst == true) {
                // 第一次进入游戏大厅
                // 判断离线收益
                FZMergeDateManager.instance.IsFirst = false;
                Laya.timer.frameOnce(1, this, () => {
                    let popSignUi = this.checkPopSignUi();
                    let popOffLineUi = FZMergeDateManager.instance.addOffLineGold(popSignUi);
                });
            } else {
                FZMergeDateManager.instance.onbackHall();
            }
        }

        private initUI()
        {
            FZGameData.instance.initTitlePos(this.scene.title_diamond,this.scene.title_gold);
            FZGameData.instance.initResourcesPool();

            // 创建 常驻交叉导流
            // this.createResidentBanner();
            // 创建 常驻 滚动 交叉导流
            // this.createResidentRoll();
            // this.createRollBanner();
            // 创建抽屉UI
            FZUIManager.instance.createUI(FZUIManager.UI_DrawerDialog);
            // 显示当前所用赛车
            // this.changeCurUseCar();
            // 显示关卡信息
            this.showPointInfo();
            this.postInit();
            Laya.timer.once(100,this,()=>{
                let hasGuide = this.checkGuideStep();
                if (!hasGuide) {
                    this.checkAutoPopUi();
                }
            });
            this.softGuideRunning();
        }

        public postInit(): void
        {
            //添加粒子特效
            // Laya.loader.load("particle/jinbiyu01.part", Laya.Handler.create(this, this.onLoadPart0), null, Laya.Loader.JSON);
            // Laya.loader.load("particle/jinbiyu011.part",Laya.Handler.create(this,this.onLoadPart1),null,Laya.Loader.JSON);
            // Laya.loader.load("particle/jinbiyu0111.part",Laya.Handler.create(this,this.onLoadPart2),null,Laya.Loader.JSON);
        }

        private onLoadPart0(part: laya.particle.ParticleSetting): void
        {
            // this.partSp_0 = new laya.particle.Particle2D(part);
            // this.partSp_0.autoPlay = false;
            // this.partSp_0.emitter.start();
            // this.scene.addChild(this.partSp_0);
            // this.partSp_0.x = this.scene.width / 2;
            // this.partSp_0.y = 0;
            // this.partSp_0.visible = false;
        }

        private onLoadPart1(part: laya.particle.ParticleSetting): void
        {
            this.partSp_1 = new laya.particle.Particle2D(part);
            this.partSp_1.emitter.start();
            this.scene.addChild(this.partSp_1);
            this.partSp_1.x = this.scene.width / 2;
            this.partSp_1.y = 0;
            this.partSp_1.visible = false;
        }

        private onLoadPart2(part: laya.particle.ParticleSetting): void
        {
            this.partSp_2 = new laya.particle.Particle2D(part);
            this.partSp_2.emitter.start();
            this.scene.addChild(this.partSp_2);
            this.partSp_2.x = this.scene.width / 2;
            this.partSp_2.y = 0;
            this.partSp_2.visible = false;
        }

        showPointInfo()
        {
            let check_point = FZGameData.instance.getCheckPoint();
            if (check_point <= 1)
            {
                check_point = 1;
                this.scene.pre_point_bg.visible = false;
            } else if (check_point >= FZGameData.instance.max_check_point_count) {
                check_point = FZGameData.instance.max_check_point_count;
                this.scene.next_point_bg.visible = false;
            }
            else
            {
                this.scene.pre_point_bg.visible = true;
                this.scene.next_point_bg.visible = true;
            }
            this.scene.cur_point_lbl.text = check_point.toString();
            this.scene.pre_point_lbl.text = (check_point - 1).toString();
            this.scene.next_point_lbl.text = (check_point + 1).toString();
        }

        checkLuckyRotaryCount(){
            //let resetTime = FZMergeDateManager.instance.getRotaryTabelResetTime();
            let maxCount = FZMergeDateManager.instance.getRotaryTableFreeCount();
            let curCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", "5"));
            // if (curCount > 0 && !this.scene.main_ani_zhuanpan.isPlaying) {
            //     this.scene.main_ani_zhuanpan.play();
            // }
            // if (curCount <= 0 && this.scene.main_ani_zhuanpan.isPlaying) {
            //     // this.scene.main_ani_zhuanpan.stop();
            //     this.scene.main_ani_zhuanpan.gotoAndStop(0);
            // }

            return curCount;
        }


        checkWeaponLevelUpTag(){
            this.getUnlockWeapon();  //获取是否解锁了相应武器的数据
            this.getWeapeonNoticeCtr();  //刷新武器升级红点提示
            this.scene.img_levelUp_notice.visible = false;
            let coin = FZGameData.instance.getWeaponsCoin();
            let diamond = FZMergeDateManager.instance.getGameDiamond();

            let mainLevel = FZGameData.instance.getMainWeaponLevel();
            let mainCost = FZCfgManager.instance.getBaseMainWeapons()[mainLevel+''].cost;

            let mainWeaponLevel = FZGameData.instance.getMainWeaponLevel();
            if (coin >= mainCost && !this.WeaponFullLevel/* && !(mainWeaponLevel >= FZGameData.instance.mainWeaponMaxLevel)*/) {
                this.scene.img_levelUp_notice.visible = true;
                return;
            }

            let deputyLevel = FZGameData.instance.getDeputyWeaponLocalLevel();
            if (deputyLevel) {
                let deputyCost = FZCfgManager.instance.getDeputyWeapons(deputyLevel).sCoin;
                let needMoney = FZCfgManager.instance.getDeputyWeapons(deputyLevel).sChoice == 1 ? coin : diamond;
                let deputyWeaponMaxLevel = FZGameData.instance.getDeputyWeaponMaxLevel();
                let deputyWeaponLevel = FZGameData.instance.getDeputyWeaponLocalLevel();
                if (needMoney >= deputyCost && !this.WeaponFullLevel && !(deputyWeaponLevel >= deputyWeaponMaxLevel)) {
                    this.scene.img_levelUp_notice.visible = true;
                    return;
                }
            }

            let curSelectUav = FZGameData.instance.getCurUseUAV();
            if (curSelectUav != -1) {
                let uavLocalData = FZGameData.instance.getUAVData();
                if (!uavLocalData) {
                    return;
                }

                let uavConfig = FZCfgManager.instance.getUAVWeaponsCfg();
                let pay = uavConfig[curSelectUav.toString()][uavLocalData[curSelectUav.toString()]].Coin;
                if (coin >= pay && !this.WeaponFullLevel){
                     this.scene.img_levelUp_notice.visible = true;
                }
            }else if(curSelectUav == -1 && FZGameData.instance.getCheckPoint() >= FZGameData.instance.getUAVWeaponOpenPoint()){  //解锁了无人机，但是没有选择
                this.scene.img_levelUp_notice.visible = true;
            }
        }

        checkShopFreeCarTag()
        {
            let showShopFreeTag = false;
            this.shopFreeCarindex = -1;
            let curMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();
            let carConfig = FZCfgManager.instance.getRoadsideCarList();
            for (let key in carConfig)
            {
                if (carConfig[key].level == curMaxLevel)
                {
                    let bonusCar_level = carConfig[key].bonusCar_level
                    let time = new Date().getTime();
                    let lastVideoCarTime = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_LAST_VIDEO_BUY_CAR", "0");
                    if (bonusCar_level && bonusCar_level != -1 && (time - parseInt(lastVideoCarTime)) > FZMergeDateManager.instance.SHOP_VIDEO_BUY_CAR)
                    {
                        this.shopFreeCarindex = bonusCar_level - 1;
                        showShopFreeTag = true;
                    }
                    break;
                }
            }

            this.scene.shop_free_tag.visible = showShopFreeTag;
            if(showShopFreeTag){
                this.scene.free_tag_scale_ani.play(0,true);
            }else{
                this.scene.free_tag_scale_ani.gotoAndStop(0);
            }
        }

        showItemBox()
        {
        }

        /**
        * 空投车辆
        */
        onRandomCar()
        {
        }

        /**
         * 更改价格
         */
        public onChangePrice(): void
        {
            this.onUpdateBuyCar();
        }
        /**
         * 加速
         */
        // onUpdateSpeed()
        // {
        //     var time = Math.ceil(FZMergeDateManager.instance.getTempSpeedTime() / 1000);
        //     var speed = FZMergeDateManager.instance.getTempSpeed();
        //     if (time != 0)
        //     {
        //         //this.scene.lab_speed_up.text = "加速:" + speed*100 + "%" + "   "+ time + "s";
        //         let time_str = "00:00";
        //         if (time >= 60)
        //         {
        //             let min = Math.floor(time / 60);
        //             let sec = time % 60;
        //             let min_str = (min >= 10) ? min + "" : "0" + min;
        //             let sec_str = (sec >= 10) ? sec + "" : "0" + sec;
        //             time_str = min_str + ":" + sec_str;
        //         } else
        //         {
        //             time_str = (time >= 10) ? "00:" + time : "00:0" + time;
        //         }
        //         this.scene.lbl_speed_time.text = time_str;
        //         this.scene.btn_time_red.visible = false;
        //     } else
        //     {
        //         //this.scene.lab_speed_up.text = "加速:" + speed*100 + "%";
        //         this.scene.lbl_speed_time.text = "收益X5";
        //         this.scene.btn_time_red.visible = true;
        //     }
        //     this.scene.lab_speed_up.text = "加速:" + speed * 100 + "%";
        // }
        /**
         * 刷新钞票
         */
        private onUpdateMoney():void
        {
            let count = FZUtils.formatNumberStr(FZGameData.instance.getWeaponsCoin().toString());
            this.scene.lab_game_money.text = count;
        }

        /**
         * 刷新钻石
         */
        private onUpdareDiamond(): void
        {
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
        }
        private updateShareConfig(): void{
            let isAuditVersion = FZWechat.instance.isAuditVersion();
            this.scene.btn_shop.visible = !isAuditVersion;
        }
        /**
         * 升级
         */
        public onUpLevel(): void
        {
            var level = FZMergeDateManager.instance.getUserLevel();
            // 显示升级界面
            //FZUIManager.instance.createUI(FZUIManager.UI_LevelUp);

            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_LAST_VIDEO_BUY_CAR", "0");
        }
        /**
         * 刷新金币
         */
        onUpdateGameGold(): void
        {
            var gold_str = FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold());
            var rate_str = "+" + FZUtils.formatNumberStr(FZMergeDateManager.instance.getGoldAllSpeed() + "") + "/s";
            let len = gold_str.length+rate_str.length;
            let _scale = 0.5;
            this.scene.lab_game_gold.text = gold_str;
            this.scene.lab_game_gold.scaleX = _scale;
            this.scene.lab_game_gold.scaleY = _scale;

            Laya.Tween.to(this.scene.lab_game_gold, { scaleX: _scale*1.2, scaleY: _scale*1.2 }, 200, Laya.Ease.expoInOut, Laya.Handler.create(this, function ()
            {
                this.scene.lab_game_gold.scaleX = _scale*1;
                this.scene.lab_game_gold.scaleY = _scale*1;
            }));
            this.onUpdateBuyCarState();
        }
        /**
         * 刷新经验
         */
        onUpdateExperience(): void
        {
            var level = FZMergeDateManager.instance.getUserLevel();
            var exp = FZMergeDateManager.instance.getUserExperience();
            // 增加经验动画
            if (exp - this.last_exp)
            {

            }
            var exp_max = FZCfgManager.instance.getLevelInfo(level).level_up_exp;
            this.scene.lv_label.text = level + "";
            if (exp_max == -1)
            {
                exp_max = exp;
            }

            let lv_progress = exp / exp_max;
            let pro_height = lv_progress * this.scene.lv_pro_bg.height;
            pro_height = Math.min(pro_height, 56);
            pro_height = Math.max(pro_height, 1);
            this.scene.lv_pro.height = pro_height;

            this.last_exp = exp;
        }

        /**
         * 刷新金币速率
         */
        private onUpdateGoldSpeed(): void
        {
            let game_temp_earning_time = FZMergeDateManager.instance.getGameTempEarningTime();
            if (game_temp_earning_time > 0)
            {
                if (!this.earning)
                {
                    this.earning = true;
                    this.scene.animation_5_1.visible = true;
                    this.scene.animation_5_1.play(0, true);
                    this.scene.animation_5_2.visible = true;
                    this.scene.animation_5_2.play(0, true);
                    // if (this.partSp_0) {
                    //     this.partSp_0.visible = true;
                    //     this.partSp_1.visible = true;
                    //     this.partSp_2.visible = true;
                    // }
                }
                FZMergeDateManager.instance.setGameTempEarningTime(-1)
            } else
            {
                if (this.earning)
                {
                    this.scene.animation_5_1.visible = false;
                    this.scene.animation_5_1.stop();
                    this.scene.animation_5_2.visible = false;
                    this.scene.animation_5_2.stop();
                    // if (this.partSp_0) {
                    //     this.partSp_0.visible = false;
                    //     this.partSp_1.visible = false;
                    //     this.partSp_2.visible = false;
                    // }
                    this.earning = false;
                }
            }

            var str = "+" + FZUtils.formatNumberStr(FZMergeDateManager.instance.getGoldAllSpeed() + "") + "/s";
            this.scene.lab_game_rate.text = str;
            this.resetGoldLabPos();

            this.scene.lab_earnings.text = "收益:" + Math.floor(FZMergeDateManager.instance.getGameEarnings() * 100) + "%";
            this.onUpdateBuyCar();
        }

        resetGoldLabPos(){
            let off_w = 36;
            var gold_str = FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold());
            var rate_str = "+" + FZUtils.formatNumberStr(FZMergeDateManager.instance.getGoldAllSpeed() + "") + "/s";
            let len = gold_str.length+rate_str.length;
            let _scale = 0.5;
            this.scene.lab_game_gold.scaleX = _scale;
            this.scene.lab_game_gold.scaleY = _scale;
            // this.scene.lab_game_rate.x = this.scene.lab_game_gold.x+(off_w*_scale*gold_str.length);
            // this.scene.lab_game_gold.x = this.scene.lab_game_rate.x-(off_w*0.3*rate_str.length);
        }

        /**
         * 初始化车位
         */
        private initCarSlot(): void
        {
            for (var i = 0; i < 12; i++)
            {
                var car = new FZSlotNode();
                car.addParent(this.scene.list_car_pos);
                this.carSlotList.push(car);
                var param: any = {};
                param.index = i;
                car.setParam(param);
            }
        }

        /**
         * 刷新车位
         */
        private onUpdateCarSlot()
        {
            var count = FZMergeDateManager.instance.getGameCarSlot();
            this.pos_list = FZMergeDateManager.instance.getGameCarSlotPos(count);
            if (!FZUtils.isNullOrEmpty(this.pos_list))
            {
                var CarSlotData = FZMergeDateManager.instance.getCarSlotData()
                for (var i = 0; i < 12; i++)
                {
                    if (i < count)
                    {
                        this.scene["sprite_pos" + i].visible = true;
                        this.scene["sprite_pos" + i].x = this.pos_list[i].x;
                        this.scene["sprite_pos" + i].y = this.pos_list[i].y;
                        FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": i });//更新车的位置
                    } else
                    {
                        this.scene["sprite_pos" + i].visible = false;
                        this.scene["sprite_pos" + i].x = -100;
                        this.scene["sprite_pos" + i].y = -100;
                    }

                }
            }
        }

        public onClickPointBg(param)
        {
            let max_check_point = FZGameData.instance.getMaxCheckPoint();
            if (max_check_point < FZGameData.instance.getChoosePointOpenPoint()) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : FZGameData.instance.getChoosePointOpenPoint()+"关之后可选关"});
                return;
            }
            tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheSelectLevelButton,[]);
            FZUIManager.instance.createUI(FZUIManager.UI_CheckPointChoose);

            /*let check_point = FZGameData.instance.getCheckPoint();
            switch (param)
            {
                case "pre":
                    if (check_point <= 1)
                    {
                        return;
                    }
                    FZGameData.instance.setCheckPoint(check_point - 1);
                    if (check_point <= 2)
                    {
                        this.scene.pre_point_lbl.text = "";
                    } else
                    {
                        this.scene.pre_point_lbl.text = (check_point - 2).toString();
                    }
                    this.scene.cur_point_lbl.text = (check_point - 1).toString();
                    this.scene.next_point_lbl.text = check_point.toString();
                    break;

                case "cur":
                    break;

                case "next":
                    if (check_point >= max_check_point)
                    {
                        return;
                    }
                    FZGameData.instance.setCheckPoint(check_point + 1);
                    this.scene.pre_point_lbl.text = check_point.toString();
                    this.scene.cur_point_lbl.text = (check_point + 1).toString();
                    this.scene.next_point_lbl.text = (check_point + 2).toString();
                    break;
            }*/
        }

        public onClickItemBox()
        {
        }

        public addItemCarCount(count: number)
        {
            for (let i = 0; i < count; i++)
            {
                this.itemBoxCarCount++;
            }
        }

        /**
         *
         * @param params 按钮回调
         */
        public onBtnClick(params)
        {
            FZDebug.D("点击按钮-----------" + params);

            if(params != "btn_car_list"){
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            }

            if (params == "btn_add_diamond")
            {

            }
            else if (params == "btn_car_list")
            {
                if(this.softGuideType == FZGameStatus.softGuidePriority.buyCar)
                {
                    this.softGuideType = 0;
                    this.scene.carList_hand.visible = false;
                    FZGameData.instance.isHandGuideFix = false;
                }
                /**
                 * 操作打断 无操作计时
                 */
                this.resetBuySoftGuide();
                this.onBuyCar();
                FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
            }
            else if (params == "btn_start_game")
            {
                if (FZMergeDateManager.instance.isMergeState == true) {
                    return
                }
                //FZSoundManager.instance.stopBgm();
                FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
                FZUIManager.instance.createUI(FZUIManager.UI_FZGameJiaZaiUI,"game");
                tywx.BiLog.clickStat(tywx.clickStatEventType.onClickStartGame,[]);
            }
            else if (params == "btn_time")
            {
                // FZUIManager.instance.createUI(FZUIManager.UI_AddRevenueDialog);
            }
            else if (params == "btn_shop")
            {
                // tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserShare,[]);
                FZUIManager.instance.createUI(FZUIManager.UI_ShopDialog,this.shopFreeCarindex);
                if(FZMergeDateManager.instance.getCarMaxLevel()>5)
                {
                    this.resetShopSoftGuide();
                    FZMergeDateManager.instance.setShopSoftGuide(1);
                }
            }
            else if (params == "sprte_change_car")
            {
                FZUIManager.instance.createUI(FZUIManager.UI_SelectView);

            }
            else if (params == "btn_rotaryTable")
            {
                FZUIManager.instance.createUI(FZUIManager.UI_LuckyGuy);
                // FZUIManager.instance.createUI(FZUIManager.UI_BeOffline);
            }
            else if (params == "btn_levelUp")
            {
                FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
                FZUIManager.instance.createUI(FZUIManager.UI_WeaponLevelUpView);
                this.scene.lvUp_hand.visible = false;
                FZGameData.instance.getLvUpGuideTouch(1);
                if(!this.runSoftGuide)
                {
                    this.softGuideRunning();
                }
            } else if (params == "air_drop_box"){
                this.airDropClick();  // 点击空投箱触发事件
            } else if (params == "btn_more_game"){
                if(FZMergeDateManager.instance.getPopJcdlCfg().length > 0){
                    FZJcdlTypeUI.instance.create({type : 4 });  //创建抽屉交叉导流
                }else{
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text: "无可试玩的游戏，请明天再来～"});
                }
                // FZSaveDateManager.instance.setItemToLocalStorage("MORE_GAME_NOTICE", "false");
                // this.updateMoreGameNotice();
            }else if(params == "btn_online_gift"){
                if(!this.checkGift){
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "倒计时结束点击宝箱有惊喜~"});
                }else{
                    FZUIManager.instance.createUI(FZUIManager.UI_OnlineGift, 1);
                }
            } else if( params == "img_clean" ){  // 点击删除车辆 事件
                this.clickTrashInGuide();
            }
        }

        /**
         * 更新更多游戏红点提示
         */
        public updateMoreGameNotice(){
            var num = FZMergeDateManager.instance.getPopJcdlCfg().length;
            if(num > 0){
                this.scene.more_game_notice_img.visible = true;
                this.scene.more_game_num.visible = true;
                this.scene.more_game_num.text = num + "";
            }else{
                this.scene.more_game_notice_img.visible = false;
                this.scene.more_game_num.visible = false;
            }
        }

        /**
         * 刷新状态
         */
        private onUpdateBuyCarState(): void
        {
            var game_gold = FZMergeDateManager.instance.getGameGold();
            if (game_gold > 0 && FZUtils.StrJudge(game_gold + "", this.buy_car_info["price"]) != 0)
            {
                this.scene.btn_car_list.gray = false;
                this.softCanBuyCar = true;
                //this.scene.btn_car_list.disabled = false;
            } else
            {
                this.scene.btn_car_list.gray = true;
                this.softCanBuyCar = false;
                //this.scene.btn_car_list.disabled = true;
            }
        }
        /**
         * 刷新购买车UI
         */
        private onUpdateBuyCar(): void
        {
            　//FZDebug.D("刷新购买车UI--------------onUpdateBuyCar");

            this.buy_car_info = FZMergeDateManager.instance.getCheapestCar();
            this.scene.img_buy_car.skin = this.buy_car_info["path"];
            this.scene.label_buy_car_price.text = FZUtils.formatNumberStr(this.buy_car_info["price"]);
            var game_gold = FZMergeDateManager.instance.getGameGold();
            if (game_gold > 0 && FZUtils.StrJudge(game_gold + "", this.buy_car_info["price"]) != 0)
            {
                this.scene.btn_car_list.gray = false;
                this.softCanBuyCar = true;
                //this.scene.btn_car_list.disabled = false;
            } else
            {
                this.scene.btn_car_list.gray = true;
                this.softCanBuyCar = false;
                //this.scene.btn_car_list.disabled = true;
            }
        }

        /**
         * 购买车按钮回调
         */
        public onBuyCar()
        {
            //1 判断卡槽是否还存在
            //2 创建车辆
            var _index = FZMergeDateManager.instance.JudgeSolt();
            if (_index == -1)
            {
                // 卡槽已满
                FZDebug.D("车位已满--------------");
                FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                    FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "FULL");
                }
            } else
            {
                var game_gold = FZMergeDateManager.instance.getGameGold();
                if (game_gold > 0 && FZUtils.StrJudge(game_gold + "", this.buy_car_info["price"]) != 0)
                {
                    // 减去金币
                    FZMergeDateManager.instance.SubtractGameGold(this.buy_car_info["price"]);
                    var data: any = {};
                    data.level = this.buy_car_info.level;
                    data.state = 2; // 1 直接显示  0 显示箱子 2 缩小动作
                    let needLeveUp = this.showCarFreeLeveUp(data.level);
                    if (FZMergeDateManager.instance.showFreeLvUpCar && needLeveUp != -1)
                    {
                        data.needLeveUp = needLeveUp;
                        FZUIManager.instance.createUI(FZUIManager.UI_FreeLeveUp, { "index": _index, "data": data });
                    } else
                    {
                        // 修改车位数据
                        FZMergeDateManager.instance.changeCarSlotData(_index, data);
                        // 增加车辆的购买次数
                        FZMergeDateManager.instance.addBuyCarCount(this.buy_car_info.level, FZGameStatus.QMoneyType.Coin);
                        //更新车的位置
                        FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": _index });
                        // 刷新最优车辆
                        this.onUpdateBuyCar();
                    }
                    FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.buy_car);
                    tywx.BiLog.clickStat(tywx.clickStatEventType.onClickFastBuyCar,[]);
                } else
                {
                    FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                    if(FZGameData.instance.getLvUpGuideTouch(null) == 1 && FZMergeDateManager.instance.getShopSoftGuide() == 0 && this.softGuideType == 0)
                    {
                        // let isAuditVersion = FZWechat.instance.isAuditVersion();
                        // if(FZMergeDateManager.instance.getCarMaxLevel()>3 && FZMergeDateManager.instance.getCarMaxLevel()<10 && !isAuditVersion)
                        // {
                        //     this.scene.shop_hand.visible = true;
                        //     FZGameData.instance.isHandGuideFix = true;
                        //     this.softGuideType = FZGameStatus.softGuidePriority.shop;
                        // }
                    }
                    FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.gold);
                }
            }
        }

        /**
         * 判断是否可以免费升级购买的车辆
         */
        private showCarFreeLeveUp(buyVarLv)
        {
            let next_level = -1;
            let time = new Date().getTime();
            let lastFreeLvUp = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_LAST_CAR_FREE_LEVEL_UP", "0");
            if (time - parseInt(lastFreeLvUp) > FZMergeDateManager.instance.CAR_FREE_LEVEL_UP)
            {
                let unlock_buy_gold_level = -1;
                let carConfig = FZCfgManager.instance.getRoadsideCarList();
                if (carConfig)
                {
                    let curMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();
                    for (let key in carConfig)
                    {
                        if (carConfig[key].level == curMaxLevel)
                        {
                            unlock_buy_gold_level = carConfig[key].unlock_buy_gold_level;
                        }
                    }
                    let offLv = unlock_buy_gold_level - buyVarLv;
                    if (unlock_buy_gold_level != -1 && offLv)
                    {
                        let freeCarsConf = FZCfgManager.instance.getFreeCarsLevelUpConf();
                        let randomNum = Math.random() * 10000;
                        if (randomNum <= freeCarsConf[offLv]["freelevelup_chance"])
                        {
                            next_level = freeCarsConf[offLv]["plus_level"];
                            // console.log("免费升级购买车辆 showCarFreeLeveUp------ 升级等级 level = " + next_level);
                            return next_level;
                        }
                    }
                    // console.log("免费升级购买车辆未达成 showCarFreeLeveUp------");
                    return next_level;
                }
            }
            // console.log("免费升级购买车辆时间未到 showCarFreeLeveUp------ offTime = " + (time - parseInt(lastFreeLvUp)));
            return next_level;
        }

        /**
         * 按下
         */
        private onMouseDown(param): void
        {
            FZDebug.D("onMouseDown  ");
            var pos: any = this.scene.localToGlobal(new Laya.Point(param.stageX, param.stageY));
            pos.stageX = pos.x;
            pos.stageY = pos.y;
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_DOWN, pos);

            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_CLOSE_DRAWER);
        }
        // 选中的车的原始位置
        private oldpos: any = {};
        // 选中的车的原始等级
        private select_index: number = 0;
        /**
         * 选中车 返回
         * @param index  车位
         */
        private onSelectedCar(index: any): void
        {
            if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "HAND"); // 判定是否处于删除车辆手指正在引导
            }
            // 获取 车位数据
            var CarSlotData = FZMergeDateManager.instance.getCarSlotData();
            var car_slot_data = CarSlotData[index + ""];
            if (car_slot_data == null|| car_slot_data.level == null) {
                return;
            }
            var car_data = FZCfgManager.instance.getCarInfoById(car_slot_data.level);
            if (car_data == null) {
                return;
            }
            this.scene.sprite_move.zOrder = 1000;
            this.scene.sprite_move.skin = car_data.path;
            this.select_index = index;
            this.touch = true;
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_SHOW_PROMPT, car_slot_data.level);
            // 车位 位置
            var count = FZMergeDateManager.instance.getGameCarSlot();
            var pos_list = FZMergeDateManager.instance.getGameCarSlotPos(count);
            var pos = pos_list[index];
            this.scene.sprite_move.x = pos.x - 10 + 84//this.scene.sprite_move.width/2;
            this.scene.sprite_move.y = pos.y - 50 + 72.5//this.scene.sprite_move.height/2;
            this.oldpos.x = pos.x + this.scene.sprite_move.width / 2;
            this.oldpos.y = pos.y + this.scene.sprite_move.height / 2;
        }

        /**
         * 移动
         */
        private onMouseMove(param): void
        {
            this.inCleanNode();
            if (this.touch == true)
            {
                var pos: any = this.scene.localToGlobal(new Laya.Point(param.stageX, param.stageY));
                pos = this.scene.list_car_pos.globalToLocal(pos);
                this.scene.sprite_move.x = pos.x; //- this.d_width;
                this.scene.sprite_move.y = pos.y; //- this.d_height;
            }
        }

        /**
         * 移出
         */
        private onMouseOut(param): void
        {
            if (this.touch == true)
            {
                this.touch = false;
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_OUT);
                Laya.Tween.to(this.scene.sprite_move, { x: this.oldpos.x, y: this.oldpos.y }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, function ()
                {
                    this.scene.sprite_move.x = -1000;
                }), 0, true, true);
            }
        }
        /**
         * 抬起
         */
        private onMouseUp(param): void
        {
            if (this.touch == true)
            {
                this.touch = false;
                this.scene.sprite_move.x = -1000;
                var pos: any = this.scene.localToGlobal(new Laya.Point(param.stageX, param.stageY));
                pos.stageX = pos.x;
                pos.stageY = pos.y;
                pos.select_index = this.select_index;
                if (pos && !FZUtils.isNullOrEmpty(pos.stageX) && !FZUtils.isNullOrEmpty(pos.stageY) ) {
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP, pos);
                }
            }
        }

         /**
         * 监听鼠标的位置，位于垃圾桶的时候，垃圾桶出现大小和明暗的变化
         */
        private inCleanNode(): void{
            if(this.scene.sprite_move.x >= 30 && this.scene.sprite_move.x <= 140 && this.scene.sprite_move.y >= 1174 && this.scene.sprite_move.y <= 1284){
                this.haveMoveInTrash = true;
                FZEventManager.instance.sendEvent(FZEvent.IN_CLEAN, true);
            }else{
                // 只有在移动 进入过一次之后才执行这里
                if( this.haveMoveInTrash == true ){
                    FZEventManager.instance.sendEvent(FZEvent.OUT_CLEAN, false);
                    this.haveMoveInTrash = false;
                }
            }
        }

        /**
         * 合成新车
         */
        public onCreateGainCarDiaog(): void
        {
            FZUIManager.instance.createUI(FZUIManager.UI_GainCar);
        }

        /**
         * ***************软引导****************
         */
        public softGuideRunning()
        {
            return;
            if(FZWechat.instance.isAuditVersion())
            {
                this.runSoftGuide = false;
                return;
            }
            //软引导的一些东西们
            let lvUpGuide = FZGameData.instance.getLvUpGuideTouch(null);
            let stepIdx   = FZGameData.instance.newPlayerGudieStep(null);
            if(FZMergeDateManager.instance.getCarMaxLevel() < 7){
                if(lvUpGuide == 1 && stepIdx < 0)
                {
                    this.runSoftGuide = true;
                    let canSoftSynthetic = FZMergeDateManager.instance.getSyntheticSoft();
                    if(canSoftSynthetic == 0)
                    {
                        Laya.timer.loop(1000,this,this.syntheticTimeCheck);
                    }
                    let times = FZMergeDateManager.instance.getBuyGuideTime();
                    if(times >= 30)
                    {
                        this.resetBuySoftGuide();
                        this.checkBuyGuide();

                    }
                    Laya.timer.loop(1000,this,this.buyGuideTimeCheck);
                }else{
                    this.runSoftGuide = false;
                }
            }else{
                FZMergeDateManager.instance.setSyntheticSoft(1);
            }
        }

        public buyGuideTimeCheck()
        {
            FZMergeDateManager.instance.setBuyGuideTime(1);
            let times = FZMergeDateManager.instance.getBuyGuideTime();
            if(times >= 5)
            {
                this.checkBuyGuide();
            }
        }

        public syntheticTimeCheck()
        {
            this.syntheticTimes --;
            if(this.syntheticTimes < 0 && this.softGuideType == 0)
            {
                this.syntheticGuide();
            }
            if(this.syntheticTimes < 0)
            {
                this.syntheticTimes = 3;
            }
        }

        public resetSoftGuide()
        {
            //去掉商店引导
            this.resetShopSoftGuide();
            if(this.runSoftGuide){
                this.resetSyntheticGuide();
                this.resetBuySoftGuide();
            }
            this.softGuideType = 0;
        }

        public resetSyntheticGuide()
        {
            let canSoftSynthetic = FZMergeDateManager.instance.getSyntheticSoft();
            if(canSoftSynthetic == 0 && this.softGuideType == FZGameStatus.softGuidePriority.synthetic)
            {
                //**关闭合成车的引导了*/
                Laya.timer.clear(this,this.syntheticTimeCheck);
                this.softGuideType  = 0;
                FZMergeDateManager.instance.setSyntheticSoft(1);
            }
        }

        public resetBuySoftGuide()
        {
            FZMergeDateManager.instance.resetBuyGuideTime();
            this.scene.carList_hand.visible = false;
            FZGameData.instance.isHandGuideFix = false;
            this.resetSyntheticGuide();
            this.resetShopSoftGuide();
        }

        public resetShopSoftGuide()
        {
            if(this.softGuideType == FZGameStatus.softGuidePriority.shop)
            {
                this.scene.shop_hand.visible = false;
                FZGameData.instance.isHandGuideFix = false;
                this.softGuideType = 0;
            }
        }

        private refreshLuckyRedHint():void
        {
            let luckyTimes = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", "5"));
            this.scene.imgRedHint.visible = (luckyTimes!=0 || FZMergeDateManager.instance.getIsFirstClickLuckyState()==0);
            this.scene.lab_luck_num.text = luckyTimes + "";
        }

        /**
         * 获取无人机解锁的关卡限制
         */
        public getUavLockPoint(){
            let UAVConfig = FZCfgManager.instance.getUAVWeaponsCfg();
            if(!UAVConfig){
                return;
            }
            for(let key in UAVConfig){
                UAVConfig[key].pos = key
                this.listUAVData.push(UAVConfig[key])
            }
        }

        /**
         * 刷新武器升级按钮的红点提示
         */
        public getWeapeonNoticeCtr(){
            let judge = FZSaveDateManager.instance.getItemFromLocalStorage("ALL_FULL_LEVEL", "false");
            if(judge == "false"){
                this.WeaponFullLevel = false;
            }else{
                this.WeaponFullLevel = true;
            }

            let curSelectUavData1 = this.listUAVData[0];
            let curSelectUavData2 = this.listUAVData[1];
            let curSelectUavData3 = this.listUAVData[2];
            let curSelectUavData4 = this.listUAVData[3];
            let curSelectUavData5 = this.listUAVData[4];

            let curCarMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();  //车辆最大等级
            let curCheckPoint = FZGameData.instance.getCheckPoint();  //解锁的最大关卡
            if(this.unlockDeputy == "false" && curCarMaxLevel >= FZGameData.instance.getDeputyWeaponOpenPoint()){
                this.unlockDeputy = "true";
                this.WeaponFullLevel = false; //解锁副武器的时候，副武器肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_DEPUTY", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁副武器");
                return ;
            }
            if(this.unlockUav1 == "false" && curCheckPoint >= curSelectUavData1[1].unlocking){
                this.unlockUav1 = "true";
                this.WeaponFullLevel = false; //解锁第一个无人机的时候，第一个无人机肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_UAV_1", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁无人机1");
                return ;
            }
            if(this.unlockUav2 == "false" && curCheckPoint >= curSelectUavData2[1].unlocking){
                this.unlockUav2 = "true";
                this.WeaponFullLevel = false; //解锁第二个无人机的时候，第二个无人机肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_UAV_2", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁无人机2");
                return ;
            }
            if(this.unlockUav3 == "false" && curCheckPoint >= curSelectUavData3[1].unlocking){
                this.unlockUav3 = "true";
                this.WeaponFullLevel = false; //解锁第三个无人机的时候，第三个无人机肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_UAV_3", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁无人机3");
                return ;
            }
            if(this.unlockUav4 == "false" && curCheckPoint >= curSelectUavData4[1].unlocking){
                this.unlockUav4 = "true";
                this.WeaponFullLevel = false; //解锁第四个无人机的时候，第四个无人机肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_UAV_4", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁无人机4");
                return ;
            }
            if(this.unlockUav5 == "false" && curCheckPoint >= curSelectUavData5[1].unlocking){
                this.unlockUav5 = "true";
                this.WeaponFullLevel = false; //解锁第五个无人机的时候，第五个无人机肯定不是满级
                FZSaveDateManager.instance.setItemToLocalStorage("UNLOCK_UAV_5", "true");
                FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                // console.log("解锁无人机5");
                return ;
            }
        }

        public getUnlockWeapon(){
            this.unlockDeputy = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_DEPUTY", "false");
            this.unlockUav1 = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_UAV_1", "false");
            this.unlockUav2 = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_UAV_2", "false");
            this.unlockUav3 = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_UAV_3", "false");
            this.unlockUav4 = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_UAV_4", "false");
            this.unlockUav5 = FZSaveDateManager.instance.getItemFromLocalStorage("UNLOCK_UAV_5", "false");
            // console.log("解锁的无人机");
            // console.log(this.unlockUav1 + this.unlockUav2 + this.unlockUav3 + this.unlockUav4 + this.unlockUav5 + this.unlockDeputy);
        }

        /**
         * 记录宝箱出现的时间
         */
        public onlineGiftTime(){
            this.checkGift = false;
            let giftTimeArr = FZCfgManager.instance.getOnlineGiftTime();  //获取在线宝箱的出现间隔时间配置
            let timeIndex = this.getGiftShowTime();  //获取玩家成功获取在线宝箱的次数
            if(Number(timeIndex) > giftTimeArr.length - 1 || Number(timeIndex) < 0){  //边界判断
                timeIndex = 7 + "";
            }
            var gift_time = giftTimeArr[timeIndex] * 1000;  //倒计时时间
            if(FZResManager.instance.RES_GAME){  //已经加载过游戏
                let time = new Date().valueOf();
                let timeStart = Number(FZSaveDateManager.instance.getItemFromLocalStorage("GIFT_TIME_START", ""));
                if(time - timeStart > gift_time){  //在线时间大于配置时间时，显示在线宝箱
                    this.checkGift = true;
                    this.giftAlready();
                }else{  //在线时间小于配置时间时，继续计时
                    gift_time = gift_time - (time - timeStart);
                    // Laya.timer.once(gift_time, this, this.showGift);
                    this.check_time = Math.floor(gift_time / 1000);
                    this.scene.img_onlineBox_notice.visible = false;
                    this.showTime();
                    Laya.timer.loop(1000, this, this.showTime);
                }
            }else{  //没有加载过游戏
                this.check_time = Math.floor(gift_time / 1000);
                this.scene.img_onlineBox_notice.visible = false;
                this.showTime();
                Laya.timer.loop(1000, this, this.showTime);
            }
        }

        /**
        * 倒计时显示控制
        */
        showTime(){
            if(this.check_time > 1){
                this.check_time--;
                let sec = (this.check_time % 60);
                let sec1 = Math.floor((sec / 10)).toString();//second的第一位
                let sec2 = (sec % 10).toString();//second的第二位

                let min = Math.floor((this.check_time / 60));
                let min1 = Math.floor((min / 10)).toString();//minute的第一位
                let min2 = (min % 10).toString();//minute的第二位
                this.scene.time.text = min1 + min2 + ":" + sec1 + sec2;
                this.scene.time.color = "#ffd934";
                // this.scene.time.y = 80;
                this.scene.time.visible = true;
                this.scene.gift_label_bg.visible = false;
            }else{
                this.checkGift = true;
                this.giftAlready();
            }
        }
        /**
         * 显示在线宝箱
         */
        public giftAlready(){
            //  更换宝箱资源 —— 打开
            this.scene.gift_box.skin = "ui_main/onlineGift_Open.png";  //改变宝箱的资源
            //  宝箱动效显示
            if(!this.scene.flash_bg.visible){
                this.scene.flash_bg.visible = true;  //动效图片
                this.scene.flash_rotate.play(0, true);
            }
            // if(!this.scene.flash_around.visible){
            //     this.scene.flash_around.visible = true;  //动效图片
            //     this.scene.flash_alpha.play(0, true);
            // }
            this.scene.img_onlineBox_notice.visible = true;
            // this.scene.time.text = "可领取";  //隐藏倒计时
            // this.scene.time.color = "#ffffff";
            // this.scene.time.y=60;
            this.scene.time.visible = false;
            this.scene.gift_label_bg.visible = true;
        }

        /**
         * 获取玩家已经获得的在线宝箱个数
         */
        public getGiftShowTime(){
            this.getGiftTimes = FZSaveDateManager.instance.getItemFromLocalStorage("GET_GIFT_TIMES", "0");
            return this.getGiftTimes;
        }

        /**
         * 存储玩家已经获得的在线宝箱个数
         */
        public setGiftShowTime(giftTimes){
            FZSaveDateManager.instance.setItemToLocalStorage("GET_GIFT_TIMES", giftTimes);
        }

        /**
         * 成功获取在线宝箱后执行
         */
        public getGiftSuccess(){
            if(!this.scene){
                return;
            }
            let giftTimes = Number(this.getGiftTimes) + 1;  //在线宝箱获取次数+1
            this.setGiftShowTime(giftTimes);
            this.getGiftShowTime();
            this.scene.time.visible = true;  //成功获取宝箱后隐藏宝箱
            //  更换宝箱资源 —— 关闭
            this.scene.gift_box.skin = "ui_main/onlineGift.png";
            //  宝箱动效隐藏
            this.scene.flash_bg.visible = false;  //动效图片
            this.scene.flash_rotate.gotoAndStop(0);
            this.scene.flash_around.visible = false;  //动效图片
            this.scene.flash_alpha.gotoAndStop(0);
            //  宝箱隐藏后记录时间，以便在游戏界面的时候也记时
            let time = new Date().valueOf();
            FZSaveDateManager.instance.setItemToLocalStorage("GIFT_TIME_START", time.toString());

            this.onlineGiftTime();  //在线宝箱出现倒计时
        }

        /**
         * 判断是否是同一天
         */
        public isSameday(){
            let day = new Date().toLocaleDateString();
            if(day != FZSaveDateManager.instance.getItemFromLocalStorage("DAY", "0")){
                //不是同一天
                this.dateStorage(day);
                this.setGiftShowTime(0);
            }
        }

        /**
         * 存储日期
         */
        dateStorage(day){
            FZSaveDateManager.instance.setItemToLocalStorage("DAY", day);
        }
        //强制引导蒙层按钮层级移动处理
        public startForceGuide(nodeArr)
        {
            if(!nodeArr) return;
            this.scene.forceGuideBox.visible = true;
            FZUIManager.instance.setDialogActive(FZUIManager.UI_DrawerDialog,false);
            if(!this.scene.forceGuideMask.visible){//显示遮罩层
                this.scene.forceGuideBox.zOrder = 100;
                this.scene.forceGuideBox.updateZOrder();
                this.scene.forceGuideMask.width = Laya.stage.width;
                this.scene.forceGuideMask.height = Laya.stage.height;
                this.scene.forceGuideMask.alpha = 0.75;
                this.scene.forceGuideMask.visible =true;
            }

            this.guideBtnInfo = {//引导按钮相关信息
                node:[],
                parent:[],
                pos:[]
            };
            for(let i = 0; i < nodeArr.length; i++){
                this.guideBtnInfo.node.push(nodeArr[i]);//存入需要操作的引导节点组
            }
            if(nodeArr.length>1){
                this.guideBtnInfo.node.push(this.carSlotList[0].scene);
                this.guideBtnInfo.node.push(this.carSlotList[1].scene);
            }
            for(let i = 0; i < this.guideBtnInfo.node.length; i++){//获取节点组的父节点和坐标
                this.guideBtnInfo.pos.push([this.guideBtnInfo.node[i].x , this.guideBtnInfo.node[i].y]);
                this.guideBtnInfo.parent.push(this.guideBtnInfo.node[i].parent);
                this.scene.forceGuideBox.addChild(this.guideBtnInfo.node[i]);
                var worldpos = (this.guideBtnInfo.parent[i] as Laya.Sprite).localToGlobal(new Laya.Point(this.guideBtnInfo.node[i].x, this.guideBtnInfo.node[i].y));
                this.guideBtnInfo.node[i].x = worldpos.x;
                this.guideBtnInfo.node[i].y = worldpos.y;
            }
        }
        private releaseForceGuide()//强制引导结束还原节点层级
        {
            if(FZGameData.instance.newPlayerGudieStep(null)==FZGameStatus.NumForGuide.weaponUpdate){
                FZUIManager.instance.setDialogActive(FZUIManager.UI_DrawerDialog,true);
            }
            if(!this.guideBtnInfo) return;//没有需要还原的引导按钮组
            this.scene.forceGuideBox.visible = false;
            for(let i = 0; i < this.guideBtnInfo.node.length; i++){
                this.guideBtnInfo.parent[i].addChild(this.guideBtnInfo.node[i]);
                this.guideBtnInfo.node[i].x = this.guideBtnInfo.pos[i][0];
                this.guideBtnInfo.node[i].y = this.guideBtnInfo.pos[i][1];
            }
            this.guideBtnInfo = null;
        }
    }
}
export default game.view.FZMainUI;
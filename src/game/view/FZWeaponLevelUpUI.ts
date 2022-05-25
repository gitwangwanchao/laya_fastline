import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZWechat from "../core/FZWechat";
import FZShareInfo from "../logic/FZShareInfo";
import FZSceneManager from "../core/FZSceneManager";


namespace game.view
{
    export class FZWeaponLevelUpUI extends FZBaseUI
    {
        public scene : ui.view.WeaponLevelUpViewUI;

        private curCarUseLevel:number = 1;
        private curCarMaxLevel:number = 1;
        private curCheckPoint:number = 1;

        public deputyWeaponLevel: number = 1;
        public deputyLevelUpPayCount: number = 0;

        public mainWeaponLevel: number = 1;
        public baseMainWeaponData: any;
        public mainLevelUpPayCount: number = 0;

        public UAVConfig: any;
        public listUAVData: Array<any> = new Array<any>();
        public listUAVEntity: Array<any> = new Array<any>();
        public listUAVPos: Array<any> = new Array<any>();
        public UAVLocalData: any;
        public curUseUAV: number = -1;
        public uavWeaponMaxLevel: number = 100;
        public curSelectUAVIndex: number = 0;
        public uavLevelUpPayCount: number = 0;
        // 该变量使用于: 无人机 -------------------
        private canMove:boolean = false;
        private start_x: number; 
        private target_x: number;
        private max_x: number = 250;
        private min_x: number = 0;
        //--------------------------------------
        // 该变量使用于: 副武器
        private viceConfig:any;
        private canMoveByVice:boolean = false;
        private start_vice_x: number;
        private target_vice_x: number;
        private max_vice_x: number = 250;
        private min_vice_x: number = 0;
        private curSelectViceIndex:number = 0;
        private listCarPos:Array<any> = new Array<any>();
        private listViceData:Array<any> = new Array<any>();
        private listCarEntity:Array<any> = new Array<any>();
        private curUsedViceLevel: number = 1;
        private blackFilterByVice:any;
        private restoreColorByVice:any;
        private curViceMaxLevel: number = 0;
        private maxViceShiftNum : number = 4; // 区间档位为5档(0 - 4)
        private isVicePauseTime : boolean = false; // 是否正在暂停
        private autoRollTime : number = 300; // 页面回滚速度(毫秒)
        public deputyPreviewBtnCtr = "open"; // 预览按钮点击事件控制  开 OR 关
        public tryFree : boolean = false;  //每天可以试用一次
        public testLevel;  // 当前副武器的等级下限
        public deputyMoving = false;   // 避免连续点击 预览按钮
        public automaticBack = false;  //副武器进阶的时候抽屉弹出后自动收进去
        public isDeputyPreview:any = false;

        public deputyWeaponMaxLevel: number = 100;  // 副武器 最大等级数值     (如修改数目,这里记得修改)
        // --------------------------------------
        
        //--------------------------------------
        // 该变量使用于: 主武器
        private mainConfig:any;
        private canMoveByMain:boolean = false;
        private start_main_x: number;
        private target_main_x: number;
        private max_main_x: number = 250;
        private min_main_x: number = 0;
        private curSelectMainIndex:number = 0;
        private mainListCarPos:Array<any> = new Array<any>();
        private listMainData:Array<any> = new Array<any>();
        private mainlistCarEntity:Array<any> = new Array<any>();
        private curUsedMainLevel: number = 1;
        private mianWeaponLevelForView: number = 1;
        private blackFilterByMain:any;
        private restoreColorByMain:any;
        private curMainMaxLevel: number = 1;
        private maxMainShiftNum : number = 50; // 区间档位为50档(0 - 49)
        private mainSectionNum : number = 5;   // 区间档位差距数值 (默认值5 - 配置读取: getMainWeaponLevelArea )
        private autoRollTimeMain : number = 300; // 页面回滚速度(毫秒)
        public mainPreviewBtnCtr = "open"; // 预览按钮点击事件控制  开 OR 关
        public mainMoving = false;    // 避免连续点击 预览按钮
        public isMainPreview:any = false;  // 是否处于 预览打开状态

        public mainWeaponMaxLevel: number = 250; // 主武器 最大等级数值  (如修改数目,这里记得修改)
        // --------------------------------------
        // --------------------------------------
        // 该变量使用于: 子弹变化
        public bulletShootTimes = FZGameData.instance.bulletShootTimes;  //子弹发射次数
        // 副武器 - 子弹
        public deputyCount;  //子弹数量
        public deputyBallistic;  //弹道
        public deputyBulletModel;  //子弹模型
        public deputyShadowPic;  //子弹阴影
        public deputyDis;
        public deputyRota;
        public deputyFireFrequency;  //开火频率
        // 主武器 - 子弹
        public mainCount;  //子弹数量
        public mainBallistic;  //弹道
        public mainBulletModel;  //子弹模型
        public mainShadowPic;  //子弹阴影
        public mainDis;
        public mainRota;
        public mainFireFrequency;
        // --------------------------------------

        private blackFilter:any;
        private restoreColor:any;

        public uavIndex: any; // 已经解锁的无人机
        public weaponFullLevel: Array<any> = new Array<any>();  //所有已经解锁的武器是否全部满级

        public inUpdateGudie:boolean;

        public registerEvent():void{
            
            FZEventManager.instance.register(FZEvent.ON_UPDATE_WEAPONLEVEL_UI,this.onUpdateUI, this);
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateGameCash, this);
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            FZEventManager.instance.register(FZEvent.GAME_LVUPFLYRES_CTRL,this.playFlyAni,this);
        }

        public unregisterEvent():void{
            FZMergeDateManager.instance.removeDBullet();
            Laya.timer.clear(this, this.onUpdatePos);
            FZEventManager.instance.unregister(FZEvent.ON_UPDATE_WEAPONLEVEL_UI,this.onUpdateUI, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateGameCash, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            FZEventManager.instance.unregister(FZEvent.GAME_LVUPFLYRES_CTRL,this.playFlyAni,this);
            this.scene.list_container.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownByVice);
            this.scene.list_container.off(Laya.Event.MOUSE_UP, this, this.onMouseUpByVice);
            this.scene.list_container.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveByVice);
            this.scene.list_container.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutByVice);

            // 主武器 预览栏的按钮事件
            this.scene.Mainlist_container.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownByMain);
            this.scene.Mainlist_container.off(Laya.Event.MOUSE_UP, this, this.onMouseUpByMain);
            this.scene.Mainlist_container.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveByMain);
            this.scene.Mainlist_container.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutByMain);
        }

        public onDestroy() : void{
            if(this.inUpdateGudie){
                // FZEventManager.instance.sendEvent(FZEvent.CONTIMUE_GUIDE_ENTER);
                // FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
                FZGameData.instance.newPlayerGudieStep(FZGameStatus.NumForGuide.allStep);
                this.inUpdateGudie = false;
                FZEventManager.instance.sendEvent(FZEvent.FRESHAIRDROPSTATE);
            }
            FZSoundManager.instance.openWeaponLevelUp = 0;
            Laya.timer.clear(this, this.onClickDeputyPreviewBtn);
            // Laya.timer.clear(this, this.playFireSound);
        }
        /**
         * 刷新美钞
         */
        onUpdateGameCash():void{
            var str =  FZUtils.formatNumberStr(FZGameData.instance.getWeaponsCoin().toString()); 
            this.scene.lab_game_money.text = str;
            this.checkNotice();
        }
        /**
         * 刷新钻石
         */
        private onUpdareDiamond():void{
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
            this.checkNotice();
        }

        public init():void
        {
            this.scene = new ui.view.WeaponLevelUpViewUI();
            FZUtils.doUIPopAnim(this.scene.Anchorview);
            FZSoundManager.instance.openWeaponLevelUp = 1;

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            this.scene.btn_deputy.on(Laya.Event.CLICK, this, this.showDeputyWeaponBox, ["btn_deputy"]);
            this.scene.btn_main.on(Laya.Event.CLICK, this, this.showMainWeaponBox, ["btn_main"]);
            this.scene.btn_uav.on(Laya.Event.CLICK, this, this.showUavWeaponBox, ["btn_uav"]);

            // 副武器 预览栏的按钮事件 
            this.scene.list_container.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownByVice);
            this.scene.list_container.on(Laya.Event.MOUSE_UP, this, this.onMouseUpByVice);
            this.scene.list_container.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveByVice);
            this.scene.list_container.on(Laya.Event.MOUSE_OUT, this, this.onMouseOutByVice);

            // 主武器 预览栏的按钮事件
            this.scene.Mainlist_container.visible = false;
            // this.scene.Mainlist_container.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownByMain);
            // this.scene.Mainlist_container.on(Laya.Event.MOUSE_UP, this, this.onMouseUpByMain);
            // this.scene.Mainlist_container.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveByMain);
            // this.scene.Mainlist_container.on(Laya.Event.MOUSE_OUT, this, this.onMouseOutByMain);

            this.createFilter();   // 黑色背景图 To 无人机
            this.onUpdareDiamond();
            this.onUpdateGameCash();

            this.curCarUseLevel = FZMergeDateManager.instance.getCarUsedLevel() || 1;
            this.curCarMaxLevel = FZMergeDateManager.instance.getCarMaxLevel() || 1;
            this.curCheckPoint = FZGameData.instance.getCheckPoint() || 1;
            if (FZUIManager.instance.longScreen()) {
                // this.scene.btn_close.y+=70;
                // this.scene.lblTitle.y+=70;
                Laya.timer.frameOnce(1, this, () => {
                    this.scene.AnchorCenter.y += 70;
                    this.scene.box_title.y += 70;
                    this.scene.close_gudie_box.y += 70;
                });
            }
            this.checkLocking();

            this.initShowCar(); // 刷新平台上的展示
        }
         /**
         * 检查主武器升级引导
         */
        public checkGuide() 
        {
            if(FZGameData.instance.newPlayerGudieStep(null) == FZGameStatus.NumForGuide.weaponUpdate){
                //显示主武器引导
                this.scene.guide_box.visible = true;
                this.scene.guide_mask.width = Laya.stage.width;
                this.scene.guide_mask.height = Laya.stage.height;
                this.scene.guide_mask.alpha = 0.4;
                this.scene.lbl_main_lvup_pay_guide.text = this.scene.lbl_main_lvup_pay.text;
                this.scene.main_levelUp_notice_guide.visible = this.scene.main_levelUp_notice.visible;
                this.scene.update_gudie_box.visible = true;
                this.scene.guide_hand_ani.play(0,true);
                this.inUpdateGudie = true;
                
                // this.checkUpdateGuide();
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_guide_main_levelup, this, this.onClickMainLevelUp,[]);
            }
        }
        /**
         * 检查关闭按钮引导
         */
        public checkCloseGuide(){
            if(FZGameData.instance.newPlayerGudieStep(null) == FZGameStatus.NumForGuide.weaponUpdateBtn){
            //     //显示主武器引导
                this.scene.guide_box.visible = true;
                this.scene.guide_mask.width = Laya.stage.width;
                this.scene.guide_mask.height = Laya.stage.height;
                this.scene.guide_mask.alpha = 0.4;
                this.scene.close_gudie_box.visible = true;
                this.scene.close_hand_ani.play(0,true);
                this.inUpdateGudie = true;
                FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_guide_close, this, this.onClickBtnClose,[]);
                // this.checkUpdateGuide();
            }
        }
        /**
         * 刷新界面
         */
        public onUpdateUI() 
        {
            if (this.current_view == 0){
                this.showDeputyWeaponBox();
            }else if (this.current_view == 1){
                this.showMainWeaponBox();
            }else if (this.current_view == 2){
                this.showUavWeaponBox();
            }
        }

        /**
         * 判断是否解锁了无人机和副武器，没有解锁的时候不显示红点
         */
        checkLocking(){
            let deputyWeaponOpenPoint = FZGameData.instance.getDeputyWeaponOpenPoint() || 1;
            if (this.curCarMaxLevel < deputyWeaponOpenPoint) {
                // console.log("没有解锁副武器");
                this.weaponFullLevel[0] = true;
            }
            if(this.curCheckPoint < 40){
                // console.log("没有解锁无人机");
                this.weaponFullLevel[2] = true;
            }
        }
        
        setParam (param) {
            this.checkLocking();
            let hasMainNotice = false;
            let hasDeputyNotice = false;
            let hasUavNotice = false;

            let coin = FZGameData.instance.getWeaponsCoin() || 1;
            let needShowCount:number = 0;
            
            this.initMain();
            this.showMainInfo();
            this.initMainWeaponData();  // 初始化 主武器 信息(必须要写在 initMain)
    
            hasMainNotice = this.checkMainNotice();

            if (this.curCarMaxLevel >= FZGameData.instance.getDeputyWeaponOpenPoint()) {
                this.initDeputy();
                this.showDeputyInfo();
                this.initViceWeaponData();  // 初始化 副武器 信息(必须要写在 initDeputy之后)
                hasDeputyNotice = this.checkDeputyNotice();
 
                if(hasDeputyNotice && !hasMainNotice)
                {
                    needShowCount++;
                } 
            }

            if (this.curCheckPoint >= FZGameData.instance.getUAVWeaponOpenPoint()) {
                this.initUav();
                this.showUavInfo();
                hasUavNotice = this.checkUavNotice();

                if(hasUavNotice && !hasMainNotice)
                {
                    needShowCount++;
                } 
            }

            if(needShowCount >= 2 && !hasMainNotice)
            {
                hasMainNotice = false;
                hasDeputyNotice = true;
                hasUavNotice = false;
            }

            if (param) {
                if (param == "uav") {
                    this.showUavWeaponBox();
                } else if (param == "deputy") {
                    this.showDeputyWeaponBox();
                } else {
                    this.showMainWeaponBox();
                }
            } else {
                if (hasMainNotice) {
                    this.showMainWeaponBox();
                } else if (hasDeputyNotice) {
                    this.showDeputyWeaponBox();
                } else if (hasUavNotice) {
                    this.showUavWeaponBox();
                } else {
                    this.showMainWeaponBox();
                }
            }
        }

        private createFilter():void{
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，黑色
		    let blackMat = [
			    0, 0, 0, 0, 0, // R
			    0, 0, 0, 0, 0, // G
			    0, 0, 0, 0, 0, // B
			    0, 0, 0, 1, 0  // A
		    ];
            this.blackFilter = new Laya.ColorFilter(blackMat);
            this.restoreColor = new Laya.ColorFilter();
        }

        // 副武器升级 使用的 黑色背景
        private createFilterByVice():void{
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，黑色
		    let blackMat = [
			    0, 0, 0, 0, 0, // R
			    0, 0, 0, 0, 0, // G
			    0, 0, 0, 0, 0, // B
			    0, 0, 0, 1, 0  // A
		    ];
            this.blackFilterByVice = new Laya.ColorFilter(blackMat);
            this.restoreColorByVice = new Laya.ColorFilter();
        }

        // 主武器升级 使用的 黑色背景
        private createFilterByMain():void{
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，黑色
		    let blackMat = [
			    0, 0, 0, 0, 0, // R
			    0, 0, 0, 0, 0, // G
			    0, 0, 0, 0, 0, // B
			    0, 0, 0, 1, 0  // A
		    ];
            this.blackFilterByMain = new Laya.ColorFilter(blackMat);
            this.restoreColorByMain = new Laya.ColorFilter();
        }

        private initDeputy():void{
            // Laya.timer.clear(this, this.playFireSound);
            // Laya.timer.loop(130, this, this.playFireSound);
            this.isSameday();  //判断是否是同一天
            if(this.tryFree){
                this.scene.btn_deputy_preview.disabled = false;  //满级试用按钮刷新
                // this.scene.label_free_try.visible = true;
            }else{
                this.scene.label_free_try.visible = false;
            }
    
            // this.onClickDeputyPreviewBtn();
            this.checkNotice();
            FZGameData.instance.setDeputyWeaponOpenOpened();
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_deputy_levelup, this, this.onClickDeputyLevelUp, ["btn_deputy_levelup"]);
            
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.deputy_preview_btn, this, this.onClickDeputyPreviewBtn,[]);

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_deputy_preview, this, this.onClickBtnDeputyPreview,[]);
            
            this.deputyWeaponMaxLevel = FZGameData.instance.getDeputyWeaponMaxLevel();
            this.deputyWeaponLevel = FZGameData.instance.getDeputyWeaponLocalLevel();
            this.deputyWeaponLevel = Math.min(this.deputyWeaponMaxLevel, this.deputyWeaponLevel);
            if (this.deputyWeaponLevel == 0) {
                this.deputyWeaponLevel = 1;
                FZGameData.instance.setDeputyWeaponLocalLevel(1);
            }
        }
        
        private initMain():void{
            // Laya.timer.clear(this, this.playFireSound);
            // Laya.timer.loop(130, this, this.playFireSound);
            this.checkNotice();
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_main_levelup, this, this.onClickMainLevelUp, ["btn_main_levelup"]);
            this.scene.main_preview_btn.visible = false;
            // FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.Mainlist_container, this, this.onClickMainPreviewBtn,[]);  //预览按钮

            this.mainWeaponLevel = FZGameData.instance.getMainWeaponLevel();
            this.baseMainWeaponData = FZCfgManager.instance.getBaseMainWeapons();
        }

        private initUav():void{
            this.checkNotice();
            FZGameData.instance.setUavWeaponOpenOpened();

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_uav_levelup, this, this.onClickUavLevelUp, ["btn_uav_levelup"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btn_uav_choose, this, this.onClickUavChoose, ["btn_uav_choose"]);

            this.scene.uav_container.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.uav_container.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.scene.uav_container.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.uav_container.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);

            this.UAVConfig = FZCfgManager.instance.getUAVWeaponsCfg();
            if(!this.UAVConfig){
                return;
            }
            for(let key in this.UAVConfig){
                this.UAVConfig[key].pos = key
                this.listUAVData.push(this.UAVConfig[key])
            }

            this.UAVLocalData = FZGameData.instance.getUAVData();
            this.uavWeaponMaxLevel = FZGameData.instance.uavWeaponMaxLevel;
            this.curUseUAV = FZGameData.instance.getCurUseUAV();
            FZDebug.D("this.curUseUAV --------------------------------------   " + this.curUseUAV);
            this.curSelectUAVIndex = (this.curUseUAV == -1) ? 0 : this.curUseUAV-1;
            
            this.createUAVsList();
            this.createUAVsPos();
        }

        private createUAVsList () {
            if(!this.listUAVData){
                return;
            }
            let len = this.listUAVData.length;
            for (let i = 0; i < len; i++) {
                this.createOneUAV(this.listUAVData[i], i);
            }
            this.scene.uav_icon_bg.width = len*250;
            this.scene.uav_icon_bg.x = 250-(this.curSelectUAVIndex*250);
            this.min_x = 250-((len-1)*250);
        }

        createOneUAV(uavData: any, index: number){
            let weaponModel = uavData[1].Model;
            let uav = new Laya.Image(weaponModel);
            let unlocking = uavData[1].unlocking;

            //判断解锁了哪些无人机
            //获取配置
            let curSelectUavData1 = this.listUAVData[0];
            let curSelectUavData2 = this.listUAVData[1];
            let curSelectUavData3 = this.listUAVData[2];
            let curSelectUavData4 = this.listUAVData[3];
            let curSelectUavData5 = this.listUAVData[4];

            if(this.curCheckPoint < curSelectUavData1[1].unlocking){
                this.uavIndex = 0;
            }else if(this.curCheckPoint < curSelectUavData2[1].unlocking){
                this.uavIndex = 1;
            }else if(this.curCheckPoint < curSelectUavData3[1].unlocking){
                this.uavIndex = 2;
            }else if(this.curCheckPoint < curSelectUavData4[1].unlocking){
                this.uavIndex = 3;
            }else if(this.curCheckPoint < curSelectUavData5[1].unlocking){
                this.uavIndex = 4;
            }else{
                this.uavIndex = 5;
            }

            let carColor = (unlocking <= this.curCheckPoint) ? [this.restoreColor] : [this.blackFilter];
            uav.filters = carColor;
            if (unlocking > this.curCheckPoint) {
                let lock = new Laya.Image("ui_main/ui_lock_img.png");
                lock.filters = [this.restoreColor];
                lock.anchorX = 0.5;
                lock.anchorY = 0.5;
                lock.x = uav.width/2;
                lock.y = uav.height/2;
                uav.addChild(lock);
            }

            uav.anchorX = 0.5;
            uav.anchorY = 0.5;
            uav.x = index*250+125;
            uav.y = this.scene.uav_icon_bg.height/2;
            let _scale = (index == this.curSelectUAVIndex) ? 1 : 0.8;
            uav.scaleX = _scale;
            uav.scaleY = _scale;
            uav.rotation = 30;
            this.scene.uav_icon_bg.addChild(uav);

            this.listUAVEntity.push(uav);
        }

        createUAVsPos(){
            if(!this.listUAVData){
                return;
            }
            let len = this.listUAVData.length;
            for (let i = 0; i < len; i++) {
                this.listUAVPos.push(this.max_x - (i*250));
            }
        }

        /**
         * 播放开火音效
         */
        public playFireSound(){
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.gunfire);
        }

        public deputy_preview_state:any = 0; // 状态 1不可以满级试用 2可以满级使用或者正在处于满级试用的状态 3进阶
        private showDeputyWeaponBox () : void {
            this.initShowCar();
            // Laya.timer.clear(this, this.playFireSound);
            // Laya.timer.loop(130, this, this.playFireSound);
            if(this.mainPreviewBtnCtr == "close"){
                this.onClickMainPreviewBtn();
            }
            let deputyWeaponOpenPoint = FZGameData.instance.getDeputyWeaponOpenPoint();
            if (this.curCarMaxLevel < deputyWeaponOpenPoint) {
                Laya.timer.clear(this, this.deputyPlayFire);
                // Laya.timer.clear(this, this.onUpdatePos);
                Laya.timer.clear(this, this.mainPlayFire);
                //FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "玩家解锁"+deputyWeaponOpenPoint+"级车辆开启"});
                FZUIManager.instance.createUI(FZUIManager.UI_WeaponUnlockNoticeView, {value: "deputy"});
                return;
            }

            this.setCurViceView("fast"); // 自动回归到最高等级
            this.showContainer(0);
            this.onPlayDeputyFire();  //播放副武器开火动画
            this.mainFireState("hide");  //停止主武器开火

            this.deputy_preview_state = 1;
            //预览按钮skin初始化  
            if(this.tryFree || FZGameData.instance.deputy_full_level_try != 0){
                // this.scene.deputy_preview_scale.play(true);
                this.deputy_preview_state = 2;
                this.scene.label_already.visible = false;
            }else{  //满级试用过了
                this.deputy_preview_state = 1;
                this.scene.label_already.visible = true;
                this.scene.label_free_try.visible = false;
            }
            if(this.curViceMaxLevel >= 4){
                this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
            }else{
                if(this.tryFree){
                    this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open.png";
                }else{
                    this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
                }
            }
        }

        private showMainWeaponBox () : void {
            this.initShowCar();
            this.playLevelUpAnimation = false;
            // Laya.timer.clear(this, this.playFireSound);
            // Laya.timer.loop(130, this, this.playFireSound);
            if(this.deputyPreviewBtnCtr == "close"){
                this.deputy_preview_state = 1;
                this.onClickDeputyPreviewBtn();
            }
            this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";
            this.setCurMainView(); // 自动回归到最高等级
            this.showContainer(1);
            this.onPlayMainFire();  //播放主武器开火动画
            this.deputyFireState("hide");  //停止副武器开火
        }

        private showUavWeaponBox () : void {
            Laya.timer.clear(this, this.deputyPlayFire);
            // Laya.timer.clear(this, this.onUpdatePos);
            Laya.timer.clear(this, this.mainPlayFire);
            // Laya.timer.clear(this, this.playFireSound);
            let uavWeaponOpenPoint = FZGameData.instance.getUAVWeaponOpenPoint();
            if (this.curCheckPoint < uavWeaponOpenPoint) {
                
                //FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "玩家解锁"+uavWeaponOpenPoint+"级车辆开启"});
                FZUIManager.instance.createUI(FZUIManager.UI_WeaponUnlockNoticeView, {value: "uav"});
                return;
            }
            this.showContainer(2);
            this.deputyFireState("hide");  //停止副武器开火
            this.mainFireState("hide");  //停止主武器开火
        }

        /*
         *container : 0 副武器  1 主武器    2 无人机
        */
        public current_view :number = 0;
        private showContainer(container: number):void{
            this.current_view = container;
            FZDebug.D("showContainer ----------------------" + container);
            this.scene.deputy_container.visible = (container == 0);
            this.scene.img_deputy.visible = (container == 0);

            this.scene.main_container.visible = (container == 1);
            this.scene.img_main.visible = (container == 1);

            this.scene.uav_container.visible = (container == 2);
            this.scene.car_weapon.visible = !(container == 2);
            this.scene.img_uav.visible = (container == 2);

            let name_arr = ["副武器", "主武器", "无人机"];
           
            if( container == 0 || container == 1 ){
                this.scene.deputy_car_chassis.visible = true;
                this.scene.cursor_main.visible = (container == 1);
                this.scene.cursor_deputy.visible = (container == 0);

            } else if( container == 2 ){
                this.scene.deputy_car_chassis.visible = false;
                this.scene.cursor_main.visible = false;
                this.scene.cursor_deputy.visible = false;
            }
            if(container == 1){
                this.checkGuide();//检查升级引导
            }else if(this.scene.guide_ani_box.visible){
                this.scene.guide_ani_box.visible = false;
                this.scene.guide_hand_ani.gotoAndStop(0);
            }
            this.checkNotice();
        }

        private isChoiceDeputyMoney : boolean;
        private showDeputyInfo():void{
            let curDeputyWeaponData = FZCfgManager.instance.getDeputyWeapons(this.deputyWeaponLevel);
            let curBulletData = FZCfgManager.instance.getBulletList(curDeputyWeaponData.sBullet);
           
            this.scene.lbl_deputy_sh_value.text = curDeputyWeaponData.showTips;
            let deputyFullLevel = (this.deputyWeaponLevel >= this.deputyWeaponMaxLevel);
            if (deputyFullLevel) {
                this.weaponFullLevel[0] = deputyFullLevel;  //副武器满级
                this.checkAllWeaponsFullLevel();

                this.scene.lbl_cur_deputy_lv.text = "MAX";
                this.scene.lbl_cur_deputy_lv.x = 271;

                this.scene.deputy_rank.skin = "ui_main/fwq_jie_5.png";
                this.scene.deputy_rank_up.visible = false;
                for (let i = 0 ; i < 20; i++) {
                    let level_bar = this.scene["level_bar_"+i];
                    level_bar && (level_bar.visible = true);
                }

                this.scene.lbl_next_deputy_lv.visible = false;
                this.scene.btn_deputy_levelup.visible = false;
                this.scene.deputy_sh_arrow.visible = false;
                this.scene.lbl_deputy_sh_next_value.visible = false;
            }
            else {
                this.isChoiceDeputyMoney = curDeputyWeaponData.sChoice == 1;

                let stage = Math.floor((this.deputyWeaponLevel-1)/20)+1;
                let stage_index = Math.min(stage, 4);
                
                if(stage == 5){
                    this.scene.deputy_rank.skin = "ui_main/fwq_jie_" + stage + ".png";
                    this.scene.deputy_rank_up.visible = false;
                }else{
                    this.scene.deputy_rank.skin = "ui_main/fwq_jie_" + stage + ".png";
                    this.scene.deputy_rank_up.skin = "ui_main/fwq_jie_" + (stage + 1) + ".png";
                }

            
                let cur_bar_count = 20 - (stage*20 - this.deputyWeaponLevel);
                for (let i = 0 ; i < 20; i++) {
                    let level_bar = this.scene["level_bar_"+i];
                    level_bar && (level_bar.visible = (i < cur_bar_count))
                }

                this.scene.lbl_cur_deputy_lv.text = this.deputyWeaponLevel+"";
                this.scene.lbl_cur_deputy_lv.x = 41;
                let next_lv_str = Math.min(stage*20, this.deputyWeaponMaxLevel);
                this.scene.lbl_next_deputy_lv.text = "/"+next_lv_str;
                this.scene.lbl_next_deputy_lv.visible = true;

                this.scene.btn_deputy_levelup.skin = (this.deputyWeaponLevel == next_lv_str) ? "ui_common/weapon_btn_yellow.png" : "ui_common/weapon_btn_green.png";
                // this.scene.deputy_levelup_cash_bg.skin = (this.deputyWeaponLevel == next_lv_str) ? "ui_main/ui_pay_bg_1.png" : "ui_main/ui_pay_bg.png";
                // this.scene.deputy_levelup_cash_bg.skin = (this.deputyWeaponLevel == next_lv_str) ? "ui_main/common_btn_jinjie.png" : "ui_main/common_btn_green.png";
                this.scene.lbl_deputy_btn.text = (this.deputyWeaponLevel == next_lv_str) ? "进阶" : "升级";                

                this.scene.btn_deputy_levelup.visible = true;
                this.deputyLevelUpPayCount = curDeputyWeaponData.sCoin;

                this.scene.pay_depType_icon.skin = this.isChoiceDeputyMoney ? "ui_common/flyDollar.png" : "ui_common/flyDiamond.png";
                this.scene.lbl_deputy_lvup_pay.text = FZUtils.formatNumberStr(this.deputyLevelUpPayCount+"");

                let nextDeputyWeaponData = FZCfgManager.instance.getDeputyWeapons(this.deputyWeaponLevel+1);
                this.scene.deputy_sh_arrow.visible = true;
                this.scene.lbl_deputy_sh_next_value.visible = true;
                this.scene.lbl_deputy_sh_next_value.text = nextDeputyWeaponData.showTips;
            }
        }

        checkDeputyNotice(){
            if (this.curCarMaxLevel >= FZGameData.instance.getDeputyWeaponOpenPoint()) {
                let deputyFullLevel = (this.deputyWeaponLevel >= this.deputyWeaponMaxLevel);
                if (deputyFullLevel) {
                    this.scene.bottom_deputy_notice.visible = false;
                    this.scene.deputy_levelUp_notice.visible = false;
                    return false;
                } else {
                    let coin = this.isChoiceDeputyMoney ? FZGameData.instance.getWeaponsCoin() : FZMergeDateManager.instance.getGameDiamond();
                    this.scene.bottom_deputy_notice.visible = (coin >= this.deputyLevelUpPayCount);
                    this.scene.deputy_levelUp_notice.visible = (coin >= this.deputyLevelUpPayCount);
                    return coin >= this.deputyLevelUpPayCount;
                }
            }
        }

        private showMainInfo():void{
            if(!this.baseMainWeaponData){
                return;
            }
            let mainFullLevel = (this.mainWeaponLevel >= FZGameData.instance.mainWeaponMaxLevel);

            this.scene.lbl_main_dj_value.text = this.mainWeaponLevel.toString();
            let sh_value = this.baseMainWeaponData[this.mainWeaponLevel.toString()].showTips;
            this.scene.lbl_main_sh_value.text = sh_value.toString();

            if (mainFullLevel) {
                this.weaponFullLevel[1] = mainFullLevel;  //主武器满级
                this.checkAllWeaponsFullLevel();

                this.scene.sh_spr.x += 80;
                this.scene.main_dj_spr.x += 80;
                this.scene.main_dj_arrow.visible = false;
                this.scene.lbl_main_dj_next_value.visible = false;
                this.scene.main_sh_arrow.visible = false;
                this.scene.lbl_main_sh_next_value.visible = false;
                this.scene.btn_main_levelup.visible = false;
            } else {
                this.scene.main_dj_arrow.visible = true;
                this.scene.lbl_main_dj_next_value.visible = true;
                this.scene.lbl_main_dj_next_value.text = (this.mainWeaponLevel+1).toString();
                
                this.scene.main_sh_arrow.visible = true;
                this.scene.lbl_main_sh_next_value.visible = true;
                let sh_next_value = this.baseMainWeaponData[(this.mainWeaponLevel+1).toString()].showTips;
                this.scene.lbl_main_sh_next_value.text = sh_next_value.toString();

                this.mainLevelUpPayCount = Math.floor(this.baseMainWeaponData[this.mainWeaponLevel.toString()].cost);
                this.scene.btn_main_levelup.visible = true;
                this.scene.lbl_main_lvup_pay.text = FZUtils.formatNumberStr(this.mainLevelUpPayCount.toString()); 
            }
        }

        checkMainNotice(){
            let mainFullLevel = (this.mainWeaponLevel >= FZGameData.instance.mainWeaponMaxLevel);
            if (mainFullLevel) {
                this.scene.bottom_main_notice.visible = false;
                this.scene.main_levelUp_notice.visible = false;
                return false;
            } else {
                let coin = FZGameData.instance.getWeaponsCoin();
                this.scene.bottom_main_notice.visible = (coin >= this.mainLevelUpPayCount);
                this.scene.main_levelUp_notice.visible = (coin >= this.mainLevelUpPayCount);
                return coin >= this.mainLevelUpPayCount;
            }
        }

        private showUavInfo():void{
            if(!this.listUAVData){
                return;
            }
            let curSelectUavData = this.listUAVData[this.curSelectUAVIndex];
            if(!curSelectUavData||!this.UAVLocalData) return;
            
            !this.UAVLocalData[(this.curSelectUAVIndex+1) + ""] && (this.UAVLocalData[(this.curSelectUAVIndex+1) + ""] = 1);
            let uav_lv = this.UAVLocalData[(this.curSelectUAVIndex+1) + ""];

            let uav_name = curSelectUavData[1].name;
            this.scene.lbl_uav_name.text = uav_name;

            let curSelectUavLvData = curSelectUavData[uav_lv];
            this.scene.lbl_uav_sh_value.text = curSelectUavLvData.showTips;

            let unlocking = curSelectUavData[1].unlocking;
            this.scene.btn_uav_choose.visible = (unlocking <= this.curCheckPoint && this.curUseUAV != this.curSelectUAVIndex+1);
            // if(this.scene.uav_choose_notice.visible == true){
            //     //发送武器可选择事件，更新主界面武器升级红点提示
            //     FZEventManager.instance.sendEvent(FZEvent.UVA_CAN_CHOOSE, true);
            // }else{
            //     FZEventManager.instance.sendEvent(FZEvent.UVA_CAN_CHOOSE, false);
            // }
            this.scene.lbl_uav_des.visible = !(unlocking <= this.curCheckPoint && this.curUseUAV != this.curSelectUAVIndex+1);
            this.scene.lbl_uav_des.text = (unlocking <= this.curCheckPoint) ? "当前正在使用" : "通过"+unlocking+"关后解锁";

            let uavFullLevel = (uav_lv >= this.uavWeaponMaxLevel);
            if (uavFullLevel) {
                this.weaponFullLevel[2] = this.checkAllUavFullLevel();

                this.checkAllWeaponsFullLevel();

                this.scene.lbl_uav_dj_value.text = "MAX";
                this.scene.uva_dj_spr.x = 105;
                this.scene.uva_sh_spr.x = 97;
                
                this.scene.uav_dj_arrow.visible = false;
                this.scene.lbl_uav_dj_next_value.visible = false;
                this.scene.uav_sh_arrow.visible = false;
                this.scene.lbl_uav_sh_next_value.visible = false;
                this.scene.btn_uav_levelup.visible = false;
            } 
            else {
                this.scene.uva_dj_spr.x = 25;
                this.scene.uva_sh_spr.x = 17;
                this.scene.lbl_uav_dj_value.text = "" + uav_lv;
                this.scene.lbl_uav_dj_next_value.text = "" + (uav_lv+1);
                this.scene.lbl_uav_dj_next_value.visible = true;
                this.scene.uav_dj_arrow.visible = true;
    
                let curSelectUavNextLvData = curSelectUavData[uav_lv+1];
                this.scene.lbl_uav_sh_next_value.text = curSelectUavNextLvData.showTips;
                this.scene.lbl_uav_sh_next_value.visible = true;
    
                this.uavLevelUpPayCount = curSelectUavLvData.Coin;
                this.scene.lbl_uav_lvup_pay.text = FZUtils.formatNumberStr(this.uavLevelUpPayCount+"");
                this.scene.uav_sh_arrow.visible = true;
    
                this.scene.btn_uav_levelup.visible = (unlocking <= this.curCheckPoint);
            }
            
            //判断当前界面的无人机是否可以升级，刷新红点提示
            let coin = FZGameData.instance.getWeaponsCoin();
            let pay = this.UAVConfig[this.curSelectUAVIndex + 1 + ""][this.UAVLocalData[this.curSelectUAVIndex + 1 + ""].toString()].Coin;
            if(coin > pay){
                this.scene.uav_levelUp_notice.visible = true;
            }else{
                this.scene.uav_levelUp_notice.visible = false;
            }
        }

        checkUavNotice(){
            if (this.curCheckPoint < FZGameData.instance.getUAVWeaponOpenPoint()) {
                return false;
            }
            if(!this.UAVLocalData){
                return;
            }
            if(!this.UAVConfig){
                return;
            }
            this.scene.uav_choose_notice.visible = false;
            if (this.curUseUAV == -1) {
                this.scene.bottom_uav_notice.visible = true;
                this.scene.uav_choose_notice.visible = true;
                return true;
            } else {
                //判断已经解锁的无人机是否可以升级
                var judge = false;
                for(let i = 0; i < this.uavIndex; i++){                
                    let uav_lv = this.UAVLocalData[(i + 1) + ""];
                    let coin = FZGameData.instance.getWeaponsCoin();
                    let pay = this.UAVConfig[this.curUseUAV.toString()][this.UAVLocalData[this.curUseUAV.toString()].toString()].Coin;
                    if(uav_lv < this.uavWeaponMaxLevel && coin >= pay){
                        judge = true;
                    }
                }
                this.scene.bottom_uav_notice.visible = judge;
                this.scene.uav_levelUp_notice.visible = judge;
                return judge;
            }
        }
        
        /**
         * 检查所有已解锁的无人机是否满级
         */
        checkAllUavFullLevel(): boolean{
            if(!this.UAVLocalData){
                return;
            }
            let fullLevel = true;
            for(let i = 1; i < this.uavIndex + 1; i++){
                if(this.UAVLocalData[i + ""] < FZGameData.instance.uavWeaponMaxLevel){
                    fullLevel = false;
                }
            }
            return fullLevel;
        }

        /**
         * 检查所有的武器是否满级
         */
        checkAllWeaponsFullLevel(){
            for(let i = 0; i < 3; i++){
                if(!this.weaponFullLevel[i]){
                    // console.log(i + "没有满级");
                    FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "false");
                    return false;
                }
            }
            // console.log("全部满级");
            FZSaveDateManager.instance.setItemToLocalStorage("ALL_FULL_LEVEL", "true");
            return true;
        }

        onMouseDown(event){
            this.canMove = true;
            this.start_x = event.stageX;
        }
        
        onMouseUp(event){
            if (this.canMove != true) {
                this.canMove = false;
                return;
            }
            if(!this.listUAVPos){
                return;
            }
            this.updateUavShow(this.target_x);
            this.scene.uav_icon_bg.x = this.listUAVPos[this.curSelectUAVIndex];

            if (this.scene.uav_icon_bg.x > this.max_x) {
                this.scene.uav_icon_bg.x = this.max_x
            }

            this.canMove = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseOut(event){
            if (this.canMove != true) {
                this.canMove = false;
                return;
            }
        
            if(!this.listUAVPos){
                return;
            }

            this.updateUavShow(this.target_x);
            this.scene.uav_icon_bg.x = this.listUAVPos[this.curSelectUAVIndex];

            if (this.scene.uav_icon_bg.x > this.max_x) {
                this.scene.uav_icon_bg.x = this.max_x
            }

            this.canMove = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseMove(event){
            if (this.canMove != true) {
                return;
            }
            let stage_x = event.stageX;
            let off_x = stage_x - this.start_x;
            this.start_x = stage_x;
            let taget_x = this.scene.uav_icon_bg.x;
            if (this.scene.uav_icon_bg.x >= this.max_x && off_x > 0) {
                taget_x = this.max_x;
            } else if (this.scene.uav_icon_bg.x <= this.min_x && off_x < 0) {
                taget_x = this.min_x;
            } else {
                taget_x+=off_x;
            }

            this.target_x = taget_x;
            this.scene.uav_icon_bg.x = this.target_x;
        }

        private updateUavShow(x: number){
            if (x >= this.max_x) {
                this.curSelectUAVIndex = 0;
            } else {
                if(!this.listUAVPos){
                    return;
                }
                let len = this.listUAVPos.length;
                for (let i = 1; i < len; i++) {
                    // pos_0 < pos_1
                    let pos_0 = this.listUAVPos[i];
                    let pos_1 = this.listUAVPos[i-1];
                    if (x >= pos_0 && x < pos_1) {
                        if (Math.abs((x - pos_0)) >= Math.abs((x - pos_1))) {
                            this.curSelectUAVIndex = i-1;
                        } else {
                            this.curSelectUAVIndex = i;
                        }
                        break;
                    }
                }
            }
            
            //无人机大小
            if(!this.listUAVData || !this.listUAVEntity){
                return;
            }
            let len = this.listUAVData.length;
            for (let i = 0; i < len; i++) {
                let uvaWeapon = this.listUAVEntity[i];
                let _scale = (this.curSelectUAVIndex == i) ? 1 : 0.8;
                uvaWeapon.scaleX = _scale;
                uvaWeapon.scaleY = _scale;
            }

            this.showUavInfo();
        }

        checkNotice(){
            this.checkDeputyNotice();
            this.checkMainNotice();
            this.checkUavNotice();
        }

        private onClickDeputyLevelUp():void{
            if (this.deputyWeaponLevel >= this.deputyWeaponMaxLevel) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "已达到最大等级"});
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                return;
            } 

            let posMoneyCount = this.isChoiceDeputyMoney ? FZGameData.instance.getWeaponsCoin():FZMergeDateManager.instance.getGameDiamond();

            if (posMoneyCount >= this.deputyLevelUpPayCount) {
                this.deputyWeaponLevel += 1;
                if(  this.deputyWeaponLevel > this.deputyWeaponMaxLevel ){  // 边界判断,满级100
                    this.deputyWeaponLevel = this.deputyWeaponMaxLevel;
                }
                FZGameData.instance.setDeputyWeaponLocalLevel(this.deputyWeaponLevel);

                if(this.isChoiceDeputyMoney) FZGameData.instance.addWeaponsCoin(this.deputyLevelUpPayCount*-1);
                else FZMergeDateManager.instance.addGameDiamond(this.deputyLevelUpPayCount*-1);
                
                this.showDeputyInfo();
                this.checkNotice();
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.lvUp_deputyWeapon);
                // tywx.BiLog.clickStat(tywx.clickStatEventType.unlockNewCar,[this.deputyWeaponLevel]);

                // 升级副武器 - 进阶 / 升级对应效果
                this.judgeUpMoveState();
                // 播放副武器开火
                this.playLevelUpAnimation = true;
                this.onPlayDeputyFire();
                this.deputyFireState("hide");
                this.scene.ani_level_up_deputy.play(0,false);
                var that = this;
                Laya.timer.once(700, this, function(){
                    that.playLevelUpAnimation = false;
                    that.deputyFireState("show");
                })
            } else {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "资源不足"});
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.dollar);
            }
        }
        /**
         * 主武器升级
         */  
        public playLevelUpAnimation:any = false;
        private onClickMainLevelUp():void{
            if(this.inUpdateGudie){
                this.scene.update_gudie_box.visible = false;
                this.scene.guide_hand_ani.gotoAndStop(0);
                this.scene.guide_mask.alpha = 0;
                tywx.BiLog.clickStat(tywx.clickStatEventType.finishUpdateMainWeaponGuide, []);
                FZGameData.instance.newPlayerGudieStep(FZGameStatus.NumForGuide.weaponUpdateBtn);
                Laya.timer.once(1000, this, function(){
                    if(this.scene&&this.scene.visible){
                        this.checkCloseGuide();
                    }
                });
            }
            if (FZGameData.instance.getWeaponsCoin() >= this.mainLevelUpPayCount) {
                FZGameData.instance.addWeaponsCoin(this.mainLevelUpPayCount*-1);
                
                this.mainWeaponLevel+=1;
                if( this.mainWeaponLevel > this.mainWeaponMaxLevel){  // 边界判断,主武器上限 250 等级
                    this.mainWeaponLevel = this.mainWeaponMaxLevel;  
                }
                FZGameData.instance.setMainWeaponLevel(this.mainWeaponLevel);
                this.showMainInfo();
                this.checkNotice();
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.lvUp_uav);

                // 升级主武器 - 进阶 / 升级对应效果
                this.judgeUpMoveStateByMain();
                // 播放副武器开火
                this.playLevelUpAnimation = true;
                this.onPlayMainFire();
                this.mainFireState("hide");
                this.scene.ani_level_up_main.play(0,false);
                var that = this;
                Laya.timer.once(700, this, function(){
                    that.playLevelUpAnimation = false;
                    that.mainFireState("show");
                })
            } else {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "资源不足"});
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.dollar);
            }  
        }

        private onClickUavLevelUp():void{
            if(!this.UAVLocalData || !this.listUAVEntity){
                return;
            }
            if (FZGameData.instance.getWeaponsCoin() >= this.uavLevelUpPayCount) {
                FZGameData.instance.addWeaponsCoin(this.uavLevelUpPayCount*-1);
                
                this.UAVLocalData[(this.curSelectUAVIndex+1) + ""]++;
                FZGameData.instance.setUAVData(this.UAVLocalData);
                this.showUavInfo();
                this.checkNotice();
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.lvUp_uav);
                this.listUAVEntity[this.curSelectUAVIndex].scale(2,2);
                Laya.Tween.to(this.listUAVEntity[this.curSelectUAVIndex],{scaleX:1,scaleY:1},200,null,null,0,false);
            } else {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "资源不足"});
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.dollar);
            }            
        }

        private onClickUavChoose():void{
            FZGameData.instance.setCurUseUAV(this.curSelectUAVIndex+1);
            this.curUseUAV = this.curSelectUAVIndex+1;
            this.scene.btn_uav_choose.visible = false;
            this.scene.lbl_uav_des.visible = true;
            
            this.checkUavNotice();

            switch(this.curSelectUAVIndex+1){
                case 1:
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheSelectionOfUav, []);
                    break;
                case 2:
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheMissileUavSelection, []);
                    break;             
                case 3:
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheFrisbeeDroneSelection, []);
                    break;
                case 4:
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheTrackingDroneSelection, []);
                    break;
            }
        }

        /**
         * 关闭界面
         */
        private onClickBtnClose():void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            // if(this.scene.close_hand.visible){
            //     this.scene.close_hand_ani.gotoAndStop(0);
            // }
            if(this.inUpdateGudie){
                this.scene.guide_box.visible = false;
                this.scene.close_gudie_box.visible = false;
                this.scene.close_hand_ani.gotoAndStop(0);
            }
            FZUIManager.instance.removeUI(FZUIManager.UI_WeaponLevelUpView);
            
            //FZEventManager.instance.sendEvent(FZEvent.GAME_CHANGE_CUR_USE_CAR);
        }

        private playFlyAni(param: any){
            FZGameData.instance.playResFlyAni(null,this.scene.title_money,{type: param.itemType,countType: param.countType},null);
        }

        // -------------------------   副(主)武器 预览按钮 以及 满级试用  Begin  -------------------------    
        /**
         * 点击预览按钮时触发，显示和隐藏   主武器 ! 
         */
        private onClickMainPreviewBtn():void{
            if(this.mainPreviewBtnCtr == "open"){
                this.setCurMainView(); // 主武器自动回归到最高等级
                // 避免重复点击按钮
                if( this.mainMoving == true ){
                    return;
                }
                this.mainMoving = true;
                this.isMainPreview = true; // 目前处于 主武器打开状态

                this.scene.main_attribute_box.visible = false; // 关闭 主武器升级按钮
                this.scene.Mainlist_container.visible = true;  //  抽屉出
                this.scene.list_container_main.visible = false;  // 显示优化 : 等待抽屉移动指定时间,在进行绘制内容
                Laya.timer.once(200, this, function(){
                    this.scene.list_container_main.visible = true;
                });
                Laya.timer.once(300, this, function(){
                    this.mainPreviewBtnCtr = "close";  //改变开关状态
                    this.scene.main_preview_img.skin = "ui_main/weapon_preview_close.png";
                });
                Laya.Tween.to(this.scene.Mainlist_container, {x : 3}, 200, Laya.Ease.elasticInOut);
                // 避免打开过程中重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once( 400 , this , function(){
                    this.mainMoving = false;
                })
            }else if(this.mainPreviewBtnCtr == "close"){
                // 主武器 - 避免重复点击
                if( this.mainMoving == true ){
                    return;
                }
                this.mainMoving = true;
                this.isMainPreview = false;
                this.scene.main_attribute_box.visible = true; // 显示 主武器升级按钮
                Laya.timer.once(300, this, function(){
                    this.mainPreviewBtnCtr = "open";  //改变开关状态
                    this.scene.main_preview_img.skin = "ui_main/weapon_preview_open_2.png";
                });
                //显示优化 - 原理与"打开"时一致 (上方)
                Laya.timer.once(200, this, function(){
                    this.scene.list_container_main.visible = false;
                });
                Laya.Tween.to(this.scene.Mainlist_container, {x : 758}, 400, Laya.Ease.elasticInOut);
                // 避免重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once( 400 , this , function(){
                    this.mainMoving = false;
                });
                if(this.mainWeaponLevel >= this.mainWeaponMaxLevel){
                    this.scene.btn_main_levelup.visible = false;  //隐藏武器升级按钮
                }else{
                    this.scene.btn_main_levelup.visible = true;  //显示武器升级按钮
                }
            }
            //更新主武器子弹数据
            this.getMainBulletData();
            this.initShowCar();
        }

        /**
         * 点击预览按钮时触发，显示和隐藏副武器预览界面
         */
        private onClickDeputyPreviewBtn():void{
            if(this.automaticBack == true){
                Laya.timer.clear(this, this.onClickDeputyPreviewBtn);
                this.automaticBack = false;
            }

            if(this.curViceMaxLevel >= this.maxViceShiftNum){
                this.deputy_preview_state = 1;
            }

            if(this.deputyPreviewBtnCtr == "open"){
                if(this.curViceMaxLevel >= this.maxViceShiftNum){ // 已经达到满阶,不显示免费试用
                    this.scene.label_free_try.visible = false;
                }else{
                    if(this.tryFree){
                        this.scene.label_free_try.visible = true;
                    }else{
                        this.scene.label_free_try.visible = false;
                    }
                }
                // 副武器 - 避免重复点击
                if( this.deputyMoving == true ){
                    return;
                }
                this.deputyMoving = true;
                // 底部满级使用按钮 初始化数值
                this.scene.btn_deputy_preview.visible = false;
                this.scene.label_already_try.visible = false;
                this.scene.deputy_attribute_box.visible = false;

                Laya.timer.once(300, this, function(){
                    this.deputyPreviewBtnCtr = "close";  //改变开关状态
                    this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_close.png";
                });
                this.scene.list_container.visible = true;
                // 显示优化
                this.scene.list_container_vice.visible = false;
                Laya.timer.once(200, this, function(){
                    this.scene.list_container_vice.visible = true;
                });
                Laya.Tween.to(this.scene.list_container, {x : 3}, 200, Laya.Ease.elasticInOut);
                // 避免重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once( 400 , this , function(){
                    this.deputyMoving = false;
                })
                this.isDeputyPreview = true;
                if (this.deputy_preview_state == 1) {  //不可以满级试用
                    this.setCurViceView("fast");
                    this.scene.label_already_try.visible = false;
                    this.scene.label_already.visible = true;
                }else if (this.deputy_preview_state == 2) {  //可以满级试用
                    if(this.curViceMaxLevel >= 4){
                        this.curSelectViceIndex = this.curViceMaxLevel;
                        this.scene.label_already_try.visible = false;
                        this.scene.label_already.visible = true;
                    }else{
                        this.curSelectViceIndex = this.curViceMaxLevel + 1;

                        this.scene.label_already.visible = false;
                        if(FZGameData.instance.deputy_full_level_try == 0){  //满级试用之前
                            this.scene.label_already_try.visible = false;
                        }else{  //处于满级试用期间
                            this.scene.label_already_try.visible = true;
                        }
                        
                        this.scene.list_container_vice.x = 250-(this.curSelectViceIndex*250);
                        // 刷新副武器锁的大小
                        let len = this.listViceData.length;
                        for (let i = 0; i < len; i++) {
                            let deputyWeapon = this.listCarEntity[i];
                            let _scale = (this.curSelectViceIndex == i) ? 1.5 : 1.2;
                            deputyWeapon.scaleX = _scale;
                            deputyWeapon.scaleY = _scale;
                        }
                    }
                }else if(this.deputy_preview_state == 3){  //进阶时打开
                    this.automaticBack = true;
                    if(this.automaticBack){
                        Laya.timer.once(3000, this, this.onClickDeputyPreviewBtn);  //3秒之后自动关闭
                    }
                    if(this.tryFree){
                        this.deputy_preview_state = 2;
                    }else{
                        this.deputy_preview_state = 1;
                    }
                    this.curSelectViceIndex = this.curViceMaxLevel;
                    //最高阶时延时显示“满级试用label”(数据同步存在延时)
                    Laya.timer.once(500, this, function(){
                        if(this.curViceMaxLevel >= 4){
                            this.scene.label_free_try.visible = false;
                            this.scene.btn_deputy_levelup.visible = true;
                        }
                    });
                    this.scene.list_container_vice.x = 250-(this.curSelectViceIndex*250);
                }
                this.changeDeputyLeveUpBtn();
            }else if(this.deputyPreviewBtnCtr == "close"){
                // 副武器 - 避免重复点击
                if( this.deputyMoving == true ){
                    return;
                }
                this.deputyMoving = true;

                this.scene.label_already_try.visible = false;
                this.scene.label_free_try.visible = false;
                Laya.timer.once(400, this, function(){
                    this.scene.deputy_attribute_box.visible = true;
                });
                Laya.timer.once(300, this, function(){
                    this.deputyPreviewBtnCtr = "open";  //改变开关状态

                    if(this.deputy_preview_state == 2){  //满级试用
                        if(this.tryFree){
                            this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open.png";
                        }else{
                            this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
                        }
                    }else{
                        this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
                    }

                    if(this.curViceMaxLevel >= 4){
                        this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
                    }else{
                        if(this.tryFree){
                            this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open.png";
                        }else{
                            this.scene.deputy_preview_img.skin = "ui_main/weapon_preview_open_2.png";  //预览
                        }
                    }
                });
                //  抽屉进 , 显示优化 
                Laya.timer.once(200, this, function(){
                    this.scene.list_container_vice.visible = false;
                });
                Laya.Tween.to(this.scene.list_container, {x : 758}, 400, Laya.Ease.elasticInOut);
                // 避免重复点击 - 时间与 Laya.Tween.to 同步
                Laya.timer.once( 400 , this , function(){
                    this.deputyMoving = false;
                })

                this.scene.btn_deputy_preview.visible = false;
                if(this.deputyWeaponLevel >= this.deputyWeaponMaxLevel){
                    this.scene.btn_deputy_levelup.visible = false;  //隐藏武器升级按钮
                }else{
                    this.scene.btn_deputy_levelup.visible = true;  //显示武器升级按钮
                }
                this.scene.btn_deputy_levelup.disabled = false;  //武器升级按钮不可点击
                this.isDeputyPreview = false;
                this.curSelectViceIndex = this.curViceMaxLevel;    
            }
            this.getDeputyBulletData();
            this.initShowCar();
        }

        /**
         * 滑动时改变底部按钮的状态，向右滑动（滑至低等级）时，按钮变灰，向左滑动（滑至高等级）时，升级按钮隐藏，出现免费试用按钮
         * @param param 副武器已经升到的最高等级
         */
        public changeDeputyLeveUpBtn(): void{
            this.scene.label_free_try.visible = false;
            if(this.curViceMaxLevel > this.curSelectViceIndex){  //滑至低等级
                this.scene.label_already.visible = false;  //隐藏已装备label
                this.scene.label_already_try.visible = false;
                this.scene.label_free_try.visible = false;  //隐藏满级试用label
                this.scene.btn_deputy_preview.visible = false;  //隐藏满级试用按钮
            }else if(this.curViceMaxLevel < this.curSelectViceIndex){  //滑至高等级
                this.scene.label_free_try.visible = false;  //隐藏满级试用label
                this.scene.label_already.visible = false;  //隐藏已装备label
                this.scene.label_already_try.visible = false;  //隐藏满级试用的已装备label
                if(this.curViceMaxLevel + 1 < this.curSelectViceIndex){  //更高等级
                    this.scene.deputy_levelUp_notice.visible = false;  //隐藏红点
                    this.scene.btn_deputy_levelup.visible = true;  //显示武器升级按钮
                    this.scene.btn_deputy_levelup.disabled = true;  //武器升级按钮不可点击
                    this.scene.btn_deputy_preview.visible = false;  //隐藏满级试用按钮
                }else{  //只比当前高一级
                    this.scene.btn_deputy_preview.visible = true;  //显示满级试用按钮
                    this.scene.btn_deputy_levelup.visible = false;  //隐藏武器升级按钮
                    if(this.tryFree){  //判断是否可以满级试用
                        this.scene.btn_deputy_preview.disabled = false;
                    }else{
                        this.scene.btn_deputy_preview.disabled = true;
                    }
                    
                    if(FZGameData.instance.deputy_full_level_try != 0){  //满级试用label的显示控制
                        this.scene.label_already_try.visible = true;
                    }else{
                        this.scene.label_already_try.visible = false;
                    }
                }
            }else if(this.curViceMaxLevel == this.curSelectViceIndex){  //当前等级
                if(this.curViceMaxLevel == 4){  //满级试用label的显示控制
                    this.scene.label_free_try.visible = false;
                }else{
                    if(!this.tryFree){
                        this.scene.label_free_try.visible = false;
                    }else{
                        this.scene.label_free_try.visible = true;
                    }
                }
                this.checkDeputyNotice();  //更新红点显示
                this.scene.label_already_try.visible = false;
                if(FZGameData.instance.deputy_full_level_try == 0){
                    this.scene.label_already.visible = true;  //显示已装备label
                }else{
                    this.scene.label_already.visible = false;  //隐藏已装备label
                }
                this.scene.btn_deputy_levelup.visible = true;  //显示武器升级按钮
                this.scene.btn_deputy_levelup.disabled = false;  //武器升级按钮可点击
                this.scene.btn_deputy_preview.visible = false;  //隐藏满级试用按钮
            }
        }

        /**
         * 点击满级试用后执行，拉视频，成功 —— 返回进入视频之前的界面
         * “满级试用”按钮变为不可点击状态，在副武器下面显示“已装备”label
         * 此时，玩家进入游戏，用刚刚视频试用的满级武器进行游戏，
         * 游戏结束后，不论是否通关，试用都算结束，副武器变为正常状态。该满级试用功能每天刷新，刷新时间为0点
         */
        public onClickBtnDeputyPreview(){
            if(this.tryFree){
                //拉取视频
                let param = FZShareInfo.create();
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    //视频成功之后的动作 
                    this.successFreeTry();
                }), Laya.Handler.create(this, function(value){
                    // 继续开火音效
                    if(Laya.Browser.onMiniGame&&value == 1){
                        Laya.timer.clear(this, this.playFireSound);  // 关闭音效
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            //视频成功之后的动作
                            this.successFreeTry();
                            // 继续开火音效
                        }, [this])
                    }else if(value == 0){
                        // 继续开火音效
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }else{  //免费试用次数用完
                FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "每天只能试用一次"});
            }
        }

        /**
         * 观看视频成功后开始满级试用一关
         */
        public successFreeTry(){
            if(FZUtils.isNullOrEmpty(this.scene)) {
                return;
            }
            this.tryFree = false;
            FZSaveDateManager.instance.setItemToLocalStorage("FREE_DEPUTY_VIDEO", "false");
            this.scene.label_free_try.visible = false;
            this.scene.label_already_try.visible = true;  //显示已装备label
            this.scene.btn_deputy_preview.disabled = true;  //满级试用按钮不可点击
            //车上的副武器变成试用阶段满级
            if(this.curViceMaxLevel <= 3 && this.curViceMaxLevel >= 0){
                FZGameData.instance.deputy_full_level_try = (this.curViceMaxLevel + 1 + 1) * 20;
                FZSaveDateManager.instance.setItemToLocalStorage("DEPUTY_FULL_LEVEL_TRY", FZGameData.instance.deputy_full_level_try.toString());  //存储副武器试用等级
            }
            Laya.timer.once(1000, this, function(){
                FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "快去游戏中试用一局吧！"});
            }); 
        }

        /**
         * 判断是否是同一天
         */
        public isSameday(){
            let date = new Date();
            let day = date.getDate();
            if(day.toString() != FZSaveDateManager.instance.getItemFromLocalStorage("DAY_FREE_DEPUTY", "0")){
                //不是同一天
                this.dateStorage(day);
                //每天可以试用一次
                this.tryFree = true;
                //刷新视频成功观看记录
                FZSaveDateManager.instance.setItemToLocalStorage("FREE_DEPUTY_VIDEO", "true");
                //新的一天发送副武器试用结束事件
                FZEventManager.instance.sendEvent(FZEvent.DEPUTY_PROBATION_OVER);
            }else{  //是同一天
                //判断是否成功观看过视频
                if(FZSaveDateManager.instance.getItemFromLocalStorage("FREE_DEPUTY_VIDEO", "true") == "false"){  //成功观看过视频
                    this.tryFree = false;
                }else{  //没有成功观看过视频
                    this.tryFree = true;
                }
            }
        }
        /**
         * 存储日期
         */
        dateStorage(day){
            FZSaveDateManager.instance.setItemToLocalStorage("DAY_FREE_DEPUTY", day);
        }
        // -------------------------   副武器 预览按钮 以及 满级试用  End  -------------------------

        // -------------------------   副武器 预览视图  Begin  -------------------------
        /*
         *  初始化副武器 相关信息数值
         */ 
        public initViceWeaponData(){    
            // 获取到 截取配置表档位的 数组 
            var listArr = [];
            var getViceNumArr : any = [];
            getViceNumArr = FZCfgManager.instance.getViceWeaponLevelArr();
            if( getViceNumArr == -1 || getViceNumArr.length <= 0 ){ // 未获取配置,使用默认值
                getViceNumArr = [1,21,41,61,81];
            }
           for( var i = 0 ; i <  getViceNumArr.length ; i++ ){
               var num = getViceNumArr[i];
               var mesConfig = FZCfgManager.instance.getDeputyWeapons(num);
               if( !  mesConfig ){
                   return;
               }
               listArr.push(mesConfig);     
           }
            this.listViceData = listArr;
            this.createFilterByVice();  // 黑色背景图 To 副武器
            this.createViceList(); // 创建副武器的列表
            this.createVicePos();  // 创建副武器的坐标
        }

        /*
         *   点击副武器升级时,  执行升级 / 进阶 对应效果
         */  
        judgeUpMoveState(){
            // 使用lastWeaponArea原因: 因为点击升级,等级已经是 20*X + 1
            var lastWeaponArea = this.deputyWeaponLevel - 1;
            let stage = Math.floor((lastWeaponArea-1)/20)+1;
            let next_lv_str = Math.min(stage*20, this.deputyWeaponMaxLevel);
            if( lastWeaponArea == next_lv_str ){
                //预览弹窗弹出
                this.deputy_preview_state = 3;
                this.onClickDeputyPreviewBtn();
                Laya.timer.once(400, this, function(){
                    this.changeDeputyInCar("deputy"); // 进阶时候,更换平台上副武器样式
                    this.switchAdvanceMaxView();  // 本次点击属于 进阶的行为
                    //恭喜进阶
                    this.scene.ani_level_up.play(0, false);
                    FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.win);
                    if(this.tryFree){
                        this.scene.label_free_try.visible = true;
                    }else{
                        this.scene.label_free_try.visible = false;
                    }
                });
            }
        }

        /*
         *   副武器进阶, 执行的逻辑 - 切换为当前武器的界面   
         */  
        switchAdvanceMaxView(){
            var self = this;
            // 下一个等级进行 解锁打开
            var nextViewOpen = function(){
                var nextPoint = self.findAssignPoint(self.curSelectViceIndex);
                if( nextPoint ){
                    var nextLock =  nextPoint.getChildByName("lock"); // 获取锁 节点
                    if( ! nextLock ){
                        return;
                    }
                    self.isVicePauseTime = true; // 暂停其他无法移动
                    // 车辆锁 逐渐消失 , 恢复锁车的颜色
                    Laya.timer.once( 300 , self , function(){
                        nextLock.alpha = 0.6;
                        Laya.timer.once( 300 , self , function(){
                            nextLock.alpha = 0.3;
                            Laya.timer.once( 300 , self , function(){
                                nextLock.alpha = 0;
                                nextLock.visible = false; 
                                nextPoint.filters = []; // 取消滤镜
                                self.isVicePauseTime = false; // 暂停结束
                            })
                        })
                    }) 
                } 
            }
        
            // 目前就处于 最高等级(前) 界面
            this.freshCurData(); // 1 : 刷新数据
            this.setCurViceView("slow");  // 2 : 移动到最新界面
            Laya.timer.once( this.autoRollTime , this , nextViewOpen);
        }

        /*
         *  刷新目前的存储数据
         *  - ( 目前只使用于  switchAdvanceMaxView  )
         */
        freshCurData(){
            this.curViceMaxLevel += 1; // 当前解锁的最大等级 +1
            if( this.curViceMaxLevel > this.maxViceShiftNum ){ // 边界溢出
                this.curViceMaxLevel = this.maxViceShiftNum
            }

            this.curSelectViceIndex += 1; // 当前解锁的等级界面 +1
            if( this.curSelectViceIndex >= this.listViceData.length ){ // 数值溢出 
                this.curSelectViceIndex = this.listViceData.length - 1;
            } 
        }

        /*
         *  寻找并且返回 指定的列表节点 (用于: 武器 升级 / 进阶)
         */
        findAssignPoint ( index ){
            if( this.listCarEntity && this.listViceData ){
                let len = this.listViceData.length;
                var curVice : any = null;
                if( index >= len ){
                    return;
                }
                for( let i = 0; i < len; i++ ){
                    if( index == i ){
                        curVice = this.listCarEntity[i];   // 获取到 当前的升级武器的节点
                        break;
                    }
                }
                // 升级缩放的效果
                if( curVice ){
                   return curVice;
                }
            }
        }

        /*
         *  页面 切换到 当前最高等级
         *  @param  state :  
         *      "fast" - 瞬间回滚 (点击 副武器 按钮)
         *      "slow" - 慢速回滚 (点击 升级/进阶  )
         *      
         */
        private setCurViceView(state){
            if( this.curViceMaxLevel < 0 ){
                this.curViceMaxLevel = 0;
            }
            this.curSelectViceIndex = this.curViceMaxLevel;  // 当前档期刷新为最高
            // 瞬间回滚
            if( state == "fast" ){
                this.scene.list_container_vice.x = 250-(this.curSelectViceIndex*250);
            } else if(state == "slow"){
            // 慢速回滚
                var self = this;
                self.isVicePauseTime = true; // 暂停其他无法移动
                var targetRollPos = 250-(this.curSelectViceIndex*250);
                Laya.Tween.to(self.scene.list_container_vice, { x: targetRollPos }, this.autoRollTime, null, Laya.Handler.create(self, function ()
                {
                    self.scene.list_container_vice.x = 250-(this.curSelectViceIndex*250);  // 自动调整到 最高等级位置
                    self.isVicePauseTime = false; // 暂停结束
                }), 0, true, true);
            }

            // 刷新 副武器的大小
            let len = this.listViceData.length;
            for (let i = 0; i < len; i++) {
                let deputyWeapon = this.listCarEntity[i];
                let _scale = (this.curSelectViceIndex == i) ? 1.5 : 1.2;
                deputyWeapon.scaleX = _scale;
                deputyWeapon.scaleY = _scale;
            }
        }
         
        // 创建副武器的列表
        private createViceList (){
            let len = this.listViceData.length;
            for (let i = 0; i < len; i++) {
                this.createOneVice(this.listViceData[i], i);
            }
            this.scene.list_container_vice.width = len*250;
            this.scene.list_container_vice.x = 250-(this.curSelectViceIndex*250);
            this.min_vice_x = 250-((len-1)*250);
        }
        // 创建一个副武器 ( 使用于 createViceList )
        createOneVice(viceData: any, index: number){
            let deputyWeapon = new Laya.Image(viceData.sPic);  //  显示 获取配置中的资源图
            // 目前解锁的 最高等级的副武器
            let vice_stage = Math.floor((this.deputyWeaponLevel-1)/20);
            this.curViceMaxLevel  = Math.min(vice_stage, 4);  // 固定的五个档位  0 - 4
            let max_unlock_index = this.curViceMaxLevel;
            if (index > max_unlock_index) {
                let lock = new Laya.Image("ui_main/ui_lock_img.png");
                lock.filters = [this.restoreColorByVice];
                lock.anchorX = 0.5;
                lock.anchorY = 0.5;
                lock.scaleX = 0.3;
                lock.scaleY = 0.3;
                lock.x = Math.floor(deputyWeapon.width/2);
                lock.y = Math.floor(deputyWeapon.height/2);
                lock.name = "lock";
                deputyWeapon.addChild(lock);
            }

            //副武器阶数显示
            let deputyIndex = index + 1;
            let viceImage = new Laya.Image();
            viceImage.skin = "ui_main/fwq_jie_" + deputyIndex + ".png";
            viceImage.x = index*250+125+5;
            viceImage.y = Math.floor(this.scene.list_container_vice.height/2) + Math.floor(deputyWeapon.height/2) + 20;
            viceImage.anchorX = 0.5;
            viceImage.anchorY = 0.5;
            viceImage.scale(0.5, 0.5);
            this.scene.list_container_vice.addChild(viceImage);
            if(deputyIndex == 3){
                viceImage.x = index*250+125+5 + 5;  //第三阶阶数图标位置适配
            }
            deputyWeapon.x = index*250+125+5;
            deputyWeapon.y = Math.floor(this.scene.list_container_vice.height/2) - 20;
            deputyWeapon.anchorX = 0.5;
            deputyWeapon.anchorY = 0.5;
            //副武器大小
            let _scale = (index == this.curSelectViceIndex) ? 1.5 : 1.2;
            deputyWeapon.scaleX = _scale;
            deputyWeapon.scaleY = _scale;
            this.scene.list_container_vice.addChild(deputyWeapon);
            this.listCarEntity.push(deputyWeapon);
        }

        // 生成副武器的位置
        createVicePos(){
            let len = this.listViceData.length;
            for (let i = 0; i < len; i++) {
                this.listCarPos.push(this.max_vice_x - (i*250));
            }
        }

        /*
         *   该 mouse 的行为 对应的是 副武器浏览框的事件
         */
        onMouseDownByVice(event){
            Laya.timer.clear(this, this.onClickDeputyPreviewBtn);
            if( this.isVicePauseTime ){
                return;
            }
            this.canMoveByVice = true;
            this.start_vice_x = event.stageX;
        }
        
        onMouseUpByVice(event){
            if( this.isVicePauseTime ){
                return;
            }
            if (this.canMoveByVice != true) {
                this.canMoveByVice = false;
                return;
            }
            this.updateShowByVice(this.target_vice_x);
            this.scene.list_container_vice.x = this.listCarPos[this.curSelectViceIndex];
            if (this.scene.list_container_vice.x > this.max_vice_x) {
                this.scene.list_container_vice.x = this.max_vice_x
            }
            this.canMoveByVice = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseOutByVice(event){
            if( this.isVicePauseTime ){
                return;
            }
            if (this.canMoveByVice != true) {
                this.canMoveByVice = false;
                return;
            }
            this.updateShowByVice(this.target_vice_x);
            this.scene.list_container_vice.x = this.listCarPos[this.curSelectViceIndex];

            if (this.scene.list_container_vice.x > this.max_vice_x) {
                this.scene.list_container_vice.x = this.max_vice_x
            }

            this.canMoveByVice = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseMoveByVice(event){
            if( this.isVicePauseTime ){
                return;
            }
            if (this.canMoveByVice != true) {
                return;
            }
            let stage_x = event.stageX;
            let off_x = stage_x - this.start_vice_x;
            this.start_vice_x = stage_x;
            let taget_x = this.scene.list_container_vice.x;
            if (this.scene.list_container_vice.x >= this.max_vice_x && off_x > 0) {
                taget_x = this.max_vice_x;
            } else if (this.scene.list_container_vice.x <= this.min_vice_x && off_x < 0) {
                taget_x = this.min_vice_x;
            } else {
                taget_x+=off_x;
            }
            this.scene.list_container_vice.x = taget_x;
            this.target_vice_x = taget_x;
        }
        /*
         *   更新显示
         */
        private updateShowByVice(x: number){
            if (x >= this.max_vice_x) {
                this.curSelectViceIndex = 0;
            } else {
                let len = this.listCarPos.length;
                for (let i = 1; i < len; i++) {
                    let pos_0 = this.listCarPos[i];
                    let pos_1 = this.listCarPos[i-1];
                    if (x >= pos_0 && x < pos_1) {
                        if (Math.abs((x - pos_0)) >= Math.abs((x - pos_1))) {
                            this.curSelectViceIndex = i-1;
                        } else {
                            this.curSelectViceIndex = i;
                        }
                        break;
                    }
                }
            }
            //副武器大小
            let len = this.listViceData.length;
            for (let i = 0; i < len; i++) {
                let deputyWeapon = this.listCarEntity[i];
                let _scale = (this.curSelectViceIndex == i) ? 1.5 : 1.2;
                deputyWeapon.scaleX = _scale;
                deputyWeapon.scaleY = _scale;
            }
            if(this.current_view == 0) {
                this.onPlayDeputyFire();
                this.changeWeaponShow( "deputy", this.curSelectViceIndex);                
            }
            this.changeDeputyLeveUpBtn();
        }

        // -------------------------   副武器 预览视图  End    -------------------------

        // -------------------------   主武器 预览视图  Begin  ----------------------
        /*
         *  初始化副武器 相关信息数值
         */
        public initMainWeaponData(){    
            // 获取到 截取配置表档位的 数组 
            var listArr = [];
            var dataArr = [];
            var getMainNumArr = FZCfgManager.instance.getMainWeaponLevelArea();
            if( getMainNumArr == -1 || getMainNumArr.length <= 0 ){ // 未获取配置,使用默认值
                getMainNumArr = 5;
            }
            this.mainSectionNum = getMainNumArr;  // 区间档位差距数值 

            var mainWeaponsData = FZCfgManager.instance.getBaseMainWeapons();
            
            for ( var k in mainWeaponsData ){
                dataArr.push( mainWeaponsData[k] );
            }
            for( var i = 0; i < dataArr.length; i++ ){
                if( i % this.mainSectionNum == 0 ){
                    listArr.push( dataArr[i] );    
                }
            }
            this.listMainData = listArr;
            this.createFilterByMain();  // 黑色背景图 To 主武器
            this.createMainList(); // 创建主武器的列表
            this.createMainPos();  // 创建主武器的坐标
        }

        // 创建主武器的列表
        private createMainList (){
            let len = this.listMainData.length;
            for (let i = 0; i < len; i++) {
                this.createOneMain(this.listMainData[i], i);
            }
            this.scene.list_container_main.width = len*250;
            this.scene.list_container_main.x = 250-(this.curSelectMainIndex*250);
            this.min_main_x = 250-((len-1)*250);
        }
            // 创建一个主武器 ( 使用于 createMainList )
             createOneMain(mainData: any, index: number){
                    let mainWeapon = new Laya.Image(mainData.mainWeaponModel);  //  显示 获取配置中的资源图
                    let mainLabel = new Laya.Label();
                    // 目前解锁的 最高等级的主武器
                    let main_stage = Math.floor((this.mainWeaponLevel-1)/this.mainSectionNum);
                    this.curMainMaxLevel  = Math.min(main_stage, this.maxMainShiftNum);  // 固定的50档位  0 - 49 
                    let max_unlock_index = this.curMainMaxLevel;
                    if (index > max_unlock_index) {
                        let lock = new Laya.Image("ui_main/ui_lock_img.png");
                        lock.filters = [this.restoreColorByMain];
                        lock.anchorX = 0.5;
                        lock.anchorY = 0.5;
                        lock.scaleX = 0.4;
                        lock.scaleY = 0.4;
                        lock.x = Math.floor(mainWeapon.width/2);
                        lock.y = Math.floor(mainWeapon.height/2);
                        lock.name = "lock";
                        mainWeapon.addChild(lock);
                    }
        
                    // 主武器阶级文字显示
                    var label = (index+1) * this.mainSectionNum;
                    mainLabel.text = label + "级";
                    mainLabel.x = index*250+125+5;
                    mainLabel.y = Math.floor(this.scene.list_container_main.height/2) + Math.floor(mainWeapon.height/2) + 15;  //主武器预览级数的位置
                    mainLabel.anchorX = 0.5;
                    mainLabel.anchorY = 0.5;
                    mainLabel.fontSize = 26;
                    mainLabel.color = "#ffffff";
                    mainLabel.align = "center";
                    mainLabel.align = "middle";
                    this.scene.list_container_main.addChild(mainLabel);
        
                    mainWeapon.x = index*250+125+5;
                    mainWeapon.y = Math.floor(this.scene.list_container_main.height/2) - 20;
                    mainWeapon.anchorX = 0.5;
                    mainWeapon.anchorY = 0.5;
                    let _scale = (index == this.curSelectMainIndex) ? 1 : 0.8;
                    mainWeapon.scaleX = _scale;
                    mainWeapon.scaleY = _scale;
                    this.scene.list_container_main.addChild(mainWeapon);
                    this.mainlistCarEntity.push(mainWeapon);
                }

        /*
         *   点击 主武器升级时,  执行 进阶 对应效果
         */  
        judgeUpMoveStateByMain(){
            this.changeDeputyInCar("main"); // 进阶时候,更换平台上主武器样式
            // 使用lastWeaponArea原因: 因为点击升级,等级已经是 5*X + 1
            var lastWeaponArea = this.mainWeaponLevel - 1;
            let stage = Math.floor((lastWeaponArea-1)/this.mainSectionNum)+1;
            let next_lv_str = Math.min(stage*this.mainSectionNum, this.mainWeaponMaxLevel);
            if( lastWeaponArea == next_lv_str ){
                this.switchAdvanceMaxViewByMain();  // 本次点击属于 进阶的行为 ( 主武器 )
            }
        }

        /*
         *   主武器进阶, 执行的逻辑 （ 不移动 )
         */  
        switchAdvanceMaxViewByMain(){
            var self = this;
            // 下一个等级进行 解锁打开
            var nextViewOpen = function(){
                var nextPoint = self.findAssignPointByMain(self.curSelectMainIndex);
                if( nextPoint ){
                    var nextLock =  nextPoint.getChildByName("lock"); // 获取锁 节点
                    if( ! nextLock ){
                        return;
                    }
                    // 车辆锁 直接消失 , 恢复锁车的颜色
                    nextLock.visible = false; 
                    nextPoint.filters = []; // 取消滤镜
                } 
            }
            this.freshCurMainData(); // 1 : 刷新 "主武器"  数据
            this.setCurMainView(); // 回归到最高等级
            nextViewOpen(); // 2: 解锁 (不可视)
        }

        /*
         *  刷新目前的存储数据
         *  - ( 目前只使用于  switchAdvanceMaxViewByMain  )
         */
        freshCurMainData(){
            this.curMainMaxLevel += 1; // 当前解锁的最大等级 +1
            if( this.curMainMaxLevel > this.maxMainShiftNum ){ // 边界溢出
                this.curMainMaxLevel = this.maxMainShiftNum
            }

            this.curSelectMainIndex += 1; // 当前解锁的等级界面 +1
            if( this.curSelectMainIndex >= this.listMainData.length ){ // 数值溢出 
                this.curSelectMainIndex = this.listMainData.length - 1;
            }
        }

        /*
         *  页面 切换到 当前最高等级
         *      
         */
        private setCurMainView(){
            if( this.curMainMaxLevel < 0 ){
                this.curMainMaxLevel = 0;
            }
            this.curSelectMainIndex = this.curMainMaxLevel;  // 当前档期刷新为最高
            this.scene.list_container_main.x = 250-(this.curSelectMainIndex*250);

            // 刷新 主武器的大小
            let len = this.listMainData.length;
            for (let i = 0; i < len; i++) {
                let car = this.mainlistCarEntity[i];
                let _scale = (this.curSelectMainIndex == i) ? 1.2 : 1;
                car.scaleX = _scale;
                car.scaleY = _scale;
            }
        }

        /*
         *  寻找并且返回 指定的列表节点 (用于: 武器 升级 / 进阶)
         */
        findAssignPointByMain ( index ){
            if( this.mainlistCarEntity && this.listMainData ){
                let len = this.listMainData.length;
                var curMain : any = null;
                if( index >= len ){
                    return;
                }
                for( let i = 0; i < len; i++ ){
                    if( index == i ){
                        curMain = this.mainlistCarEntity[i];   // 获取到 当前的升级武器的节点
                        break;
                    }
                }
                if( curMain ){
                   return curMain;
                }
            }
        }

        // 生成主武器的位置
        createMainPos(){
            let len = this.listMainData.length;
            for (let i = 0; i < len; i++) {
                this.mainListCarPos.push(this.max_vice_x - (i*250));
            }
        }

          /*
         *   该 mouse 的行为 对应的是 主武器浏览框的事件
         */
        onMouseDownByMain(event){
            this.canMoveByMain = true;
            this.start_main_x = event.stageX;
        }
        
        onMouseUpByMain(event){
            if (this.canMoveByMain != true) {
                this.canMoveByMain = false;
                return;
            }
            this.updateShowByMain(this.target_main_x);
            this.scene.list_container_main.x = this.mainListCarPos[this.curSelectMainIndex];
            if (this.scene.list_container_main.x > this.max_main_x) {
                this.scene.list_container_main.x = this.max_main_x
            }
            this.canMoveByMain = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseOutByMain(event){
            if (this.canMoveByMain != true) {
                this.canMoveByMain = false;
                return;
            }
            this.updateShowByMain(this.target_main_x);
            this.scene.list_container_main.x = this.mainListCarPos[this.curSelectMainIndex];
            if (this.scene.list_container_main.x > this.max_main_x) {
                this.scene.list_container_main.x = this.max_main_x
            }
            this.canMoveByMain = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseMoveByMain(event){
            if (this.canMoveByMain != true) {
                return;
            }
            let stage_x = event.stageX;
            let off_x = stage_x - this.start_main_x;
            this.start_main_x = stage_x;
            let taget_x = this.scene.list_container_main.x;
            if (this.scene.list_container_main.x >= this.max_main_x && off_x > 0) {
                taget_x = this.max_main_x;
            } else if (this.scene.list_container_main.x <= this.min_main_x && off_x < 0) {
                taget_x = this.min_main_x;
            } else {
                taget_x+=off_x;
            }
            this.scene.list_container_main.x = taget_x;
            this.target_main_x = taget_x;
        }
        /*
         *   更新显示
         */
        private updateShowByMain(x: number){
            if (x >= this.max_main_x) {
                this.curSelectMainIndex = 0;
            } else {
                let len = this.mainListCarPos.length;
                for (let i = 1; i < len; i++) {
                    let pos_0 = this.mainListCarPos[i];
                    let pos_1 = this.mainListCarPos[i-1];
                    if (x >= pos_0 && x < pos_1) {
                        if (Math.abs((x - pos_0)) >= Math.abs((x - pos_1))) {
                            this.curSelectMainIndex = i-1;
                        } else {
                            this.curSelectMainIndex = i;
                        }
                        break;
                    }
                }
            }
            // 刷新 主武器的大小
            let len = this.listMainData.length;
            for (let i = 0; i < len; i++) {
                let mainWeapon = this.mainlistCarEntity[i];
                let _scale = (this.curSelectMainIndex == i) ? 1 : 0.8;
                mainWeapon.scaleX = _scale;
                mainWeapon.scaleY = _scale;
            }
            if (this.current_view == 1) {
                this.onPlayMainFire();
                this.changeWeaponShow( "main", this.curSelectMainIndex);
            }
        }

        // -------------------------   主武器 预览视图  End  ------------------------

        // -------------------------   主武器 / 副武器 展示台  Begin  ------------------------
        /*
         *   副武器界面 - 平台上增加 车展示
         */
        initShowCar(){
            var index:any = FZMergeDateManager.instance.getCarUsedLevel(); 
            // 显示车子的 图以及阴影
            this.scene.img_car_icon.skin = "ui_car/p_EventCar_" + index + ".png";
            this.scene.img_car_icon_shadow.skin = "ui_car/p_EventCar_" + index + ".png";
            this.scene.img_car_icon_shadow.filters = [FZGameData.instance.blackFilter];

            // 初始化 - 主武器 / 副武器 的显示
            this.scene.box_weapons_1.visible = true; // 默认显示主武器
            this.scene.box_deputy_weapon1.visible = false; // 默认 关闭副武器

            // 初始化 - 关闭开火的显示
            this.scene.box_fire_1.visible = false;
            this.scene.box_fire_2.visible = false;
            this.scene.deputy_fire_right.visible = false;
            this.scene.deputy_fire_left.visible = false;
        
            // 显示武器
            if(this.curCarMaxLevel < FZGameData.instance.getDeputyWeaponOpenPoint()){  //未解锁副武器
                this.changeDeputyInCar("main");
                this.scene.box_deputy_weapon1.visible = false; // 副武器并没有解锁 
            } else {
                this.changeDeputyInCar("both");
                this.scene.box_deputy_weapon1.visible = true;  // 副武器已经解锁
            }
            this.initDBullet();  //加载武器子弹
        }

        /*
         *   副 / 主武器 界面  - 车上的资源图更改 （ 升级时候 执行 ） 
         *    "deputy" - 副武器  
         *    "main"   - 主武器
         *    "both"   - 主武器+副武器
         */
        changeDeputyInCar(param){
            if( param == "deputy" || param == "both" ){
                // 刷新 副武器的图
                if (this.deputyWeaponLevel > 0){
                    var deputy_data = FZCfgManager.instance.getDeputyWeapons(this.deputyWeaponLevel);
                    this.scene.img_deputy_weapons_icon_1_0.skin = deputy_data.sPic;
                    this.scene.img_deputy_weapons_icon_1_1.skin = deputy_data.sPic;
                }
            } 
            
            if( param == "main" || param == "both" ){
                // 刷新 主武器的图
                // var bese_data = FZCfgManager.instance.getBaseMainWeapons();  
                // this.mianWeaponLevelForView = FZGameData.instance.getMainWeaponLevel();
                // this.scene.img_weapons_icon1.skin = bese_data[this.mianWeaponLevelForView].mainWeaponModel;
            } 
        }

        /*
         *   副/主武器 显示的更新 （ 预览 ）
         */
        changeWeaponShow(param,num){
            if( ! param ){
                return;
            }
            // 刷新 副武器的图
            if ( param == "deputy" ){ 
                 var curDepuNum = ( num * 20 ) + 1;
                 var deputy_data = FZCfgManager.instance.getDeputyWeapons(curDepuNum);
                 this.scene.img_deputy_weapons_icon_1_0.skin = deputy_data.sPic;
                 this.scene.img_deputy_weapons_icon_1_1.skin = deputy_data.sPic;
            } 
            // 刷新 主武器的图
            if( param == "main" ){
                // var curMainNum = ( num * 5 ) + 1;
                // var bese_data = FZCfgManager.instance.getBaseMainWeapons();
                // this.scene.img_weapons_icon1.skin = bese_data[curMainNum].mainWeaponModel;
            }
        }

        /**
         *   主武器 开火的显示与隐藏 
         */
        public mainFireState(param){
            if(!this.baseMainWeaponData){
                return;
            }
            if( param == "show" ){
                this.scene["box_fire_1"].visible = false;
                this.scene["box_fire_2"].visible = false;
                // var curLevel = (this.curSelectMainIndex) * 5 + 1;
                this.scene["box_fire_" + this.weapons_count].visible = true;
            } else if( param == "hide" ){
                this.scene.MainFireFlash.stop();
                this.scene.MainFireFlash.gotoAndStop(0);
                this.scene["box_fire_1"].visible = false;
                this.scene["box_fire_2"].visible = false;
            }
        }

        /**
         *   副武器 开火的显示与隐藏 
         */
        public deputyFireState(param){
            if( param == "show" ){
                this.scene["deputy_fire_right"].visible = true;
                this.scene["deputy_fire_left"].visible = true;
            } else if( param == "hide" ){
                this.scene.DeputyFireFlash.stop();
                this.scene.DeputyFireFlash.gotoAndStop(0);
                this.scene["deputy_fire_right"].visible = false;
                this.scene["deputy_fire_left"].visible = false;
            }
        }

        /**
         * 加载预览子弹
         */
        public initDBullet(){
            FZMergeDateManager.instance.initBullet(this.scene.car_weapon);
            var that = this;
        }

        /**
         * 获取不同等级下副武器子弹的数据
         */
        public getDeputyBulletData(){
            let curDeputyWeaponData = FZCfgManager.instance.getDeputyWeapons(this.deputyWeaponLevel);
            let curBulletData = FZCfgManager.instance.getBulletList(curDeputyWeaponData.sBullet);
            if(!curDeputyWeaponData || !curBulletData){
                return;
            }
            if(this.isDeputyPreview == true) {
                FZDebug.D("获取不同等级下副武器子弹的数据 ----------------------------  " + this.curSelectViceIndex);
                curDeputyWeaponData = FZCfgManager.instance.getDeputyWeapons((this.curSelectViceIndex + 1) * 20);
                curBulletData = FZCfgManager.instance.getBulletList(curDeputyWeaponData.sBullet);
                if(!curDeputyWeaponData || !curBulletData){
                    return;
                }
            }
            this.deputyCount = curDeputyWeaponData.sBulletNumber || 1;
            this.deputyBallistic = curDeputyWeaponData.s_ballistic_id || 1;
            this.deputyBulletModel = curBulletData.bullet_pic;
            this.deputyShadowPic = curBulletData.shadow_pic;
            this.deputyFireFrequency = curDeputyWeaponData.sFireFrequency || 130;
        }

        /**
         * 获取不同等级下主武器子弹的数据
         */
        public weapons_count:any = 1;
        public getMainBulletData(){
            if(!this.baseMainWeaponData){
                return;
            }
            var index:any = FZMergeDateManager.instance.getCarUsedLevel();
            var data = FZCfgManager.instance.getCarInfoById(index);
            var weapon_data_cur = FZCfgManager.instance.getMainWeapons(data.mainWeaponId);

            let curBulletData = FZCfgManager.instance.getBulletList(weapon_data_cur.bullet);
            if(!curBulletData){
                return;
            }
            this.mainCount = weapon_data_cur.bulletNumber || 1;
            this.mainBallistic = weapon_data_cur.main_ballistic_id || 1;
            this.mainFireFrequency = weapon_data_cur.fireFrequency || 130;

            this.scene.img_weapons_icon1.skin = weapon_data_cur.mainWeaponModel;

            this.weapons_count =  weapon_data_cur.weapons_count;
            // if(this.isMainPreview == true) {  //预览界面打开时
            //     curBulletData = FZCfgManager.instance.getBulletList(this.baseMainWeaponData[((this.curSelectMainIndex + 1) * 5).toString()].bullet);
            //     if(!curBulletData){
            //         return;
            //     }
            //     this.mainCount = this.baseMainWeaponData[((this.curSelectMainIndex + 1) * 5).toString()].bulletNumber || 1;
            //     this.mainBallistic = this.baseMainWeaponData[((this.curSelectMainIndex + 1) * 5).toString()].main_ballistic_id || 1;
            //     this.mainFireFrequency = this.baseMainWeaponData[((this.curSelectMainIndex + 1) * 5).toString()].fireFrequency || 130;
            // }

            this.mainBulletModel = curBulletData.bullet_pic;
            this.mainShadowPic = curBulletData.shadow_pic;
            
            // console.log("主武器枪管");
            // console.log(this.mainBallistic);
        }
        
        /**
         * 刷新副武器武器子弹显示
         */
        public deputyPlayFire(){
            Laya.timer.clear(this, this.mainPlayFire);
            if(this.playLevelUpAnimation == true){
                return;
            }
            this.playFireSound();
            this.scene.DeputyFireFlash.play(0, false);
            var count = this.deputyCount;  //子弹数量
            var main_ballistic = this.deputyBallistic;  //弹道
            var bulletModel = this.deputyBulletModel;
            var shadow_pic = this.deputyShadowPic;
            var deputy_dis = 0;
            var deputy_rota = 0;

            for (var j = 0; j< 2; j++) {
                if (j == 0){
                    deputy_dis = -95;
                    deputy_rota = -10;
                }else {
                    deputy_dis = 95;
                    deputy_rota = 10;
                }
                for (var i = 0; i < count; i++) {
                    var pos_data = FZGameData.instance.getDeputyButtonInitialPos(main_ballistic,i,count);
                    var y = Math.sin(deputy_rota * (Math.PI/180))*(pos_data.x) +  Math.cos(deputy_rota * (Math.PI/180))*(pos_data.y);
                    var x = Math.cos(deputy_rota * (Math.PI/180))*(pos_data.x) -  Math.sin(deputy_rota * (Math.PI/180))*(pos_data.y);
                    var bulletPoint1 = {x:this.scene.img_car_icon_1.x + deputy_dis + x , y: this.scene.img_car_icon_1.y - 50 + y , 
                    rotation:deputy_rota, bulletModel: bulletModel , shadow_pic: shadow_pic,change_data:pos_data};
                    FZMergeDateManager.instance.getDBullet().startFire(bulletPoint1);
                }
            }
        }

        /**
         * 刷新子弹位置
         */
        public onUpdatePos() {
            if(FZMergeDateManager.instance.DBulletPoolJSList.length == 0){
                if (this.isPlayDeputyBullet == true){
                    if (this.current_view == 0){
                        FZDebug.D("刷新子弹位置 ---------------- 播放副武器子弹");
                        this.onPlayDeputyFire();
                    }else if (this.current_view == 1){
                        this.onPlayMainFire();
                    }
                }
            }else{
                for (var i = FZMergeDateManager.instance.DBulletPoolJSList.length-1; i >= 0; i--){
                    FZMergeDateManager.instance.DBulletPoolJSList[i].UpdatePos();
                }
            }
        }
        /**
         * 播放副武器开火
         */
        public isPlayDeputyBullet = false;  // 开火结束后 是否再次开火
        public onPlayDeputyFire() {
            this.getDeputyBulletData();
            this.deputyFireState("show");
            this.deputyPlayFire();
            Laya.timer.clear(this, this.deputyPlayFire);
            Laya.timer.clear(this, this.onUpdatePos);
            Laya.timer.loop(this.deputyFireFrequency, this, this.deputyPlayFire);  //弹道显示
            Laya.timer.loop(1,this, this.onUpdatePos);
        }
        
        public onPlayMainFire(){
            //弹道显示
            this.getMainBulletData();
            // 播放开火
            this.mainFireState("show");
            this.mainPlayFire();
            Laya.timer.clear(this, this.mainPlayFire);
            Laya.timer.clear(this, this.onUpdatePos);
            Laya.timer.loop(this.mainFireFrequency, this, this.mainPlayFire);  //弹道显示
            Laya.timer.loop(1,this, this.onUpdatePos);
           
        }
  
        /**
         * 刷新主武器武器子弹显示
         */
        public mainPlayFire() {
            Laya.timer.clear(this, this.deputyPlayFire);
            if(this.playLevelUpAnimation == true){
                return;
            }
            this.playFireSound();
            this.scene.MainFireFlash.play(0, false);
            var count = this.mainCount;  //子弹数量
            var main_ballistic = this.mainBallistic;  //弹道
            var bulletModel = this.mainBulletModel;
            var shadow_pic = this.mainShadowPic;
            var deputy_dis = -4;
            var deputy_rota = 0;
            for (var i = 0; i < count; i++) {
                var pos_data = FZGameData.instance.getDeputyButtonInitialPos(main_ballistic,i,count);
                var bulletPoint = {x:this.scene.img_car_icon_1.x + deputy_dis + pos_data.x , y:this.scene.img_car_icon_1.y -220 + pos_data.y , 
                rotation:deputy_rota, bulletModel: bulletModel , shadow_pic: shadow_pic,change_data:pos_data};
                FZMergeDateManager.instance.getDBullet().startFire(bulletPoint);
            }
        }
    } 
}

export default game.view.FZWeaponLevelUpUI;
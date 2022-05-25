import FZMergeDateManager from "./FZMergeDateManager";
import FZBullet from "../view/QComponent/FZBullet";
import FZDebug from "../../framework/FZDebug";
import FZDiRenNode from "../view/FZDiRenNode";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "./FZEvent";
import FZSaveDateManager from "./FZSaveDateManager";
import FZCfgManager from "../core/FZCfgManager";
import FZChipNode from "../view/FZChipNode";
import FZItemsUI from "../view/FZItemsUI";
import FZObstaclesUI from "../view/FZObstaclesUI";
import FZConst from "../../framework/FZConst";
import FZUIManager from "../core/FZUIManager";
import FZUtils from "../../framework/FZUtils";
import FZWechat from "../core/FZWechat";
import FZGameStatus from "./FZGameStatus";
import FZFlyResConfig from "../view/FZFlyResConfig";
import FZCarSkills from "../view/QComponent/FZCarSkills";
import FZBossNode from "../view/FZBossNode";
import FZBulletEffect from "../view/QComponent/FZBulletEffect";

namespace game.data
{
    export class FZGameData
    {
        private constructor() { }
        public StateSprint = false; // 冲刺状态
        public StateBallistic = false; //增加弹道 
        private static _instance: FZGameData;
        public aircraft_index:number = 0;
        public static get instance(): FZGameData
        {
            if (this._instance == null)
            {
                this._instance = new FZGameData();
                this._instance.registerEvent();
            }
            return this._instance;
        }

        public registerEvent(): void
        {
            // FZEventManager.instance.register(FZEvent.IN_OBS_GUIDE, this.changeObstaclesParam, this);
            FZEventManager.instance.register(FZEvent.GAME_CURRENT_TIME, this.changeGameCurrentTime, this);
            //副武器满级试用
            FZEventManager.instance.register(FZEvent.DEPUTY_PROBATION_OVER, this.resetDeputyTryLevel, this);
        }

        public unregisterEvent(): void
        {
            // FZEventManager.instance.unregister(FZEvent.IN_OBS_GUIDE, this.changeObstaclesParam, this);
            FZEventManager.instance.unregister(FZEvent.GAME_CURRENT_TIME, this.changeGameCurrentTime, this);
            FZEventManager.instance.unregister(FZEvent.DEPUTY_PROBATION_OVER, this.resetDeputyTryLevel, this);
        }
        public loadResFinished: boolean = false; // 资源 图片 音乐 加载完成
        // public bannerAdId:string = "adunit-1896b0b11c77e456";
        // public videoAdId:string  = "adunit-9d8b35e635f641c9";
        
        // static createBannerAdOnBottom(adid:string):void;
        // static bannerAdHide():void;
        // static bannerAdShow():void;
        // static createRewardedVideoAd(adid:string,sucCallback: any,failCallback: any ):void;


        //测试数据（正式版需要关闭）
        // public useLocalRes: boolean = false; //使用本地资源测试        
        public game_stop:boolean = false;
        public game_running_time:number = 1; // 暂停之后的比率
        public game_current_time:number = 1;
        public game_stop_time:number = 0.05; // 暂停之后的比率
        public BulletPoolNodeList: any = [];    // 普通子弹对象池
        public BulletPoolNodeListVisible: any = [];    // 显示的子弹自己的
        public BulletPoolNodeListEnemyVisible: any = [];    // 显示的子弹敌人的
        public bullet_prefab_parent:any = null; // 普通子弹父节点
        public EnemyPoolNodeList:any = [];   // 敌人对象池
        public CoinPoolNodeList:any = [];   // 银币对象池
        public ProbsPoolNodeList:any = [];   // 道具对象池 
        public ProbsPoolNodeListVisible:any = [];// 显示的道具
        public ObstaclesPoolNodeList:any = []; // 障碍物
        public SkillPoolNodeList:any = [];     // 技能对象池
        public SkillPoolNodeListVisible:any = [];     // 技能对象池 显示

        public DollarPoolNodeList: any = []; //美钞pool
        public GoldPoolNodeList: any = []; //金币pool
        public DiamondPoolNodeList: any = []; //钻石pool
        public title_goldPos: object = {x: 0,y: 0};
        public title_diamondPos: object = {x: 0,y: 0};
        public flyLayer : FZFlyResConfig;
        
        public enemy_prefab_parent:any = null; // 敌人父节点
        public map_speed:number = 13.26; // 地图速度
        public map_speed_normal:number = 13.26; // 地图速度
        public map_speed_sprint:number = 24; // 地图速度
        public map_speed_stop = 1; // 暂停地图速度
        public LevelEnemyCount = 40;  // 当前关卡的敌人数量剩余
        public LevelEnemyCountMax = 40;  // 当前关卡的敌人数量 
        public PoolEnemyLength = 20;  // 敌人的对象池数量
        public FZPlayerUIPos :any = {}; // 玩家车辆位置
        public weapons_coin:number = 0;

        public integralAngle = [99,199,300];
        public integralToType = [[1,1],[1,1,1,1,2,1,1,1],[1,1,1,1,1,1,2,1,1,1,1,2,1,1,1]];//第一次分享之后全视频，，3次分享之后视频之后俩次分享
        public shieldCityShareTip = ["北京","上海","深圳","广州","长沙","天津","杭州","成都"];
        public onlyCanVideo = false;

        //-关卡信息----------------------------------------------------------------------------------------------
        public max_check_point_count:number = 1000;
        public check_point:number = 1;
        public max_check_point:number = 1;
        public player_aircraft: number = -1;
        public check_point_data:any = {};
        public  blackMat = [
            0, 0, 0, 0, 0, // R
            0, 0, 0, 0, 0, // G
            0, 0, 0, 0, 0, // B
            0, 0, 0, 1, 0  // A
        ];
        public  yellowMat = [
            1, 0, 0, 0, 0, // R
            1, 0, 0, 0, 0, // G
            0, 0, 0, 0, 0, // B
            0, 0, 0, 1, 0  // A
        ];
        public  greenMat = [
            0, 0, 0, 0, 0, // R
            1, 0, 0, 0, 0, // G
            0, 0, 0, 0, 0, // B
            0, 0, 0, 1, 0  // A
        ];
        public  redMat = [
            1, 0, 0, 0, 0, // R
            0, 0, 0, 0, 0, // G
            0, 0, 0, 0, 0, // B
            0, 0, 0, 1, 0  // A
        ];
        public whiteMat = [
            0, 0, 0, 0, 0, // R
            0, 0, 0, 0, 0, // G
            0, 0, 0, 0, 0, // B
            0, 0, 0, 0, 0  // A
        ];
        public blackFilter :any = null;
        public yellowFilter :any = null;
        public greenFilter :any = null;
        public redFilter :any = null;
        public whiteFilter:any = null;
        // probs_type 1 倒计时类  2 直接获得
        public itemConfig :any = null;
        public DollarDouble = 1; // 美钞翻倍
        //-----------------------------------------------------------------------------------------------
        public UAVData: any = null;
        public curUseUAV: number = -1;
        public uavWeapon_open_point: number = 40;
        public uavWeaponMaxLevel: number = 100;
        public uavWeaponHasOpened: number = 0;

        public mainWeaponLevel: number = 1;
        public mainWeaponMaxLevel: number = 250;

        public depoutyWeaponLocalLevel: number = 0;
        public depoutyWeaponMaxLevel: number = 100;
        public deputyWeapon_open_point: number = 10;
        public deputyWeaponHasOpened: number = 0;

        public choose_point_open_point: number = 15;
        public obstacles_check_point: number = 50;

        public airDrop_Video_State : string = "false";  // 记录空投 是否看过视频
        public airDrop_promptly_show : string = "false";  // 记录空投 新手引导结束后 是否有立即出现过

        public deleteCarGuide : string = "First"; //  记录 删除车辆引导 的次数
        public delCarGuideState : string = "InGuide"; //  记录 删除车辆 是否处于引导状态
        
        public isHandGuideFix : boolean = false;  // 小手的引导是否重叠 ( 其余的小手与删车引导 )

        public money_close_delay : boolean = false;   // 金币(美钞)弹窗 是否延迟关闭

        public main_weapon_max_level: number = 250;   // 主武器 最大等级数值 (如修改数目,这里记得修改)
        public deputy_weapon_max_level: number = 100; // 副武器 最大等级数值 (如修改数目,这里记得修改)

        public delay_show_time: number = 2000; // 关闭按钮 / 普通领取 延迟弹出的时间 
       
        public game_revive_times:any = 0; //游戏复活次数

        public deputy_full_level_try = 0; //副武器满级试用时的等级
        public bulletShootTimes = 10;  //武器子弹发射的次数

        public InterstitialAdCountMAX:number = 0;
        public InterstitialAdCount:number = 1;
        //结算翻牌概率-----------------------------------------------------------------------------------
        public cardChangce:number[][] = [
            [0.5,0.5],
            [0.5,0.5],
        ];
        /**
         * 位置X
         */  
        public POSLIST = [[0],[-15,15],[-30,0,30],[-45,-15,15,45], [-60, -30 ,0, 30, 60],[-75,-45,-15,15,45,75],[-90, -60, -30 ,0, 30, 60, 90]] // 子弹位置 
        /**
         * 位置Y
         */
        public POSLIST_Y = [[0],[0,0],[0,-30,0],[0,-30,-30,0], [0, -30 ,-60, -30, 0],[0,-30,-60,-60,-30,0],[0, -30, -60 ,-90, -60, -30, 0]] // 子弹位置 
        /**
         * 移动角度 
         */
        public POSLIST_R = [[0],[0,0],[-1,0,1],[-1,0,0,1],[-1,-1,0,1,1], [-1, -1, 0 ,0, 1, 1]];
        /**
         * 大小
         */
        public POSLIST_S = [[1],[1,1],[1,1.5,1], [1, 1.5, 1.5, 1],[1, 1.5, 1.7 ,1.5, 1], [1, 1.5, 1.7 ,1.7, 1.5, 1]];
        /**
         * zoder
         */
        public ZODER_S = [[0],[0,1],[0,1,0], [0, 1, 2, 0],[0, 1, 2 ,1, 0], [0, 1, 2 ,3, 1, 0]];

        public moreGameTime: any;  //开始试玩的时间
        public moreGameAwardTime: number = 20;  //试玩时间

        /**
         * 设置开始试玩的时间
         */
        public setMoreGameTime(){
            this.moreGameTime = new Date().getTime();
        }

        /**
         * 获取开始试玩的时间
         */
        public getMoreGameTime(){
            return this.moreGameTime;
        }

        public getWeaposX(_index, count): any
        {   
            return this.POSLIST[count-1][_index];
        }
        public getWeaposY(_index, count):any
        {
            return this.POSLIST_Y[count-1][_index];
        }

        /**
         * 重置副武器试用的等级
         */
        public resetDeputyTryLevel(){
            this.deputy_full_level_try = 0;
            FZSaveDateManager.instance.setItemToLocalStorage("DEPUTY_FULL_LEVEL_TRY", (this.deputy_full_level_try).toString());
        }
        /**
         * 副武器获得位置
         * 1 直线 平 
         * 2 偏移 凸
         * 3 直线 凸 
         * 4 直线 凸 大小
         * 5 偏移 凸 大小
         * 6 偏移 凸 大小 
         * 7 偏移
         * 8 偏移 旋转
         * 9 大小 旋转
         * 10 偏移 大小 旋转
         */
        
        public getDeputyButtonInitialPos(type:number, _index:number, count:number) {
            var data: any = {};
            data.scale = 1;
            data.move_roate = 0;
            data.rotating = 0;
            data.zoder = this.ZODER_S[count-1][_index];
            if (type == 1) {
                data.x = this.POSLIST[count-1][_index];
                data.y = 0;
                data.move_roate = 0;
            } else if(type == 2) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate =  this.POSLIST_R[count-1][_index];
            } else if(type == 3) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate = 0;
            } else if(type == 4) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate = 0;
                data.scale = this.POSLIST_S[count-1][_index];
            } else if(type == 5) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate = this.POSLIST_R[count-1][_index];;
                data.scale = this.POSLIST_S[count-1][_index];
            } else if(type == 6) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate = this.POSLIST_R[count-1][_index];;
                // 特殊大小
                var P_S = [[1],[1,1],[1,1.1,1], [1, 1.1, 1.1, 1],[1, 1.1, 1.1 ,1.1, 1], [1, 1, 1.1 ,1.1, 1, 1]];
                data.scale = P_S[count-1][_index];
            } else if(type == 7) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate =  this.POSLIST_R[count-1][_index];
            } else if(type == 8) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate =  this.POSLIST_R[count-1][_index];
                data.rotating = 1;
            } else if(type == 9) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate =  0;
                data.scale = this.POSLIST_S[count-1][_index];
                data.rotating = 1;
            } else if(type == 10) {
                data.x = this.POSLIST[count-1][_index];
                data.y = this.POSLIST_Y[count-1][_index];
                data.move_roate =  this.POSLIST_R[count-1][_index];
                data.scale = this.POSLIST_S[count-1][_index];
                data.rotating = 1;
            }
            return data;
        }

        public changeGameCurrentTime(param: any){
            if (param == 0) {
                Laya.timer.clear(this, this.LoopTime);
                this.onGameStop();
            }
            this.game_current_time = param;
        }

        public isInObstaclesGuide = "true";  //控制第一关障碍物的出现，只出现一次
        public enemyCheck = 0;  //控制出现障碍物的是第几波怪，前几波不出现障碍物，避免障碍物引导和道具引导冲突

        public judgeBossCheckPoint:boolean = false;
        public getButtleGameTime():any
        {
            if (this.game_stop == true) {
                return this.game_stop_time;
            } else {
                return this.game_running_time;
            }
        }
        /**
         * 游戏运行状态
         */
        public getGameTime():any
        {
            return this.game_current_time;
        }
        /**
         * 暂停 继续游戏
         */
        public startGameRunning():void {
            Laya.timer.clear(this, this.LoopTime);
            Laya.timer.loop(1, this, this.LoopTime);
        }
        /**
         * 暂停
         */
        public startGameStop():void
        {
            Laya.timer.clear(this, this.LoopTime);
            Laya.timer.loop(1, this, this.LoopTime);
        }
        private LoopTime(){
            if (this.game_stop == true) {
                this.game_current_time -= 0.1;
            }else {
                this.game_current_time += 0.1;
            }
            // FZDebug.D("this.game_current_time =       " + this.game_current_time);
            if (this.game_current_time <= this.game_stop_time) {
                this.game_current_time = this.game_stop_time;
                Laya.timer.clear(this, this.LoopTime);
            } else if (this.game_current_time >= this.game_running_time) {
                this.game_current_time = this.game_running_time;
                Laya.timer.clear(this, this.LoopTime);
            }
        }
        /**
         *  游戏结束子弹时间
         */
        public startGameOver():void {
            // Laya.timer.loop(1, this, this.LoopGameOverTime);
        }
        /**
         * 子弹时间
         */
        private LoopGameOverTime(){
            // this.game_current_time -= 0.1;
            // if (this.game_current_time <= this.game_stop_time) {
            //     this.game_current_time = this.game_stop_time;
            //     Laya.timer.clear(this, this.LoopGameOverTime);
            // } 
        }

        public getMapSpeed():any
        {
            return this.map_speed;
        }
        public setMapSpeed(speed):void 
        {
            this.map_speed = speed;
        }
        public bullet_index :number = 0;
        public EnemyList:any = [];
        public car_pos:any = [96, 239, 382, 525, 668]//[80, 228,375, 523, 670];//[70, 218,365, 513, 660];
        public checkpoint_diamond = 0;
        public checkpoint_dollars = 0;
        public initData(): void {
            this.deputy_full_level_try = Number(FZSaveDateManager.instance.getItemFromLocalStorage("DEPUTY_FULL_LEVEL_TRY", "0"));  //获取副武器试用等级
            // FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE ,this.UpdatePos,this);   // 刷新位置
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_RESURRECT ,this.onResurrect,this);   // 复活
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_OVER ,this.onGameOver,this);   // 游戏结束
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_RUNNING,this.onGameRunning,this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_STOP,this.onGameStop,this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_FAIL,this.onGameFail,this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onGameWin,this);
            FZEventManager.instance.register(FZEvent.GAME_VIEW_BOSS_OVER,this.onPlayWinAnimation, this);  

            this.DollarDouble = 1;
            this.itemConfig = FZCfgManager.instance.getitemConfig(); 
            this.PoolEnemyLength = 20;
            this.checkpoint_diamond = 0;
            this.checkpoint_dollars = 0;
            this.StateBallistic = false; // 是否增加弹道
            
            this.car_pos = [96, 239, 382, 525, 668];
            this.aircraft_index = 0;
            this.BulletPoolNodeList =[];
            this.BulletPoolNodeListVisible = [];
            this.BulletPoolNodeListEnemyVisible = [];
            this.EnemyList =[];
            this.ObstaclesPoolNodeList = [];
            this.ObstaclesListJSData = [];
            // 初始化 合成数据
            FZMergeDateManager.instance.initData();  
            // 初始化 关卡信息
            this.initCheckPoint();
            this.bullet_index = 0;
            this.blackFilter = new Laya.ColorFilter(this.blackMat);
            this.yellowFilter = new Laya.ColorFilter(this.yellowMat);
            this.greenFilter = new Laya.ColorFilter(this.greenMat);
            this.redFilter = new Laya.ColorFilter(this.redMat);
            this.whiteFilter = new Laya.ColorFilter(this.whiteMat);
            this.airDrop_Video_State = FZSaveDateManager.instance.getItemFromLocalStorage("AIR_DROP_VIDEO", "false");
            this.deleteCarGuide  = FZSaveDateManager.instance.getItemFromLocalStorage("DELETE_CAR_GUIDE", "First");
            this.delCarGuideState = FZSaveDateManager.instance.getItemFromLocalStorage("DELETE_CAR_GUIDE_STATE", "NoGuide");
            this.isInObstaclesGuide = FZSaveDateManager.instance.getItemFromLocalStorage("OBS_GUIDE", "true");

            this.airDrop_promptly_show = FZSaveDateManager.instance.getItemFromLocalStorage("AIR_DROP_THREE", "false");

            this.BulletList = [];
            this.EnemyPosList = [];
            for (var i =0; i < this.POSYLIST.length; i++){
                this.EnemyPosList[i] = [];
                this.BulletList[i] = [];
            }

        } 
        // ----------------------------------------------------------------------------------------------------------------
        public addInterstitialAdCount() {
            this.InterstitialAdCount -= 1;
            FZSaveDateManager.instance.setItemToLocalStorage("INTERSTITIALAD", this.InterstitialAdCount.toString());
        }
        /**
         * 插屏次数
         */
        public getInterstitialAdCount() {
            this.InterstitialAdCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("INTERSTITIALAD", "0"));
            var time = FZSaveDateManager.instance.getItemFromLocalStorage("INTERSTITIALADTIME", "0");
            var new_time = new Date().toLocaleDateString();
            if (time != new_time) {
                this.InterstitialAdCount = FZGameData.instance.InterstitialAdCountMAX;
                FZSaveDateManager.instance.setItemToLocalStorage("INTERSTITIALAD", this.InterstitialAdCount.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("INTERSTITIALADTIME", new_time);
            }
            return  this.InterstitialAdCount;
        }
        // ----------------------------------------------------------------------------------------------------------------
        public playerCar:any ={};
        public setFZPlayerUI(value){
            this.playerCar = value;
        }
        // 更改冲刺状态
        public onChangeStateSprint(value){
            this.StateSprint = value;
            for (var i = this.BulletPoolNodeListVisible.length-1; i >= 0;i--){
                if (this.BulletPoolNodeListVisible[i]){
                    this.BulletPoolNodeListVisible[i].onUpdatePosEnd();
                }
            }
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i >=0 ;i--){
                if (this.BulletPoolNodeListEnemyVisible[i]){
                    this.BulletPoolNodeListEnemyVisible[i].onUpdatePosEnd();
                }
            }
            for (var i = this.EnemyList.length-1 ; i >= 0 ;i--){
                if (this.EnemyList[i]){
                    this.EnemyList[i].onUpdateSpeed();                
                }
            }
        }

        /**
         * 位置移动
         */
        public UpdatePos() {
            // 敌人
            for (var i = this.EnemyList.length-1; i >= 0; i--){
                if (this.EnemyList[i]){
                    this.EnemyList[i].UpdatePos();
                    this.EnemyList[i].onJudgeOutScreen();
                }
            }
            // 技能 
            for (var i = this.SkillPoolNodeListVisible.length-1; i >= 0; i--){
                if (this.SkillPoolNodeListVisible[i]){
                    this.SkillPoolNodeListVisible[i].UpdatePos();
                    this.SkillPoolNodeListVisible[i].onJudgeOutScreen();
                }
            }
            // 子弹 自己的
            for (var i =this.BulletPoolNodeListVisible.length-1; i >= 0 ;i--){
                if (this.BulletPoolNodeListVisible[i]) {
                    this.BulletPoolNodeListVisible[i].UpdatePos();
                    this.BulletPoolNodeListVisible[i].onJudgeOutScreen();
                }
            }

            // 子弹 敌人的
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i >= 0 ;i--){
                if (this.BulletPoolNodeListEnemyVisible[i]) {
                    this.BulletPoolNodeListEnemyVisible[i].UpdatePos();
                    this.BulletPoolNodeListEnemyVisible[i].onJudgeOutScreen();
                }
            }            
            // 障碍物
            for (var i = this.ObstaclesListJSData.length - 1; i >= 0 ;i--){
                if (this.ObstaclesListJSData[i]) {
                    this.ObstaclesListJSData[i].UpdatePos();
                    this.ObstaclesListJSData[i].onJudgeOutScreen();
                }
            }
            // 道具
            for (var i = this.ProbsPoolNodeListVisible.length-1; i>= 0 ;i--){
                if (this.ProbsPoolNodeListVisible[i]) {
                    this.ProbsPoolNodeListVisible[i].UpdatePos();
                    this.ProbsPoolNodeListVisible[i].onJudgeOutScreen();
                }
            }
            if (this.BossNode && this.BossNode.state != 0){
                this.BossNode.UpdatePos();    
            }
            // 碰撞检测
            this.onHit();
        }
        /**
         * 碰撞检测
         * 1子弹和车
         */
        public bullet_pos :any ={};
        public attack:number = 0;
        public mtype:number = 0;
        public play_pos:any ={};
        public onHit(){
            this.play_pos = this.playerCar.getPos();
            // 敌人子弹和玩家车碰撞
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i>=0 ;i--){
                this.bullet_pos = this.BulletPoolNodeListEnemyVisible[i].box_posit;
                if (this.JudgeRectangular(this.play_pos,this.bullet_pos) == true)
                {
                    this.attack =this.BulletPoolNodeListEnemyVisible[i].attack;
                    if (this.BulletPoolNodeListEnemyVisible[i].getCartype == 3 || this.BulletPoolNodeListEnemyVisible[i].getCartype == 4)
                    {
                        FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_BULLET_HIT + "QPalyerCar" ,{vibrateType:1, type:3,attack: this.attack});
                    }else {
                        FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_BULLET_HIT + "QPalyerCar" ,{type:3,attack: this.attack});
                    }
                    
                    this.BulletPoolNodeListEnemyVisible[i].onHit();
                }
            }  
            // 敌人与玩家
            for (var i = this.EnemyList.length-1; i >= 0; i--){
                this.bullet_pos = this.EnemyList[i].box_posit;
                if (this.JudgeRectangular(this.play_pos,this.bullet_pos) == true)
                {
                    this.EnemyList[i].onHit({type:1});
                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_BULLET_HIT + "QPalyerCar" ,{vibrateType:2, type:1});
                }
            }
            // 玩家 与 技能 
            for (var i = this.SkillPoolNodeListVisible.length-1; i >= 0; i--){
                if (this.SkillPoolNodeListVisible[i].skillstate == 1){
                    this.bullet_pos = this.SkillPoolNodeListVisible[i].box_posit;
                    if (this.JudgeRectangular(this.play_pos,this.bullet_pos) == true)
                    {
                        this.attack = this.SkillPoolNodeListVisible[i].attack;
                        this.SkillPoolNodeListVisible[i].onHit();
                        this.mtype = 4;
                        FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_BULLET_HIT + "QPalyerCar" ,{type: this.mtype, vibrateType:2 ,attack: this.attack});
                    }
                }
            }
            // 道具
            for (var i = this.ProbsPoolNodeListVisible.length-1; i >= 0 ; i--){
                this.bullet_pos = this.ProbsPoolNodeListVisible[i].box_posit;
                if (this.JudgeRectangular(this.play_pos,this.bullet_pos) == true)
                {
                    this.ProbsPoolNodeListVisible[i].onHit();
                }
            }
            // 障碍物
            for (var i = this.ObstaclesListJSData.length-1; i >= 0; i--){
                this.bullet_pos = this.ObstaclesListJSData[i].box_posit;               
                if (this.bullet_pos && this.ObstaclesListJSData[i].state == 1 && this.JudgeRectangular(this.play_pos,this.bullet_pos) == true)
                {
                    // FZDebug.D("障碍物的位置----------ee--------------" + JSON.stringify(this.bullet_pos));
                    FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_BULLET_HIT + "QPalyerCar" ,{vibrateType:2,type: 2});
                    this.ObstaclesListJSData[i].Hit();
                }
            }
            this.onHit_B();
        }
        /**
         * 玩家子弹和敌人碰撞
         */
        public BulletList :any =[];
        public bullet_pos_1:any = {};
        public EnemyPosList:any = [];
        public bullet__index:number = 0;
        public onHit_B() {
            // 子弹分类 4类
            for (var i = 0; i< this.BulletPoolNodeListVisible.length;i++){
                if (this.BulletPoolNodeListVisible[i]) {
                    this.bullet_pos = this.BulletPoolNodeListVisible[i].box_posit;
                    this.bullet__index = this.JudgeRectangularA(this.bullet_pos);
                    this.BulletList[this.bullet__index].push(this.BulletPoolNodeListVisible[i]); 
                }
            }  
            // BOSS
            if (this.BossNode && this.BossNode.state !=2 && this.BossNode.state !=0){ 
                this.bullet_pos_1 = this.BossNode.box_posit;
                var poslist = this.JudgeRectangularB(this.bullet_pos_1);
                var flag = false;
                for (var j = 0; j< poslist.length;j++) {
                    this.bullet__index = poslist[j];
                    for (var i = this.BulletList[this.bullet__index].length-1 ; i >=0 ; i--){
                        this.bullet_pos = this.BulletList[this.bullet__index][i].box_posit;
                        if(this.JudgeRectangular(this.bullet_pos, this.bullet_pos_1)== true){
                            this.attack = this.BulletList[this.bullet__index][i].attack;
                            this.BulletList[this.bullet__index][i].onHit();
                            this.BossNode.onHit({type:2, attack: this.attack});
                            flag = true
                            this.BulletList[this.bullet__index].splice(i,1);
                        }
                        if (this.BossNode.air_show == true) {
                            if (flag == false && this.BossNode.air_left_hp > 0) {
                                this.bullet_pos_1 = this.BossNode.box_left_posit;
                                if (this.JudgeRectangular(this.bullet_pos,this.bullet_pos_1) == true){
                                    flag = true;
                                    this.attack = this.BulletList[this.bullet__index][i].attack;
                                    this.BulletList[this.bullet__index][i].onHit();
                                    this.BossNode.onHitAirCarft({type:1, attack: this.attack});
                                    this.BulletList[this.bullet__index].splice(i,1);
                                }
                            }
                            if (flag == false && this.BossNode.air_right_hp > 0) {
                                this.bullet_pos_1 = this.BossNode.box_right_posit;
                                if (this.JudgeRectangular(this.bullet_pos,this.bullet_pos_1) == true){
                                    this.attack = this.BulletList[this.bullet__index][i].attack;
                                    this.BulletList[this.bullet__index][i].onHit();
                                    this.BossNode.onHitAirCarft({type:2, attack: this.attack});
                                    this.BulletList[this.bullet__index].splice(i,1);
                                }
                            }
                        } 
                    }
                }
                
            }
            
            for (var j = 0; j < this.EnemyList.length; j++){
                if (this.EnemyList[j]) {
                    this.bullet_pos_1 = this.EnemyList[j].box_posit;
                    var list = this.JudgeRectangularB(this.bullet_pos_1);
                    for (var i = 0; i < list.length; i++){
                        this.EnemyPosList[list[i]].push(this.EnemyList[j]);
                    }
                }
            }
            // FZDebug.D("子弹 1 = " +JSON.stringify(this.BulletList));
            // FZDebug.D("敌人 1 = " +JSON.stringify(this.EnemyPosList));
            for (var _index = 0;_index < this.POSYLIST.length; _index++){
                for (var i = this.BulletList[_index].length-1; i >=0; i--) {
                    this.bullet_pos = this.BulletList[_index][i].box_posit;
                    for(var j = this.EnemyPosList[_index].length-1; j >=0; j--){
                        if(this.BulletList[_index][i] && this.EnemyPosList[_index][j]){
                            this.bullet_pos_1 = this.EnemyPosList[_index][j].box_posit;
                            if( this.EnemyPosList[_index][j] && this.EnemyPosList[_index][j].state != 2 && this.EnemyList[j].state != 0){
                                if (this.JudgeRectangular(this.bullet_pos,this.bullet_pos_1) == true){
                                    this.attack = this.BulletList[_index][i].attack;
                                    this.BulletList[_index][i].onHit();
                                    this.BulletList[_index].splice(i,1);
                                    this.EnemyPosList[_index][j].onHit({type:2, attack: this.attack});
                                    this.EnemyPosList[_index].splice(j,1);
                                    continue;
                                }
                            }
                        }
                        
                    }
                }
            }
            for (var i =0; i < this.POSYLIST.length; i++){
                this.EnemyPosList[i].length = 0;
                this.BulletList[i].length = 0;
            }
        }
        /**
         * 初步判断 子弹与玩家碰撞
         */
        public POSYLIST = [300,600,900,1200,4000];
        public JudgeRectangularA(rect1:any):any{
            for (var i =0;i < this.POSYLIST.length; i++) {
                if (rect1.y < this.POSYLIST[i]){
                    return i;
                }
            }
            console.error('[JudgeRectangularA]y = ' + rect1.y);
        }
        /**
         * 敌人 判断
         * @param rect1
         */
        public RectangularBList:any =[];
        public JudgeRectangularB(rect1:any):any{
            this.RectangularBList.length = 0;
            for (var i =0;i< this.POSYLIST.length; i++) {
                if (rect1.y < this.POSYLIST[i] && rect1.y + rect1.height >= this.POSYLIST[i]){
                    this.RectangularBList.push(i);
                    this.RectangularBList.push(i+1);
                    return this.RectangularBList;
                }else {
                    if (rect1.y + rect1.height < this.POSYLIST[i]){
                        this.RectangularBList.push(i);
                        return this.RectangularBList;
                    }
                }
            }
            console.error('[JudgeRectangularB]y = ' + rect1.y);
        }

        /**
         * 判断玩家和敌人子弹 车
         */
        public JudgeRectangular (rect1:any,rect2:any):any {
            if (rect1.y >= rect2.y && rect1.y >= rect2.y + rect2.height) {  
				return false;  
			}else if (rect1.x <= rect2.x && rect1.x + rect1.width <= rect2.x) {  
				return false;  
			} else if (rect1.x >= rect2.x && rect1.x >= rect2.x + rect2.width) {  
				return false;  
			} else if (rect1.y <= rect2.y && rect1.y + rect1.height <= rect2.y) {  
				return false;  
			}  
			return true;
		}
        /**
         * 复活
         */
        public onResurrect() {
            // 子弹
            for (var i =  this.BulletPoolNodeListVisible.length-1; i>= 0;i--){
                if (this.BulletPoolNodeListVisible[i]) {
                    this.BulletPoolNodeListVisible[i].onHit();
                }
            }  
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i >= 0 ;i--){
                if (this.BulletPoolNodeListEnemyVisible[i]) {
                    this.BulletPoolNodeListEnemyVisible[i].onHit();
                }
            }  
            // 敌人
            for (var i = this.EnemyList.length-1; i >= 0; i--){
                if (this.EnemyList[i]) {
                    this.EnemyList[i].onGameResurrect();
                }
            }
            // 障碍物
            for (var i = this.ObstaclesListJSData.length-1; i>= 0 ;i--){
                if (this.ObstaclesListJSData[i]){
                    this.ObstaclesListJSData[i].onGameResurrect();
                }
            }
            // 技能
            for (var i = this.SkillPoolNodeListVisible.length-1; i >= 0 ;i--){
                if (this.SkillPoolNodeListVisible[i]) {
                    this.SkillPoolNodeListVisible[i].onGameOver();
                }
            }  
        }

        /**
         * 游戏结束
         */ 
        public onGameOver() {
            Laya.timer.clearAll(this);
            for (var i = this.BulletPoolNodeListVisible.length-1; i>=0 ;i--){
                this.BulletPoolNodeListVisible[i].onGameOver();
            }  
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i>= 0;i--){
                this.BulletPoolNodeListEnemyVisible[i].onGameOver();
            }  
            // 敌人
            for (var i = this.EnemyList.length-1; i >= 0; i--){
                this.EnemyList[i].onGameOver();
            }
            // 障碍物
            for (var i = this.ObstaclesListJSData.length-1; i >= 0 ;i--){
                this.ObstaclesListJSData[i].onGameOver();
            }

            for (var i = this.ProbsPoolNodeListVisible.length-1; i >=0 ;i--){
                this.ProbsPoolNodeListVisible[i].onGameOver();
            }
            // 技能
            for (var i = this.SkillPoolNodeListVisible.length-1; i >= 0 ;i--){
                if (this.SkillPoolNodeListVisible[i]) {
                    this.SkillPoolNodeListVisible[i].onGameOver();
                }
            }  
           
            if (this.BossNode) {
                this.BossNode.destroy();
                this.BossNode = null;
            }
            FZDebug.D("onGameOver-----------------------");
        }
        public onGameRunning(){
            // 敌人
            for (var i = this.EnemyList.length-1; i >=0 ; i--){
                if (this.EnemyList[i]) {
                    this.EnemyList[i].onGameRunning();
                }
            }
            if (this.BossNode) {
                this.BossNode.onGameRunning();
            }
        }
        public onGameStop(){
            // 敌人
            for (var i = this.EnemyList.length-1; i >=0 ; i--){
                if (this.EnemyList[i]) {
                    this.EnemyList[i].onGameStop();
                }
            }
            if (this.BossNode) {
                this.BossNode.onGameStop();
            }

            // if (this.BossNode) {
            //     this.BossNode.onGameStop();
            // }
        }

        public onGameFail(){
            // 敌人
            for (var i = this.EnemyList.length-1; i >=0 ; i--){
                if (this.EnemyList[i]) {
                    this.EnemyList[i].onGameFail();
                }
            }
            if (this.BossNode) {
                this.BossNode.onGameFail();
            }
        }
        /**
         * 游戏胜利
         */
        public onGameWin() {
            for (var i = this.BulletPoolNodeListVisible.length-1; i>=0 ;i--){
                if (this.BulletPoolNodeListVisible[i]) {
                    this.BulletPoolNodeListVisible[i].onGameWin();
                }
            }  
            for (var i = this.BulletPoolNodeListEnemyVisible.length-1; i>= 0;i--){
                if (this.BulletPoolNodeListEnemyVisible[i]) {
                    this.BulletPoolNodeListEnemyVisible[i].onGameWin();
                }
            }
            for (var i = this.EnemyList.length-1; i >= 0; i--){
                if (this.EnemyList[i]) {
                    this.EnemyList[i].onPlayGameOver();
                }
            }
            this.game_current_time = 0.5;
        }
        /**
         * 子弹时间 
         * 玩家车辆移动
         */
        public onPlayWinAnimation() {
            // this.game_current_time = this.game_running_time;
            this.startGameRunning();
        }
        // ----------------------------------------------------------------------------------------------------------------

        /**
         * 判断视频还是分享
         * 1.分享
         * 0.视频
         */
        public setOnlyCanVideo(b: boolean)
        {
            this.onlyCanVideo = b;
        }

        public getOnlyCanVideo(): boolean
        {
            return this.onlyCanVideo;
        }

        /**新加入了一个积分策略*/
        public getShareOrVideo():any{
            if (!Laya.Browser.onMiniGame) return false;//非微信环境关闭分享
            let isAuditVersion = FZWechat.instance.isAuditVersion();
            let userArea = tywx.UserInfo.userArea || "";
            let shareinfo = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.ShareCfg];
            let shieldCityShareTip = shareinfo.shieldCityShareTip || this.shieldCityShareTip;
            let shield = shieldCityShareTip.indexOf(userArea) >= 0 && shareinfo.shieldCityOpen;
            if(isAuditVersion == true || shield){
                return false;
            }else {
                if(this.onlyCanVideo){
                    return false;
                }
                let type = this.getShareTypeByIntegral();
                if(type == FZGameStatus.integralStrategy.video)
                {
                    return false;
                }
                else if(type == FZGameStatus.integralStrategy.share)
                {
                    return true;
                }
                if (shareinfo.isShare == null || shareinfo.isShare == false) {
                    return false;
                }else {
                    return true;
                }
            }
        }

        public getShieldCityShareTip(): any
        {
            // let shareinfo = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.ShareCfg];
            // let shieldCityShareTip = shareinfo.shieldCityShareTip;
            // return shieldCityShareTip;
            let shareinfo = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.ShareCfg];
            let shieldCityShareTip = shareinfo.shieldCityShareTip;
            return shieldCityShareTip || this.shieldCityShareTip;
        }
        /**
         * 积分分享算法
         * 1 分享 2 视频 3 不干预
         */
        public getShareTypeByIntegral(): any{
            let gameConfig   = FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.ShareCfg];
            let userIntegral = FZMergeDateManager.instance.getUserIntegral();
            if(userIntegral < 0 || !gameConfig.integratingMasterSwitch)
            {
                return FZGameStatus.integralStrategy.nothing;
            }

            let idx = -1;
            let score = userIntegral;
            for(let i = 0; i < this.integralAngle.length; i++)
            {
                if(score <= this.integralAngle[i]){
                    idx = i;
                    break;
                }
            }
            let typeArr = this.integralToType[idx];
            if(typeArr)
            {
                //获取当天是第几次，默认第一次 1
                let times = FZMergeDateManager.instance.getShareCount();
                let type  = typeArr[times - 1];
                if(type)
                {
                    return type;
                }
                return FZGameStatus.integralStrategy.video;
            }
            return FZGameStatus.integralStrategy.nothing;
        }

        public obstacles_index:number = 0; // 障碍物索引
        /**
         * 初始化关卡
         */
        public initCheckPoint():void 
        {
            FZGameData.instance.game_revive_times = 0;
            this.obstacles_index = 0;
            this.map_speed = this.map_speed_normal;
            // 关卡
            this.check_point = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_CHECK_POINT", "1")); 
            this.check_point = Math.min(1000, this.check_point);
            
            this.max_check_point = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_MAX_CHECK_POINT", "1")); 
            // 当前 选中的飞行器
            this.player_aircraft = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_PLAYER_AIRCRAFT", "-1")); 
            // 武器碎片 用于升级 副武器 飞行器
            this.weapons_coin = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_WEAPONS_COIN", "500"));
            this.UAVData = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_UAV_WEAPON_DATA", null));
            // 当前 选中的飞行器
            this.curUseUAV = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_CUR_USE_UAV_LEVEL", -1+""));
            // 副武器等级
            this.depoutyWeaponLocalLevel = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_DEPUTY_WEAPON_LOCAL_LEVEL", 0+""));
            // 主武器等级
            this.mainWeaponLevel = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_MAIN_WEAPON_LEVEL", 1+""));
            
            this.deputyWeaponHasOpened = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_DEPUTY_WEAPON_HAS_OPENED", 0+""));
            this.uavWeaponHasOpened = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_UAV_WEAPON_HAS_OPENED", 0+""));

            // 刷新关卡信息
            this.onUpdateCheckPointData();
        }
        /**
         * 关卡通关重置数据 
         */
        public GameDataReset() {
            FZGameData.instance.onChangeStateSprint(false);
            Laya.timer.frameOnce(3,this, function(){
                
                this.checkpoint_diamond = 0;
                this.checkpoint_dollars = 0;
                this.DollarDouble = 1; // 美钞翻倍
                this.StateBallistic = false; // 弹道
                this.saveAllLocalData();
                this.ObstaclesListData = [];
                // FZDebug.D("this.EnemyList============="  + this.EnemyList.length);
                // FZDebug.D("this.BulletPoolNodeListVisible============="  + this.BulletPoolNodeListVisible.length);
                // FZDebug.D("this.BulletPoolNodeListEnemyVisible============="  + this.BulletPoolNodeListEnemyVisible.length);
                // FZDebug.D("this.ObstaclesListJSData============="  + this.ObstaclesListJSData.length);
                this.ObstaclesListJSData = [];
                // FZDebug.D("this.ProbsPoolNodeListVisible============="  + this.ProbsPoolNodeListVisible.length);
                //删除对象池
                for (var  i = this.EnemyPoolNodeList.length-1; i>=0; i--) {
                    this.EnemyPoolNodeList[i].destroy();
                    this.EnemyPoolNodeList.splice(i, 1);
                }
                for (var  i = this.BulletPoolNodeList.length-1; i>=0; i--) {
                    this.BulletPoolNodeList[i].destroy();
                    this.BulletPoolNodeList.splice(i, 1);
                }
    
                for (var  i = this.CoinPoolNodeList.length-1; i>=0; i--) {
                    this.CoinPoolNodeList[i].destroy();
                    this.CoinPoolNodeList.splice(i, 1);
                }
    
                for (var  i = this.ProbsPoolNodeList.length-1; i>=0; i--) {
                    this.ProbsPoolNodeList[i].destroy();
                    this.ProbsPoolNodeList.splice(i, 1);
                }
                
                for (var  i = this.ObstaclesPoolNodeList.length-1; i>=0; i--) {
                    this.ObstaclesPoolNodeList[i].destroy();
                    this.ObstaclesPoolNodeList.splice(i, 1);
                }

                for (var  i = this.SkillPoolNodeList.length-1; i>=0; i--) {
                    this.SkillPoolNodeList[i].destroy();
                    this.SkillPoolNodeList.splice(i, 1);
                }
                for (var i = this.BulletEffectPoolNodeList.length-1; i >= 0 ;i--){
                    if (this.BulletEffectPoolNodeList[i]) {
                        this.BulletEffectPoolNodeList[i].destroy();
                        this.BulletEffectPoolNodeList.splice(i, 1);
                    }
                }  
                this.bullet_prefab_parent = null;
                this.bullet_index = 0;
                this.car_index = 0;
                this.obstacles_index = 0;
            })
        }
        /**
         * 本地数据存储
         */
        public saveAllLocalData() 
        {
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_CHECK_POINT", this.check_point.toString()); 
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_MAX_CHECK_POINT", this.max_check_point.toString()); 
            // 当前 选中的飞行器
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_PLAYER_AIRCRAFT", this.player_aircraft.toString()); 
            // 武器碎片 用于升级 副武器 飞行器
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_WEAPONS_COIN", this.weapons_coin.toString());
        }
        /**
         * 刷新关卡信息
         */
        public onUpdateCheckPointData() {
            this.gameOver = false;
            this.judgeBossCheckPoint = false;
            this.game_state_elite = 0;
            this.game_state_elite_appear = 0;
            this.check_point_data = FZCfgManager.instance.getCheckPoint(this.check_point);
            if (this.check_point_data.bossNeedid != 0) {
                this.judgeBossCheckPoint = true;
            }
            this.LevelEnemyCount = this.check_point_data.enemyNumber;
            this.LevelEnemyCountMax = this.check_point_data.enemyNumber;
            this.boss_drop =[];
            var data  =  this.check_point_data.bossdropCash.split(",");
            for (var i = 0; i < 6;i++){
                this.boss_drop.push(parseInt(data[i]));
            }
            // this.game_obstacles_index = this.check_point_data.perblockUpper; // 障碍物个数每关
            
        }
        /**
         * 当前关卡道具掉率
         */
        public getCheckPointDropchance():any {
            return this.check_point_data.dropchance;
        }
        /**
         * 当前关卡美钞倍数
         */
        public getCheckPointDollerTimes():any {
            return this.check_point_data.cash_times;
        }
        /**
         * 武器碎片 （银币）
         */
        public getWeaponsCoin(){
            return this.weapons_coin;
        }
        public setWeaponsCoin(value: number){
            if (value== null) {
                return;
            }
            this.weapons_coin = value;
        }
        /**
         *  武器碎片 （银币）
         */
        addWeaponsCoin(value: number){
            this.weapons_coin += value;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_WEAPONS_COIN", this.weapons_coin.toString());
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH);
        }
        /**
         * 增加关卡
         */
        // 
        public OpenUav:any = false;
        addCheckPoint(){
            FZDebug.D("addCheckPoint-----------------------------------------");
            if(tywx.clickStatEventType.finishGameLevel[this.check_point + ""]){
                tywx.BiLog.clickStat(tywx.clickStatEventType.finishGameLevel[this.check_point + ""],[]);
            }            
            this.check_point +=1; 
            this.check_point = Math.min(1000, this.check_point);
            if (this.check_point == 2) {
                FZSaveDateManager.instance.setItemToLocalStorage("ISNEWUSER", "1");
            }
            if (this.max_check_point < this.check_point) {
                this.max_check_point = Math.max(this.max_check_point, this.check_point);
                let unlocking = FZCfgManager.instance.getUAVWeaponsCfg()["1"]["1"].unlocking;
                if (this.OpenUav == false && unlocking == this.max_check_point){
                    this.OpenUav = true;
                }
                if (this.max_check_point == FZGameData.instance.uavWeapon_open_point) {
                    FZGameData.instance.setCurUseUAV(1);
                }
                // 上传网络数据
                FZMergeDateManager.instance.sendUpdataData();
            }
            Laya.timer.frameOnce(1, this, function() {
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_CHECK_POINT", this.check_point.toString()); 
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_MAX_CHECK_POINT", this.max_check_point.toString()); 
            })             
        }
        /**
         * 关卡
         */
        public getCheckPoint() {
            return this.check_point;
        } 
        public setCheckPoint(point: number) {
            this.check_point = point;
            this.check_point = Math.min(1000, this.check_point);
            this.max_check_point = Math.max(this.max_check_point, this.check_point);
            Laya.timer.frameOnce(1, this, function() {
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_CHECK_POINT", this.check_point.toString()); 
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_MAX_CHECK_POINT", this.max_check_point.toString()); 
            })
        } 
        public setMaxCheckPoint(checkPoint: number) {
            this.max_check_point = checkPoint;
        }
        public getMaxCheckPoint() {
            return this.max_check_point;
        }

        /**
         * 获得美钞代表的数量
         */
        getCheckPointAcount() {
            return this.check_point_data.cash_times;
        }
        /**
         * 获得关卡 BOSS 美钞
         */
        public boss_drop:any =[];
        public getCheckPointBossDrop() {
            return this.boss_drop;
        }
        /**
         * 获得关卡数据
         */
        public getCheckPointData() {
            return this.check_point_data;
        }

        public getMainWeaponLevel(){
            return this.mainWeaponLevel;
        }

        public setMainWeaponLevel(level){
            if(this.mainWeaponLevel < level) {
                this.mainWeaponLevel = Math.max(level, 1);
                this.mainWeaponLevel = Math.min(this.mainWeaponLevel, 250);
                if( this.mainWeaponLevel > this.main_weapon_max_level ){  //主武器等级 边界值判断
                    this.mainWeaponLevel = this.main_weapon_max_level
                }
                // 上传网络数据
                FZMergeDateManager.instance.sendUpdataData();
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_MAIN_WEAPON_LEVEL", level.toString());
            }
            this.mainWeaponLevel = level;
            if( this.mainWeaponLevel > this.main_weapon_max_level ){  //主武器等级 边界值判断
                this.mainWeaponLevel = this.main_weapon_max_level
            }
        }

        public setCurUseUAV (value: number) {
            this.curUseUAV = value;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_CUR_USE_UAV_LEVEL", value.toString());
        }
        public getCurUseUAV () {
            return this.curUseUAV;
        }
        public setUAVData (param) {
            if (param) {
                this.UAVData = param;
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_UAV_WEAPON_DATA", JSON.stringify(param));
                // 上传网络数据
                FZMergeDateManager.instance.sendUpdataData();
            }
        }
        public getUAVData () {
            this.UAVData = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_UAV_WEAPON_DATA", null));
            return this.UAVData;
        }

        public getDeputyWeaponLocalLevel () {
            let default_Level = (FZMergeDateManager.instance.getCarMaxLevel() >= this.deputyWeapon_open_point) ? 1 : 0;
            // this.depoutyWeaponLocalLevel = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_DEPUTY_WEAPON_LOCAL_LEVEL", default_Level+""));
            return this.depoutyWeaponLocalLevel;
        }

        public setDeputyWeaponLocalLevel (level: number) {
            if (this.depoutyWeaponLocalLevel < level) {
                this.depoutyWeaponLocalLevel = level;

                if( this.depoutyWeaponLocalLevel > this.deputy_weapon_max_level ){  // 副武器等级 边界值判断
                    this.depoutyWeaponLocalLevel = this.deputy_weapon_max_level
                }

                FZSaveDateManager.instance.setItemToLocalStorage("GAME_DEPUTY_WEAPON_LOCAL_LEVEL", level.toString());
                // 上传网络数据
                FZMergeDateManager.instance.sendUpdataData();
            }
            this.depoutyWeaponLocalLevel = level;
            if( this.depoutyWeaponLocalLevel > this.deputy_weapon_max_level ){  // 副武器等级 边界值判断
                this.depoutyWeaponLocalLevel = this.deputy_weapon_max_level
            }
        }

        public getDeputyWeaponMaxLevel () {
            return this.depoutyWeaponMaxLevel;
        }

        public getDeputyWeaponOpenPoint (){
            return this.deputyWeapon_open_point;
        }
        public getUAVWeaponOpenPoint (){
            return this.uavWeapon_open_point;
        }
        public getChoosePointOpenPoint (){
            return this.choose_point_open_point;
        }

        public getDeputyWeaponOpenState(){
            return this.deputyWeaponHasOpened;
        }
        public setDeputyWeaponOpenOpened(){
            this.deputyWeaponHasOpened = 1;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_DEPUTY_WEAPON_HAS_OPENED", 1+"");
        }
        public getUavWeaponOpenState(){
            return this.uavWeaponHasOpened;
        }
        public setUavWeaponOpenOpened(){
            this.uavWeaponHasOpened = 1;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_UAV_WEAPON_HAS_OPENED", 1+"");
        }

        /**
         * 获得 玩家战场位置
         */ 
        public getFZPlayerUIPos():any
        {
            return this.FZPlayerUIPos;
        }
        /**
         * 玩家位置
         * @param value 
         */
        public setFZPlayerUIPos(value:any):void {
            this.FZPlayerUIPos = value;
        }
        /**
         * 加载敌人
         */
        public BossNode:any = null;
        initEnemyCarPool(parent:any):void
        {
            this.EnemyList = [];
            this.enemy_prefab_parent = parent;
            for (var i = 0; i< this.PoolEnemyLength; i++) {
                var enemy = new FZDiRenNode();
                enemy.addParent(parent);
                this.EnemyPoolNodeList.push(enemy);
            }
            this.BossNode = new FZBossNode();
            this.BossNode.addParent(parent);
        }

        /**
         * 油罐车爆炸
         */
        public explodeCarDie(enemy: any):void
        {
            for(let i = 0;i<this.EnemyList.length;i++) 
            {
                if(enemy.box_posit != this.EnemyList[i].box_posit)
                {
                    //获取当前敌人与油罐车的距离
                    let dis = this.getTargetEnemyAndOtherDis(enemy.box_posit,this.EnemyList[i].box_posit);
                    //在油罐车范围内的敌人,全部爆炸
                    if(dis <= 400)
                    {
                        //油罐车周围炸毁的车 延迟0.2s爆炸
                        if(!FZUtils.isNullOrEmpty(this.EnemyList[i]))
                        {
                            if( this.EnemyList[i].getCarIsShow())
                            {
                                this.EnemyList[i].playAni(true,true);
                            }
                        }
                    }
                }
            }
        }

        private getTargetEnemyAndOtherDis(targetEnemy0:any,targetEnemy1:any):number
        {
            return Math.sqrt(Math.pow(Math.abs(targetEnemy0.x - targetEnemy1.x),2)+Math.pow(Math.abs(targetEnemy0.y - targetEnemy1.y),2));
        }

        /**
         * 精英 BOSS死亡
         */
        public killBossEnemyPoolList(enemy: any) :any 
        {
            if(enemy.cartype == 3 || enemy.cartype == 4) {
                // 精英死亡 BOSS死亡
                this.game_state_elite = 0; 
            }
            enemy.onkill();
            if(enemy.cartype == 4) {
                this.killEnemyBoss();
                return;
            }
        }
        /**
         * 敌人
         */
        
        public killEnemyPoolList(enemy: any) :void 
        { 
            enemy.onkill();
            var index = this.EnemyList.indexOf(enemy);
            if (index != -1){
                this.EnemyList.splice(index, 1);
            }
            this.EnemyPoolNodeList.push(enemy);
            // FZDebug.D(" 敌人死亡对象池 ----------------------- = " + this.EnemyPoolNodeList.length);
            // FZDebug.D(" 敌人死亡对象池 -----------------------PoolEnemyLength = " + this.PoolEnemyLength);
            if (this.EnemyPoolNodeList.length == this.PoolEnemyLength) {
                if(this.game_state_elite == 1 ) {
                    // 精英来袭
                    // FZDebug.D("精英来袭---------------------------------------------");
                } else if(this.game_state_elite == 0 && this.LevelEnemyCount == 0) {
                    if(this.check_point_data.bossNeedid != 0) {
                        // FZDebug.D("BOSS来袭--------------------------------------------------");
                        if(FZUIManager.instance.getDialogActive(FZUIManager.UI_GameResurrectView)){
                            FZEventManager.instance.register(FZEvent.GAME_VIEW_GAME_RESURRECT_START,this.onCreateBoss,this)
                        }else{
                            Laya.timer.loop(200, this, this.onCreateBoss);
                        }
                    }else {
                        // FZDebug.D("关卡结束--------------------------------------------------");
                        this.killEnemyBoss();
                    }
                }
            }
        }
        /**
         * 创建精英怪 
         */
        public onCreateElite():void
        {
            // FZDebug.D("精英来袭--------------------------------------------------");
            if (this.EnemyPoolNodeList.length == this.PoolEnemyLength) {
                if(this.game_state_elite == 1 ) {
                    var data = this.judgeObstacles();
                    // FZDebug.D("精英来袭--------------------------------------------------障碍物个数 = " + data.length);
                    if (/*this.StateSprint == false &&*/ data.length == 0) {
                        Laya.timer.clear(this, this.onCreateElite);   
                        this.game_state_elite_appear = 1; // 精英一出现
                        var pos_x = this.car_pos[2];
                        var pox_y = -400;
                        if (this.elite_enemy != null ) {
                            if (this.BossNode) {
                                this.BossNode.setEnemyData(this.elite_enemy);
                                var position = {x:pos_x, y: pox_y};                
                                this.BossNode.startMove(position);
                            }
                        }
                    }
                }
            }
            
            
        }

        /**
         * 创建BOSS
         */
        public onCreateBoss():void
        {
            FZEventManager.instance.unregister(FZEvent.GAME_VIEW_GAME_RESURRECT_START,this.onCreateBoss,this)
            // if (this.StateSprint == false) {
                Laya.timer.clear(this, this.onCreateBoss);   
                this.game_state_elite = 2;
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_BOSS_START);
            // }
        }

        /**
         * 杀死怪物
         */
        public killEnemy () {
            this.LevelEnemyCount -= 1;
            this.LevelEnemyCount = Math.max(0, this.LevelEnemyCount);
            FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_RUNNING_CHANGE_DATA);
            if (this.LevelEnemyCount == 0){
                // 小怪都被杀死
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_GAME_ENEMY_OVER);
            }            
        }
        /**
         * 杀死BOSS
         */
        public gameOver:any = false;
        public killEnemyBoss() {
            if (this.gameOver == false) {
                this.gameOver = true;
                // 重置精英
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_RUNNING_CHANGE_DATA);
                FZEventManager.instance.sendEvent(FZEvent.GAME_VIEW_BOSS_OVER);
            }
            
        }
        /**
         * 获得敌人
         */
        public getEnemyPool(): any {
            this.car_index += 1;
            if (this.EnemyPoolNodeList.length > 0) {
                //FZDebug.D("获得敌人--------------------------------------------------存在");
                var enemy_js = this.EnemyPoolNodeList.pop();
                enemy_js.setId(this.car_index);
                this.EnemyList.push(enemy_js);
                return enemy_js;
            }else {
                FZDebug.D("获取敌人对象池不足-------------------------------");
                var enemy = new FZDiRenNode();
                enemy.addParent(this.enemy_prefab_parent);
                enemy.setId(this.car_index);
                this.PoolEnemyLength += 1;
                this.EnemyList.push(enemy);
                return enemy;
            }
        }
        /**
         * 判断目标是否死亡
         */
        public judgeEnemyDeath(enemy:any):any
        {
            var index = this.EnemyList.indexOf(enemy);
            if (index == -1) {
                return 0;
            } else {
                if (this.EnemyList[index].judgeDeath() == 0) {
                    return 0;
                }
            }
            return 1;
        }

        /**
         * 播放资源动画
         * 起点 fn
         * 终点 tn
         * 资源 type
         * 数量 countType
         * 音效 
         * 回调 cb
         */
        public playResFlyAni(fn,tn,typeInfo,cb){
            let flyLayer = new FZFlyResConfig();
            let fromPos  = (()=>{
                if(fn)
                {
                    let p = (fn.parent as Laya.Sprite).localToGlobal(new Laya.Point(fn.x,fn.y));
                    return p;
                }
                else
                {
                    return {x: Laya.stage.width / 2, y: Laya.stage.height / 2};
                }
            })();
            let toPos    = (()=>{
                if(tn)
                {
                    return (tn as Laya.Sprite).localToGlobal(new Laya.Point(0, 0));
                }
                else
                {
                    if(typeInfo.type == 1)
                    {
                        return this.title_goldPos;
                    }
                    else if(typeInfo.type == 2)
                    {
                        return this.title_diamondPos;
                    }
                }
            })();
            let param    = {
                fromPos: fromPos,
                toPos  : toPos,
                type   : typeInfo.type,
                countType: typeInfo.countType,
                closeSound: typeInfo.closeSound || false,
                cb     : cb,
            }
            flyLayer.playFlyResAni(param);
        }

        /**
         * 获取目标 
         */
        public getEnemyNearly():any 
        {   
            var data :any = [];
            if(this.BossNode && this.BossNode.judgeDeath() == 1) {
                return this.BossNode
            }
            for (var i = 0; i < this.EnemyList.length; i++) {
                if (this.EnemyList[i].judgeDeath() == 1) {
                    data.push(i);
                }
            }
            var count = Math.min(data.length, 2);
            if (count == 0) {
                return -1;
            }
            var index = Math.round(Math.random()* (count-1));
            return this.EnemyList[data[index]];
        }

        /**
         * 创建资源
         */
        //type 0美钞 1金币 2钻石
        public createResourcesNode(type){
            if(type == 0)
            {
                let dollar = new Laya.Image();
                dollar.skin = "ui_common/flyDollar.png";
                dollar.scaleX = 0.7;
                dollar.scaleY = 0.7;
                return dollar;
            }
            else if(type == 1)
            {
                let gold = new Laya.Image();
                gold.skin = "ui_common/flyCoin.png";
                gold.scaleX = 0.7;
                gold.scaleY = 0.7;
                return gold;
            }
            else if(type == 2)
            {
                let diamond = new Laya.Image();
                diamond.skin = "ui_common/flyDiamond.png";
                diamond.scaleX = 0.7;
                diamond.scaleY = 0.7;
                return diamond;
            }
        }

        /**
         * 主界面节点
         */
        public initTitlePos(dia_node,gold_node){
            //预先确定主界面俩个资源栏位置
            if(dia_node)
            {
                let p = (dia_node.parent as Laya.Sprite).localToGlobal(new Laya.Point(dia_node.x,dia_node.y));
                this.title_diamondPos = p;
            }
            if(gold_node)
            {
                let p = (gold_node.parent as Laya.Sprite).localToGlobal(new Laya.Point(gold_node.x,gold_node.y));
                this.title_goldPos = p;
            }
        }  

        /**
         * 加载钻石和钞票
         */
        public initResourcesPool(){
            if(!this.DollarPoolNodeList.length){
                for(let i = 0; i < 10; i++){
                    let diamond = this.createResourcesNode(0);
                    this.DollarPoolNodeList.push(diamond);
                }
            }

            if(!this.GoldPoolNodeList.length){
                for(let i = 0; i < 10; i++){
                    let diamond = this.createResourcesNode(1);
                    this.GoldPoolNodeList.push(diamond);
                }
            }

            if(!this.DiamondPoolNodeList.length){
                for(let i = 0; i < 10; i++){
                    let diamond = this.createResourcesNode(2);
                    this.DiamondPoolNodeList.push(diamond);
                }
            }

        }
        /**
         * 获取资源节点
         */
        public getResourcesNode(type){
            let cNode = null;
            switch(type){
                case 0:
                    if (this.DollarPoolNodeList.length > 0) {
                        cNode = this.DollarPoolNodeList.pop();
                    }else {
                        cNode = this.createResourcesNode(type);
                    }
                break;

                case 1:
                    if (this.GoldPoolNodeList.length > 0) {
                        cNode = this.GoldPoolNodeList.pop();
                    }else {
                        cNode = this.createResourcesNode(type);
                    }
                break;

                case 2:
                    if (this.DiamondPoolNodeList.length > 0) {
                        cNode = this.DiamondPoolNodeList.pop();
                    }else {
                        cNode = this.createResourcesNode(type);
                    }
                break;
            }
            return cNode;
        }

        /**
         * 返还资源节点
         */
        public returnResourcesNode(_n,type){
            switch(type){
                case 0:
                    this.DollarPoolNodeList.push(_n);
                break;

                case 1:
                    this.GoldPoolNodeList.push(_n);
                break;

                case 2:
                    this.DiamondPoolNodeList.push(_n);
                break;
            }
        }


        /**
         * 加载子弹对象池
         * @param node 
         */
        public initBulletPool(parent: any):void 
        {
            // FZDebug.D("this.BulletPoolNodeList = " + this.BulletPoolNodeList.length);
            this.bullet_prefab_parent = parent;
            for (var i = 0; i< 100; i++) {
                var bullet = new FZBullet();
                bullet.addParent(parent);
                this.BulletPoolNodeList.push(bullet);
            }
        }
        /**
         * 子弹
         */
        public killPoolNodeList(bullet: any) :void 
        {
            var index = -1;
            if(bullet.bulletType == "QEnemyBossBullet") {
                index = this.BulletPoolNodeListEnemyVisible.indexOf(bullet);
                if (index != -1) {
                    this.BulletPoolNodeListEnemyVisible.splice(index,1);
                }
            } else {
                index = this.BulletPoolNodeListVisible.indexOf(bullet)
                if (index != -1) {
                    this.BulletPoolNodeListVisible.splice(index,1);
                }
            }
            bullet.onkill();
            this.BulletPoolNodeList.push(bullet);
        }
       
        /**
         * 获得子弹
         */
        public getBulletPool(value): any {
            this.bullet_index += 1;
            if (this.BulletPoolNodeList.length > 0) {
                var node = this.BulletPoolNodeList.pop();
                node.setBulletId(this.bullet_index); 
                if (value == 0) {
                    this.BulletPoolNodeListVisible.push(node);
                }else if (value == 1){
                    this.BulletPoolNodeListEnemyVisible.push(node);
                }
                return node
            }else {
                FZDebug.D("子弹对象池不足-------------------------------");
                var bullet = new FZBullet();
                bullet.addParent(this.bullet_prefab_parent);
                bullet.setBulletId(this.bullet_index); 
                if (value == 0) {
                    this.BulletPoolNodeListVisible.push(bullet);
                }else if (value ==1){
                    this.BulletPoolNodeListEnemyVisible.push(bullet);
                }
                return bullet;
            }
        }
        // -子弹爆炸特效-------------------------------------------------------------------------------------------------------
        public effect_parent:any = null;
        public BulletEffectPoolNodeList:any = [];
        public BulletEffectPoolNodeListVisible:any =[];
        public initEffectPool(parent: any){
            this.BulletEffectPoolNodeList = [];
            this.effect_parent = parent;
            for (var i = 0; i< 50; i++) {
                var effect = new FZBulletEffect();
                effect.addParent(parent);
                this.BulletEffectPoolNodeList.push(effect);
            }
        }
        /**
         * 获取特效
         */
        public getEffectPool():any {
            if (this.BulletEffectPoolNodeList.length > 0) {
                var node = this.BulletEffectPoolNodeList.pop();
                this.BulletEffectPoolNodeListVisible.push(node);
                return node
            }else {
                FZDebug.D("特效对象池不足-------------------");
                var effect = new FZBulletEffect();
                effect.addParent(this.effect_parent);
                this.BulletEffectPoolNodeListVisible.push(effect);
                return effect;
            }
        }

        /**
         * 回收特效
         */
        public killEffectPool(effect:any) {
            this.BulletEffectPoolNodeListVisible.push(effect);
            var index = this.BulletEffectPoolNodeListVisible.indexOf(effect);
            if(index >= 0){
                this.BulletEffectPoolNodeListVisible.splice(index, 1);
            }
            effect.onkill();
            this.BulletEffectPoolNodeList.push(effect);
        }
        /**
         * 播放爆炸特效
         */
        public playExplosion(param:any) {
            var node = this.getEffectPool();
            node.playExplosion(param);
        }
        // --------------------------------------------------------------------------------------------------------

        // ---------------------------------------------------------------------------------------------------------
        
        public car_index = 0;
        public ObstaclesListData :any = [];  // 障碍物(未创建)1
        public ObstaclesListJSData :any = [];  // 障碍物 正在运行中
        public game_state_elite = 0;  // 0 普通  1精英 2 BOSS
        public game_state_elite_appear = 0; // 是否出现精英怪
        public elite_enemy :any = null;// 精英怪物
        public game_obstacles_index:number = 0;
        /**
         * 设置障碍物
         * type 2
         */
        public setObstaclesDataType2():void 
        {
            var count = this.getObstaclesCount();
            var car_poslist:any = [0,1,2,3,4];
            for (var i = 0; i < count; i++ ) {
                var index = Math.round(Math.random()* (car_poslist.length-1));
                this.ObstaclesListData.push(car_poslist[index]);
                car_poslist.splice(index,1);
            }
        }
        /**
         * 获得障碍物个数
         */
        public getObstaclesCount():any
        {
            var strarr = this.check_point_data.blocknumchance.split(",");  
            var count = 0;
            for (var i = 0; i < strarr.length; i++) {
                count += parseInt(strarr[i]);
            }
            var index =  Math.round(Math.random()* (count -1) + 1);
            var __count = 0;
            for (var i = 0; i < strarr.length; i++) {
                __count += strarr[i];
                if (index  <= __count) {
                    return i+1;
                }
            }
            return -1;
        } 
        /**
         * 设置障碍物 
         * type 1
         * 
         */
        public setObstaclesDataType1(): void 
        {
            // FZDebug.D("设置障碍物-------------------------------------1");
            // 判断当前 哪条道路是空的
            // 1 判断敌人
            var data_road :any = [];
            for (var j = 0 ; j < this.EnemyList.length; j++) {
                var index = this.car_pos.indexOf(this.EnemyList[j].scene.x)
                if (data_road.indexOf(index) == -1) {
                    data_road.push(index);
                }
            }
            // FZDebug.D("设置障碍物-------------------------------------2");
            var data = this.judgeObstacles();
            for (var i = 0; i < data.length; i++) {
                if (data_road.indexOf(data[i]) == -1) {
                    data_road.push(data[i]);
                }
            }
            // FZDebug.D("设置障碍物-------------------------------------3");
            var car_poslist:any = [0,1,2,3,4];
            var ___count = this.getObstaclesCount();
            var count = 0;
            for (var i =0; i < 5; i++) {
                var index1 = Math.round(Math.random()* (car_poslist.length-1));
                if (data_road.indexOf(car_poslist[index1]) == -1 ) {
                    count += 1;
                    if (count + data.length <= ___count) {
                        this.ObstaclesListData.push(car_poslist[index1]);
                        car_poslist.splice(index1,1);
                    }
                }
            }
        }
        /**
         * 判断障碍物
         * 处于非安全区域
         */
        public judgeObstacles():any
        {
            var data :any =[];
            // 当前 
            var  count1 =  this.ObstaclesListJSData.length;
            for (var i = 0; i < count1; i++){
                if (this.ObstaclesListJSData[i].isSafeDistance() == 0) {
                    data.push(this.car_pos.indexOf(this.ObstaclesListJSData[i].scene.x));
                }
            }
            return data;
        }
        /**
         * 创建障碍物
         */ 
        public onCreateObstacles():void
        {   
            var flag = true;
            var count = this.ObstaclesListData.length;
            // 判断 要创建的障碍物的道路中是否存在敌人
            for (var i = 0; i < count; i++ ) {
                for (var j = 0 ; j < this.EnemyList.length; j++) {
                    if (this.car_pos.indexOf(this.EnemyList[j].scene.x) == this.ObstaclesListData[i] && this.EnemyList[j].judgeDeath() == 1)
                    {
                        flag = false;
                    }
                }
            }
            // 障碍物
            if (flag == true) {
                // 当前 
                var data = this.judgeObstacles();
                if (data.length >= this.check_point_data.blockupper) {
                    // 判断当前屏幕障碍物个数
                    flag = false;
                } else {
                    for (var i = 0; i < data.length; i++) {
                        var index = this.ObstaclesListData.indexOf(data[i]);
                        if (index != -1) {
                            this.ObstaclesListData.splice(index,1);
                        }
                    }
                }
            }
            /**
             * 障碍物不能出现在80以内
             */
            var ___index = ((this.LevelEnemyCountMax - this.LevelEnemyCount) /this.LevelEnemyCountMax) * 100;
            if (___index >= 80) {
                flag = false;
            }
            if (flag == true) {
                // 都是安全距离
                count = this.ObstaclesListData.length;
                var data = this.judgeObstacles();
                for (var i = (count-1); i >= 0; i-- ) {
                    if (data.length < this.check_point_data.blockupper){
                        var params :any = {};
                        params.param_type = 2;
                        // FZDebug.D("this.ObstaclesListData[i] ===== " + this.ObstaclesListData[i]);
                        // FZDebug.D("this.car_pos[this.ObstaclesListData[i] ===== " + this.car_pos[this.ObstaclesListData[i]]);
                        params.position = {x:this.car_pos[this.ObstaclesListData[i]], y: -400};
                        // FZDebug.D("障碍物创建成功--------------------------------------------------");
                        var obstacles_js = FZGameData.instance.getObstaclesPool(); 
                        obstacles_js.startMove(params.position);
                        this.ObstaclesListData.splice(i, 1);
                    }
                }
                //进入障碍物引导
                if(this.isInObstaclesGuide == "true"){
                    FZEventManager.instance.sendEvent(FZEvent.OBS_GUIDE, {pos: params.position, index: 5});
                    //成功完成障碍物引导
                    this.isInObstaclesGuide = "false";
                    FZSaveDateManager.instance.setItemToLocalStorage("OBS_GUIDE", this.isInObstaclesGuide + "");
                }
            }
        }

        /**
         * 创建一波敌人
         */
        public onCreateWaveEnemy():void 
        {   
            // FZDebug.D("创建一波敌人----------------------------------------------------------------this.game_state_elite- " + this.game_state_elite);
            if (this.game_state_elite != 0 ) {
                // 不是普通敌人
                return;
            }
            // FZDebug.D("创建一波敌人-----------------------------------------------------------------2");

            if (this.ObstaclesListData.length > 0) {
                // 判断 存在障碍物
                this.onCreateObstacles();
            } else {
                if(this.check_point_data.blockupper != 0) {
                    // 障碍物 逻辑 
                    if (this.obstacles_check_point < this.check_point) {
                        // 判断 是否是否产生障碍物
                        var count = this.LevelEnemyCountMax - this.LevelEnemyCount;
                        // 主动出现障碍物
                        var strarr = this.check_point_data.blockappear.split(",");  
                        if (strarr.indexOf(count)) {
                            // 随机障碍物道路数
                            this.setObstaclesDataType2();
                        }
                    } else {
                    // 道路空了 判断障碍物
                        this.setObstaclesDataType1();
                    }
                }
                if (this.ObstaclesListData.length > 0) {
                    this.onCreateObstacles();
                }
            }
            // 创建敌人 （屏蔽掉 未创建的障碍物 和 处于非安全距离的障碍物）
            // 处于安全距离的障碍物
            var data =  this.judgeObstacles();
            for (var i = 0; i < this.ObstaclesListData.length;i++ ) {
                data.push(this.ObstaclesListData[i]);    
            }
            // 随机 一波敌人的个数 (2-5)（可改为配置）
            var index = Math.random()* 4 + 1;
            var car_poslist:any = [96, 239, 382, 525, 668];//[70, 218,365, 513, 660];

            for (var i =1; i<= index; i++){
                var __index = Math.round(Math.random()* (car_poslist.length-1));
                var pos_x = car_poslist[__index];
                car_poslist.splice(__index,1);
                // 判断道路是否和 障碍物冲突
                var old_index =  this.car_pos.indexOf(pos_x);
                if (data.indexOf(old_index) == -1 ) {
                    var enemy_data = this.getEnemyRandomData();
                    // FZDebug.D("敌人数据--------------" + JSON.stringify(enemy_data));
                    if (enemy_data.cartype != 3) {
                        enemy_data.param_type = 1;
                        var pox_y = -400 + Math.round(Math.random()* 200);
                        enemy_data.position ={x:pos_x, y: pox_y};
                        var enemy_js = FZGameData.instance.getEnemyPool(); 
                        enemy_js.setEnemyData(enemy_data);
                        enemy_js.startMove(enemy_data.position);
                    } else if (enemy_data.cartype == 3) {
                        let elit_data = this.getEliteEnemyIcon();
                        // FZDebug.log(" elit_data : "+JSON.stringify(elit_data))
                        enemy_data.car_pic = elit_data.bosspic;
                        enemy_data.skills = elit_data.skills;
                        // 没有出现过精英
                        this.elite_enemy = enemy_data;
                    }
                } 
            }
        }

        /**
         * 每帧只执行一次 
         * param 
         * param_type  1 敌人
         * param_type  2 障碍物
         * param_type  3 道具
         * param_type  4 美钞
         */ 
        public frameOnceTime :any = null; // 定时器
        public frameOnceList :any = []; // 数据表
        public addNodeFrameOnce(param) {
            this.frameOnceList.push(param);
            if (this.frameOnceTime == null) {
                this.frameOnceTime = Laya.timer.frameLoop(1, this, this.onCreatNode);
            }
        }
        /**
         * 创建节点
         */
        public frameNode :any = null;
        public onCreatNode() {
            if (this.frameOnceList.length == 0) {
                Laya.timer.clear(this, this.onCreatNode);
                this.frameOnceTime = null;
                return;
            }
            this.frameNode = this.frameOnceList[0];
            if (this.frameNode.param_type == 1) {
                var enemy_js = FZGameData.instance.getEnemyPool(); 
                enemy_js.setEnemyData(this.frameNode);
                enemy_js.startMove(this.frameNode.position);
            } else if (this.frameNode.param_type == 2) {
                var obstacles_js = FZGameData.instance.getObstaclesPool(); 
                obstacles_js.startMove(this.frameNode.position);
            } else if (this.frameNode.param_type == 3) {
                var probs_js = FZGameData.instance.getProbsPool(); 
                probs_js.setParam(this.frameNode);
                probs_js.startMove(this.frameNode.param_data[0], this.frameNode.param_data[1]);
            }else if (this.frameNode.param_type == 4) {
                var probs_js = FZGameData.instance.getCoinPool(); 
                probs_js.setParam(this.frameNode);
                probs_js.startMove(this.frameNode.param_data[0], this.frameNode.param_data[1], this.frameNode.param_data[2]);
            } 
            this.frameOnceList.splice(0,1);
        }
        /**
         * 精英 获取图片
         */
        public getEliteEnemyIcon():any
        {
            var data = FZCfgManager.instance.getBossConfig();
            var count = data["1"].time;
            var index = this.check_point%count;
            if (index == 0) {
                index = count;
            }

            var flag = false;
            for (var k in data){
                if(index >= data[k].putLv[0] && index <= data[k].putLv[1]) {
                    flag = true;
                    return data[k];
                }
            }
            //if (flag == false) {
                return data["1"];
            //}
        }

        /**
         * 获得BOSS
         */
        public getBoosPool():any 
        {
            return this.BossNode;
        }
        /**
         * BOSS 数据
         * // "1": {
            //     "bossid": 1,
            //     "bossCheckPoint": 5,
            //     "time": 75,
            //     "bossTime": 5,
            //     "putLv": [
            //         6,
            //         10
            //     ],
            //     "newBossPut": 80,
            //     "bossHp": 2700,
            //     "bossAttack": 63,
            //     "bosspic": "boss_pic1.png",
            //     "bossWeaponid": 1
            // },
         */ 

        public getBossEnemyData():any
        {
            var data = FZCfgManager.instance.getBossConfig();
            var count = data["1"].time;
            var index = this.check_point_data.bossNeedid;//this.check_point%count;
            for (var k in data){
                if(index == data[k].bossid) {
                    return data[k];
                }
            }
        }
        public probs_prefab_parent:any = null; // 道具对象池
        public coin_prefab_parent:any = null;  // 游戏硬币对象池
        
        /**
         * 加载银币
         */
        public initCoinPool(parent:any):void
        {
            this.coin_prefab_parent = parent;
            for (var i = 0; i < 30; i++) {
                var probs = new FZChipNode();
                probs.addParent(parent);
                this.CoinPoolNodeList.push(probs);
            }
        }
        /**
         * 释放银币
         */
        public killCoinPoolList(probs: any) :void 
        {
            probs.onkill();
            this.CoinPoolNodeList.push(probs);
        }
        /**
         * 获取银币
         */
        public getCoinPool(): any {
            if (this.CoinPoolNodeList.length > 0) {
                return this.CoinPoolNodeList.pop()
            }else {
                FZDebug.D("获取银币对象池不足-------------------------------");
                var probs = new FZChipNode();
                probs.addParent(this.coin_prefab_parent);
                return probs;
            }
        }
        /**
         * 加载障碍物
         * @param parent 
         */
        public initObstaclesPool(parent:any):void
        {
            for (var i = 0; i < 6; i++) {
                var probs = new FZObstaclesUI();
                probs.addParent(parent);
                this.ObstaclesPoolNodeList.push(probs);
            }
        }
        /**
         * 释放障碍物
         */
        public killObstaclesPoolList(probs: any) :void 
        {
            // FZDebug.D("释放障碍物-------------------------------");
           
            var index = this.ObstaclesListJSData.indexOf(probs);
            if(index != -1) {
                // FZDebug.D("释放障碍物-------------ObstaclesListJSData------------------");
                this.ObstaclesListJSData.splice(index, 1);
                // FZDebug.D("释放障碍物-------------ObstaclesListJSData------------------count = " + this.ObstaclesListJSData.length);
            }
            probs.onkill();
            this.ObstaclesPoolNodeList.push(probs);
        }
        /**
         * 获取障碍物
         */
        public getObstaclesPool(): any {
            this.obstacles_index += 1;
            if (this.ObstaclesPoolNodeList.length > 0) {
                var node = this.ObstaclesPoolNodeList.pop();
                node.setId(this.obstacles_index); 
                this.ObstaclesListJSData.push(node);
                return node
            }else {
                FZDebug.D("障碍物对象池不足-------------------");
                var node1 = new FZObstaclesUI();
                node1.addParent(this.probs_prefab_parent);
                node1.setId(this.obstacles_index); 
                this.ObstaclesListJSData.push(node1);
                return node1;
            }
        }

        /**
         * 加载道具
         * @param parent 
         */
        public initProbsPool(parent:any):void
        {
            this.probs_prefab_parent = parent;
            for (var i = 0; i < 10; i++) {
                var probs = new FZItemsUI();
                probs.addParent(this.probs_prefab_parent);
                this.ProbsPoolNodeList.push(probs);
            }
        }
        /**
         * 释放道具
         */
        public killProbsPoolList(probs: any) :void 
        {
            probs.onkill();
            var index = this.ProbsPoolNodeListVisible.indexOf(probs);
            if (index != -1) {
                this.ProbsPoolNodeListVisible.splice(index,1);
            }
            this.ProbsPoolNodeList.push(probs);
        }
        /**
         * 获取道具
         */
        public getProbsPool(): any {
            if (this.ProbsPoolNodeList.length > 0) {
                var node = this.ProbsPoolNodeList.pop();
                this.ProbsPoolNodeListVisible.push(node);
                return node
            }else {
                FZDebug.D("道具对象池不足-------------------");
                var probs = new FZItemsUI();
                probs.addParent(this.probs_prefab_parent);
                this.ProbsPoolNodeListVisible.push(probs);
                return probs;
            }
        }

        /**
         * 获取 随机道具
         */
        public getItemData():any 
        {
            var count = 0;
            for (var i = 1; i <= 6; i++) {
                count += this.itemConfig[i + ""].chance * 100;
            }
            var index = Math.round(Math.random() * (count-1) + 1);
            var count_new = 0;
            for (var i = 1; i <= 6; i++) {
                count_new += this.itemConfig[i + ""].chance * 100;
                if (index <= count_new) {
                    return this.itemConfig[i + ""];
                }
            }
        }
        /**
         * 美钞
         */
        public getDollerItemData():any 
        {
            var index = Math.floor(Math.random()*10)+1;
            let chance_5 = this.itemConfig[5].chance * 10;
            let chance_6 = this.itemConfig[6].chance * 10;
            if (chance_5 <= chance_6) {
                if (index <= chance_5) {
                    return this.itemConfig[5];
                } else {
                    return this.itemConfig[6];
                }
            } else {
                if (index <= chance_6) {
                    return this.itemConfig[6];
                } else {
                    return this.itemConfig[5];
                }
            }
        }

        /**
         * 小额美钞
         */
        public getLessDollar():any
        {
            return this.itemConfig[5];   
        }
        /**
         * 大额美钞
         */
        public getLargeDollar():any
        {
            return this.itemConfig[6];
        }
        /**
         * 获取敌人数据
         */
        public getEnemyRandomData():any 
        {
            FZDebug.D("获取敌人数据-------------------------精英");
            var data = this.getEnemyElite();
            if (data == 0) {
                FZDebug.D("获取敌人数据-------------------------普通");
                data = this.getEnemyNormal();
            }
            // FZDebug.log(" data : "+JSON.stringify(data));
            return data;
        }

        /**
         * 精英怪物
         * 0  没有精英
         * 
         */
        public getEnemyElite() {
            if (this.game_state_elite_appear != 1 && this.game_state_elite == 0 && this.check_point > 5) {
                var killCount = this.LevelEnemyCountMax - this.LevelEnemyCount;
                if (killCount/this.LevelEnemyCountMax >= 0.5 && killCount/this.LevelEnemyCountMax <= 0.7) {
                    var __data = this.getEliteEnemyIcon();
                    var __index = Math.floor(this.check_point/__data.time);
                    var count = 1;
                    if (__data["pbb"][__index]) {
                        count = __data["pbb"][__index];
                    }
                    var ____index = Math.random(); 
                    if (____index <= count) {
                        this.game_state_elite = 1;
                        var data = FZCfgManager.instance.getEnemyConfig();
                        Laya.timer.loop(200, this, this.onCreateElite);
                        return data["13"];
                    }else {
                        this.game_state_elite_appear = 1;
                        return 0;
                    }
                }
            }
            return 0;
        }
        /**
         * 普通怪物
         */
        public getEnemyNormal(){
            var data = FZCfgManager.instance.getEnemyConfig();
            var id_arr = this.check_point_data["enemyIds"].split(",")
            var strarr = this.check_point_data["enemyWgts"].split(",");
            var count = 0;
            for (var i = 0; i < strarr.length; i++) {
                count += parseInt(strarr[i]);
            }
            var index = Math.round(Math.random() * (count-1) + 1);
            var count_new = 0;
            var enemy_id = -1;
            var flag = false;
            for (var i = 0; i < strarr.length; i++) {
                if (flag == false) {
                    count_new += parseInt(strarr[i]);
                    if (index <= count_new) {
                        enemy_id = id_arr[i];
                        flag = true;   
                    }
                }
            }
            // FZDebug.D("普通怪物------------------" + enemy_id);
            return data[enemy_id];
        }
        //wx分享
        public noVideoToShareWay:number = 0; // 0视频状态 1分享状态
        public isOpenVideoToShare : boolean = true;

        public setNoVideoToShareWay(value: number)
        {
            this.noVideoToShareWay = value;
        }

        //新手引导数据
        public newPlayerGudieStep(stepIdx: any){
            let nowStep  = Number(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_GUIDE", "1"));
            if(nowStep == 0)
            {
                let carMaxLv = FZMergeDateManager.instance.getCarMaxLevel();
                if(carMaxLv > 1)
                {
                    nowStep = FZGameStatus.NumForGuide.allStep;
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_GUIDE", String(nowStep));
                }
            }
            if(nowStep > FZGameStatus.NumForGuide.allStep){
                return -1;
            }

            if(stepIdx){
                let dt = String(stepIdx);
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_GUIDE", dt)
            }else{
                return nowStep; 
            }
            
        }

        /**
         * 升级软
         */
        public getLvUpGuideTouch(idx: number): any{
            let dt = Number(FZSaveDateManager.instance.getItemFromLocalStorage("lvUpGuide","0"));
            if(idx)
            {
                FZSaveDateManager.instance.setItemToLocalStorage("lvUpGuide","1");
                return 1;
            }
            return dt;
        }

        // ------------------------------------------------------------------------------------
        /**
         * 加载技能对象池
         */
        public initSkillPool(parent:any) {
            for (var i = 0; i < 2; i++) {
                var skill = new FZCarSkills();
                skill.addParent(parent);
                this.SkillPoolNodeList.push(skill);
            }
        }

        /**
         * 释放技能
         */
        public killSkillPoolList(probs: any) :void 
        {
            probs.onkill();
            var index = this.SkillPoolNodeListVisible.indexOf(probs);
            if (index != -1) {
                this.SkillPoolNodeListVisible.splice(index,1);
            }
            this.SkillPoolNodeList.push(probs);
        }
        /**
         * 获取技能
         */
        public getSkillPool(): any {
            if (this.SkillPoolNodeList.length > 0) {
                var node = this.SkillPoolNodeList.pop();
                this.SkillPoolNodeListVisible.push(node);
                return node
            }else {
                FZDebug.D("技能对象池不足-------------------");
                var probs = new FZCarSkills();
                probs.addParent(this.probs_prefab_parent);
                this.SkillPoolNodeListVisible.push(probs);
                return probs;
            }
        }

        /**
         * 播放技能
         */
        public playSkill(param:any){
            // 技能
            var skill_js = FZGameData.instance.getSkillPool(); 
            skill_js.playSkill(param);
        }

        // 空投 是否看过视频
        public setAirDropVideoState(param : string ){
            FZSaveDateManager.instance.setItemToLocalStorage("AIR_DROP_VIDEO" , param  );
            this.airDrop_Video_State = param;
        }

        // 空投 是否第三关有立即出现过
        public setAirDropInstance(param : string ){
            FZSaveDateManager.instance.setItemToLocalStorage("AIR_DROP_THREE" , param  );
            this.airDrop_promptly_show = param;
        }

        public changeObstaclesParam(){
            // this.isInObstaclesGuide = "true";
            // this.enemyCheck = 0;
        }

        // 删除车辆引导次数 的刷新
        public setDeleteCarGuideTime(param : string){
            this.deleteCarGuide = param;
            FZSaveDateManager.instance.setItemToLocalStorage("DELETE_CAR_GUIDE" , param  );
        }

         // 删除车辆引导 是否处于引导状态刷新
         public setDeCarGuideState(param : string){
            this.delCarGuideState = param;
            FZSaveDateManager.instance.setItemToLocalStorage("DELETE_CAR_GUIDE_STATE" , param  );
        }

        // 获取交叉导流配置信息 
        public getJcdlDataList(){
            return FZCfgManager.instance.dicConfig[FZGameStatus.QCfgType.JCDL];
        }

    }
}

export default game.data.FZGameData;
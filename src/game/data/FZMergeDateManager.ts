import FZSaveDateManager from "./FZSaveDateManager";
import FZUtils from "../../framework/FZUtils";
import FZCfgManager from "../core/FZCfgManager";
import FZDebug from "../../framework/FZDebug";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "./FZEvent";
import FZGameData from "./FZGameData";
import FZUIManager from "../core/FZUIManager";
import FZGameStatus from "./FZGameStatus";
import FZHttps from "../../framework/FZHttps";
import FZZiDan from "../view/FZZiDan";

 /**
 * 合成车的数据文件
 */
namespace game.data
{
    export class FZMergeDateManager
    {
        //微信小游戏不显示的功能
        public showFreeLvUpCar: boolean = false;    //免费升级车辆
        public showRandomCar: boolean = false;      //随机免费车
        public showItemBox: boolean = true;        //空投道具
        public clearAccount: boolean = false;       //清除账号
        public hasShopFreeCar: boolean = true;     //商城免费车 

        public showWeaponOpenNotice: boolean = true;    //显示副武器或无人机开启跳转提示
        
        public todayShareCount = 1; // 今日视频和分享的次数
        public shareCountDate  = ""; // 计算时的日期
        public userIntegral: number = 200;  //积分范围与对应的策略小于等于 99分 199分 300分的时候 1分享 2视频

        //可购买最高等级枪   当前最高等级 减 它
        public MaxFastBuyCarLevelDiv:number = 5;
        public MaxBuyGunLevelDiv:number = 2;
        public game_gold:string =  "4000"; // 游戏金币
        public game_card_slot:number = 12; // 车位 初始为3
        public game_gold_speed:number = 0; // 游戏速度
        public game_diamond:number = 0; //钻石
        public haveInfo: string = "";
        public NetWorkOK :number = 0;
        private game_earnings:number = 1; //永久收益
        private game_temp_earning: number = 0;//临时收益时间
        private game_temp_earning_time: number = 0;//临时收益时间
        private game_price_proport:number = 1; // 价格比例
        public game_temp_speed:number = 1; // 游戏加速
        public BOX_TIME:number = 20 * 1000; // 免费车的间隔时间
        // public ITEM_BOX_TIME:number = 5 * 1000; // 空投包间隔时间   - 注释原因 : 旧版本空投逻辑
        public CAR_FREE_LEVEL_UP:number = 180 * 1000; // 买车免费升级时间
        public SHOP_VIDEO_BUY_CAR:number = 60 * 1000; // 商店视频购车时间
        public IsFirst:boolean = true;
        public pos_height1:number = 735;
        public pos_height2:number = 877;
        public pos_height3:number = 1031;
        public posx1 = 24;
        public posx2 = 213;
        public posx3 = 389;
        public posx4 = 574;
    
        public game_card_slot_pos = {
            "12": [{"x":this.posx1, "y":this.pos_height1}, {"x":this.posx2, "y":this.pos_height1}, {"x":this.posx3, "y":this.pos_height1}, {"x":this.posx4, "y":this.pos_height1},
            {"x":this.posx1, "y":this.pos_height2}, {"x":this.posx2, "y":this.pos_height2}, {"x":this.posx3, "y":this.pos_height2}, {"x":this.posx4, "y":this.pos_height2}, 
            {"x":this.posx1, "y":this.pos_height3}, {"x":this.posx2, "y":this.pos_height3}, {"x":this.posx3, "y":this.pos_height3},{"x":this.posx4, "y":this.pos_height3}] 
        };
        public game_card_slot_data:any = {};  //  车位数据
        public CarMaxLevel: number = 1;   //  当前最高等级
        public CarUsedLevel: number = 1;//    当前正使用赛车等级
        public curTableCarMaxLevel:number =  50; //当前
        public game_buy_record =  {};     //  购买记录 金币
        public game_buy_diamond_record = {} // 购买记录 钻石
        public user_experience = 0;       //  当前经验
        public user_level = 1;            //  当前等级 
        public buy_item_record = [];      //  道具 购买记录
        public rotary_table_max_count:number = 5;           //  转盘免费次数
        public rotary_table_reset_time:number = 10*60*1000;     //  转盘重置时间
        public syntheticSoft: number = 0; //合成软引导
        public shopSoft: number = 0;      //是否点过商城
        public noTouchTime: number =0;    //无合成相关操作时间

        public freeDollarTimes: Array<number> = [1.5,1.3,1.2,0.8,0.8,0.8,0.6];

        public exchange_diamond_base: number = 1;
        public exchange_dollar_base: number = 300;
        public exchange_dynamic_coefficient: number = 1;

        public allowRandomCar: boolean = false;     //  是否允许随机送车辆

        public is_First_Recycle_Car:number = 0; //是否第一次回收车辆(0:是  1:不是)
        public is_First_Click_Lucky:number = 0; //是否第一次点击转盘抽奖(0:是  1:不是)

        public play_game_win_times:number = 0; //游戏胜利次数
        public isMergeState : any = false;
        private static _instance: FZMergeDateManager;
        public static get instance(): FZMergeDateManager
        {
            if (this._instance == null)
            {
                this._instance = new FZMergeDateManager();
                this._instance.registerEvent();
            }
            return this._instance;
        }
        
        /**
         * 注册监听
         */
        public registerEvent():void  {
            FZEventManager.instance.register(FZEvent.WX_ON_SHOW, this.onShow, this);
            FZEventManager.instance.register(FZEvent.WX_ON_HIDE, this.onHide, this);
        }

        /**
         * 删除监听
         */
        public unregisterEvent(): void
        {
            FZEventManager.instance.unregister(FZEvent.WX_ON_SHOW, this.onShow, this);
            FZEventManager.instance.unregister(FZEvent.WX_ON_HIDE, this.onHide, this);
        }

        public setLvUpGuideTouch(){
            let dt = FZSaveDateManager.instance.setItemToLocalStorage("lvUpGuideTouch","yes");
        }

        /**
         * 增加当前经验 ///传入exp为0时 视为刷新当前经验ui
         */
        addUserExperience(exp: number):void{
            this.user_experience += exp | 0;
            var info = FZCfgManager.instance.getLevelInfo(this.user_level);
            if (info.level_up_exp == -1) {
                return;
            }
            if (this.user_experience >= info.level_up_exp) {
                this.user_level += 1;
                FZSaveDateManager.instance.setItemToLocalStorage("USER_LEVEL", this.user_level.toString());
                 // 升级
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_LEVEL);
                var newinfo = FZCfgManager.instance.getLevelInfo(this.user_level)
                if (newinfo.level_up_exp == -1){
                    // 满级
                    this.user_experience = info.level_up_exp;
                }else {
                    this.user_experience -= info.level_up_exp;
                }
            }
            // 更新 经验
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_EXPERIENCE);
            // console.log('当前经验' + this.user_experience);
        }

        public setCarUsedLevel(level: number){
            if (this.CarUsedLevel != level) {
                this.CarUsedLevel = level;
                Laya.timer.frameOnce(2, this, function(){
                    FZSaveDateManager.instance.setItemToLocalStorage("CARUSEDLEVEL", this.CarUsedLevel.toString());
                });
                FZEventManager.instance.sendEvent(FZEvent.GAME_CHANGE_CUR_USE_CAR);
            }
            
            
        }
        /**
         * 获取用户分享积分
         */
        public getUserIntegral():number
        {
            return this.userIntegral;
        }

        public getCarUsedLevel():number{
            return this.CarUsedLevel;
        }
        
        /**
         * 设置最大的等级
         */
        public setCarMaxLevel(level:number):void
        {
            FZDebug.D("合成设置等级  ------  " + level );
            FZDebug.D("合成设置等级  ------  " + this.CarMaxLevel );
            if (level > this.CarMaxLevel) {
                this.CarMaxLevel = level;
                Laya.timer.frameOnce(2, this, function(){
                    FZSaveDateManager.instance.setItemToLocalStorage("CARMAXLEVEL", this.CarMaxLevel.toString());
                })
                this.setCarUsedLevel(level);//升级后将当前选中车改成新车
                // 更改选择
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_MERGE_NEW_CAR);
                if (level == FZGameData.instance.deputyWeapon_open_point) {
                    FZGameData.instance.setDeputyWeaponLocalLevel(1);
                }
                 // 上传网络数据
                FZMergeDateManager.instance.sendUpdataData();
                if(this.CarMaxLevel  == FZMergeDateManager.instance.curTableCarMaxLevel) {
                    FZ.BiLog.clickStat(FZ.clickStatEventType.CarMaxLevel,[]);
                }
                if(this.CarMaxLevel == 10){
                    FZ.BiLog.clickStat(FZ.clickStatEventType.CarMaxLevel10,[]);
                }
                if(this.CarMaxLevel == 30){ 
                    FZ.BiLog.clickStat(FZ.clickStatEventType.CarMaxLevel30,[]);
                }
            }
        }

        public getCarMaxLevel():any
        {
            return this.CarMaxLevel;
        }
        // 初始化合成数据
        initData(): void 
        {
            //this.initTest();
            //本地是否有数据
            this.NetWorkOK = 0;
            this.setLocalGameData();
            this.haveInfo = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_DATA","");
            if(!this.haveInfo){
                //覆盖本地数据
                FZ.TuyooSDK.setNewUser(false);
            }
            this.getUserInfo();
            Laya.timer.clear(this,this.updateUserIntegral);
            Laya.timer.loop(60*1000,this,this.updateUserIntegral);
            this.setLaunchOptionsSync();
            this.initPopJcdlCfg();  //初始化试玩界面数据
        }

        public jcdlCfgArr = [];  //当天可以试玩的导流信息
        public jcdlCanPlay = [];  //可以试玩的导流信息（配置可更改）
        public showJcdlCfg = [];  //交叉导流的配置信息
        // public clickAppID: "";  //本次试玩的游戏ID
        public appIDClicked = [];  //当天已经试玩过的游戏ID数组
        public toOtherGame = false;  //记录从弹窗导流进入其他游戏的状态

        /**
         * 初始化弹窗导流数据
         */
        public initPopJcdlCfg(){
            this.showJcdlCfg = FZGameData.instance.getJcdlDataList();
            this.appIDClicked = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("APPID_CILCK_ARR", JSON.stringify([])));
            var sameDay = this.isSamedayJcdl();
            if(sameDay){
                this.jcdlCfgArr = this.getPopJcdlCfgStorage();  //获取弹窗交叉导流的本地配置信息
                this.updatePopJcdlWhenVersionUp();
            }else{
                FZSaveDateManager.instance.setItemToLocalStorage("MORE_GAME_DAY_FRESH", "1");
                this.fleshPopJcdl();
            }
        }

        /**
         * 获取更新试玩信息
         */
        public getPopJcdlCfg():any{
            return this.jcdlCfgArr;
        }

        /**
         * 更新试玩信息
         * @param param 当前试玩的appID
         */
        public changePopJcdlCfg(param){
            if(this.jcdlCfgArr.length > 0){
                console.log("交叉导流  ========  ");
                console.log(this.jcdlCfgArr);
                for(let i = 0; i < this.jcdlCfgArr.length; i++){  //删除已经成功试玩过的导流
                    if(this.jcdlCfgArr[i].toappid == param){
                        this.jcdlCfgArr.splice(i, 1);
                    }
                }
                this.appIDClicked.push(param);
                FZSaveDateManager.instance.setItemToLocalStorage("APPID_CILCK_ARR", JSON.stringify(this.appIDClicked));
                this.setPopJcdlCfgStorage(this.jcdlCfgArr);
                FZEventManager.instance.sendEvent(FZEvent.MORE_GAME_NUM);
            }
        }

        /**
         * 交叉导流配置更新时，更新本地存储的弹窗导流的配置信息
         */
        public updatePopJcdlWhenVersionUp(){
            if(this.jcdlCfgArr.length <= 0 || this.jcdlCanPlay.length <= 0){
                return;
            }
            // this.jcdlCfgArr = this.getPopJcdlCfgStorage();
            //检测本地存在，cnd上不存在的导流
            for(let i = 0; i < this.jcdlCfgArr.length; i++){
                let flag = false;  //标记导流是否存在
                var appid = this.jcdlCfgArr[i].toappid;
                for(let j = 0; j < this.jcdlCanPlay.length; j++){
                    if(appid == this.jcdlCanPlay[j].toappid){
                        flag = true;  //导流存在
                        break;
                    }
                }
                if(!flag){
                    this.jcdlCfgArr = this.jcdlCfgArr.splice(i, 1);  //去掉不存在的导流信息
                }
            }

            //检测cdn上存在，本地不存在的导流
            for(let i = 0; i < this.jcdlCanPlay.length; i++){
                let flag = false;  //标记导流是否存在
                var appid = this.jcdlCanPlay[i].toappid;
                for(let j = 0; j < this.jcdlCfgArr.length; j++){
                    if(appid == this.jcdlCfgArr[j].toappid){
                        flag = true;  //导流存在
                        break;
                    }
                }
                if(!flag){  //cdn上的导流在本地不存在
                    let clickedFlag = false;
                    for(let k = 0; k < this.appIDClicked.length; k++){
                        if(appid == this.appIDClicked[k]){  //该游戏当天试玩过
                            clickedFlag = true;
                            break;
                        }
                    }
                    if(!clickedFlag){  //没有试玩过
                        this.jcdlCfgArr.push(this.jcdlCfgArr[i]);  //增加新添的导流信息
                    }
                }
            }
            this.setPopJcdlCfgStorage(this.jcdlCfgArr);
        }

        /**
         * 判断导流是否能够试玩
         */
        public canPlay(){
            let arr = [];
            for(let i = 0; i < this.showJcdlCfg.length; i++){
                if(this.showJcdlCfg[i].can_play == 1){
                    arr.push(this.showJcdlCfg[i]);
                }
            }
            return arr;
        }

        /**
         * 判断是否是同一天
         */
        public isSamedayJcdl(){
            let day = new Date().toLocaleDateString();
            if(day != FZSaveDateManager.instance.getItemFromLocalStorage("MORE_GAME_DAY", "0")){
                //不是同一天
                // this.fleshPopJcdl();
                // FZSaveDateManager.instance.setItemToLocalStorage("MORE_GAME_DAY_FRESH", "1");  //刷新可试玩次数
                this.dateStorage(day);
                FZDebug.D("不是同一天");
                return false;
            }else{  //啥也不干
                FZDebug.D("是同一天");
                return true;
            }
        }

        /**
         * 刷新导流数据
         */
        public fleshPopJcdl(){
            // this.setPopJcdlCfgStorage(this.jcdlCanPlay);  //刷新本地可试玩游戏信息
            // this.jcdlCfgArr = this.jcdlCanPlay;  //防止数据不同步
            this.jcdlCfgArr = this.canPlay();
            this.setPopJcdlCfgStorage(this.jcdlCfgArr);
            //刷新本地已试玩游戏ID
            this.appIDClicked = [];
            FZSaveDateManager.instance.setItemToLocalStorage("APPID_CILCK_ARR", JSON.stringify(this.appIDClicked));
            FZEventManager.instance.sendEvent(FZEvent.MORE_GAME_NUM);
        }

        /**
         * 获取弹窗导流数据
         */
        public getPopJcdlCfgStorage(){
            let cfg = FZSaveDateManager.instance.getItemFromLocalStorage("POP_JCDL_CFG", "");
            if(cfg){
                return JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("POP_JCDL_CFG", ""));
            }else{
                return [];
            }
        }

        /**
         * 存储弹窗导流数据
         * @param param 弹窗导流数据
         */
        public setPopJcdlCfgStorage(param){
            FZSaveDateManager.instance.setItemToLocalStorage("POP_JCDL_CFG", JSON.stringify(param));
        }

        /**
         * 存储日期
         */
        dateStorage(day){
            FZSaveDateManager.instance.setItemToLocalStorage("MORE_GAME_DAY", day);
        }

        public setLaunchOptionsSync():any
		{
			if(Laya.Browser.onMiniGame)
			{
				// let info = Laya.Browser.window.wx.getLaunchOptionsSync();
                FZDebug.log("info : " + FZ.UserInfo.scene_id);
				if(!FZUtils.isNullOrEmpty(FZ.UserInfo.scene_id)){
					//视频本地策略
					let spArr = [1005,1006,1011,1012,1013,1053];
					if(spArr.indexOf(parseInt(FZ.UserInfo.scene_id)) >= 0/* || (info.query.fun_type && info.query.fun_type == "onShareAppMessage")*/){
						FZGameData.instance.setOnlyCanVideo(true);
					}else{
						FZGameData.instance.setOnlyCanVideo(false);
					}
				}
			}
		}

        //setLocalInfo
        setLocalGameData(): void{
            // 钻石
            this.game_diamond = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_DIANOND", "0")); 
            if (this.game_diamond < 0) {
                this.game_diamond = 0;
            }
            // 车辆最高等级
            this.CarMaxLevel = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("CARMAXLEVEL","1"));
            // todo
            this.CarMaxLevel = Math.min(50,this.CarMaxLevel);
            // 当前使用赛车等级
            this.CarUsedLevel = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("CARUSEDLEVEL","1"));
            this.CarUsedLevel = Math.min(50, this.CarUsedLevel);
            // 1 用户拥有的金币
            this.game_gold = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_GOLD","4000");
             // var n = this.game_gold.split('NaN').length-1;
            //  if (this.game_gold.indexOf("NaN") != -1) {
            //     this.game_gold = "10000000000000000000000";
            // }
            // 开启的车位
            this.game_card_slot = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_CARD_SLOT","12"));
            // 车位数据
            this.game_card_slot_data = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_CARD_SLOT_DATA", JSON.stringify({"0":{"level": 1, "state":1}})));
            for (var k in this.game_card_slot_data) {
                if (this.game_card_slot_data[k]!= null){
                    if (this.game_card_slot_data[k].level == null || this.game_card_slot_data[k].level <= 0) {
                        this.game_card_slot_data[k]= null;
                    } else if (this.game_card_slot_data[k].level > 50) {
                        this.game_card_slot_data[k].level = 50;
                    } else {
                        if (this.CarMaxLevel < this.game_card_slot_data[k].level && this.game_card_slot_data[k].state !=3 && this.game_card_slot_data[k].state !=4){
                            this.CarMaxLevel = this.game_card_slot_data[k].level
                        }
                    }
                }
            }
            FZSaveDateManager.instance.setItemToLocalStorage("CARMAXLEVEL",this.CarMaxLevel.toString());
            // 购买记录 金币
            this.game_buy_record = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_BUG_RECORD", "{}"));
            // 购买记录 钻石
            this.game_buy_diamond_record = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_BUG_DIAMOND_RECORD", "{}"));
            // 当前经验
            this.user_experience = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("USER_EXPERIENCE","0"));
            // 用户等级
            this.user_level = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("USER_LEVEL","1"));
            // 游戏金币速率
            this.game_gold_speed = this.onUpdateGoldSpeed();
            // 永久增益
            this.game_earnings = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_EARINGS","1"));
            // 加速时间
            var last_time = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SPEED_LAST_LIST", JSON.stringify({"2": -1, "5": -1})));
            // 合成软引导
            this.syntheticSoft = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("syntheticSuccess","0"));
            // 商店软引导
            this.shopSoft = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("shopTouch","0"));
            // 未操作时长
            this.noTouchTime = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("noTouchTime","0"));
            // 今日分享次数
            this.todayShareCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("todayShareCount", "1"));
            // 上次分享的日期
            this.shareCountDate = FZSaveDateManager.instance.getItemFromLocalStorage('shareCountDate',"");

            var newtime = new Date().getTime();
            for (var key in last_time) {
                if (last_time[key] != -1) {
                    this.game_speed_list[key] = newtime + last_time[key];
                } else  {
                    this.game_speed_list[key] = -1;
                }
            }        
            // 道具购买记录
            this.buy_item_record = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("BUY_ITEM_RECORD",JSON.stringify([])));
            // 价格比例
            this.game_price_proport = parseFloat(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_PRICE_PROPORT","1"));
            //是否第一次回收车辆
            this.is_First_Recycle_Car = parseFloat(FZSaveDateManager.instance.getItemFromLocalStorage("IS_FIRST_RECYCLE_CAR","0"));
            //是否第一次点击转盘抽奖
            this.is_First_Click_Lucky = parseFloat(FZSaveDateManager.instance.getItemFromLocalStorage("IS_FIRST_CLICK_LUCKY","0"));
            //游戏胜利次数
            this.play_game_win_times = parseFloat(FZSaveDateManager.instance.getItemFromLocalStorage("PLAY_GAME_WIN_TIMES","0"));
            // 初始化 空投包数据
            this.initAirDropList();
        }
        
        public updateUserIntegral()
        {
            new FZHttps().get("game/getUserAccScore",this,(e)=>{
                let dt = e.data;
                if(e.state == 200 && dt)
                {
                    this.userIntegral = dt.accScore;
                    FZDebug.D("用户分数------------------------ = " + this.userIntegral);
                }
            },null);
        }

        public setUseriInviteCode()
        {
            if(FZ.UserInfo.invite_id > 0)
            {
                new FZHttps().get("game/setInviteInfo",this,(e)=>{
                    this.updateUserIntegral();
                },{inviteUserId:FZ.UserInfo.invite_id});
            }
            else
            {
                this.updateUserIntegral();
            }
        }

        /**
         * 获得用户信息
         */
        public getUserInfo(): any{
            if((Laya.Browser.onMiniGame || Laya.Browser.onAndroid || Laya.Browser.onIOS)) {
                if (!this.clearAccount) {
                    FZDebug.D("请求用户数据------------------------");
                    new FZHttps().get("game/getGameInfo",this,this.getAIWxUserDataSuccess,null);
                } 
            }
        }
        /**
         * 判断数据是否合理
         * @param value 
         */
        public judgeData(value):any{
            if (this.CarMaxLevel < parseInt(value.carMaxLevel) || FZGameData.instance.getMaxCheckPoint() < parseInt(value.maxCheckPoint)
            || FZGameData.instance.getMainWeaponLevel() < parseInt(value.mainWeaponLevel) || FZGameData.instance.getDeputyWeaponLocalLevel() < parseInt(value.deputyWeaponLevel)) {
                return true;
            }else {
                if (this.CarMaxLevel == parseInt(value.carMaxLevel) || FZGameData.instance.getMaxCheckPoint() == parseInt(value.maxCheckPoint)
                || FZGameData.instance.getMainWeaponLevel() == parseInt(value.mainWeaponLevel) || FZGameData.instance.getDeputyWeaponLocalLevel() == parseInt(value.deputyWeaponLevel)) {
                    return true;
                }
            }
            return false;
        }
        /**
         *  更改车辆数据
         */
        public changeCarSlotDataNetWork(value){
            var count = 0;
            for (var k in value) {
                if (value[k] != null && value[k].level != null && value[k].level > 0){
                    count += value[k].level;
                }
            }
            var count_new = 0;
            for (var k in this.game_card_slot_data) {
                if (this.game_card_slot_data[k]!= null && this.game_card_slot_data[k].level != null && this.game_card_slot_data[k].level > 0){
                    count_new += this.game_card_slot_data[k].level;
                }
            }
            if (count > count_new) {
                this.game_card_slot_data = value;
            }
            // this.game_card_slot_data = JSON.parse(gamedata.gameCardSlotData);
            for (var k in this.game_card_slot_data) {
                if (this.game_card_slot_data[k]!= null){
                    if (this.game_card_slot_data[k].level == null || this.game_card_slot_data[k].level <= 0) {
                        this.game_card_slot_data[k]= null;
                    } else if (this.game_card_slot_data[k].level > 50) {
                        this.game_card_slot_data[k].level = 50;
                    } else {
                        if (this.CarMaxLevel < this.game_card_slot_data[k].level && this.game_card_slot_data[k].state !=3 && this.game_card_slot_data[k].state !=4){
                            this.CarMaxLevel = this.game_card_slot_data[k].level
                        }
                    }
                }
            }
        }
        /**
         * 数据返回
         * @param 
         */
        public getAIWxUserDataSuccess(e): void{
            let dt = e.data;
            FZDebug.D("用户数据------------------------" + JSON.stringify(e));
            if(e.state == 200 && dt && dt.gamedata){
                var gamedata = JSON.parse(dt.gamedata);
                if(this.judgeData(gamedata) == false ) {
                    return;
                }
                FZDebug.D("用户数据------------------------" + JSON.stringify(gamedata));
                //mergeData
                this.user_level = parseInt(gamedata.userLevel);
                this.CarMaxLevel = parseInt(gamedata.carMaxLevel);
                this.CarMaxLevel = Math.min(50,this.CarMaxLevel);
                this.CarUsedLevel = parseInt(gamedata.carUsedLevel);

                this.game_gold = gamedata.gameGold;
                // if (this.game_gold.indexOf("NaN") != -1) {
                //     this.game_gold = "10000000000000000000000";
                // }
                this.game_diamond = parseInt(gamedata.gameDiamond);
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_DIANOND",this.game_diamond.toString()); 
                this.game_card_slot = 12;
                this.changeCarSlotDataNetWork(JSON.parse(gamedata.gameCardSlotData));
                if (this.CarUsedLevel < this.CarMaxLevel) {
                    this.CarUsedLevel = this.CarMaxLevel;
                }
                FZSaveDateManager.instance.setItemToLocalStorage("CARMAXLEVEL",this.CarMaxLevel.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("CARUSEDLEVEL", this.CarUsedLevel.toString());
                this.game_buy_record = JSON.parse(gamedata.gameBugRecord);
                this.game_buy_diamond_record = JSON.parse(gamedata.gameBugDiamondRecord);
                this.user_experience = parseInt(gamedata.userExperience);
                this.game_earnings = parseInt(gamedata.gameEarings);
                this.buy_item_record = JSON.parse(gamedata.buyItemRecord);
                this.game_price_proport = parseFloat(gamedata.gamePriceProport);
                this.is_First_Recycle_Car = parseFloat(gamedata.isFirstRecycleCar);
                this.is_First_Click_Lucky = parseFloat(gamedata.isFirstClickLucky);
                this.play_game_win_times = parseFloat(gamedata.playGameWinTimes);

                FZSaveDateManager.instance.setItemToLocalStorage("USER_LEVEL", this.user_level.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT","12");
                // 车位数据
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT_DATA", JSON.stringify(this.game_card_slot_data));
                // 购买记录 金币
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_RECORD", JSON.stringify(this.game_buy_record));
                // 购买记录 钻石
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_DIAMOND_RECORD", JSON.stringify(this.game_buy_diamond_record));
                // 当前经验
                FZSaveDateManager.instance.setItemToLocalStorage("USER_EXPERIENCE",this.user_experience.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_EARINGS",this.game_earnings.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("BUY_ITEM_RECORD",JSON.stringify(this.buy_item_record));
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_PRICE_PROPORT",this.game_price_proport.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("IS_FIRST_RECYCLE_CAR",this.is_First_Recycle_Car.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("IS_FIRST_CLICK_LUCKY",this.is_First_Click_Lucky.toString());
                FZSaveDateManager.instance.setItemToLocalStorage("PLAY_GAME_WIN_TIMES",this.play_game_win_times.toString());
                // 用户等级
                // gameData
                FZGameData.instance.setWeaponsCoin(gamedata.weaponCoin || 0);
                FZGameData.instance.setMainWeaponLevel(gamedata.mainWeaponLevel || 1);
                FZGameData.instance.setCheckPoint(gamedata.checkPoint || 1),
                FZGameData.instance.setMaxCheckPoint(gamedata.maxCheckPoint || 1),
                FZGameData.instance.setDeputyWeaponLocalLevel(gamedata.deputyWeaponLevel || 0);
                FZGameData.instance.setCurUseUAV(gamedata.curSelectUav || -1);
                FZGameData.instance.setUAVData(gamedata.uavData);
                FZGameData.instance.newPlayerGudieStep(gamedata.guideStep);
                if(!FZUtils.isNullOrEmpty(gamedata.AirDropList)) {
                    this.AirDropList = gamedata.AirDropList;
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropList",JSON.stringify(this.AirDropList)); 
                }
                if(!FZUtils.isNullOrEmpty(gamedata.AirDropIsOpen)) {
                    this.AirDropIsOpen = gamedata.AirDropIsOpen;
                    if ((gamedata.AirDropIsOpen == 0 || gamedata.AirDropIsOpen == 1|| gamedata.AirDropIsOpen == 3) && gamedata.AirDropCount == 0){
                        this.AirDropIsOpen = 2;
                    }
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropIsOpen", this.AirDropIsOpen + ""); 
                }
                if(!FZUtils.isNullOrEmpty(gamedata.FreeAirDropOpen)) {
                    this.FreeAirDropOpen = gamedata.FreeAirDropOpen;
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateFreeAirDropOpen", this.FreeAirDropOpen + ""); 
                }
                if(!FZUtils.isNullOrEmpty(gamedata.AirDropCount)) {
                    this.AirDropCount = gamedata.AirDropCount;
                    if(this.AirDropIsOpen == 2){
                        this.AirDropCount = 0;
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropCount", this.AirDropCount + ""); 
                        // todo 
                        this.AirDropTime = 120;
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropTime", this.AirDropTime + "");
                        if (FZGameData.instance.getCheckPoint() > 3) {
                            this.createAirDrop();    
                        }
                    }else {
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropCount", this.AirDropCount + ""); 
                    }
                    FZEventManager.instance.sendEvent(FZEvent.UPDATE_AIRDROP_RED_NUM);
                }
                // 处理异常
                if (FZGameData.instance.getCheckPoint() == 2){
                    // this.game_card_slot_data
                    var index = this.judgeCarSlotDataAirdrop();
                    if (index != -1) {
                        var data :any = {};
                        data.level = 1;
                        data.state = 1; // 1 直接显示  0 显示箱子
                        this.changeCarSlotData(index, data);
                        this.AirDropIsOpen = 2;
                        this.AirDropCount = 0;
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropIsOpen", this.AirDropIsOpen + ""); 
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropCount", this.AirDropCount + ""); 
                        this.AirDropTime = 120;
                        FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropTime", this.AirDropTime + "");
                    }
                }

                if(!FZUtils.isNullOrEmpty(gamedata.AirdropPos)) {
                    this.AirdropPos = gamedata.AirdropPos;
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropPos", JSON.stringify(this.AirdropPos)); 
                }
                if(!FZUtils.isNullOrEmpty(gamedata.airDrop_promptly_show)){
                    FZGameData.instance.airDrop_promptly_show = gamedata.airDrop_promptly_show;
                    FZGameData.instance.setAirDropInstance(gamedata.airDrop_promptly_show)
                }


                if (FZUtils.isNullOrEmpty(this.haveInfo)){
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_DATA",'haveInfo');  
                    this.haveInfo = "haveInfo";      
                }

                
                this.NetWorkOK = 1;
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_UI);
                this.setUseriInviteCode();
            }
            if (dt && dt.gamedata == null) {
                if (FZUtils.isNullOrEmpty(this.haveInfo)){
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_DATA",'haveInfo');        
                    this.haveInfo = "haveInfo";
                }
                this.setUseriInviteCode();
                this.NetWorkOK = 1;
            }
            if (e.state != 200) {
                FZDebug.D("请求用户数据-失败-----------------------");
                if(Laya.Browser.onMiniGame || Laya.Browser.onAndroid || Laya.Browser.onIOS) {
                    Laya.timer.frameOnce(20, this, function(){
                        this.getUserInfo();
                    });
                }
            }
        }
        /**
         * 服务器更新数据
         */
        public sendUpdataData() {
            if (this.NetWorkOK == 0) {
                return;
            }
            let data = {
                // mergeData
                userLevel:this.user_level,
                carMaxLevel:this.CarMaxLevel.toString(),
                carUsedLevel:this.CarUsedLevel.toString(),
                gameGold:this.game_gold,
                gameDiamond:this.game_diamond.toString(),
                gameCardSlot:this.game_card_slot.toString(),
                gameCardSlotData:JSON.stringify(this.game_card_slot_data),
                gameBugRecord:JSON.stringify(this.game_buy_record),
                gameBugDiamondRecord:JSON.stringify(this.game_buy_diamond_record),
                userExperience:this.user_experience.toString(),
                gameEarings:this.game_earnings.toString(),
                buyItemRecord:JSON.stringify(this.buy_item_record),
                gamePriceProport:this.game_price_proport.toString(),
                isFirstRecycleCar:this.is_First_Recycle_Car.toString(),
                isFirstClickLucky:this.is_First_Click_Lucky.toString(),
                playGameWinTimes:this.play_game_win_times.toString(),
                // gameData
                weaponCoin: FZGameData.instance.getWeaponsCoin(),
                mainWeaponLevel: FZGameData.instance.getMainWeaponLevel(),
                checkPoint: FZGameData.instance.getCheckPoint(),
                maxCheckPoint: FZGameData.instance.getMaxCheckPoint(),
                deputyWeaponLevel: FZGameData.instance.getDeputyWeaponLocalLevel(),
                curSelectUav: FZGameData.instance.getCurUseUAV(),
                uavData: FZGameData.instance.getUAVData(),
                guideStep: FZGameData.instance.newPlayerGudieStep(null),
                AirDropList: this.AirDropList,// 空投包数据
                AirDropIsOpen: this.AirDropIsOpen,// 空投包状态
                FreeAirDropOpen: this.FreeAirDropOpen,// 空投包 免费
                AirDropCount: this.AirDropCount, // 空投包剩余次数
                AirdropPos: this.AirdropPos, // 空投包位置
                airDrop_promptly_show: FZGameData.instance.airDrop_promptly_show
            }

            var __data :any= {}
            __data.gamedata = JSON.stringify(data);
            if(FZ.UserInfo.userId!=0 && FZ.UserInfo.userId != 123){
                this.setGameData(__data);    
            }
        }
        /**
         * 设置用户信息
         */
        public setGameData(data): any{
            new FZHttps().get("game/setGameInfo",this,(e)=>{
                FZDebug.D("数据同步成功---------------------------");
            },data);
        }
        
        /**
         * 获取永久收益
         */
        public getGameEarnings():any
        {
            if (this.game_temp_earning_time > 0) {
                return (this.game_earnings - 1) + this.game_temp_earning;
            }
            return this.game_earnings;
        }

        /**
         * 设置永久收益
         */
        public setGameEarnings(value:number):void
        {
            FZDebug.D("设置永久收益1  " + this.game_earnings);
            this.game_earnings = value;
            FZDebug.D("设置永久收益2  " + this.game_earnings);
            this.onUpdateGoldSpeed();
        }

        public getGameTempEarnings(){
            return this.game_temp_earning;
        }
        public setGameTempEarnings(tempEarning: number){
            this.game_temp_earning = tempEarning;
        }
        public getGameTempEarningTime(){
            return this.game_temp_earning_time;
        }
        public setGameTempEarningTime(time:number){
            this.game_temp_earning_time += time
        }

        public setGamePriceProport(value:number):void
        {
            this.game_price_proport = value;
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_CHANGE_PRICE);
        }
        public getGamePriceProport()
        {
            return this.game_price_proport
        }
        /**
         * 获取钻石
         */
        getGameDiamond():any 
        {
            return this.game_diamond;
        }
        /**
         * 增加钻石
         */
        addGameDiamond(value:number):any 
        {
            this.game_diamond += value;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_DIANOND",this.game_diamond.toString()); 
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_DIAMOND);// 刷新钻石
            // 上传网络数据
            FZMergeDateManager.instance.sendUpdataData();
        }
        /**
         * 获得收益状态下金币速率
         */
        public getGoldSpeed():any 
        {
            return this.game_gold_speed;
        }
        /**
         * 获得所有状态下金币速率
         */
        public getGoldAllSpeed():any 
        {
            if (this.game_temp_earning_time > 0) {
                return this.game_temp_earning * this.game_gold_speed * this.game_temp_speed;
            }
            return this.game_gold_speed * this.game_temp_speed;
        }

        /**
         * 更新金币速率
         */
        private onUpdateGoldSpeed():any {
            var speed = 0;
            // FZDebug.D("更新金币速率---------------------" + JSON.stringify(this.game_card_slot_data));
            for (var k in this.game_card_slot_data) {
                if (!FZUtils.isNullOrEmpty(this.game_card_slot_data[k])) {
                    var level = this.game_card_slot_data[k].level;
                    var info = FZCfgManager.instance.getCarInfoById(level);
                    if (info && info.output_gold_second) {
                        speed += info.output_gold_second;
                    }
                }
            }
            this.game_gold_speed = Math.ceil(speed * this.game_earnings);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_GOLD_SPEED);
            return this.game_gold_speed;
        }
        
        /**
         * 获取一定时间内车辆的金币产出
         * time 秒
         */
        public getCarSlotOutputByTime(time: number){
            let gold = 0;
            for (var k in this.game_card_slot_data) {
                if (!FZUtils.isNullOrEmpty(this.game_card_slot_data[k])) {
                    var level = this.game_card_slot_data[k].level;
                    var info = FZCfgManager.instance.getCarInfoById(level);
                    if (info && info.output_gold_second) {
                        gold += time*info.output_gold_second;
                    }
                    //let times = time/info.gold_interval;
                    //gold += Math.ceil(times * info.output_gold * FZMergeDateManager.instance.getGameEarnings());
                }
            }
            return gold;
        }

        /**
         * 测试
         */
        initTest()
        {
            FZSaveDateManager.instance.setItemToLocalStorage("USER_LEVEL","1");
            FZSaveDateManager.instance.setItemToLocalStorage("CARMAXLEVEL", "1");
            FZSaveDateManager.instance.setItemToLocalStorage("CARUSEDLEVEL", "1");
            // 保存金币
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_GOLD","1000000");
            // 开启的车位
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT","12");
            // 车位数据
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT_DATA", JSON.stringify({"0":{"level": 1, "state":1}}));
            // 购买记录
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_RECORD", "{}");
            // 保存当前经验
            FZSaveDateManager.instance.setItemToLocalStorage("USER_EXPERIENCE","0");
            // 购买道具记录
            FZSaveDateManager.instance.setItemToLocalStorage("BUY_ITEM_RECORD",JSON.stringify([]));
            // 打折卡 
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_PRICE_PROPORT","1")
        }

        // 游戏金币
        public getGameGold(): any 
        {
            return this.game_gold;
        }

        // 用户经验
        public getUserExperience(): any
        {
            return this.user_experience;
        }
        /**
         * 用户等级
         */
        public getUserLevel():any
        {
            return this.user_level;
        }
        /**
         *  增加游戏金币
         */
        public addGameGold(value: string): void {
            value =  FZUtils.scienceNum(value);
            this.game_gold = FZUtils.StrAdd(this.game_gold, value);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD);
        }

        /**
         *  减少游戏金币
         */
        public SubtractGameGold(value: string): void {
            value =  FZUtils.scienceNum(value);
            this.game_gold = FZUtils.StrSubtract(this.game_gold, value);
            FZDebug.D("减少游戏金币---------" + this.game_gold);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD);
        }

        /**
         * 游戏金币翻倍
         */
        public StrMultipGameGold(value:number): void {
            this.game_gold = FZUtils.StrMultip(this.game_gold, value.toString());
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD);
        }
        
        /**
         * 获取车位位置
         */
        public getGameCarSlotPos(index: number):any 
        {
            var pos_list = this.game_card_slot_pos[index + ""];
            if (FZUtils.isNullOrEmpty(pos_list)) {
                FZDebug.E("getGameCarSlotPos :" + "参数异常");
                return null;
            }
            return pos_list;
        }

        /**
         * 获取车位数
         */
        public getGameCarSlot():any 
        {
            return this.game_card_slot;
        }
        /**
         * 增加车位
         */
        public addGameCarSlot():void
        {   
            return;
            //当前等级是否能加入车位
            /*let obj = FZCfgManager.instance.getLevelInfo(this.user_level);
            if(this.game_card_slot >= obj.max_plane){return}
            this.game_card_slot += 1;
            this.game_card_slot= Math.min(this.game_card_slot,12);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_UPDATE_CAR_SLOT);*/
        }
       
        // 获得车的购买次数
        public getBuyCarCount(level: number ,mtype:number):any {
            var count = this.game_buy_diamond_record[level + ""];
            if (mtype == FZGameStatus.QMoneyType.Diamond) {
                
            }else {
                count = this.game_buy_record[level +""];
            }
            if (!count) {
                return 0; 
            }
            return count;
        }
        /**
         * 
         * @param level 增加车的购买次数
         */
        public addBuyCarCount(level:number,mtype:number)
        {
            if (mtype == FZGameStatus.QMoneyType.Diamond) {
                var count = this.game_buy_diamond_record[level.toString()];
                if (!count) {
                    count = 0;
                }
                this.game_buy_diamond_record[level.toString()] = count + 1;
                Laya.timer.frameOnce(8, this, function(){
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_DIAMOND_RECORD", JSON.stringify(this.game_buy_diamond_record));
                })
            }else {
                var count = this.game_buy_record[level.toString()];
                if (!count) {
                    count = 0;
                }
                this.game_buy_record[level.toString()] = count + 1;
                Laya.timer.frameOnce(10, this, function(){
                    FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_RECORD", JSON.stringify(this.game_buy_record));
                })
            }
           
        }

        // 获得车的价格
        public getCarBuyPrice(level : number): string {
            var car_info = FZCfgManager.instance.getCarInfoById(level);
            var pow = this.getBuyCarCount(level, FZGameStatus.QMoneyType.Coin);
            var buy_gold = Math.floor(car_info.buy_gold * Math.pow(car_info.add_gold,pow) * this.game_price_proport )+ "";
            var gold = FZUtils.scienceNum(buy_gold);
            return gold;
        }
        
         // 获得车的价格 钻石
         public getCarBuyPriceDiamond(level : number): string {
            var car_info = FZCfgManager.instance.getCarInfoById(level);
            if(!car_info) {return '';}
            var pow = this.getBuyCarCount(level, FZGameStatus.QMoneyType.Diamond);
            var buy_gold = Math.floor(car_info.buy_diamond + car_info.add_diamond * pow)+ "";
            var gold = FZUtils.scienceNum(buy_gold);
            return gold;
        } 

        // 车的合成经验byID
        public setExperience(level : number): void {
            var car_info = FZCfgManager.instance.getCarInfoById(level);
            var expUp = car_info.merge_exp;
            // 增加经验
            this.addUserExperience(expUp);
        }
        

        // 车的出售价格
        public getCarSellPrice(level :number): string {
            var car_info = FZCfgManager.instance.getCarInfoById(level);
            var pow = this.getBuyCarCount(level, FZGameStatus.QMoneyType.Coin);
            var sell_gold = Math.floor(car_info.sell_gold * Math.pow(car_info.add_gold, pow)* this.game_price_proport ) + "";
            var gold = FZUtils.scienceNum(sell_gold);
            return gold;
        } 

        // 获取最优车辆
        public  getCheapestCar(): any {
            //旧算法
            /*let maxBuyGunLevel = this.CarMaxLevel - FZMergeDateManager.instance.MaxBuyGunLevelDiv;
            maxBuyGunLevel = maxBuyGunLevel < 0 ? 0 : maxBuyGunLevel;
            var level = 1;
            if (0 != maxBuyGunLevel) {
                //区间
                let price = this.getCarBuyPrice(1);
                FZDebug.D("获取最优车辆 -----------0-price=  " + price);
                let minUnitPrice = price;
                for (let i = 1; i <= maxBuyGunLevel; ++i) {
                    price = this.getCarBuyPrice(i);
                    let unitPrice = price / Math.pow(2, i); //单价
                    if (minUnitPrice > unitPrice) {
                        minUnitPrice = unitPrice;
                        level = i;
                    }
                }
            }*/

            // 新算法
            let level = 1;
            if (this.CarMaxLevel > 5) {
                let minBuyLevel = (this.CarMaxLevel <= 9) ? 1 : this.CarMaxLevel - (FZMergeDateManager.instance.MaxFastBuyCarLevelDiv + 4 - 1);
                let maxBuyLevel = this.CarMaxLevel - 4;

                level = minBuyLevel;
                let price = this.getCarBuyPrice(level);
                let minUnitPrice = price;
                for (let i = minBuyLevel; i <= maxBuyLevel; i++) {
                    price = this.getCarBuyPrice(i);
                    let unitPrice = FZUtils.bigDivide(price , Math.pow(2, i).toString()); //单价
                    if (FZUtils.StrJudge(minUnitPrice , unitPrice) == 1) {
                        minUnitPrice = unitPrice;
                        level = i;
                    }
                }
            }
            var new_price  = this.getCarBuyPrice(level);
            var car_data = {};
            car_data["level"] = level;
            car_data["price"] = new_price;
            var info = FZCfgManager.instance.getCarInfoById(level);
            car_data["path"] = info.path;
            return car_data;
        }

        /**
         * 判断哪个车位空闲
         */
        public JudgeSolt():number {
            // FZDebug.D("判断哪个车位空闲 ------------------" + JSON.stringify(this.game_card_slot_data));
            for (var k in this.game_card_slot_data) {
                if (this.game_card_slot_data[k]!= null){
                    if (this.game_card_slot_data[k].level == null || this.game_card_slot_data[k].level <= 0) {
                        this.game_card_slot_data[k]= null;
                    }
                }
            }
            /**
             *  因为想达到满数量的时候 , 直接更新 车辆引导
             *  若删除车辆引导没有结束 , 使用 JudgeSolt 结束后需要增加一辆车 以达到满数量 - 
             */
            this.isLoadLastIndex();
            
            for(var i = 0; i < this.game_card_slot; i++ ) {
                if (FZUtils.isNullOrEmpty(this.game_card_slot_data[i + ""])) {
                    return i;
                }
            }
            return -1;
        }

        /**
         *  判断是否只剩下一个位置  如果是 , 则执行这里会让车辆已满 - (用于删车引导) 
         */
        public isLoadLastIndex() : void {
            if ( FZGameData.instance.deleteCarGuide == "Close") {
                return;
            }
            var carNum = 0;
            for(var i = 0; i < this.game_card_slot; i++ ) {
                if (FZUtils.isNullOrEmpty(this.game_card_slot_data[i + ""])){
                    ++carNum;
                }
            }
            if( carNum == 1 ){  
                FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_GUIDE); // 删除车辆引导
            }
        }

        /**
         * 获取车位数据
         */
        public getCarSlotData ():any 
        {
            return this.game_card_slot_data;
        }

        /**
         * 切换车位数据
         */
        public exchangeCarSlotData(index1:number, index2:number) {
            var data = this.game_card_slot_data[index1 + ""];
            this.changeCarSlotData(index1, this.game_card_slot_data[index2 + ""]);
            this.changeCarSlotData(index2, data);
        }

        /**
         * 修改车位数据
         */
        public changeCarSlotData(index1:number, param:any) {
            if (index1 < 0 || index1 == null || index1 > 11){
                return;
            }
            this.game_card_slot_data[index1 + ""] = param;
            // 刷新金币速率
            this.onUpdateGoldSpeed();
            Laya.timer.frameOnce(2, this, function(){
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT_DATA", JSON.stringify(this.game_card_slot_data));
                // 0 显示未开启 1 显示已开启  2 未显示空投 3 停车位已满 
                if (!((this.AirDropIsOpen == 0 || this.AirDropIsOpen == 1 || this.AirDropIsOpen == 3)&& this.AirDropCount == 0)) {
                    FZMergeDateManager.instance.sendUpdataData();// 同步数据
                }
            })
        }
        // 进入游戏界面时间
        public enterGameStarTime:number = 0;
        /**
         * 进入游戏
         */
        public enterGame():void{
            // 保存时间
            this.enterGameStarTime = new Date().getTime(); 
            FZMergeDateManager.instance.saveAllLocalData();
        }

        /**
         * 返回大厅
         */
        onbackHall() {
            var nowdate = new Date().getTime(); 
            if (this.enterGameStarTime == 0) {
                return;
            }
            var gold = this.getGoldInGame(nowdate, this.enterGameStarTime);
            this.addGameGold(gold + "");
            
            // 增加 免费车
            if (this.showRandomCar) {
                var time  = Math.floor((nowdate - this.enterGameStarTime)/this.BOX_TIME);
                this.enterGameStarTime = 0;
                for ( var i = 0; i < time; i++){
                    var _index =  FZMergeDateManager.instance.JudgeSolt();
                    if (_index == -1) {
                        return;
                    } else {
                        var level = FZMergeDateManager.instance.getRandomCarDate();
                        if (level != -1) {
                            var data :any = {}; 
                            data.level = level;
                            data.state = 0; // 1 直接显示  0 显示箱子
                            FZMergeDateManager.instance.changeCarSlotData(_index, data);                        
                        }
                    }
                }
            }
        }
       
    
        /**
         * 计算离线金币
         */
        public addOffLineGold(popSign: boolean = false) {
            var offlinetime = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_OFFLINE_TIME", "0"));
            // console.log("addOffLineGold 计算离线收益 --- offlinetime = " + offlinetime);
            if (offlinetime == 0 ) {
                // 第一次进入游戏
                var time_1 = new Date().getTime();
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_OFFLINE_TIME",time_1.toString());
                return;
            }
            var maxTime = FZCfgManager.instance.getOffLineMaxTime();
            var newtime = new Date().getTime();
            // console.log("addOffLineGold 计算离线收益 --- newtime = " + newtime);
            var offline_h = Math.floor((newtime - offlinetime)/(1000 * 3600)); // 小时
            offline_h = Math.min(maxTime, offline_h);
            var offline_s = Math.floor((newtime - offlinetime)/(1000)) - offline_h * 3600; // 秒
            offline_s = (offline_h >= maxTime) ? 0 : offline_s;
            var data = FZCfgManager.instance.getOffLine();
            var gold = 0;
            for (var k = 0; k <=8 ;k++) {
                var key = k + "";
                var time_min = data[key].min_time;
                var time_max = data[key].max_time;
                var revenue_multiple = data[key].revenue_multiple;
                if (offline_h >= time_min) {
                    if (offline_h < time_max) {
                        gold +=  ((offline_h - time_min)* 3600 + offline_s) * this.getGoldSpeed() * revenue_multiple;
                    }else {
                        gold += (time_max - time_min)* 3600 * this.getGoldSpeed() * revenue_multiple;
                    }
                }
            }
            FZDebug.D("离线界面 小时------------------- "  + offline_h);
            FZDebug.D("离线界面 秒------------------- "  + offline_s);

            gold = Math.floor(gold);
            var time = FZCfgManager.instance.getOffLineTime();
            if(FZ.StateInfo.debugMode)
                alert("计算离线金币 offlinetime:"+offlinetime+'offline_h:'+offline_h+'offline_s:'+offline_s+'time:'+time)
            // 判断是否弹离线弹窗
            if (offline_h > 0 || (offline_h == 0 && offline_s >= time ))
            {
                FZDebug.D("离线界面 ------------------1- "  + gold);
                // 弹窗离线界面
                if (!popSign) {
                    FZUIManager.instance.createUI(FZUIManager.UI_BeOffline, {"gold": gold});
                } else {
                    FZUIManager.instance.addWaitUI(FZUIManager.UI_BeOffline, {"gold": gold});
                }
                return true;
            }else {
                FZDebug.D("离线界面 ------------------2- "  + gold);
                this.addGameGold(gold + "");
            }
        }
        /**
         * 返回前台
         * 检测加速状态
         * 把剩余时间转化为 结束时间戳
         */
        public onShow() 
        {
            // var lastTime:any = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_SPEED_LAST_LIST", JSON.stringify({"2":-1, "5":-1})));
            // var newtime = new Date().getTime();
            // for(var key in lastTime){
            //     if (lastTime[key] && lastTime[key] != -1) {
            //         this.game_speed_list[key] =  newtime + lastTime[key];
            //     }else {
            //         this.game_speed_list[key] = -1;
            //     }
            // }
            // 恢复定时器
            // Laya.timer.resume();
            // 计算离线金币
            if(FZUIManager.instance.getDialogActive(FZUIManager.UI_Main)){
                this.addOffLineGold();
            }
        }

        /**
         * 切换到后台
         * 如果实在游戏界面 结算这段时间的金币
         * 加速状态保存
         * 暂停定时器
         * 存储离线时间
         */
        public onHide()
        {
            var newtime = new Date().getTime();
            // console.log("onHide 存储离线时间 --- leavetime = " + newtime);
            // 加速状态 保存
            var lastTime:any = {};
            for(var key in this.game_speed_list){
                if (this.game_speed_list[key] != -1 && this.game_speed_list[key] > newtime) {
                    lastTime[key] = this.game_speed_list[key] - newtime;
                }else {
                    lastTime[key] = -1;
                }
            }
            FZDebug.D("切换到后台 -------------------------" + JSON.stringify(lastTime));
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_SPEED_LAST_LIST", JSON.stringify(lastTime));
            if (!this.clearAccount) {
                this.saveAllLocalData();
                FZGameData.instance.saveAllLocalData();
            }
            
            // 如果实在游戏界面 结算这段时间的金币
            if(this.enterGameStarTime != 0) {
                var gold = this.getGoldInGame(newtime, this.enterGameStarTime);
                this.addGameGold(gold + "");
            }
            
            // 暂停定时器
            // Laya.timer.pause();
            // 存储离线时间
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_OFFLINE_TIME", newtime.toString());
        }
         /**
         * 存储本地数据
         */
        public saveAllLocalData():void {
            // 保存钻石
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_DIANOND",this.game_diamond.toString()); 
            // 设置最大等级
            // FZSaveDateManager.instance.setItemToLocalStorage("CARMAXLEVEL", this.CarMaxLevel.toString());
            // FZSaveDateManager.instance.setItemToLocalStorage("CARUSEDLEVEL", this.CarUsedLevel.toString());
            // 保存金币
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_GOLD",this.game_gold);
            // 开启的车位
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT",this.game_card_slot.toString());
            // 车位数据
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_CARD_SLOT_DATA", JSON.stringify(this.game_card_slot_data));
            // 购买记录 金币
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_RECORD", JSON.stringify(this.game_buy_record));
            // 购买记录 钻石
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_BUG_DIAMOND_RECORD", JSON.stringify(this.game_buy_diamond_record));
            // 设置当前经验
            // FZSaveDateManager.instance.setItemToLocalStorage("USER_EXPERIENCE", this.user_experience.toString());
            // 永久收益
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_EARINGS",this.game_earnings.toString());
            // 道具购买记录
            // FZSaveDateManager.instance.setItemToLocalStorage("BUY_ITEM_RECORD",JSON.stringify(this.buy_item_record));
            // 价格比例
            // FZSaveDateManager.instance.setItemToLocalStorage("GAME_PRICE_PROPORT",this.game_price_proport.toString());
            // 合成软引导
            FZSaveDateManager.instance.setItemToLocalStorage("syntheticSuccess",this.syntheticSoft.toString());
            // 商店软引导
            FZSaveDateManager.instance.setItemToLocalStorage("shopTouch",this.shopSoft.toString());
            // 时间
            FZSaveDateManager.instance.setItemToLocalStorage("noTouchTime",this.noTouchTime.toString());
            // 今日分享的次数(不传服务器)
            FZSaveDateManager.instance.setItemToLocalStorage("todayShareCount",this.todayShareCount.toString());
            // 上次分享的日期
            FZSaveDateManager.instance.setItemToLocalStorage('shareCountDate',this.shareCountDate.toString());
        }

        /**
         * 在游戏中 这段时间需要计算加速状态
         * 这段时间获得的金币
         */
        public getGoldInGame(new_time, time):any 
        {
            var gold =  0;
            for (var key in this.game_speed_list) {
                if (this.game_speed_list[key] != -1) {
                    var count = 0;
                    if (this.game_speed_list[key] > new_time) {
                            // 加速时间未结束
                            count = Math.ceil((new_time - time)/1000); //时间
                    } else {
                        count = Math.ceil((this.game_speed_list[key] - time)/1000); //时间
                        this.game_speed_list[key] = -1;
                    }
                    gold += count * this.getGoldSpeed() * parseInt(key);
                }
            }
            return gold;
        }

        /**
         * 增加今日分享次数
         */
        public addShareCount(){
            this.initShareCount();
            this.todayShareCount ++;
        }
        /**
         * 初始化分享次数
         */
        public initShareCount(){
            let new_date = new Date();
            let date_str = new_date.toLocaleDateString();
            if(!this.shareCountDate)
            {
                this.shareCountDate = FZSaveDateManager.instance.getItemFromLocalStorage("shareCountDate", "");
            }
            
            if(this.shareCountDate != date_str)
            {
                //当日分享0次
                this.todayShareCount = 1;
                this.shareCountDate = date_str;
                FZSaveDateManager.instance.setItemToLocalStorage("shareCountDate", date_str);
            }
        }

        /**
         * 获得今日成功分享次数
         */
        public getShareCount(): number{
            this.initShareCount();
            return this.todayShareCount;
        }

        /**
         * 增加加速时间
         */
        public game_speed_list:any = {};
        addGameSpeedTime(key:number, value:number):void
        {
            var time = new Date().getTime();
            if(this.game_speed_list[key+""] == -1){
                this.game_speed_list[key+""] = time + value*1000; 
            }else {
                this.game_speed_list[key+""] += value*1000; 
            }
            FZDebug.D("增加加速时间--------------------------------------------------- = " + JSON.stringify(this.game_speed_list));
        }

        /**
         * 获得 加速 速率
         */
        public getTempSpeed():any
        {
            var time = new Date().getTime();
            var count = 0;
            for (var key in this.game_speed_list) {
                if (this.game_speed_list[key] > time) {
                    count += parseInt(key);
                }else {
                    this.game_speed_list[key] = -1;
                }
            }
            if (count == 0) 
            {
                this.setTempSpeed(1);
            } else {
                this.setTempSpeed(count);
            }
            return this.game_temp_speed;
         }

         /**
          * 获取加速 剩余时间
          */
         public getTempSpeedTime():any 
         {
            var count = 0;
            var time = new Date().getTime();
            for (var key in this.game_speed_list) {
                if (this.game_speed_list[key] > time) {
                    count = Math.max(count, this.game_speed_list[key] - time);
                }else {
                    this.game_speed_list[key] = -1;
                }
            }
            return count;
         }

         /**
          *  设置 加速 速率
         */
        public setTempSpeed(value) 
        {
            if (this.game_temp_speed != value){
                this.game_temp_speed = value;
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_RESTART_TIMER);
            }
        }
        public coseMoney(mtype:number,count:number):boolean
        {
            if(mtype==FZGameStatus.QMoneyType.Coin)
            {
                return this.coseCoin(count);
            }
            else if(mtype==FZGameStatus.QMoneyType.Diamond)
            {
                return this.coseDiamond(count);
            }
            else if(mtype==FZGameStatus.QMoneyType.Video)
            {
                return true;
            }
        }
        public coseCoin(count: number): boolean
        {
            
            if (!FZUtils.StrJudge(this.game_gold + "", count + ""))
            {
                FZDebug.log("Not enough coin !")
                return false;
            }
            else
            {
                this.SubtractGameGold(count+"")
                return true;
            }
        }

        public coseDiamond(count: number): boolean
        {
            if (this.game_diamond < count)
            {
                FZDebug.log("Not enough diamond !")
                return false;
            }
            else
            {
                this.addGameDiamond(- count);
                return true;
            }
        }
        /**
         * 道具购买记录
         */
        public addItemBuyRecord(value):void
        {
            if (this.buy_item_record.indexOf(value) == -1) {
                this.buy_item_record.push(value);
            }
        }

        /**
         * 道具购买记录 获得
         */
        public getItemBuyRecord(value):any 
        {
            if(this.buy_item_record.indexOf(value) == -1){
                return false
            }
            return true;
        }

        /**
         * 获得免费车辆
         */
        public getRandomCarDate():any 
        {
            var car_data = FZCfgManager.instance.getCarRandom();
            var car_info = car_data[this.CarMaxLevel + ""];
            var data:any = [];
            var count = 0;
            for (var i = 1; i <= 5; i++){
                if (car_info["random_level_0"+i] != -1) {
                    var new_data :any = {};
                    new_data.weight = car_info["random_weight_0"+i];
                    new_data.level = car_info["random_level_0"+i];
                    count += new_data.weight;
                    data.push(new_data);
                }
            }
            var __index = Math.random()* (count-1) + 1;
            var count_new= 0;
            for (var i = 0; i < data.length; i++) {
                count_new += data[i].weight;
                if (__index <= count_new) {
                    return data[i].level;
                }
            }
            return -1;
        }

        getRotaryTableFreeCount(){
            return this.rotary_table_max_count;
        }

        getRotaryTabelResetTime(){
            return this.rotary_table_reset_time;
        }
        
        //合成软引导
        setSyntheticSoft(_any: number){
            this.syntheticSoft = _any
        }

        getSyntheticSoft(): number{
            return this.syntheticSoft;
        }

        //商店软引导
        setShopSoftGuide(_any: number){
            this.shopSoft = _any;
        }

        //商店软引导
        getShopSoftGuide(): number{
            return this.shopSoft;
        }

         /**
         * 未操作时长 （赛车游戏中也视为未操作）
         */
        setBuyGuideTime(_any: number){
            this.noTouchTime+=_any;
        }

        getBuyGuideTime(): number{
            return this.noTouchTime;
        }

        /**
         * 重置时间
         */
        resetBuyGuideTime(){
            this.noTouchTime = 0;
        }

        //计算出俩辆一样的车
        getSameCarInMap(){
            let posIdx = [];
            let onCar  = 0;
            if(this.game_card_slot_data)
            {
                for(let i = 0; i < this.game_card_slot; i++){
                    let obj = this.game_card_slot_data[i+""];
                    if(obj && obj.level)
                    {
                        posIdx.push(obj.level);
                        onCar ++;
                    }
                    else
                    {
                        posIdx.push(0)
                    }
                }
                let canIdx = [];
                posIdx.forEach((element,idx,arr) => {
                    if(element != 0)
                    {
                        for(let i = idx + 1; i < posIdx.length; i ++)
                        {
                            if(element == posIdx[i])
                            {
                                canIdx.push([idx, i]);
                                break;
                            }
                        }
                    }
                });

                return {canIdx: canIdx, onCar: onCar};
            }
            return null;
        }


        /**
         * 获取免费美钞的每次倍数
         */
        public getFreeDollarTimes(count: number): number
        {   
            if(this.freeDollarTimes[count])
            {
                return this.freeDollarTimes[count];
            }
            return this.freeDollarTimes[this.freeDollarTimes.length - 1];
        }


        /**
         * 获取是否第一次回收车辆状态
         */
        public getIsFirstRecycleCarState():number
        {
            return this.is_First_Recycle_Car;
        }

        /**
         * 设置是否第一次回收车辆状态
         */
        public setIsFirstRecycleCarState(value:number):void
        {
            this.is_First_Recycle_Car = value;
            FZSaveDateManager.instance.setItemToLocalStorage("IS_FIRST_RECYCLE_CAR",this.is_First_Recycle_Car.toString());
        }

        /**
         * 获取是否第一次点击转盘抽奖状态
         */
        public getIsFirstClickLuckyState():number
        {
            return this.is_First_Click_Lucky;
        }

        /**
         * 设置是否第一次标记状态
         */
        public setIsFirstClickLuckyState(value:number):void
        {
            this.is_First_Click_Lucky = value;
            FZSaveDateManager.instance.setItemToLocalStorage("IS_FIRST_CLICK_LUCKY",this.is_First_Click_Lucky.toString());
        }

        //设置游戏胜利次数
        public setPlayGameWinTimes():void
        {
            this.play_game_win_times++;
            FZSaveDateManager.instance.setItemToLocalStorage("PLAY_GAME_WIN_TIMES",this.play_game_win_times.toString());
        }

        //获取游戏胜利次数
        public getPlayGameWinTimes():number
        {
            return this.play_game_win_times;
        }
        /**
         * 加载预览子弹
         */
        public DBulletPoolNodeList:any = [];
        public DBulletPoolJSList:any = [];
        public bulletParent:any = [];
        public initBullet(parent){
            this.bulletParent = parent;
            for(var i = 0; i< 50; i++){
                var node = new FZZiDan();
                node.addParent(this.bulletParent);
                this.DBulletPoolNodeList.push(node);
            }
        }
        /**
         * 获得子弹
         */
        public getDBullet():any {
            if (this.DBulletPoolNodeList.length > 0) {
                var node = this.DBulletPoolNodeList.pop();
                this.DBulletPoolJSList.push(node);
                return node
            }else {
                var node1 = new FZZiDan();
                node1.addParent(this.bulletParent);
                this.DBulletPoolJSList.push(node1);
                return node1;
            }
        }
        /**
         * 子弹
         */
        public killDBulletPool(bullet: any) :void 
        {
            bullet.onkill();
            var index = this.DBulletPoolJSList.indexOf(bullet);
            if (index != -1) {
                this.DBulletPoolJSList.splice(index,1);
            }
            this.DBulletPoolNodeList.push(bullet);
        }
        /**
         * 删除
         */
        public removeDBullet():void {
            for (var i = this.DBulletPoolJSList.length - 1; i>=0;i--){
                this.killDBulletPool(this.DBulletPoolJSList[i]);
            }
            this.DBulletPoolJSList = [];
            for (var i = this.DBulletPoolNodeList.length - 1; i >= 0; i--){
                this.DBulletPoolNodeList[i].destroy();
            }
            this.DBulletPoolNodeList = [];
        }




        //--空投----------------------------------------------------------------------------------------------------
        public AirDropList:any = null; //空投数据数组
        public AirDropIsOpen:any = 2; // 空投状态  0 显示未开启 1 显示已开启  2 未显示空投 3 停车位已满 
        public AirDropTime:any = 120;// 空投时间间隔
        public AirDropCountList:any = [9,10]; // 空投数量
        public FreeAirDropOpen:any = 1; // 空投是否免费
        public AirDropCount:any = 60;
        public AirdropPos:any = null;
        public AirDropLevel:any = 15;
        // 加载空投数据
        public initAirDropList(){
            // 处理之前的空投数据
            FZSaveDateManager.instance.setItemToLocalStorage("AIR_DROP_STATE",  "HIDE" );
            this.AirDropList = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateAirDropList",JSON.stringify([]))); 
            this.AirDropIsOpen = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateAirDropIsOpen","2")); 
            this.FreeAirDropOpen = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateFreeAirDropOpen","1")); 
            FZEventManager.instance.register(FZEvent.ON_CREATE_AIRDROP, this.onCreateAirDrop, this);
            this.AirDropCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateAirDropCount","0"));
            this.AirdropPos = JSON.parse(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateAirDropPos",JSON.stringify({x:0, y:0}))); 
            this.AirDropLevel = 15;
            if (this.AirDropCount == 0){
                FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropIsOpen","2"); 
                this.AirDropIsOpen = 2;
            }
        }
        
        /**
         * 创建空投
         */
        public createAirDrop() {
            if (this.judgeCarSlotDataAirdrop() != -1){
                return;
            }
            FZ.BiLog.clickStat(FZ.clickStatEventType.ShowAirDrop,[]);
             // 设置空投状态
            this.setAirDropOpenState(0);
            // 判断当前玩家车辆最高等级 30级之前降落到停车位 30级之后降临到原先的位置
            if(FZMergeDateManager.instance.CarMaxLevel <= FZMergeDateManager.instance.AirDropLevel) {
                // 停车位
                // 1 判断当前车位是否已满
                var index = this.JudgeSolt();
                if (index == -1) {
                    //已满
                    this.setAirDropOpenState(3);
                    FZDebug.D("已满---------------------------");
                }else {
                    var data: any = {};
                    data.level = 1;
                    data.state = 3; // 1 直接显示  0 显示箱子  2 缩小动作 3 空投箱
                    FZMergeDateManager.instance.changeCarSlotData(index, data);
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": index});  //更新车的位置
                    FZDebug.D("空投箱---------------------------");
                }
            }else {
                FZDebug.D("空投箱-------普通--------------------");
                // 普通
                FZEventManager.instance.sendEvent(FZEvent.MAIN_OPEN_AIRDROP);
            }
           
        }
        /**
         * 空投数量 
         */
        public onCalculateAirDropCount(){
            var index = Math.floor(Math.random()*99);
            this.AirDropCount = this.AirDropCountList[0];
            if (index < 50){
                this.AirDropCount = this.AirDropCountList[1];
            }
            FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropCount", this.AirDropCount + "");
        }
        /**
         * 计算 空投数据
         */
        public onCalculateAirDrop() {
            this.AirDropList.length = 0;
            this.onCreateAirdropData(this.AirDropCount);
            FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropList",JSON.stringify(FZMergeDateManager.instance.AirDropList)); 
        }
        /**
         * 更具数据表生成空投数据
         */
        public onCreateAirdropData(AirDropCount){
            this.CarMaxLevel = Math.min(this.CarMaxLevel, 50);
            var dataByCar = FZCfgManager.instance.getCarInfoById(this.CarMaxLevel);
            var getLevelInterval = dataByCar["airdropcar_level"] ? dataByCar["airdropcar_level"] : "1"; // 获得车辆 设置的等级 
            if(dataByCar["airdropcar_level"].indexOf(",") == -1 ) {
                getLevelInterval = Number(dataByCar["airdropcar_level"]) ? dataByCar["airdropcar_level"] : "1"; // 获得车辆 设置的等级 
            }
            var getCarRatio = dataByCar["weight"] ? dataByCar["weight"] : "10" ;  // 获得车辆等级 占比
            if(dataByCar["weight"].indexOf(",") == -1 ) {
                getCarRatio = Number(dataByCar["weight"]) ? dataByCar["weight"] : "10" ;  // 获得车辆等级 占比
            }
            var level_Array :any = []; // 等级
            var Ratio_Array :any = []; // 权重
            level_Array = this.removeErrorData(getLevelInterval.split(','));
            Ratio_Array = this.removeErrorData(getCarRatio.split(','));
            var count = 0;
            for (var i = 0; i < Ratio_Array.length; i++) {
                count += Number(Ratio_Array[i]); 
            }
            for( var j = 0 ; j < AirDropCount ; j++ ){
                var index = Math.round(Math.random() * (count-1) + 1); 
                var clyTotal = 0;
                for( var k = 0 ; k < Ratio_Array.length ; k++ ){ 
                    clyTotal += Number(Ratio_Array[k]); 
                    if( index <= clyTotal ){   
                        var __index = Math.max(Number(level_Array[k]),1);
                        __index = Math.min(Number(level_Array[k]),50);
                        this.AirDropList.push(__index);
                        break;
                    }
                }
            }
        }

        /**
         * 计算停车位上车都不相同
         * value  最低2个值
         */
        public onCalculateAirDropDifferent(value) {
            // var length = value[1].level - value[0].level + 1;
            // this.AirDropList.length = 0;
            // length = Math.min(this.AirDropCount,length);
            // for (var i =0; i < length; i++) {
            //     this.AirDropList.push(value[0].level+i);
            // }
            // if (this.AirDropCount - length > 0){
            //     this.onCreateAirdropData(this.AirDropCount - length);
            // }
            // FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropList",JSON.stringify(FZMergeDateManager.instance.AirDropList)); 
        }
        /**
         * 判断停车位上是否存在空投箱
         */
        public judgeCarSlotDataAirdrop(){
            for(var i = 0; i < 12; i++){
                if(this.game_card_slot_data[i + ""] != null && (this.game_card_slot_data[i + ""].state == 3 || this.game_card_slot_data[i + ""].state == 4)){
                    return i;
                } 
            }
            return -1;
        }
        /*
        * 判断停车位上车辆
        */
       public judgeCarDifferent():any {
            var data = [];
            var count = 0;
            var MaxCount = 11;
            for(var i = 0; i < 12; i++){
                if (this.game_card_slot_data[i + ""] != null && this.game_card_slot_data[i + ""].state != 3 && this.game_card_slot_data[i + ""].state != 4 ){
                        data.push(this.game_card_slot_data[i + ""]);
                        count ++;
                } else {
                    if(this.game_card_slot_data[i + ""] != null && (this.game_card_slot_data[i + ""].state == 3 || this.game_card_slot_data[i + ""].state == 4)){
                            MaxCount = 10;
                    }
                }
            }
            var index = 0;
            data.sort( function(a,b){
                if (a.level > b.level) {
                    return 1
                }else if (a.level == b.level){
                        index = 1;
                        return -1;
                }else {
                        return -1;
                    }
            })
            var flag = false;
            if (count == MaxCount){
                    flag = true;
            }
            if (flag == true && index == 0){
                    var __data = [];
                    if (data.length >= 1) {
                        __data.push(data[0]);
                        return  __data;
                }
            }
            return -1;
       }

        /**
         * 删除错误数据
         */ 
        public removeErrorData(value){
            for (var i = value.length -1; i >= 0; i--){
                if(value[i] == null){
                    value.splice(i,1);
                }
            }
            return value;
        }
        /**
         * 设置空投状态
         * @param value 
         */
        public setAirDropOpenState(value,obj:any = null){
            if (value == 0 || value == 1 || value == 2 || value ==3){
                if (value == 1){
                    this.AirdropPos = {x: obj.x , y: obj.y};
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropPos",JSON.stringify(this.AirdropPos)); 
                    this.onCalculateAirDrop();
                }
                this.AirDropIsOpen = value;
                FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropIsOpen",this.AirDropIsOpen + "");
                if (value == 0){
                    // 空投数据
                    this.onCalculateAirDropCount();
                }
            }
        }

        /**
         * 定时器
         */
        public initAirDropTime(){
            if (this.AirDropIsOpen != 2) {
                return;
            }
            var time = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("QMergeDateAirDropTime", this.AirDropTime + ""));
            if (time == 0){
                this.createAirDrop();
                return;
            }
            var that = this;
            var loopAirdropTime = function(){
                time = time - 1;
                // FZDebug.D("空投定时器 ----------" + time);
                if (time > 0){
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropTime",time + "");
                }else 
                {
                    Laya.timer.clear(that,loopAirdropTime);
                    that.createAirDrop();
                    FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropTime", that.AirDropTime + "");
                }
            }
            loopAirdropTime();
            Laya.timer.loop(1000, this, loopAirdropTime);
        }

        /**
         * 获得空投等级
         */
        public getAirDropLevel():any{
            if (FZMergeDateManager.instance.AirDropList.length > 0){
                var list = this.judgeCarDifferent()
                var level = FZMergeDateManager.instance.AirDropList[0];
                if (list != -1) {
                    level = list[0].level;
                }
                FZMergeDateManager.instance.AirDropList.splice(0,1);
                this.AirDropCount = FZMergeDateManager.instance.AirDropList.length;
                FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropCount", this.AirDropCount + "");
                FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateAirDropList",JSON.stringify(FZMergeDateManager.instance.AirDropList)); 
                return level;
            }
            return -1;
        }

        /**
         * 设置空投免费
         */
        public setFreeAirDropOpen(){
            FZSaveDateManager.instance.setItemToLocalStorage("QMergeDateFreeAirDropOpen","0"); 
            this.FreeAirDropOpen = 0;
        }
        
        public onCreateAirDrop(){
            // 空投状态  0 显示未开启 1 显示已开启  2 未显示空投 3 停车位已满 
            if (FZMergeDateManager.instance.AirDropIsOpen != 1) {
                FZDebug.D("空投未开启-----------------");
                
                if(FZMergeDateManager.instance.AirDropIsOpen == 3){
                    FZDebug.D("停车位已满 空投未开启-----------------");
                    // 未开启
                    this.createAirDrop();
                }
                return;
            }
            var _index = FZMergeDateManager.instance.JudgeSolt();
            if (_index != -1){
                var level = FZMergeDateManager.instance.getAirDropLevel();
                if (level != -1){
                    var data_1: any = {};
                    data_1.level = level;
                    data_1.state = 5; // 1 直接显示  0 显示箱子  2 缩小动作 3 空投箱 4空投箱降落 5 空投移动车辆
                    FZMergeDateManager.instance.changeCarSlotData(_index, data_1);
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": _index, pos: this.AirdropPos});  //更新车的位置

                    FZEventManager.instance.sendEvent(FZEvent.UPDATE_AIRDROP_RED_NUM);
                    if (FZMergeDateManager.instance.AirDropList.length > 0){
                        Laya.timer.once(200, this, this.onCreateAirDrop);
                    }else {
                        FZDebug.D("删除数据-----------------------------------------------------");
                        // 删除数据
                        // 普通
                        FZEventManager.instance.sendEvent(FZEvent.CLOSE_AIRDROP);
                        var car_slot_index = this.judgeCarSlotDataAirdrop();
                        FZMergeDateManager.instance.changeCarSlotData(car_slot_index, null);
                        FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": car_slot_index});
                        if(this.AirDropIsOpen == 1){
                            this.setAirDropOpenState(2);
                            this.initAirDropTime();
                        }
                    }
                } 
            }
        }

        //--空投----------------------------------------------------------------------------------------------------
    }
}
export default game.data.FZMergeDateManager;
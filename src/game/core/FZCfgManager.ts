
import Handler = Laya.Handler;
import FZEventManager from "../../framework/FZEventManager";
import FZGameStatus from "../data/FZGameStatus";
import FZEvent from "../data/FZEvent";
import FZHttps from "../../framework/FZHttps";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
import FZUtils from "../../framework/FZUtils";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZAdManager from "./FZAdManager";
import FZWechat from "./FZWechat";
import FZMergeDateManager from "../data/FZMergeDateManager";
// import QTcpMgr from "./QTcpMgr"

/**
 * 配置列表
 * wangwanchao
 */
namespace game.core
{
    export class FZCfgManager
    {
        private constructor() { }

        private static _instance: FZCfgManager;
        public static get instance(): FZCfgManager
        {
            if (this._instance == null)
            {
                this._instance = new FZCfgManager();
            }
            return this._instance;
        }

        public dicConfig = {};
        public httpShareCfg: boolean = false;
        /**
         * 加载所有配置文件
         */
        public loadAllCfg(): void
        {
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.GameConfig), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.GameConfig]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.JCDL), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.JCDL]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.UserLevel), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.UserLevel]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.CheckPoint), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.CheckPoint]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.BuyCarLevelUp), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.BuyCarLevelUp]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.Weapons), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.Weapons]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.DeputyWeapon), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.DeputyWeapon]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.UAVWeapon), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.UAVWeapon]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.SignIn), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.SignIn]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.LuckyRotaryTable), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.LuckyRotaryTable]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.ShareCfg), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.ShareCfg]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(FZGameStatus.QCfgType.BossCfg), Handler.create(this, this.getLocalConfigDone, [FZGameStatus.QCfgType.BossCfg]), null, Laya.Loader.BUFFER,0,true);
           
        }

        private loadCfgType : number = 0;
        /**
         * 判断JSON 文件是否加载完成
         * @param cfgType 
         */
        private isCfgLoadFinished(cfgType)
        {
            //let finished = (this.loadCfgType & cfgType) != 0;
            let finished = !!this.dicConfig[cfgType];
            return finished;
        }
        /*
        * 加载JSON成功回调
        */ 
        private getLocalConfigDone(cfgType: number)
        {
            // if (cfgType == FZGameStatus.QCfgType.ShareCfg && this.httpShareCfg) {
            //     return;
            // }
            let buffer = Laya.loader.getRes(this.getCfgPathByType(cfgType)) as Laya.Buffer;
            let bytes = new Laya.Byte(buffer);
            let jsonStr = bytes.readUTFBytes(bytes.length);
            this.dicConfig[cfgType] = JSON.parse(jsonStr);
            // FZDebug.log("getLocalConfigDone: " + FZGameStatus.QCfgName[cfgType]);

            this.doCfgLoadFinish(cfgType);
        }
        /*
        * 加载网络JSON成功回调
        */ 
        private getOnlineConfigDone(result): void
        {
            if (result.state == 200)
            {
                let config = JSON.parse(result.data);
                
                let cfgType = result.args;
                this.dicConfig[cfgType] = config;

                this.doCfgLoadFinish(cfgType);
            }
            else
            {
                Laya.timer.once(3000, this, this.loadAllCfg);
                FZDebug.log("getOnlineConfigDone Failed: " + result.msg);
            }
        }
        /**
         * 加载JSON完成后 发出加载JSON完成事件
         * @param cfgType 
         */
        private doCfgLoadFinish(cfgType : number) : void
        {
            if(cfgType == FZGameStatus.QCfgType.JCDL)
            {
                FZEventManager.instance.sendEvent(FZEvent.GET_JCDL_CONFIG_SUCCESS);
            }

            if (cfgType == FZGameStatus.QCfgType.UAVWeapon) {
                this.setUAVWeaponLocalData();
            }

            this.loadCfgType |= cfgType;

            if(this.isCfgLoadFinished(FZGameStatus.QCfgType.GameConfig)
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.JCDL) && this.isCfgLoadFinished(FZGameStatus.QCfgType.UserLevel)
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.CheckPoint) && this.isCfgLoadFinished(FZGameStatus.QCfgType.BuyCarLevelUp) 
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.Weapons) && this.isCfgLoadFinished(FZGameStatus.QCfgType.DeputyWeapon)
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.UAVWeapon) && this.isCfgLoadFinished(FZGameStatus.QCfgType.SignIn)
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.LuckyRotaryTable) && this.isCfgLoadFinished(FZGameStatus.QCfgType.ShareCfg) 
                && this.isCfgLoadFinished(FZGameStatus.QCfgType.BossCfg))
            {
                this.loadCfgType = 0;
                FZDebug.log("FZGameData.initData() after config file load done! deviceId");
                tywx.BiLog.clickStat(tywx.clickStatEventType.onloadCfg,[]);
                this.onloadConfig();
                FZGameData.instance.initData();
                FZEventManager.instance.sendEvent(FZEvent.RES_LOAD_FINISHED, FZGameStatus.QResType.Config);
                tywx.BiLog.clickStat(tywx.clickStatEventType.loadingSuccess,[]);
            }
        }
        /**
         * 加载完本地数据
         */
        public onloadConfig(){
            if(!Laya.Browser.onMiniGame) return;
            // CDN 下载 shareCfg(分享)配置
            var time = new Date().getTime();
            let path = "https://myqn.nalrer.cn/Moyu/quanmzc/game_config/shareCfg";
            let params = {url: FZDebug.isDebug ? (path+"_debug.json") : (path+".json")}
            params.url = params.url + "?" + time + "";
            tywx.HttpUtil.httpGet(params,this.getShareCfgSuccess,this.getShareCfgFail);

            // CDN 下载 交叉倒流(Banner)配置
            let pathToB = "https://myqn.nalrer.cn/Moyu/quanmzc/game_config/jcdl_config";
            let paramsToB = {url: FZDebug.isDebug ? (pathToB+"_debug.json") : (pathToB+".json")}
            var timeToB = new Date().getTime();
            paramsToB.url = paramsToB.url + "?" + timeToB + "";
            tywx.HttpUtil.httpGet(paramsToB,this.getJcdlSuccess,this.getShareCfgFail);
        }
        
        // 获取 交叉倒流(Banner) cdn 配置成功
        getJcdlSuccess(param){
            FZCfgManager.instance.setOneDicConfigToJCDL(FZGameStatus.QCfgType.JCDL, param);
            FZDebug.D("交叉导流配置文件-----------------" + JSON.stringify(param));
        }

        getShareCfgSuccess(e){
            FZCfgManager.instance.setOneDicConfig(FZGameStatus.QCfgType.ShareCfg, e);
            FZDebug.D("配置文件-----------------" + JSON.stringify(e));
            if (e.AirDropTime) {
                FZMergeDateManager.instance.AirDropTime = e.AirDropTime;
            }
            tywx.UserInfo.shieldCityShareTip = e.shieldCityShareTip;
            FZWechat.instance.BannerRefreshCount = e.BannerRefreshCount;
            FZGameData.instance.InterstitialAdCountMAX = e.InterstitialAdCount;
            // :FZAdManager
            FZAdManager.instance.BANNER_GAME_VIDEO_ID =  e.banner_id;
            FZAdManager.instance.AD_VIDEO_ID = e.video_id;
            // FZCfgManager.instance.httpShareCfg = true;
            FZEventManager.instance.sendEvent(FZEvent.UPDATE_SHARE_CONFIG);
        }

        getShareCfgFail(e){
            if(e.state){
                
            }
        }

        setOneDicConfig(cfgType: number, config: any) {
            this.dicConfig[cfgType] = config;
            FZDebug.D("设置分享数据-----------" + JSON.stringify(this.dicConfig[cfgType]));
        }

        setOneDicConfigToJCDL(cfgType: number, config: any) {
            this.dicConfig[cfgType] = config;
            FZDebug.D("设置 交叉倒流数据-----------" + JSON.stringify(this.dicConfig[cfgType]));
        }

        setUAVWeaponLocalData(){
            if (!FZGameData.instance.getUAVData()) {
                let UAVWeaponData = {};
                let UAVCfg = this.dicConfig[FZGameStatus.QCfgType.UAVWeapon];
                for (let i in UAVCfg) {
                    UAVWeaponData[i] = 1;
                }
                FZGameData.instance.setUAVData(UAVWeaponData);
            }
        }

        private configPathPrefix: string = "res/config/";
        /**
         * 获取本地JSON 路径
         * @param type 
         */
        private getCfgPathByType(type: number): string
        {
            
            let path = Laya.Browser.onMiniGame ? (Laya.Browser.window.wx.env.USER_DATA_PATH+"/v" + tywx.SystemInfo.version + "/"+ this.configPathPrefix) : this.configPathPrefix;
            return (path + FZGameStatus.QCfgName[type] + ".json");
        }
        private configCdnPathPrefix: string = FZGameStatus.DownloadUrl + "res/config/";
        /**
         * 获取CDN本地JSON 路径
         * @param type 
         */
        private getCdnCfgPathByType(type: number): string
        {
            return (this.configCdnPathPrefix + FZGameStatus.QCfgName[type] + ".json");
        }

        /**
         * 根据ID 获得车辆信息 
         * @param id 
         */
        public getCarInfoById(id: number): any
        {
            if (id == null){
                id = 1;
            }
            id = Math.max(id, 1);
            id = Math.min(id, 50);
            let carCfg = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["carCfg"];
            if (!FZUtils.isNullOrEmpty(carCfg[id + ""])) {
                return carCfg[id + ""];
            }
            return null;
        }
        // 汽车列表
        // private listRoadsideCarList: any[];
        /**
         * 获取汽车列表
         */
        public getRoadsideCarList(): any[]
        {
            let carCfg = this.dicConfig[FZGameStatus.QCfgType.GameConfig].carCfg;
            return carCfg;
        }

        /**
         * 获取分享相关
         */
        public getShareCfg(): any[]
        {
            let shareCfg = this.dicConfig[FZGameStatus.QCfgType.ShareCfg];
            return shareCfg;
        }

        /**
         * 获取购买汽车免费升级配置
         */
        public getFreeCarsLevelUpConf(): any[]
        {
            let freeCarCfg = this.dicConfig[FZGameStatus.QCfgType.BuyCarLevelUp];
            return freeCarCfg;
        }

        /**
         * 获得商店道具
         */
        public getShopItem():any 
        {
            let data = this.dicConfig[FZGameStatus.QCfgType.GameConfig].shopItem;
            return data;
        }

        /**
         * 获取当前经验的等级
         */
        public getLvByExp(exp): any{
            let lv = 0;
            let residualExp = exp;
            let lvInfo = this.dicConfig[FZGameStatus.QCfgType.UserLevel].userLvInfo;
            for (let key = 0; key < lvInfo.length; key++) {
                const element = lvInfo[key];
                if(residualExp - element.level_up_exp < 0 || key == lvInfo.length - 1){
                    lv = element.user_level;
                    return {info: element, exp: residualExp};
                }
                residualExp = residualExp - element.level_up_exp;
            }
            FZDebug.logError('userLevelInfo-----Err');
        }

        /**
         * 根据等级 获得数据
         */
        public getLevelInfo(level):any {
            let lvInfo = this.dicConfig[FZGameStatus.QCfgType.UserLevel].userLvInfo;
            if (!FZUtils.isNullOrEmpty(lvInfo[level-1])) {
                return lvInfo[level-1];
            }
            return null;
        }

        /**
         * 离线数据
         */
        public getOffLine():any {
            var offline = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["offLine"];
            return offline;
        }
        /**
         * 离线时间多长时间 弹弹窗
         */
        public getOffLineTime():any {
            var offline = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["offLineTime"];
            return offline;
        }
        /**
         * 离线计算的最大时间
         */
        public getOffLineMaxTime():any {
            var offLineMaxTime = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["offLineMaxTime"];
            return offLineMaxTime;
        }
        /**
         * 离线收益最长时间
         */
        public getOffLineEarningsTime():any {
            var offline = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["offLine"];
            var count = 0;
            for (var key in offline) 
            {
                count = Math.max(offline[key].max_time, count); 
            }
            return count;
        }
        /**
         * 获得空投车数据
         */
        public getCarRandom():any {
            var data = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["carRandom"];
            if (!FZUtils.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 

        /**
         * 获得 空投 配置信息
         * @param openLevel 开启等级 
         * @param carNum    包含车数量
         * @param waitTime  隐藏时间([0]正常时间 [1]金额不足) 
         */
        public getAirDropData():any {
            var data = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["airDrop"];
            if (!FZUtils.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 

        /**
         *    获取 副武器 阶级状态的等级数组 ( 1 , 21 , 41 , 61 , 81 )
         */
        public getViceWeaponLevelArr():any {
            var data = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["viceWeaponIndex"];
            if (!FZUtils.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 

        /**
         *    获取 主武器 阶级状态的等级数组 ( 5 为一等级 )
         */
        public getMainWeaponLevelArea():any {
            var data = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["mainWeaponIndex"];
            if (!FZUtils.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 
        
        
        /**
         * 获取在线宝箱的时间配置
         */
        public getOnlineGiftTime():any {
            var data = this.dicConfig[FZGameStatus.QCfgType.GameConfig]["onlineGiftTime"];
            if (!FZUtils.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 
        
        /**
         * 获得关卡信息
         */
        public getCheckPoint(level:number) {
            var data = this.dicConfig[FZGameStatus.QCfgType.CheckPoint]["" + level];
            return data;
        }
        /**
         * 获得主武器基础伤害值
         */
        public getBaseMainWeapons(){
            var data = this.dicConfig[FZGameStatus.QCfgType.Weapons]["baseMainWeapons"];
            return data;
        }
        /**
         * 获得主武器
         */
        public getMainWeapons(id: number){
            // FZDebug.D("获得主武器-----------" + JSON.stringify(this.dicConfig[FZGameStatus.QCfgType.Weapons]));
            var data = this.dicConfig[FZGameStatus.QCfgType.Weapons]["mainWeapons"]["" + id];
            return data;
        }
        /**
         * 获得副武器
         */
        public getDeputyWeapons(id: number){
            // FZDebug.D("获得副武器-----------" + JSON.stringify(this.dicConfig[FZGameStatus.QCfgType.DeputyWeapons]));
            var data = this.dicConfig[FZGameStatus.QCfgType.DeputyWeapon]["" + id];
            return data;
        }
        public getUAVWeaponsCfg(){
            // FZDebug.D("获得无人机-----------" + JSON.stringify(this.dicConfig[FZGameStatus.QCfgType.UAVWeapons]));
            return this.dicConfig[FZGameStatus.QCfgType.UAVWeapon];
        }
        /**
         * 获得无人机通过ID
         */
        public getUAVWeaponsById(id: number){
            // FZDebug.D("获得无人机-----------" + JSON.stringify(this.dicConfig[FZGameStatus.QCfgType.UAVWeapons]));
            var data = this.dicConfig[FZGameStatus.QCfgType.UAVWeapon]["" + id];
            return data;
        }
        /**
         * 获得签到表单
         */
        public getSiginCfg(){
            return this.dicConfig[FZGameStatus.QCfgType.SignIn];
        }
        /**
         * 获得转盘信息
         */
        public getRotaryTableCof(){
            return this.dicConfig[FZGameStatus.QCfgType.LuckyRotaryTable];
        }

        /**
         * 获得子弹数据
         */
        public getBulletList(id:number):any {
            return this.dicConfig[FZGameStatus.QCfgType.GameConfig].bulletConfig["" + id];
        }

        /**
         * 获取道具数据
         */
        public getitemConfig():any
        {
            return this.dicConfig[FZGameStatus.QCfgType.GameConfig].itemConfig;
        }

        /**
         * 获取敌人数据
         */
        public getEnemyConfig():any
        {
            return this.dicConfig[FZGameStatus.QCfgType.GameConfig].EnemyConfig;
        }

        /**
         * 获取BOSS数据
         */
        public getBossConfig():any
        {
            return this.dicConfig[FZGameStatus.QCfgType.BossCfg].BossConfig;
        }
        /**
         * 获得 BOSS 技能数据
         */
        public getBossSkill():any 
        {
            return this.dicConfig[FZGameStatus.QCfgType.BossCfg].BossSkill;
        }
        
    }
}

export default game.core.FZCfgManager;
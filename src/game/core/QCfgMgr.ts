
import Handler = Laya.Handler;
import QEventMgr from "../../framework/QEventMgr";
import QGameConst from "../data/QGameConst";
import QEventType from "../data/QEventType";
import QHttp from "../../framework/QHttp";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QUtil from "../../framework/QUtil";
import QSavedDateItem from "../data/QSavedDateItem";
import QAdManager from "./QAdManager";
import QWxSDK from "./QWxSDK";
import QMergeData from "../data/QMergeData";
// import QTcpMgr from "./QTcpMgr"

/**
 * 配置列表
 * wangwanchao
 */
namespace game.core
{
    export class QCfgMgr
    {
        private constructor() { }

        private static _instance: QCfgMgr;
        public static get instance(): QCfgMgr
        {
            if (this._instance == null)
            {
                this._instance = new QCfgMgr();
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
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.GameConfig), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.GameConfig]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.JCDL), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.JCDL]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.UserLevel), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.UserLevel]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.CheckPoint), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.CheckPoint]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.BuyCarLevelUp), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.BuyCarLevelUp]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.Weapons), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.Weapons]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.DeputyWeapon), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.DeputyWeapon]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.UAVWeapon), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.UAVWeapon]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.SignIn), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.SignIn]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.LuckyRotaryTable), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.LuckyRotaryTable]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.ShareCfg), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.ShareCfg]), null, Laya.Loader.BUFFER,0,true);
            Laya.loader.load(this.getCfgPathByType(QGameConst.QCfgType.BossCfg), Handler.create(this, this.getLocalConfigDone, [QGameConst.QCfgType.BossCfg]), null, Laya.Loader.BUFFER,0,true);
           
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
            // if (cfgType == QGameConst.QCfgType.ShareCfg && this.httpShareCfg) {
            //     return;
            // }
            let buffer = Laya.loader.getRes(this.getCfgPathByType(cfgType)) as Laya.Buffer;
            let bytes = new Laya.Byte(buffer);
            let jsonStr = bytes.readUTFBytes(bytes.length);
            this.dicConfig[cfgType] = JSON.parse(jsonStr);
            // QDebug.log("getLocalConfigDone: " + QGameConst.QCfgName[cfgType]);

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
                QDebug.log("getOnlineConfigDone Failed: " + result.msg);
            }
        }
        /**
         * 加载JSON完成后 发出加载JSON完成事件
         * @param cfgType 
         */
        private doCfgLoadFinish(cfgType : number) : void
        {
            if(cfgType == QGameConst.QCfgType.JCDL)
            {
                QEventMgr.instance.sendEvent(QEventType.GET_JCDL_CONFIG_SUCCESS);
            }

            if (cfgType == QGameConst.QCfgType.UAVWeapon) {
                this.setUAVWeaponLocalData();
            }

            this.loadCfgType |= cfgType;

            if(this.isCfgLoadFinished(QGameConst.QCfgType.GameConfig)
                && this.isCfgLoadFinished(QGameConst.QCfgType.JCDL) && this.isCfgLoadFinished(QGameConst.QCfgType.UserLevel)
                && this.isCfgLoadFinished(QGameConst.QCfgType.CheckPoint) && this.isCfgLoadFinished(QGameConst.QCfgType.BuyCarLevelUp) 
                && this.isCfgLoadFinished(QGameConst.QCfgType.Weapons) && this.isCfgLoadFinished(QGameConst.QCfgType.DeputyWeapon)
                && this.isCfgLoadFinished(QGameConst.QCfgType.UAVWeapon) && this.isCfgLoadFinished(QGameConst.QCfgType.SignIn)
                && this.isCfgLoadFinished(QGameConst.QCfgType.LuckyRotaryTable) && this.isCfgLoadFinished(QGameConst.QCfgType.ShareCfg) 
                && this.isCfgLoadFinished(QGameConst.QCfgType.BossCfg))
            {
                this.loadCfgType = 0;
                QDebug.log("QGameData.initData() after config file load done! deviceId");
                tywx.BiLog.clickStat(tywx.clickStatEventType.onloadCfg,[]);
                this.onloadConfig();
                QGameData.instance.initData();
                QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Config);
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
            let params = {url: QDebug.isDebug ? (path+"_debug.json") : (path+".json")}
            params.url = params.url + "?" + time + "";
            tywx.HttpUtil.httpGet(params,this.getShareCfgSuccess,this.getShareCfgFail);

            // CDN 下载 交叉倒流(Banner)配置
            let pathToB = "https://myqn.nalrer.cn/Moyu/quanmzc/game_config/jcdl_config";
            let paramsToB = {url: QDebug.isDebug ? (pathToB+"_debug.json") : (pathToB+".json")}
            var timeToB = new Date().getTime();
            paramsToB.url = paramsToB.url + "?" + timeToB + "";
            tywx.HttpUtil.httpGet(paramsToB,this.getJcdlSuccess,this.getShareCfgFail);
        }
        
        // 获取 交叉倒流(Banner) cdn 配置成功
        getJcdlSuccess(param){
            QCfgMgr.instance.setOneDicConfigToJCDL(QGameConst.QCfgType.JCDL, param);
            QDebug.D("交叉导流配置文件-----------------" + JSON.stringify(param));
        }

        getShareCfgSuccess(e){
            QCfgMgr.instance.setOneDicConfig(QGameConst.QCfgType.ShareCfg, e);
            QDebug.D("配置文件-----------------" + JSON.stringify(e));
            if (e.AirDropTime) {
                QMergeData.instance.AirDropTime = e.AirDropTime;
            }
            tywx.UserInfo.shieldCityShareTip = e.shieldCityShareTip;
            QWxSDK.instance.BannerRefreshCount = e.BannerRefreshCount;
            QGameData.instance.InterstitialAdCountMAX = e.InterstitialAdCount;
            // :QAdManager
            QAdManager.instance.BANNER_GAME_VIDEO_ID =  e.banner_id;
            QAdManager.instance.AD_VIDEO_ID = e.video_id;
            // QCfgMgr.instance.httpShareCfg = true;
            QEventMgr.instance.sendEvent(QEventType.UPDATE_SHARE_CONFIG);
        }

        getShareCfgFail(e){
            if(e.state){
                
            }
        }

        setOneDicConfig(cfgType: number, config: any) {
            this.dicConfig[cfgType] = config;
            QDebug.D("设置分享数据-----------" + JSON.stringify(this.dicConfig[cfgType]));
        }

        setOneDicConfigToJCDL(cfgType: number, config: any) {
            this.dicConfig[cfgType] = config;
            QDebug.D("设置 交叉倒流数据-----------" + JSON.stringify(this.dicConfig[cfgType]));
        }

        setUAVWeaponLocalData(){
            if (!QGameData.instance.getUAVData()) {
                let UAVWeaponData = {};
                let UAVCfg = this.dicConfig[QGameConst.QCfgType.UAVWeapon];
                for (let i in UAVCfg) {
                    UAVWeaponData[i] = 1;
                }
                QGameData.instance.setUAVData(UAVWeaponData);
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
            return (path + QGameConst.QCfgName[type] + ".json");
        }
        private configCdnPathPrefix: string = QGameConst.DownloadUrl + "res/config/";
        /**
         * 获取CDN本地JSON 路径
         * @param type 
         */
        private getCdnCfgPathByType(type: number): string
        {
            return (this.configCdnPathPrefix + QGameConst.QCfgName[type] + ".json");
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
            let carCfg = this.dicConfig[QGameConst.QCfgType.GameConfig]["carCfg"];
            if (!QUtil.isNullOrEmpty(carCfg[id + ""])) {
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
            let carCfg = this.dicConfig[QGameConst.QCfgType.GameConfig].carCfg;
            return carCfg;
        }

        /**
         * 获取分享相关
         */
        public getShareCfg(): any[]
        {
            let shareCfg = this.dicConfig[QGameConst.QCfgType.ShareCfg];
            return shareCfg;
        }

        /**
         * 获取购买汽车免费升级配置
         */
        public getFreeCarsLevelUpConf(): any[]
        {
            let freeCarCfg = this.dicConfig[QGameConst.QCfgType.BuyCarLevelUp];
            return freeCarCfg;
        }

        /**
         * 获得商店道具
         */
        public getShopItem():any 
        {
            let data = this.dicConfig[QGameConst.QCfgType.GameConfig].shopItem;
            return data;
        }

        /**
         * 获取当前经验的等级
         */
        public getLvByExp(exp): any{
            let lv = 0;
            let residualExp = exp;
            let lvInfo = this.dicConfig[QGameConst.QCfgType.UserLevel].userLvInfo;
            for (let key = 0; key < lvInfo.length; key++) {
                const element = lvInfo[key];
                if(residualExp - element.level_up_exp < 0 || key == lvInfo.length - 1){
                    lv = element.user_level;
                    return {info: element, exp: residualExp};
                }
                residualExp = residualExp - element.level_up_exp;
            }
            QDebug.logError('userLevelInfo-----Err');
        }

        /**
         * 根据等级 获得数据
         */
        public getLevelInfo(level):any {
            let lvInfo = this.dicConfig[QGameConst.QCfgType.UserLevel].userLvInfo;
            if (!QUtil.isNullOrEmpty(lvInfo[level-1])) {
                return lvInfo[level-1];
            }
            return null;
        }

        /**
         * 离线数据
         */
        public getOffLine():any {
            var offline = this.dicConfig[QGameConst.QCfgType.GameConfig]["offLine"];
            return offline;
        }
        /**
         * 离线时间多长时间 弹弹窗
         */
        public getOffLineTime():any {
            var offline = this.dicConfig[QGameConst.QCfgType.GameConfig]["offLineTime"];
            return offline;
        }
        /**
         * 离线计算的最大时间
         */
        public getOffLineMaxTime():any {
            var offLineMaxTime = this.dicConfig[QGameConst.QCfgType.GameConfig]["offLineMaxTime"];
            return offLineMaxTime;
        }
        /**
         * 离线收益最长时间
         */
        public getOffLineEarningsTime():any {
            var offline = this.dicConfig[QGameConst.QCfgType.GameConfig]["offLine"];
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
            var data = this.dicConfig[QGameConst.QCfgType.GameConfig]["carRandom"];
            if (!QUtil.isNullOrEmpty(data)){
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
            var data = this.dicConfig[QGameConst.QCfgType.GameConfig]["airDrop"];
            if (!QUtil.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 

        /**
         *    获取 副武器 阶级状态的等级数组 ( 1 , 21 , 41 , 61 , 81 )
         */
        public getViceWeaponLevelArr():any {
            var data = this.dicConfig[QGameConst.QCfgType.GameConfig]["viceWeaponIndex"];
            if (!QUtil.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 

        /**
         *    获取 主武器 阶级状态的等级数组 ( 5 为一等级 )
         */
        public getMainWeaponLevelArea():any {
            var data = this.dicConfig[QGameConst.QCfgType.GameConfig]["mainWeaponIndex"];
            if (!QUtil.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 
        
        
        /**
         * 获取在线宝箱的时间配置
         */
        public getOnlineGiftTime():any {
            var data = this.dicConfig[QGameConst.QCfgType.GameConfig]["onlineGiftTime"];
            if (!QUtil.isNullOrEmpty(data)){
                return data;
            }
            return -1;
        } 
        
        /**
         * 获得关卡信息
         */
        public getCheckPoint(level:number) {
            var data = this.dicConfig[QGameConst.QCfgType.CheckPoint]["" + level];
            return data;
        }
        /**
         * 获得主武器基础伤害值
         */
        public getBaseMainWeapons(){
            var data = this.dicConfig[QGameConst.QCfgType.Weapons]["baseMainWeapons"];
            return data;
        }
        /**
         * 获得主武器
         */
        public getMainWeapons(id: number){
            // QDebug.D("获得主武器-----------" + JSON.stringify(this.dicConfig[QGameConst.QCfgType.Weapons]));
            var data = this.dicConfig[QGameConst.QCfgType.Weapons]["mainWeapons"]["" + id];
            return data;
        }
        /**
         * 获得副武器
         */
        public getDeputyWeapons(id: number){
            // QDebug.D("获得副武器-----------" + JSON.stringify(this.dicConfig[QGameConst.QCfgType.DeputyWeapons]));
            var data = this.dicConfig[QGameConst.QCfgType.DeputyWeapon]["" + id];
            return data;
        }
        public getUAVWeaponsCfg(){
            // QDebug.D("获得无人机-----------" + JSON.stringify(this.dicConfig[QGameConst.QCfgType.UAVWeapons]));
            return this.dicConfig[QGameConst.QCfgType.UAVWeapon];
        }
        /**
         * 获得无人机通过ID
         */
        public getUAVWeaponsById(id: number){
            // QDebug.D("获得无人机-----------" + JSON.stringify(this.dicConfig[QGameConst.QCfgType.UAVWeapons]));
            var data = this.dicConfig[QGameConst.QCfgType.UAVWeapon]["" + id];
            return data;
        }
        /**
         * 获得签到表单
         */
        public getSiginCfg(){
            return this.dicConfig[QGameConst.QCfgType.SignIn];
        }
        /**
         * 获得转盘信息
         */
        public getRotaryTableCof(){
            return this.dicConfig[QGameConst.QCfgType.LuckyRotaryTable];
        }

        /**
         * 获得子弹数据
         */
        public getBulletList(id:number):any {
            return this.dicConfig[QGameConst.QCfgType.GameConfig].bulletConfig["" + id];
        }

        /**
         * 获取道具数据
         */
        public getitemConfig():any
        {
            return this.dicConfig[QGameConst.QCfgType.GameConfig].itemConfig;
        }

        /**
         * 获取敌人数据
         */
        public getEnemyConfig():any
        {
            return this.dicConfig[QGameConst.QCfgType.GameConfig].EnemyConfig;
        }

        /**
         * 获取BOSS数据
         */
        public getBossConfig():any
        {
            return this.dicConfig[QGameConst.QCfgType.BossCfg].BossConfig;
        }
        /**
         * 获得 BOSS 技能数据
         */
        public getBossSkill():any 
        {
            return this.dicConfig[QGameConst.QCfgType.BossCfg].BossSkill;
        }
        
    }
}

export default game.core.QCfgMgr;

declare module FZ
{
    class HttpUtil
    {
        static httpPost (cfgObj: Object): void;
        static httpGet (cfgObj: Object, successcb: Function, failcb: Function): void;
    }
    class wxFileUtil
    {
        static downloadFile (url:string,sucCallback: any,failCallback: any):any;
        static getCacheFilePath():string;
        static readFile(url:string,sucCallback: any,failCallback: any):void;
    }
    class Util
    {

        static setItemToLocalStorage(keyStr : string, ValueStr: string) : void;
    }

    class BiLog 
    {
        /**
        * 打点接口
        * @param eventId      打点事件
        * @param ParamsList   额外参数,最多10位,参见bi组文档说明
        */
        static clickStat(eventId : number,paramList : any[]):void
        static clickStatEventType : any;
        static device_id:number;
    }

    class clickStatEventType
    {
        /**
         * 用户分享
         */
        static clickStatEventTypeUserShare : number;  
        /**
         * 点击icon,直接拉进小游戏成功（点击确认）
         */
        static clickStatEventTypeClickDirectToMiniGameSuccess : number;
        /**
         * 点击icon,直接拉进小游戏失败（点击取消）
         */
        static clickStatEventTypeClickDirectToMiniGameFail : number;
        /**
         * 展示分流倒量的二维码
         */
        static clickStatEventTypeClickShowQRCode : number;
        static unlockingUav  : number; // 解锁无人机
        static clickTheSelectionOfUav  : number; // 机枪无人机选择按钮点击
        static clickTheMissileUavSelection  : number;  // 导弹无人机选择按钮点击
        static clickTheFrisbeeDroneSelection  : number;// 飞盘无人机选择按钮点击
        static clickTheTrackingDroneSelection  : number;   // 追踪弹无人机选择按钮点击
        static unlockingSecondaryWeapon  : number; // 解锁副武器
        static secondaryWeaponUpgradeLevel  : number;  // 副武器升级等级                    00
        static modifyTheNickname  : number;    // 修改昵称
        static copyTheNickname  : number;  // 复制昵称                                     00
        static goToTheAutoRacingInterface  : number;   // 进去选择赛车界面
        static clickTheSelectInRacingInterface  : number;  // 赛车界面点击选择按钮
        static clickThePrivilegeTAB  : number; // 点击特权标签
        static buyingPrivileges  : number; // 购买特权
        static clickOnTheEmptyBag  : number;   // 点击空头包
        static clickOnTheDiamondGetDropBag  : number;  // 点击钻石获得空投包
        static shareVideoGetAirdropPackage  : number;  // 点击视频/分享获得空投包
        static successfullyObtained4AirdropPackages  : number; // 成功获得4辆赛车空投包
        static successfullyObtained5AirdropPackages  : number; // 成功获得5倍收益空投包
        static clickOnTheSoundSwitch  : number; // 点击声音开关
        static clickTheSelectLevelButton  : number;    // 点击选择关卡按钮
        static selectNumberOfLevels  : number; // 选择关卡数
        static diamondPurchaseCar  : number;   // 钻石购买车
        static diamondsForDollars  : number;   // 钻石兑换美钞
        static pauseTimesOfGameInterface  :number;// 游戏界面暂停次数
        static doubleYourDollarBills  : number; // 拾取美钞双倍次数
        static pickupIncreasesBarrageCount  : number;  // 拾取增加弹幕次数
        static numberOfMedicalBagPickup  : number; // 拾取医疗包次数
        static pickupAcceleration  : number;   // 拾取加速次数
        static doubleSettlement  : number; // 结算单倍领取
        static settlement3TimesGet: number;

        static loadingSuccess : number;//加载成功人数
        static onClickStartGame : number;//点击开始游戏的人数
        static onClickFastBuyCar : number;//点击快速购买枪的人数
        static userShareOrVideoQuicken : number  ;//使用分享/视频加速的人数
        static userDiamondQuicken : number;//使用钻石加速的人数
        static successComDailyCheck : number;//成功普通签到
        static successDoubleDailyCheck : number;//成功双倍签到
        static successTurnDial : number; // 成功转动转盘
        static successMoreMutipleAward : number;//成功领取下次3倍/下次6倍
        static successAddDialTimes : number;//成功添加转盘次数
        static successSellCar : number;//成功卖出枪
        static successRevive : number;//成功复活[关卡ID]
        static shopGetFreeCar : number;//商城获得免费车辆
        static useGunLevel : number;//玩家使用枪数据[枪等级ID]
        static getCommonOffLineAward : number;//获取普通离线奖励
        static getDoubleOffLineAward : number;//获取双倍离线奖励
        static getFirstCarDiamond : number;//领取第一次合成枪的钻石
        static onClickSecondLevel : number;//点击第二关的开始游戏
        static unlockNewCar : number;//解锁新枪[枪等级]

        static startLoadingRes : number;//开始加载资源
        static loadingResSuc : number;//成功加载资源
        static startGameLevel : Object;//开始第*关
        static finishGameLevel : Object;//完成第*关
        static flopRewardSuc : number[];//完成第*个翻牌
        static flopRewardSuc_gameEnd : number[];//游戏结束完成第*个翻牌
        static flopRewardSuc_firstgameEnd : number[];//第一关游戏结束完成第*个翻牌
        static tripleRewardCard : number;//第一张牌3倍领取
        static openSignPanel : number;//打开签到
        static normalSignReward : number;//普通签到
        static doubleSignReward : number;//双倍签到
        static getOneMoreGift : number;//领取再来一份惊喜
        static openWheelPanel : number;//打开转盘
        static tripleRewards : number;//3倍领取
        static doubleTripleRewards : number;//6倍领取
        // static fiveMoreTimes : number;//+5次数
        static freeGoldPanel : number;//弹出免费金币弹窗
        static getFreeGoldSuc : number;//成功获取免费金币
        static freeCashpanel : number;//弹出免费美钞弹窗
        static getFreeCashSuc : number;//成功获取免费美钞
        static showRewardVideoSuc : number;//成功播放激励视频
        static CarMaxLevel:number; // 合成50级车辆的人数
        static CarMaxLevel10:number; // 合成10级车辆的人数
        static CarMaxLevel30:number; // 合成30级车辆的人数
        static finishUpdateMainWeaponGuide:number; //完成第一次主武器升级引导
        static finishMergeNewCarGuide:number; //完成第一次合成新车引导

        static ShowAirDrop:number; // 出现空投箱
        static OpenAirDropSuc:number; // 成功打开空投箱
        static loadingDuration:Object;//loading界面等待时间
        static loadingTimeCount:number;//loading界面时间累计

        static downZipStart:number; // 开始下载zip包
        static downZipFailed:number; // 下载zip包失败
        static downZipSuccess:number; // 下载zip包成功
        static upZipStart:number; //  开始解压
        static upZipFailed:number; //  解压失败
        static upZipSuccess:number; //  解压成功
        static onloadRes:number; //  加载游戏资源
        static onloadCfg:number; //  加载游戏配置文件
        static onload3dScene:number; //  加载游戏3d场景
        static onloadMainScene:number; //  加载游戏主场场景
        static loadGameView:number;//  加载游戏场景
        static moreGameOpen: number; //成功打开试玩界面
        static moreGameSuccess: number;//试玩成功领取奖励
    }

    class UserInfo
    {
        static userId : number;
        static userName : string;
        static wxgame_session_key : string;
        static systemType : number;
        static userArea : string;
        static userProvince : string;
        static authorCode : string;
        static scene_id : string;
        static onlyCanVideo : boolean;
        static invite_id : number;
        static shieldCityShareTip:any;
    }

    class HelpInfo
    {
        static isHelpOther:boolean;
        static userId : string;
        static name : string;
        static url : string;
        static trackId : number;
    }

    class SystemInfo
    {
        static version: string;
        static loginUrl:string;
        static gameId:number;
        static intClientId:number;
        static clientId:number;
        static isDownZip:boolean;
        static isNewUser:boolean;
    }

    class StateInfo
    {
        static debugMode: boolean;//日志开关
        
        /**
         * 网络状态
         */
        static networkConnected : boolean;
        /**
         * 网络类型
         */
        static networkType : boolean;
    }

    class AdManager
    {
        static resetBtnIcon():void;
    }

    class PropagateInterface
    {
        static _cachedShareConfig;
    }

    class AD 
    {
        static createBannerAdOnBottom(adid:string):void;
        static bannerAdHide():void;
        static bannerAdShow():void;
        static createRewardedVideoAd(adid:string,sucCallback: any,failCallback: any ):void;
    }    
    class NotificationCenter
    {
        static listen(eName, handler, scope):void;
        static ignore(eName, handler, scope):void;
        static ignoreScope(scope):void;
    }

    class EventType
    {
        static TCP_ERROP:string;
        static TCP_CLOSE:string;
        static TCP_OPENED:string; // 连接建立好之后的回调
        static TCP_RECONNECT:string;
        static TCP_RECEIVE:string; //长连接接收任何消息的事件

        static SDK_LOGIN_SUCCESS:string;
        static SDK_LOGIN_FAIL:string;
        static WEIXIN_LOGIN_SUCCESS:string;
        static WEIXIN_LOGIN_FAIL:string;
    
        static GET_USER_FEATURE_SUCCESS:string;
        static GET_USER_FEATURE_FAIL:string;
        static GET_SHARE_CONFIG_SUCCESS:string;
        static GET_SHARE_CONFIG_FAIL:string;

        static GET_OPEN_DATA_RESULT_SUCCESS:string;
        static GET_OPEN_DATA_RESULT_FAIL:string;
        static GET_OPEN_DATA_RESULT_TIMEOUT:string;

        static SEND_HEART_BEAT:string;
        static GAME_SHOW:string;
        static GAME_HIDE:string;
        static START_AUTHORIZATION_SUCCESS:string;//授权成功
        static START_AUTHORIZATION_FAILED:string;//授权失败

        static GET_ADMANAGER_ICON_INFO_SUCCESS:string;//获取交叉导流icon信息成功
        static GET_ADMANAGER_BANNER_INFO_SUCCESS:string;//获取交叉导流banner信息成功

        static HELP_OTHERS:string;//求助他人
    }

    class ShareInterface
    {
        static activityShare(activityData : any, successCallback : any, failCallback : any, extraInfo : any) : void;
    }

    class TCPClient
    {
        static sendMsg(data) : void;
        static reconnet() : void;
        static connectStatus : number;
        static CONNECT_STATUS_OK : number;
    }

    class showQuery
    {
        static inviteCode : number;
        static sourceCode : string;
    }
    class AndroidHelper
    {
        static hideSplash():void;
        static showBanner():void;
        static hideBanner():void;
        static startVibrate(time:number):void;
        static isNetConnected():boolean;
        static loginByGuest():void;
        static showRewardVideo(successCallback : any, failCallback : any):void;
    }
    class TuyooSDK
    {
        static setNewUser(isNewUser:any):void;
        static isNewUser():any;
        static isTodayFirstLogin():any;
    }
}

declare class FZ
{
    static IsWechatPlatform():void
    /**
    * 日志相关方法,若不符合项目组标准,可自行进行扩展
    */
    static LOGD(tag : string, msg : string):void
}

declare module FZ.AdManager
{
    class adNodeObj
    {
        static resetBtnIcon():void
    }
}
declare module FZ.AndroidAloneHelper
{
    class events
    {
        static LOGIN_SUCCESS:number
    }
}

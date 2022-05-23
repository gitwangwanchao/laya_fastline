/**
 * Created by xiaochuntian on 2018/5/2.
 */


tywx.clickStatEventType = {
    /**
     * tywx.SystemInfo.errorLogServer = "https://clienterr.touch4.me/api/bilog5/clientlog"
     * tywx.SystemInfo.biLogServer = "https://cbi.touch4.me/api/bilog5/text"
     * 使用方法:
     * 将bilog.js加入工程后,在需要打点的地方调用tywx.BiLog.clickStat(事件id,[参数列表]);
     * 以下是由BI组规定的必须进行上报的打点,请各个项目组不要修改
     */
    clickStatEventTypeUserFrom : 99990001,//用户来源
    clickStatEventTypeUserShare : 99990002,//用户分享
    clickStatEventTypeShowAdBtn : 99990003,  //分流icon显示
    clickStatEventTypeClickShowQRCode : 99990004, //展示分流倒量的二维码
    clickStatEventTypeClickAdBtn : 99990007,//点击分流icon
    clickStatEventTypeClickDirectToMiniGameSuccess : 99990005, //点击icon,直接拉进小游戏成功（点击确认）
    clickStatEventTypeClickDirectToMiniGameFail : 99990006, //点击icon,直接拉进小游戏失败（点击取消）
    clickStatEventTypeOnShowTimeStampSubmit: 99990010,//onshow时上报时间戳
    clickStatEventTypeOnHideTimeStampSubmit: 99990011,//onhide时上报时间戳
    clickStatEventTypeOnReportGameTime: 99990012,     //上报一天内的总游戏时长
    clickStatEventTypeOnReportShareTimes: 99990013,   //上报一天内的总分享次数
    clickStatEventTypeOnReportVideoAdsInfo: 99990020, //实时上报激励视频信息
    clickStatEventTypeSubmitVersionInfo : 9999, //上报微信版本及基础库信息
    clickStatEventTypeWxLoginStart : 10001,//微信登录开始
    clickStatEventTypeWxLoginSuccess : 10002,//微信登录成功
    clickStatEventTypeWxLoginFailed : 10003,//微信登录失败
    clickStatEventTypeAuthorizationStart : 10004,//授权开始
    clickStatEventTypeAuthorizationSuccess : 10005,//授权成功
    clickStatEventTypeAuthorizationFailed : 10006,//授权失败
    clickStatEventTypeLoginSDKStart : 10007,//登录SDK开始
    clickStatEventTypeLoginSDKSuccess : 10008,//登录SDK成功
    clickStatEventTypeLoginSDKFailed : 10009,//登录SDK时失败
    clickStatEventTypeTCPStart : 10010,//TCP连接开始
    clickStatEventTypeTCPSuccess : 10011,//TCP连接成功
    clickStatEventTypeTCPFailed : 10012,//TCP连接失败

    loadingSuccess : 20001,//加载配置表成功人数
    onClickStartGame : 20002,//点击开始游戏的人数
    finishOneUsCar : 20003,//完成一次枪
    onClickFastBuyCar : 20004,//点击快速购买枪的人数
    userShareOrVideoQuicken : 20005,//使用分享/视频加速的人数
    userDiamondQuicken : 20006,//使用钻石加速的人数
    inShopBuyCar: 20007,//在商店内购买枪的人数
    successGainCollect : 20008,//成功领取收藏奖励
    successComDailyCheck : 20009,//成功普通签到
    successDoubleDailyCheck : 20010,//成功双倍签到
    successTurnDial : 20011, // 成功转动转盘
    successMoreMutipleAward : 20012,//成功领取下次3倍/下次6倍
    successAddDialTimes : 20013,//成功添加转盘次数
    resultDoubleAward : 20014,//结算双倍奖励领取
    successSellCar : 20015,//成功卖出枪
    successGetThreeAward : 20016,//成功领取三倍奖励
    successGetFiveAward : 20017,//成功领取五倍奖励
    successRevive : 20018,//成功复活[关卡ID]
    shopGetFreeCar : 20019,//商城获得免费车辆
    useGunLevel : 20020,//玩家使用枪数据[枪等级ID]
    getCommonOffLineAward : 20021,//获取普通离线奖励
    getDoubleOffLineAward : 20022,//获取双倍离线奖励
    getFirstCarDiamond : 20023,//领取第一次合成枪的钻石
    onClickSecondLevel : 20024,//点击第二关的开始游戏
    passTrack : 20025,//用户通关数据[关卡ID:是否通关(成功0 :失败1)]
    unlockNewCar : 20026,//解锁新枪[枪等级]
    getOneDiamondGiftAward : 20027,//获取一次钻石礼包奖励
    getFiveDiamondGiftAward :20028,//获取五次钻石礼包奖励
    
    /**
     * 请在下方添加游戏相关的具体打点,另起声明放在业务层也可以
     */
    unlockingUav  :20029, // 解锁无人机
    clickTheSelectionOfUav  :20030, // 机枪无人机选择按钮点击
    clickTheMissileUavSelection  :20031,  // 导弹无人机选择按钮点击
    clickTheFrisbeeDroneSelection  :20032,// 飞盘无人机选择按钮点击
    clickTheTrackingDroneSelection  :20033,   // 追踪弹无人机选择按钮点击
    unlockingSecondaryWeapon  :20034, // 解锁副武器
    secondaryWeaponUpgradeLevel  :20035,  // 副武器升级等级
    modifyTheNickname  :20036,    // 修改昵称
    copyTheNickname  :20037,  // 复制昵称
    goToTheAutoRacingInterface  :20038,   // 进去选择赛车界面
    clickTheSelectInRacingInterface  :20039,  // 赛车界面点击选择按钮
    clickThePrivilegeTAB  :20040, // 点击特权标签
    buyingPrivileges  :20041, // 购买特权
    clickOnTheEmptyBag  :20042,   // 点击空头包
    clickOnTheDiamondGetDropBag  :20043,  // 点击钻石获得空投包
    shareVideoGetAirdropPackage  :20044,  // 点击视频/分享获得空投包
    successfullyObtained4AirdropPackages  :20045, // 成功获得4辆赛车空投包
    successfullyObtained5AirdropPackages  :20046, // 成功获得5倍收益空投包
    clickOnTheSoundSwitch  :20047, // 点击声音开关
    clickTheSelectLevelButton  :20048,    // 点击选择关卡按钮
    selectNumberOfLevels  :20049, // 选择关卡数
    diamondPurchaseCar  :20050,   // 钻石购买车
    diamondsForDollars  :20051,   // 钻石兑换美钞
    pauseTimesOfGameInterface  :20052,// 游戏界面暂停次数
    doubleYourDollarBills  :20053, // 拾取美钞双倍次数
    pickupIncreasesBarrageCount  :20054,  // 拾取增加弹幕次数
    numberOfMedicalBagPickup  :20055, // 拾取医疗包次数
    pickupAcceleration  :20056,   // 拾取加速次数
    doubleSettlement  :20057, // 结算单倍领取
    settlement3TimesGet  :20058,  // 结算3倍领取

    startLoadingRes : 20059,//开始加载资源
    loadingResSuc : 20060,//成功加载资源
    startGameLevel : {'1':20061,'2':20062,'3':20063,'5':20064,'7':20065,'10':20066},//开始第*关
    finishGameLevel : {'1':20067,'2':20068,'3':20069,'5':20070,'7':20071,'10':20072},//完成第*关
    flopRewardSuc : [20073,20074,20075],//完成第*个翻牌
    tripleRewardCard : 20076,//第一张牌3倍领取
    openSignPanel : 20077,//打开签到
    normalSignReward : 20078,//普通签到
    doubleSignReward : 20079,//双倍签到
    getOneMoreGift : 20080,//领取再来一份惊喜
    openWheelPanel : 20081,//打开转盘
    tripleRewards : 20082,//3倍领取
    doubleTripleRewards : 20083,//6倍领取
    // fiveMoreTimes : 20084,//+5次数同successAddDialTimes : 20013,//成功添加转盘次数
    freeGoldPanel : 20084,//弹出免费金币弹窗
    getFreeGoldSuc : 20085,//成功获取免费金币
    freeCashpanel : 20086,//弹出免费美钞弹窗
    getFreeCashSuc : 20087,//成功获取免费美钞
    showRewardVideoSuc : 20088,//成功播放激励视频
    CarMaxLevel:20089,// 50级合成车辆人数
    CarMaxLevel10:20090, // 合成10级车辆的人数
    CarMaxLevel30:20091, // 合成30级车辆的人数

    ShowAirDrop:20092,  //  出现空投箱
    OpenAirDropSuc:20093, //  成功打开空投箱

    loadingDuration : {'1':20094,'3':20095,'5':20096,'8':20097,'12':20098,'16':20099},//loading界面等待时间
    loadingTimeCount: 20100,//loading界面时间累计

    downZipStart:20101, // 开始下载zip包
    downZipFailed:20102, // 下载zip包失败
    downZipSuccess:20103, // 下载zip包成功
    upZipStart:20104, //  开始解压
    upZipFailed:20105, //  解压失败
    upZipSuccess:20106, //  解压成功
    onloadRes:20107, //  加载游戏资源
    onloadCfg:20108, //  加载游戏配置文件
    onload3dScene:20109, //  加载游戏3d场景
    onloadMainScene:20110, //  加载游戏主场场景
    flopRewardSuc_gameEnd: [20111,20112,20113],//结束界面完成第*个翻牌
    flopRewardSuc_firstgameEnd: [20114,20115,20116],//第一关结束界面完成第*个翻牌
    finishUpdateMainWeaponGuide: 20117,//完成第一次主武器升级引导
    finishMergeNewCarGuide: 20118,//完成第一次合成新车引导
    loadGameView: 20119,// 加载完主场景
    moreGameOpen: 20120, //成功打开试玩界面
    moreGameSuccess: 20121, //试玩成功领取奖励
};

tywx.BiLog = {

    /**
     * 上传实时log,富豪斗地主用此接口上传错误情况下的日志
     * @param logtxt:log内容
     */
    uploadLogTimely:function (logtxt) {
        if(!tywx.StateInfo.networkConnected) {
            tywx.LOGD('tywx.BiLog', 'net error!');
            return;
        }
        if(logtxt) {
            var header = ['Content-Type:text/plain'];
            var configObj = {
                'url': tywx.SystemInfo.errorLogServer + '?cloudname=' + tywx.SystemInfo.cloudId + '.' + tywx.SystemInfo.intClientId,
                'header': header,
                'postData': logtxt,
                'callback': null
            };
            tywx.HttpUtil.httpPost(configObj,'POST');
        }
    },

    getSystemInfo : function(){
        this.cloud_id = tywx.SystemInfo.cloudId;   //独立服务id
        this.rec_type = '1';   //日志类型
        this.rec_id     = '0'; //日志记录id
        this.receive_time  ='0'; // 日志接收时间  输出日志时统一填0，BI服务会在接收时添加
        this.user_id = tywx.UserInfo.userId || '0';      //用户id
        this.game_id = tywx.SystemInfo.gameId;      //游戏id
        this.client_id = tywx.SystemInfo.clientId;
        this.device_id = this.device_id || tywx.Util.getLocalUUID();	//device id
        this.ip_addr='#IP';// ip地址	占位--服务器处理
        this.nettype= "0"; //网络状况
        this.phone_maker= "0"; //手机制造商
        this.phone_model= tywx.UserInfo.model; //手机型号
        this.phone_carrier= "0";//手机运营商
        this.reserved ='0';
    },
    /*BI组打点
     参数1是事件id，参数2是[],内含扩展参数
     60001事件id
     在查询工具，cloud id+game id+事件id即可找到,GDSS有前端日志查询工具
     ty.BiLog.clickStat(ddz.StatEventInfo.DdzButtonClickInPlugin,
     [ddz.PluginHall.Model.statInfoType[scope.index],ddz.GameId]);

     // ty.BiLog.clickStat(hall5.BILogEvents.BILOG_EVENT_PLUGIN_UPDATE_SUCCESS,[hall5.BilogStatEvent.Plugin_Update_Success,gameid]);
     */
    uploadClickStatLogTimely:function (logtxt) {
        var callbackObj = this;
        if(logtxt!=undefined && logtxt!='') {
            var header = ['Content-Type:text/plain'];
            var configObj = {
                'url': tywx.SystemInfo.biLogServer,
                'headers': header,
                'postData': logtxt,
                'obj': callbackObj,
                'tag': null,
                'callback': null
            };
        }
        tywx.HttpUtil.httpPost(configObj,'POST');
    },

    /**
     * 打点接口
     * @param eventId      打点事件
     * @param ParamsList   额外参数,最多10位,参见bi组文档说明
     */
    clickStat: function (eventId, paramsList) {
        paramsList = paramsList || [];
        var dyeparams = [];
        if (paramsList.length < 10) {
            for (var i = 0; i < 9; i++) {
                if (i < paramsList.length) {
                    dyeparams.push(paramsList[i]);}
                else {
                    dyeparams.push(0);
                }
            }
        }
        else {
            dyeparams = paramsList;
        }
        tywx.LOGD('BI打点', "eventid= " + eventId + " 描述 = " + JSON.stringify(dyeparams));
        var bilog = this.assemblelog(eventId, dyeparams);
        this.uploadClickStatLogTimely(bilog+ '\n');
        if (tywx.UserInfo.FromShareCard == true){
            eventId = "1"+eventId;
            bilog = this.assemblelog(eventId, dyeparams);
            this.uploadClickStatLogTimely(bilog+ '\n');
        }
    },

    /**
     * BIlog拼接
     * @param eventid
     * @param paramsarr
     * @returns {*}
     */
    assemblelog:function (eventid, paramsarr) {
        var time = new Date().getTime();
        if(time-this._timetag>60000) {
            this._timetag = time;
            this.nettype=0;
        }
        var paramstr = paramsarr.join('\t');

        this.getSystemInfo();
        var logStr =this.cloud_id+'\t'+this.rec_type+'\t'+time+'\t'+this.rec_id+'\t'+this.receive_time+
            '\t'+eventid+'\t'+this.user_id+'\t'+this.game_id+'\t'+this.client_id+'\t'+this.device_id+'\t'+
            this.ip_addr +'\t'+this.nettype+'\t'+this.phone_maker +'\t'+this.phone_model +'\t'+this.phone_carrier+'\t'+paramstr+'\t'+ this.reserved ;

        var str = this.trimTab0(logStr);
        return str;
    },

    /**
     * 精简上报字符串,结尾都是默认值的部分可以去掉,由BI接收端进行补齐
     * @param str
     * @returns {*}
     */
    trimTab0:function (str) {
        if(str==null || str==undefined)
            return '';
        var txt = str.replace(/(\t0)*$/,'');
        return txt;
    },
};

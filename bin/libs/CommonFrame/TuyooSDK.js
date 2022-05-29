/**
 * @author zhaoliang
 * @date 1.28
 * 
 * 全局对象
 * 系统信息
 * 包括clientId，loginUrl等
 */
console.log("TuyooSDK loaded");
FZ.TuyooSDK = {
    SESSION_KEY: 'TU_SESSION_STORAGE',
    LOCAL_GAME_TIME_RECORD: 'LOCAL_GAME_TIME_RECORD',
    LOCAL_SHARE_TIMES_RECORD: 'LOCAL_SHARE_TIMES_RECORD',
    newUser:false,
    isFirstLogin:true,

    /***************************以下为登录相关接口*********************************/
    login: function() {
        if(FZ.IsWechatPlatform()) {
            FZ.TuyooSDK.getSystemInfo();
            FZ.TuyooSDK.getUserAreaInfo();
            FZ.TuyooSDK.wechatLogin();
            FZ.PropagateInterface._doHttpGetShareConfig();
        }else if(navigator.platform=='android'){
            //其他平台,待添加
            FZ.TuyooSDK.getUserAreaInfo();
            FZ.AndroidAloneHelper.login();
            FZ.TuyooSDK.updateLastLoginDate();
        }
        FZ.TuyooSDK.updateLastLoginDate();
    },
    updateLastLoginDate:function(){
        var date = new Date().toLocaleDateString();
		this.lastLoginDate = FZ.Util.getItemFromLocalStorage('Last_Login_Date', "0");
        var firstloginDate = FZ.Util.getItemFromLocalStorage('First_Login_Date', date);
        if(firstloginDate==date){//当前为第一次登陆，标记为新用户
			this.newUser = true;
			FZ.Util.setItemToLocalStorage('First_Login_Date', date);
        }
        this.isFirstLogin = this.lastLoginDate==date?false:true;
        FZ.Util.setItemToLocalStorage('Last_Login_Date', date);
    },
    isTodayFirstLogin:function(){
        return this.isFirstLogin;
    },
    isNewUser:function(){
        return this.newUser;
    },
    setNewUser:function(isNewUser){
        this.newUser=isNewUser;
    },
    getUserAreaInfo : function () {
        var finalUrl = FZ.SystemInfo.areaUrl + 'api/iploc5/search/city';
        var successcb = function(ret) {
            if(ret&&ret['ok']===1){
                var loc = ret['loc'];
                if(loc&&loc.length>3){
                    FZ.LOGD("fengbing", " *--*-*-*-*-*  获取用户区域:  "+loc[2]);
                    FZ.UserInfo.userArea = loc[2];
                    FZ.UserInfo.userProvince = loc[1];
                }
            }
        };

        var failcb = function(ret) {
        };
        FZ.HttpUtil.httpGet({'url':finalUrl}, successcb, failcb);
    },
    
    // 微信登录
    wechatLogin: function() {
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }

            FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeWxLoginStart, []);
            wx.login({
                success: function(params) {
                    FZ.LOGD(null, 'wx login success, params:' + JSON.stringify(params));
                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeWxLoginSuccess, [params.code]);
                    if (params.code) {
                        var code = params.code;
                        FZ.TuyooSDK.loginTuyooWithCode(code, {});
                        FZ.NotificationCenter.trigger(FZ.EventType.WEIXIN_LOGIN_SUCCESS);
                    }
                },

                fail: function(params) {
                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeWxLoginFailed, []);
                    FZ.LOGD(null, 'wx login fail, params:' + JSON.stringify(params));
                    FZ.NotificationCenter.trigger(FZ.EventType.WEIXIN_LOGIN_FAIL);
                },

                complete: function(params) {

                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.wechatLogin——" + JSON.stringify(err));
        }
    },

    // 微信不需要重新授权，使用
    loginTuyooWith3rdSession: function() {
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            wx.getStorage({
                key: FZ.TuyooSDK.SESSION_KEY,
                success: function(params) {
                    if (!params.data) {
                        FZ.TuyooSDK.wechatLogin();
                        return;
                    }
                    // 微信授权成功后使用code登录途游服务器
                    wx.request({
                        url: FZ.SystemInfo.loginUrl + 'open/v3/user/processSnsIdNew',
                        data: {
                            snsId: params.data,
                            deviceName: 'wechatGame',
                            clientId: FZ.SystemInfo.clientId,
                            appId: FZ.SystemInfo.appId
                        },

                        success: function(params) {
                            FZ.LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
                        },

                        fail: function(params) {
                            FZ.LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
                        },

                        complete: function(params) {

                        }
                    });
                },
                fail: function(params) {
                    FZ.TuyooSDK.wechatLogin();
                },
                complete:function(params) {

                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.loginTuyooWith3rdSession——" + JSON.stringify(err));
        }
    },

    // 微信授权成功后，使用
    /* {
        "data": {
            "result": {
                "code": 0,
                "userId": 10116,
                "exception_report": 0,
                "userType": 4,
                "authInfo": "{\"authcode\": \"eyJ1aWQiOiAxMDExNiwgInVuYW1lIjogIlx1Njc2NVx1NWJiZTAwNzRBaWJzVCIsICJ1dG9rZW4iOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzEzMzgiLCAiY29pbiI6IDAsICJlbWFpbCI6ICIiLCAidXRpbWUiOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzA0NzEifQ==\", \"account\": \"\", \"uid\": 10116, \"usercode\": \"\"}",
                "tcpsrv": {
                    "ip": "192.168.10.88",
                    "port": 8041
                },
                "isCreate": 1,
                "changePwdCount": 0,
                "360.vip": 0,
                "logclient": {
                    "loguploadurl": "",
                    "logreporturl": ""
                },
                "userPwd": "ty817142",
                "purl": "http://ddz.image.tuyoo.com/avatar/head_female_0.png",
                "snsId": "wxapp:071Nehqt0Z4XEe1jN6qt007Cqt0Nehqz",
                "userEmail": "",
                "connectTimeOut": 35,
                "appId": 9999,
                "heartBeat": 6,
                "userName": "来宾0074AibsT",
                "mobile": "",
                "token": "cce362d6-68a8-485e-b137-86ae6828e07a",
                "authorCode": "eyJ1aWQiOiAxMDExNiwgInVuYW1lIjogIlx1Njc2NVx1NWJiZTAwNzRBaWJzVCIsICJ1dG9rZW4iOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzEzMzgiLCAiY29pbiI6IDAsICJlbWFpbCI6ICIiLCAidXRpbWUiOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzA0NzEifQ==",
                "log_report": 0,
                "showAd": 1
            }
        },
        "header": {
            "Server": "nginx/1.4.1",
            "Date": "Mon, 29 Jan 2018 06:13:12 GMT",
            "Content-Type": "application/json;charset=UTF-8",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive",
            "Content-Encoding": "gzip"
        },
        "statusCode": 200,
        "errMsg": "request:ok"
    }
    */
    loginTuyooWithCode: function(code, userInfo) {
        try {
            if (!FZ.IsWechatPlatform()) {
                return;
            }
            // 微信授权成功后使用code登录途游服务器
            wx.showShareMenu({
                withShareTicket: true
            });


            //咱们后端 0 是男 1 是女,要转换
            var gender = userInfo.gender || 0;

            var local_uuid = FZ.Util.getLocalUUID();
            FZ.LOGD("local_uuid:", local_uuid);
            var sdkPath = FZ.SystemInfo.loginUrl;
            var dataObj = {
                appId: FZ.SystemInfo.appId,
                wxAppId: FZ.SystemInfo.wxAppId,
                clientId: FZ.SystemInfo.clientId,
                snsId: 'wxapp:' + code,
                uuid: local_uuid,
                //以下为上传玩家的微信用户信息
                //nickName: userInfo.nickName,
                //avatarUrl: userInfo.avatarUrl,
                gender: gender,
                scene_id: FZ.UserInfo.scene_id || "",
                scene_param: FZ.UserInfo.scene_param || "",
                invite_id: FZ.UserInfo.invite_id || 0
            };
            if (userInfo && userInfo.nickName) {
                dataObj.nickName = userInfo.nickName;
            }

            if (userInfo && userInfo.avatarUrl) {
                dataObj.avatarUrl = userInfo.avatarUrl;
            }
            FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeLoginSDKStart, [code, local_uuid, userInfo.nickName]);
            wx.request({
                url: sdkPath + 'open/v6/user/LoginBySnsIdNoVerify',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: dataObj,
                method: 'POST',

                success: function (params) {
                    FZ.LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
                    var checkData = params.data;
                    if ((checkData.error && checkData.error.code == 1) || !(checkData.result && checkData.result.userId)) {
                        FZ.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                        return;
                    }

                    // 保存用户名/用户ID/用户头像
                    var result = checkData.result;
                    FZ.UserInfo.userId = result.userId;
                    FZ.UserInfo.userName = result.userName;
                    FZ.UserInfo.userPic = result.purl;
                    FZ.UserInfo.authorCode = result.authorCode;
                    FZ.UserInfo.wxgame_session_key = result.wxgame_session_key;
                    FZ.LOGD(null, 'userId:' + FZ.UserInfo.userId + ' userName:' + FZ.UserInfo.userName + ' userPic:' + FZ.UserInfo.userPic);

                    if (FZ.UserInfo.userId && FZ.UserInfo.userName) {
                        FZ.LOGE("TUYOO_SDK_LOGIN_SUCCESS", JSON.stringify(params));
                    } else {
                        FZ.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                    }

                    var token = result.token;
                    FZ.LOGD(null, 'token:' + token);
                    wx.setStorage({
                        key: FZ.TuyooSDK.SESSION_KEY,
                        data: token
                    });


                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeLoginSDKSuccess, [code, local_uuid, userInfo.nickName, result.userId]);
                    if (FZ.showScene && FZ.showQuery && FZ.showQuery.sourceCode) {
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom, [FZ.showScene, FZ.showQuery.inviteCode, FZ.showQuery.sourceCode, FZ.showQuery.imageType, "GameStart"]);
                    }
                    //FZ.TuyooSDK.initWebSocketUrl(result);
                    FZ.PropagateInterface.processRawShareConfigInfo();    //处理分享数据
                    // //建立TCP连接
                    // if(FZ.SystemInfo.webSocketUrl != null && FZ.SystemInfo.webSocketUrl != ''){
                    //     FZ.TCPClient.connect(FZ.SystemInfo.webSocketUrl);
                    // }
                    var params = {url: ""};
                    params.url = FZ.SystemInfo.loginUrl + "api/quanmzc/game/getGameInfo?gameId=" + FZ.SystemInfo.gameId + "&userId=" + FZ.UserInfo.userId + "&clientId" + FZ.SystemInfo.clientId;
                    FZ.HttpUtil.httpGet(params, function(res){
                    	// console.log('用户信息-------:' + JSON.stringify(res));
                        if(res && res.result){
                            console.log('用户信息-------1:');
                            // console.log('用户信息-------1:res.result.gamedata = ' + res.result.gamedata);
                            if(res.result.gamedata == undefined || res.result.gamedata == null) {
                            	console.log('用户信息-------2:');
                                FZ.SystemInfo.isNewUser = true
                            }else {
                                var gamedata = JSON.parse(res.result.gamedata);
                                if(gamedata.checkPoint == 1){
                                    console.log('用户信息-------2:');
                                    FZ.SystemInfo.isNewUser = true;
                                }
                            }
                        }
                    }, function(){

                    });

                    // 发送登录成功事件
                    FZ.NotificationCenter.trigger(FZ.EventType.SDK_LOGIN_SUCCESS);
                },

                fail: function (params) {
                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeLoginSDKFailed, [code, local_uuid, userInfo.nickName]);
                    FZ.LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
                    FZ.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                    FZ.NotificationCenter.trigger(FZ.EventType.SDK_LOGIN_FAIL);
                },

                complete: function (params) {

                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.loginTuyooWithCode——" + JSON.stringify(err));
        }
    },

    /**
     * 使用sdk登陆返回信息解析得到服务器连接地址,对于单机游戏来说无效
     * @param loginResult
     */
    initWebSocketUrl: function(loginResult) {
        if(loginResult && loginResult.tcpsrv) {
            var ip = loginResult.tcpsrv.ip;
            var port = loginResult.tcpsrv.wsport || loginResult.tcpsrv.port; //优先使用wsport
            var webSocketUrl;
            if (FZ.SystemInfo.loginUrl.indexOf("https://") > -1){
                webSocketUrl = 'wss://' + ip + '/';
            }
            else{
                webSocketUrl = 'ws://' + ip + ':' + port.toString() + '/';
            }
            FZ.LOGD(null, 'webSocketUrl:' + webSocketUrl);
            FZ.SystemInfo.webSocketUrl = webSocketUrl;
        }
    },


    getSystemInfo : function () {
        // {
        // 	"0":{
        // 	"errMsg":"getSystemInfo:ok",
        // 		"model":"iPhone X",
        // 		"pixelRatio":3,
        // 		"windowWidth":375,
        // 		"windowHeight":812,
        // 		"system":"iOS 10.0.1",
        // 		"language":"zh_CN",
        // 		"version":"6.6.3",
        // 		"batteryLevel":100,
        // 		"screenWidth":375,
        // 		"screenHeight":812,
        // 		"SDKVersion":"1.8.0",
        // 		"brand":"devtools",
        // 		"fontSizeSetting":16,
        // 		"statusbarHeight":44,
        // 		"platform":"devtools"
        // }
        // }
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            wx.getSystemInfo({
                success : function (result) {
                    var model = result.model;
                    var isiPhone = model.indexOf("iPhone") >= 0;
                    var windowHeight = result.windowHeight;
                    var resultType = 0;
                    if (isiPhone){
                        if(windowHeight == 812 || windowHeight == 896){   //iPhoneX, XS, XR, XMax
                            resultType = 2;
                        }else if (windowHeight == 736){ // 7p 8p
                            resultType = 4;
                        }else {  //其他iPhone
                            resultType = 1;
                        }
                    }else { //cc.sys.OS_ANDROID
                        resultType = 3;
                    }
                    FZ.UserInfo.systemType = resultType;
                    FZ.UserInfo.wechatType = result.version;
                    FZ.UserInfo.model = result.model;
                    FZ.UserInfo.system = result.system;
                    FZ.UserInfo.sdkVersion = result.SDKVersion;
                    console.error("基础库版本为:" + FZ.UserInfo.sdkVersion);

                    FZ.TuyooSDK.checkSdkVersion();

                    //上报顺序为微信版本 基础库版本 平台 操作系统版本
                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeSubmitVersionInfo,
                        [result.version, result.SDKVersion, result.platform, result.system]);
                },
                fail : function () {
                },
                complete : function () {
                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.getSystemInfo——" + JSON.stringify(err));
        }
    },

    checkSdkVersion: function(){
        if(FZ.TuyooSDK.compareVersion(FZ.UserInfo.sdkVersion, '2.1.0') < 0)
        {
            wx.showModal({
                title: "提示",
                content: '当前微信版本过低，部分游戏功能将无法使用，请升级到最新微信版本后重试!',
                showCancel : false,
                success: function(res){
                    if (res.confirm) 
                    {
                        wx.exitMiniProgram();
                    }
                    else
                    {
                        FZ.TuyooSDK.checkSdkVersion();
                    }
                    
                },
                fail: function(res){
                    FZ.TuyooSDK.checkSdkVersion();
                }
            })
        }
    },

    compareVersion: function(v1, v2) {
        if(v1 == undefined || v1 == null) return 1;

        v1 = v1.split('.')
        v2 = v2.split('.')
        var len = Math.max(v1.length, v2.length)
      
        while (v1.length < len) {
          v1.push('0')
        }
        while (v2.length < len) {
          v2.push('0')
        }
      
        for (var i = 0; i < len; i++) {
          var num1 = parseInt(v1[i])
          var num2 = parseInt(v2[i])
      
          if (num1 > num2) {
            return 1
          } else if (num1 < num2) {
            return -1
          }
        }
      
        return 0
    },
      
    wechatAuthorize: function() {
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            wx.getSetting({
                success:function(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeAuthorizationStart, []);
                        wx.authorize({
                            scope : "scope.userInfo",
                            success : function () {
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeAuthorizationSuccess, []);
                                FZ.NotificationCenter.trigger(FZ.EventType.START_AUTHORIZATION_SUCCESS);
                            },
                            fail:function () {
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeAuthorizationFailed, []);
                                FZ.NotificationCenter.trigger(FZ.EventType.START_AUTHORIZATION_FAILED);
                            },
                            complete:function () {
                            }
                        });
                    }
                    else{
                        FZ.NotificationCenter.trigger(FZ.EventType.START_AUTHORIZATION_SUCCESS);
                    }
                }
            })
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.wechatAuthorize——" + JSON.stringify(err));
        }
    },

    /***************************以下为支付相关接口*********************************/

    createOrder:function(id, prodPrice, name, prodCount, extraProdId, extraAppInfo){
        /*
         params  id:商品ID,prodPrice:价格  单位元, name:商品名称
         prodCount:购买数量,默认为1

         prodId:商品ID, prodName:商品名称, prodCount:购买数量
         prodPrice:价格  单位元,
         chargeType:支付方式 wxapp.iap,
         gameId:子游戏id,
         appInfo:透传参数,
         mustcharge:是否支付 默认填 1
         */
        var data = {};
        data.prodId = id;
        data.prodPrice = prodPrice;
        data.chargeType = "wxapp.iap";
        data.gameId = FZ.SystemInfo.gameId;
        data.prodName = name;
        data.prodCount = prodCount;
        data.appInfo = extraAppInfo ? extraAppInfo :{};
        data.extraProdId = extraProdId ? extraProdId : '';
        FZ.TuyooSDK.rechargeOrder(data);
    },

    orderCallFunc:function(url, platformOrderId, chargeCoin){
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            var local_uuid = FZ.Util.getLocalUUID();
            var _chargeCoin = chargeCoin;
            wx.request({
                url: url,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    userId:FZ.UserInfo.userId,
                    appId: FZ.SystemInfo.appId,
                    wxAppId: FZ.SystemInfo.wxAppId,
                    clientId: FZ.SystemInfo.clientId,
                    imei: 'null',
                    uuid : local_uuid,
                    platformOrderId: platformOrderId,
                },

                method:'POST',

                success: function(results) {
                    var tips = "购买成功";
                },
                fail: function(params) {
                    FZ.LOGE(null, 'file = [Recharge] fun = [OrderCallFun] 充值失败 params = ' + JSON.stringify(params));
                },
                complete: function(params) {

                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.orderCallFunc——" + JSON.stringify(err));
        }
    },

    /*
     params prodId:商品ID, prodName:商品名称, prodCount:购买数量
     prodPrice:价格  单位元,
     chargeType:支付方式 wxapp.iap,
     gameId:子游戏id,
     appInfo:透传参数,
     mustcharge:是否支付 默认填 1
     */
    rechargeOrder: function (params){
        try {
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            var local_uuid = FZ.Util.getLocalUUID();
            var sdkPath = FZ.SystemInfo.loginUrl;
            var reqUrl = FZ.SystemInfo.hall_version == 'hall37' ? sdkPath + 'open/v4/pay/order': sdkPath + 'open/v5/pay/order';
            wx.request({
                url: reqUrl,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    userId:FZ.UserInfo.userId,
                    appId: FZ.SystemInfo.appId,
                    wxAppId: FZ.SystemInfo.wxAppId,
                    clientId: FZ.SystemInfo.clientId,
                    imei: 'null',
                    uuid : local_uuid,
                    //商品信息
                    prodId: params.prodId,
                    prodName: params.prodName,
                    prodCount: params.prodCount || 1,
                    prodPrice: params.prodPrice,
                    chargeType: params.chargeType,
                    gameId : params.gameId,
                    appInfo : params.appInfo,
                    mustcharge : params.mustcharge || 1,
                    prodOrderId: params.extraProdId,
                },

                method:'POST',

                success: function(params) {
                    FZ.LOGE(null, 'tuyoo rechargeOrder success, params:' + JSON.stringify(params));
                    var results = params.data.result;
                    if (results.code == 0) {
                        var chargeInfo = results.chargeInfo;
                        var chargeData = chargeInfo.chargeData;
                        var notifyUrl = chargeData.notifyUrl;
                        var platformOrderId = chargeData.platformOrderId;
                        var buyQuantity = chargeData.buyQuantity ? chargeData.buyQuantity : (10 * chargeInfo.chargeTotal);
                        FZ.LOGE(null, 'tuyoo rechargeOrder success 创建订单成功, chargeData.mustcharge =' + chargeData.mustcharge);
                        if (chargeData && chargeData.mustcharge == 1) {
                            // wx.requestMidasPayment  购买微信币
                            wx.requestMidasPayment({
                                mode: chargeData.mode,
                                env: chargeData.env,
                                offerId: chargeData.offerId,
                                buyQuantity: buyQuantity,
                                platform:chargeData.platform,
                                currencyType:"CNY",
                                zoneId: chargeData.zoneId,
                                success:function(params) {
                                    // 支付成功
                                    FZ.TuyooSDK.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
                                },
                                fail:function(res) {
                                    FZ.LOGE(null, '米大师支付 fail params = ' + JSON.stringify(params));
                                    if(res.errCode && res.errCode == 1) {
                                        //支付取消
                                        FZ.TuyooSDK.cancelOrder(platformOrderId);
                                    }
                                }
                            });
                        }else if (chargeData && chargeData.mustcharge == 0){
                            FZ.TuyooSDK.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
                        }
                    }else if (results.code == 1) {
                        //hall.MsgBoxManager.showToast({title : results.info});
                    }else if (results.code == 3) {
                        //hall.MsgBoxManager.showToast({title : '微信小程序登陆验证失败!'});
                    }
                },
                fail: function(params) {
                    //hall.MsgBoxManager.showToast({title : '购买失败!'});
                },
                complete: function(params) {
                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.rechargeOrder——" + JSON.stringify(err));
        }
    },

    cancelOrder: function(orderId) {
        try {
            var sendUrl = FZ.SystemInfo.loginUrl + 'open/v4/pay/cancelorder';
            var postData = {
                platformOrderId: orderId,
                appId: FZ.SystemInfo.appId,
                userId: FZ.UserInfo.userId,
                clientId: FZ.SystemInfo.clientId,
                payType:  "wxapp.iap"
            };
            wx.request({
                url: sendUrl,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: postData,
                method:'POST',
                success: function(params) {
                    FZ.LOGE(null, 'tuyoo cancelOrder success, params:' + JSON.stringify(params));
                },
                fail: function(params) {
                    FZ.LOGE(null, 'tuyoo cancelOrder fail, params:' + JSON.stringify(params));
                },
                complete: function(params) {
                }
            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TuyooSDK.cancelOrder——" + JSON.stringify(err));
        }
    },

    //-------------------处理本地数据缓存并发送至BI-------------------

    freshLocalShareTimes : function () {      //分享成功后才能调用
        try {
            var localSTimesRecord = wx.getStorageSync(FZ.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};

            var _localDate = (new Date()).toLocaleDateString();

            if (localSTimesRecord[_localDate] && localSTimesRecord[_localDate].count) {
                localSTimesRecord[_localDate].count = parseInt(localSTimesRecord[_localDate].count) + 1;
            } else {

                var _sObj = {
                    count: 1,           //当日分享次数
                    status : 0,         //1已发送 0未发送
                };

                localSTimesRecord[_localDate] = _sObj;
            }

            wx.setStorage({
                key:  FZ.TuyooSDK.LOCAL_SHARE_TIMES_RECORD,
                data: localSTimesRecord
            });
        }catch (e){
            console.error("error:", "FZ.TuyooSDK.freshLocalShareTimes ===>" + JSON.stringify(e));
        }

    },

    //本地缓存的数据格式
    /*
        {

            '2018/08/23':{
                count: 1,
                status : 0
            },
            '2018/08/24':{
                count: 1,
                status : 0
            }
        }
    */

    processLocalRecord : function () {      //onShow时候调用

        try {

            FZ.TuyooSDK.onShowTimeStamp = (new Date()).getTime();
            
            if(!FZ.UserInfo.userId){
                return;
            }

            //读取
            var _cDate = new Date();
            var _localDate = _cDate.toLocaleDateString();


            var localGTimeRecord = wx.getStorageSync(FZ.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};

            if (localGTimeRecord) {
                for (var k in localGTimeRecord) {

                    if (k != _localDate && 0 == localGTimeRecord[k].status) {
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeOnReportGameTime, [localGTimeRecord[k].count, k]);
                        localGTimeRecord[k].status = 1;
                    }
                }
            }

            //本地只保留30天的每日游戏次数日志，超过30条的，按照记录时间进行删除
            var dateKeys = Object.keys(localGTimeRecord);
            var _tmpGTRecord = {};
            if(dateKeys.length && 30 < dateKeys.length){
                dateKeys.reverse();
                for(var i = 0; i < 30; i++){
                    if(dateKeys[i] && localGTimeRecord[dateKeys[i]]){
                        _tmpGTRecord[dateKeys[i]] = localGTimeRecord[dateKeys[i]];
                    }
                }
            }else{
                _tmpGTRecord = localGTimeRecord;
            }
            //回写
            wx.setStorage({
                key:  FZ.TuyooSDK.LOCAL_GAME_TIME_RECORD,
                data: _tmpGTRecord
            });


            var localSTimeRecord = wx.getStorageSync(FZ.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};
            if (localSTimeRecord) {
                for (var k in localSTimeRecord) {

                    if (k != _localDate && 0 == localSTimeRecord[k].status) {
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeOnReportShareTimes, [localSTimeRecord[k].count, k]);
                        localSTimeRecord[k].status = 1;
                    }
                }
            }
            //本地只保留30天的每日分享总次数日志，超过30条的，按照记录时间进行删除
            var shareKeys = Object.keys(localSTimeRecord);
            var _tmpSTRecord = {};
            if(shareKeys.length && 30 < shareKeys.length){
                shareKeys.reverse();
                for(var i = 0; i < 30; i++){
                    if(shareKeys[i] && localSTimeRecord[shareKeys[i]]){
                        _tmpSTRecord[shareKeys[i]] = localSTimeRecord[shareKeys[i]];
                    }
                }
            }else{
                _tmpSTRecord = localSTimeRecord;
            }
            //回写
            wx.setStorage({
                key:  FZ.TuyooSDK.LOCAL_SHARE_TIMES_RECORD,
                data: _tmpSTRecord
            });

        }catch (e){
            console.error("error:", "FZ.TuyooSDK.processLocalRecord ===>" + JSON.stringify(e));
        }

    },

    writeBackLocolRecord : function () {   //onHide时候调用
        try {

            if(FZ.TuyooSDK.onShowTimeStamp < 0){
                return;
            }

            var localGTimeRecord = wx.getStorageSync(FZ.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};

            var _curDate = new Date();
            var _curTimeStamps = _curDate.getTime();
            var _playTimeOffset = _curTimeStamps - FZ.TuyooSDK.onShowTimeStamp;

            //判读是否跨天
            var _startTimeStamps = Date.parse(_curDate.toLocaleDateString());

            if (_startTimeStamps > FZ.TuyooSDK.onShowTimeStamp) {

                var _preDateGameTime = _startTimeStamps - FZ.TuyooSDK.onShowTimeStamp;
                var _curDateGameTime = _playTimeOffset - _preDateGameTime;

                var _preDateString = (new Date(FZ.TuyooSDK.onShowTimeStamp)).toLocaleDateString(); // 2018/08/19
                var _curDateString = _curDate.toLocaleDateString();                                  // 2018/08/20

                if (localGTimeRecord[_preDateString] && localGTimeRecord[_preDateString].count) {
                    localGTimeRecord[_preDateString].count = parseInt(localGTimeRecord[_preDateString].count) + _preDateGameTime;
                } else {

                    var _gtObj = {
                        count: _preDateGameTime,           //当日总游戏时长
                        status : 0,         //1已发送 0未发送
                    };

                    localGTimeRecord[_preDateString] = _gtObj;
                }

                if (localGTimeRecord[_curDateString] && localGTimeRecord[_curDateString].count) {
                    localGTimeRecord[_curDateString].count = parseInt(localGTimeRecord[_curDateString].count) + _curDateGameTime;
                } else {

                    var _gtObj = {
                        count: _curDateGameTime,           //当日总游戏时长
                        status : 0,         //1已发送 0未发送
                    };

                    localGTimeRecord[_curDateString] = _gtObj;
                }
            } else {

                var _curDateString = _curDate.toLocaleDateString();                                 // 2018/08/20

                if (localGTimeRecord[_curDateString] && localGTimeRecord[_curDateString].count) {
                    localGTimeRecord[_curDateString].count = parseInt(localGTimeRecord[_curDateString].count) + _playTimeOffset;
                } else {
                    var _gtObj = {
                        count: _playTimeOffset,           //当日总游戏时长
                        status : 0,                       //1已发送 0未发送
                    };
                    localGTimeRecord[_curDateString] = _gtObj;
                }
            }
            wx.setStorage({
                key:  FZ.TuyooSDK.LOCAL_GAME_TIME_RECORD,
                data: localGTimeRecord
            });

            FZ.TuyooSDK.onShowTimeStamp = -1;

        }catch (e){
            console.error("error:", "FZ.TuyooSDK.writeBackLocolRecord ===>" + JSON.stringify(e));
        }
    },

    /**
     * 获取每日游戏时长的本地记录（本地只对最近30日时长进行记录）
     */
    getLocalGameTimeRecord : function () {

        try{
            return wx.getStorageSync(FZ.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};
        }catch (e){
            return {};
        }

    },

    /**
     * 获取每日分享次数的本地记录（本地只对最近30日的分享次数进行记录）
     */
    getLocalShareTimesRecord : function () {

        try{
            return wx.getStorageSync(FZ.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};
        }catch (e){
            return {};
        }

    },

    /**
     * 上传激励视频日志
     * @param sceneName  场景名称（必须为非空字符串）
     * @param StatusCode 状态码  （1代表拉起激励视频，2代表观看结束，3代表观看取消，4代表获取激励视频失败）
     */
    postRVideoAdLog : function (sceneName, StatusCode) {

        if(typeof sceneName != 'string' || !sceneName) {
            console.error('Error sceneName! Please Check!');
            return;
        }

        if(1 != StatusCode && 2 != StatusCode && 3 != StatusCode&& 4 != StatusCode){
            console.error('Error StatusCode! Please Check!');
            return;
        }

        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeOnReportVideoAdsInfo, [sceneName, StatusCode]);

    },

    //获取用户特征库信息
    getUserFeature : function (gameid, cloudid, userid, successCallback, failCallBack) {

        if(!gameid || !cloudid || !userid){

            FZ.LOGE('getUserFeature', 'Error: Params Error, Please Check!');
        }
        var _url = 'https://analy.ywdier.com/';

        var reqObj = {};
        var timeStamp = new Date().getTime();
        reqObj.act = 'api.getUserFeature';
        reqObj.time = timeStamp;
        reqObj.cloud_id = cloudid;
        reqObj.game_id = gameid;
        reqObj.user_id = userid;

        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for(var key in reqObj) {
            paramStrList.push(key + '=' + reqObj[key]);
        }
        paramStrList.push('sign=' + signStr);
        var finalUrl = _url + '?' + paramStrList.join('&');
        var that = this;

        wx.request({
            url : finalUrl,
            method : 'GET',
            success : function (res) {

                if(200 == res.status) {
                    FZ.NotificationCenter.trigger(FZ.EventType.GET_USERFEATURE_INFO_SUCCESS, res.data);
                    successCallback && successCallback(res.data);
                }else{
                    FZ.NotificationCenter.trigger(FZ.EventType.GET_USERFEATURE_INFO_FAIL);
                    failCallBack && failCallBack();
                }
            },
            fail : function (res) {
                FZ.NotificationCenter.trigger(FZ.EventType.GET_USERFEATURE_INFO_FAIL);
                failCallBack && failCallBack();
            }
        });

    },

    //-------------------------------------------------------------
}

FZ.WechatInterfaceInit = function() {
    try {
        if(FZ.IsWechatPlatform()) {
            /**
             * 小程序回到前台,具体逻辑自己实现
             */
            wx.onShow(function (result) {
                // {"0":{"scene":1044,"shareTicket":"beecdf9e-e881-492c-8a3f-a7d8c54dfcdb","query":{}}}  (从后台切到前台才有shareTicket,启动时没有)
                FZ.LOGE('', "+++++++++++++++++onShow+++++++++++++++++"+JSON.stringify(result));
                //取相关参数
                var scene = result.scene;
                var query = result.query;
                var scenePath = '';
                FZ.showScene = scene;
                FZ.showQuery = query;
                //来源处理
                FZ.UserInfo.scene_id = scene;
                FZ.UserInfo.scene_param = query.from || "";
                FZ.UserInfo.invite_id = query.inviteCode || 0;
                FZ.StateInfo.isOnForeground = true;
                FZ.NotificationCenter.trigger(FZ.EventType.GAME_SHOW, result);
                var hasUUID = FZ.Util.checkLocalUUID();
                var oldUserFlag = hasUUID ? 1 : 0;
                if (query && query.gdt_vid && query.weixinadinfo) {
                    //从广点通广告跳过来的，from的开头加入gdt标识区分
                    var from = "gdt." + query.weixinadinfo;
                    FZ.UserInfo.scene_param = from;
                    FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom,[scene, from, oldUserFlag]);
                }
                else if(query && query.sourceCode) {
                    if(scene == 1088){
                        //从小程序动态消息推送进入，该场景为"点击用户分享卡片进入游戏注册时，param01为场景值，param02和param03分别代表分享点id和分享图文id"
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.inviteCode, query.sourceCode, query.imageType, query.entryType, oldUserFlag])
                    }else {
                        //从小程序消息卡片中点入,该场景为"点击用户分享卡片进入游戏注册时，分享用户的user_id直接当做场景参数放在param02，param03和param04分别代表分享点id和分享图文id"
                        //var query = "inviteCode="+ty.UserInfo.userId+"&sourceCode="+type +"&imageType="+imageMap.imageType+"&inviteName="+ty.UserInfo.userName;
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.inviteCode, query.sourceCode, query.imageType, "CardActive", oldUserFlag,query.template_type,query.fun_type]);
                    }
                    FZ.UserInfo.FromShareCard = true;
                    if(FZ.SystemInfo.isDownZip == true){
                        FZ.SystemInfo.isDownZip = false;
                        FZ.BiLog.clickStat(FZ.clickStatEventType.downZipStart,[]); 
                    }
                } else {
                    if(FZ.Util.isSceneQrCode(scene)) {
                        //从小程序码进入,相关见文档https://developers.weixin.qq.com/minigame/dev/tutorial/open-ability/qrcode.html
                        if (query.hasOwnProperty('scene')){
                            scenePath = query.scene;
                        } else if(result.hasOwnProperty('path')) {
                            scenePath = result.path;
                        }
                        scenePath.replace(".html", "");     //生成时可能会在path后面添加.html
                        scenePath = decodeURIComponent(scenePath);
                        FZ.UserInfo.scene_param = scenePath;
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom,[scene, scenePath, oldUserFlag]);
                    } else {
                        //场景值和场景参数分别记录到可选参数param01和param02当中，如param01=1058，param02=tuyouqipai
                        //场景参数由项目组接入推广渠道时配置，如公众号dacihua、tuyouqipai，二维码填写企业或个人标识
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.from, oldUserFlag]);
                    }
                }
                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeOnShowTimeStampSubmit,[FZ.SystemInfo.FZVersion]);
                FZ.TuyooSDK.login();
                if(FZ.SystemInfo.openLocalRecord){
                    setTimeout(FZ.TuyooSDK.processLocalRecord, 2000);
                }

                FZ.AdManager && FZ.AdManager.onForeGround && FZ.AdManager.onForeGround();
            });

            /**
             * 小程序进入后台
             */
            wx.onHide(function () {
                FZ.LOGE('',"+++++++++++++++++onHide+++++++++++++++++");
                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeOnHideTimeStampSubmit,[]);
                FZ.UserInfo.scene_id = 0;
                FZ.StateInfo.isOnForeground = false;
                FZ.NotificationCenter.trigger(FZ.EventType.GAME_HIDE);
                // FZ.TCPClient.close();

                if(FZ.SystemInfo.openLocalRecord){
                    FZ.TuyooSDK.writeBackLocolRecord();
                }
            });

            var getNetSuccess = function (res) {
                if (res.hasOwnProperty('isConnected')){
                    FZ.StateInfo.networkConnected = res.isConnected;
                }
                else if (res.hasOwnProperty('errMsg')){
                    FZ.StateInfo.networkConnected = res.errMsg == 'getNetworkType:ok'
                }
                else{
                    FZ.StateInfo.networkConnected = res.networkType != 'none';
                }

                FZ.StateInfo.networkType = res.networkType;//wifi,2g,3g,4g,none,unknown
            };

            wx.getNetworkType({
                success:getNetSuccess
            });

            wx.onNetworkStatusChange(getNetSuccess);

            wx.onError(function (res) {
                var d = new Date();
                var errMsg = 'userId:' + FZ.UserInfo.userId + 'time:'+ d.toDateString() + ' ' + d.toTimeString() +';' + res.message;
                FZ.BiLog.uploadLogTimely(errMsg);
            });
        }else if(navigator.platform=='android'){
            FZ.TuyooSDK.login();
        }
    }
    catch(err) {
        FZ.LOGE("error:", "FZ.WechatInterfaceInit——" + JSON.stringify(err));
    }
};

FZ.WechatInterfaceInit();


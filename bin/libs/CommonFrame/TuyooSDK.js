/**
 * @author zhaoliang
 * @date 1.28
 * 
 * 全局对象
 * 系统信息
 * 包括clientId，loginUrl等
 */
console.log("TuyooSDK loaded");
tywx.TuyooSDK = {
    SESSION_KEY: 'TU_SESSION_STORAGE',
    LOCAL_GAME_TIME_RECORD: 'LOCAL_GAME_TIME_RECORD',
    LOCAL_SHARE_TIMES_RECORD: 'LOCAL_SHARE_TIMES_RECORD',
    newUser:false,
    isFirstLogin:true,

    /***************************以下为登录相关接口*********************************/
    login: function() {
        if(tywx.IsWechatPlatform()) {
            tywx.TuyooSDK.getSystemInfo();
            tywx.TuyooSDK.getUserAreaInfo();
            tywx.TuyooSDK.wechatLogin();
            tywx.PropagateInterface._doHttpGetShareConfig();
        }else if(navigator.platform=='android'){
            //其他平台,待添加
            tywx.TuyooSDK.getUserAreaInfo();
            tywx.AndroidAloneHelper.login();
            tywx.TuyooSDK.updateLastLoginDate();
        }
        tywx.TuyooSDK.updateLastLoginDate();
    },
    updateLastLoginDate:function(){
        var date = new Date().toLocaleDateString();
		this.lastLoginDate = tywx.Util.getItemFromLocalStorage('Last_Login_Date', "0");
        var firstloginDate = tywx.Util.getItemFromLocalStorage('First_Login_Date', date);
        if(firstloginDate==date){//当前为第一次登陆，标记为新用户
			this.newUser = true;
			tywx.Util.setItemToLocalStorage('First_Login_Date', date);
        }
        this.isFirstLogin = this.lastLoginDate==date?false:true;
        tywx.Util.setItemToLocalStorage('Last_Login_Date', date);
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
        var finalUrl = tywx.SystemInfo.areaUrl + 'api/iploc5/search/city';
        var successcb = function(ret) {
            if(ret&&ret['ok']===1){
                var loc = ret['loc'];
                if(loc&&loc.length>3){
                    tywx.LOGD("fengbing", " *--*-*-*-*-*  获取用户区域:  "+loc[2]);
                    tywx.UserInfo.userArea = loc[2];
                    tywx.UserInfo.userProvince = loc[1];
                }
            }
        };

        var failcb = function(ret) {
        };
        tywx.HttpUtil.httpGet({'url':finalUrl}, successcb, failcb);
    },
    
    // 微信登录
    wechatLogin: function() {
        try {
            if(!tywx.IsWechatPlatform()) {
                return;
            }

            tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeWxLoginStart, []);
            wx.login({
                success: function(params) {
                    tywx.LOGD(null, 'wx login success, params:' + JSON.stringify(params));
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeWxLoginSuccess, [params.code]);
                    if (params.code) {
                        var code = params.code;
                        tywx.TuyooSDK.loginTuyooWithCode(code, {});
                        tywx.NotificationCenter.trigger(tywx.EventType.WEIXIN_LOGIN_SUCCESS);
                    }
                },

                fail: function(params) {
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeWxLoginFailed, []);
                    tywx.LOGD(null, 'wx login fail, params:' + JSON.stringify(params));
                    tywx.NotificationCenter.trigger(tywx.EventType.WEIXIN_LOGIN_FAIL);
                },

                complete: function(params) {

                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.wechatLogin——" + JSON.stringify(err));
        }
    },

    // 微信不需要重新授权，使用
    loginTuyooWith3rdSession: function() {
        try {
            if(!tywx.IsWechatPlatform()) {
                return;
            }
            wx.getStorage({
                key: tywx.TuyooSDK.SESSION_KEY,
                success: function(params) {
                    if (!params.data) {
                        tywx.TuyooSDK.wechatLogin();
                        return;
                    }
                    // 微信授权成功后使用code登录途游服务器
                    wx.request({
                        url: tywx.SystemInfo.loginUrl + 'open/v3/user/processSnsIdNew',
                        data: {
                            snsId: params.data,
                            deviceName: 'wechatGame',
                            clientId: tywx.SystemInfo.clientId,
                            appId: tywx.SystemInfo.appId
                        },

                        success: function(params) {
                            tywx.LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
                        },

                        fail: function(params) {
                            tywx.LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
                        },

                        complete: function(params) {

                        }
                    });
                },
                fail: function(params) {
                    tywx.TuyooSDK.wechatLogin();
                },
                complete:function(params) {

                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.loginTuyooWith3rdSession——" + JSON.stringify(err));
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
            if (!tywx.IsWechatPlatform()) {
                return;
            }
            // 微信授权成功后使用code登录途游服务器
            wx.showShareMenu({
                withShareTicket: true
            });


            //咱们后端 0 是男 1 是女,要转换
            var gender = userInfo.gender || 0;

            var local_uuid = tywx.Util.getLocalUUID();
            tywx.LOGD("local_uuid:", local_uuid);
            var sdkPath = tywx.SystemInfo.loginUrl;
            var dataObj = {
                appId: tywx.SystemInfo.appId,
                wxAppId: tywx.SystemInfo.wxAppId,
                clientId: tywx.SystemInfo.clientId,
                snsId: 'wxapp:' + code,
                uuid: local_uuid,
                //以下为上传玩家的微信用户信息
                //nickName: userInfo.nickName,
                //avatarUrl: userInfo.avatarUrl,
                gender: gender,
                scene_id: tywx.UserInfo.scene_id || "",
                scene_param: tywx.UserInfo.scene_param || "",
                invite_id: tywx.UserInfo.invite_id || 0
            };
            if (userInfo && userInfo.nickName) {
                dataObj.nickName = userInfo.nickName;
            }

            if (userInfo && userInfo.avatarUrl) {
                dataObj.avatarUrl = userInfo.avatarUrl;
            }
            tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeLoginSDKStart, [code, local_uuid, userInfo.nickName]);
            wx.request({
                url: sdkPath + 'open/v6/user/LoginBySnsIdNoVerify',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: dataObj,
                method: 'POST',

                success: function (params) {
                    tywx.LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
                    var checkData = params.data;
                    if ((checkData.error && checkData.error.code == 1) || !(checkData.result && checkData.result.userId)) {
                        tywx.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                        return;
                    }

                    // 保存用户名/用户ID/用户头像
                    var result = checkData.result;
                    tywx.UserInfo.userId = result.userId;
                    tywx.UserInfo.userName = result.userName;
                    tywx.UserInfo.userPic = result.purl;
                    tywx.UserInfo.authorCode = result.authorCode;
                    tywx.UserInfo.wxgame_session_key = result.wxgame_session_key;
                    tywx.LOGD(null, 'userId:' + tywx.UserInfo.userId + ' userName:' + tywx.UserInfo.userName + ' userPic:' + tywx.UserInfo.userPic);

                    if (tywx.UserInfo.userId && tywx.UserInfo.userName) {
                        tywx.LOGE("TUYOO_SDK_LOGIN_SUCCESS", JSON.stringify(params));
                    } else {
                        tywx.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                    }

                    var token = result.token;
                    tywx.LOGD(null, 'token:' + token);
                    wx.setStorage({
                        key: tywx.TuyooSDK.SESSION_KEY,
                        data: token
                    });


                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeLoginSDKSuccess, [code, local_uuid, userInfo.nickName, result.userId]);
                    if (tywx.showScene && tywx.showQuery && tywx.showQuery.sourceCode) {
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom, [tywx.showScene, tywx.showQuery.inviteCode, tywx.showQuery.sourceCode, tywx.showQuery.imageType, "GameStart"]);
                    }
                    //tywx.TuyooSDK.initWebSocketUrl(result);
                    tywx.PropagateInterface.processRawShareConfigInfo();    //处理分享数据
                    // //建立TCP连接
                    // if(tywx.SystemInfo.webSocketUrl != null && tywx.SystemInfo.webSocketUrl != ''){
                    //     tywx.TCPClient.connect(tywx.SystemInfo.webSocketUrl);
                    // }
                    var params = {url: ""};
                    params.url = tywx.SystemInfo.loginUrl + "api/quanmzc/game/getGameInfo?gameId=" + tywx.SystemInfo.gameId + "&userId=" + tywx.UserInfo.userId + "&clientId" + tywx.SystemInfo.clientId;
                    tywx.HttpUtil.httpGet(params, function(res){
                    	// console.log('用户信息-------:' + JSON.stringify(res));
                        if(res && res.result){
                            console.log('用户信息-------1:');
                            // console.log('用户信息-------1:res.result.gamedata = ' + res.result.gamedata);
                            if(res.result.gamedata == undefined || res.result.gamedata == null) {
                            	console.log('用户信息-------2:');
                                tywx.SystemInfo.isNewUser = true
                            }else {
                                var gamedata = JSON.parse(res.result.gamedata);
                                if(gamedata.checkPoint == 1){
                                    console.log('用户信息-------2:');
                                    tywx.SystemInfo.isNewUser = true;
                                }
                            }
                        }
                    }, function(){

                    });

                    // 发送登录成功事件
                    tywx.NotificationCenter.trigger(tywx.EventType.SDK_LOGIN_SUCCESS);
                },

                fail: function (params) {
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeLoginSDKFailed, [code, local_uuid, userInfo.nickName]);
                    tywx.LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
                    tywx.LOGE("TUYOO_SDK_LOGIN_FAIL", JSON.stringify(params));
                    tywx.NotificationCenter.trigger(tywx.EventType.SDK_LOGIN_FAIL);
                },

                complete: function (params) {

                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.loginTuyooWithCode——" + JSON.stringify(err));
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
            if (tywx.SystemInfo.loginUrl.indexOf("https://") > -1){
                webSocketUrl = 'wss://' + ip + '/';
            }
            else{
                webSocketUrl = 'ws://' + ip + ':' + port.toString() + '/';
            }
            tywx.LOGD(null, 'webSocketUrl:' + webSocketUrl);
            tywx.SystemInfo.webSocketUrl = webSocketUrl;
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
            if(!tywx.IsWechatPlatform()) {
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
                    tywx.UserInfo.systemType = resultType;
                    tywx.UserInfo.wechatType = result.version;
                    tywx.UserInfo.model = result.model;
                    tywx.UserInfo.system = result.system;
                    tywx.UserInfo.sdkVersion = result.SDKVersion;
                    console.error("基础库版本为:" + tywx.UserInfo.sdkVersion);

                    tywx.TuyooSDK.checkSdkVersion();

                    //上报顺序为微信版本 基础库版本 平台 操作系统版本
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeSubmitVersionInfo,
                        [result.version, result.SDKVersion, result.platform, result.system]);
                },
                fail : function () {
                },
                complete : function () {
                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.getSystemInfo——" + JSON.stringify(err));
        }
    },

    checkSdkVersion: function(){
        if(tywx.TuyooSDK.compareVersion(tywx.UserInfo.sdkVersion, '2.1.0') < 0)
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
                        tywx.TuyooSDK.checkSdkVersion();
                    }
                    
                },
                fail: function(res){
                    tywx.TuyooSDK.checkSdkVersion();
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
            if(!tywx.IsWechatPlatform()) {
                return;
            }
            wx.getSetting({
                success:function(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeAuthorizationStart, []);
                        wx.authorize({
                            scope : "scope.userInfo",
                            success : function () {
                                tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeAuthorizationSuccess, []);
                                tywx.NotificationCenter.trigger(tywx.EventType.START_AUTHORIZATION_SUCCESS);
                            },
                            fail:function () {
                                tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeAuthorizationFailed, []);
                                tywx.NotificationCenter.trigger(tywx.EventType.START_AUTHORIZATION_FAILED);
                            },
                            complete:function () {
                            }
                        });
                    }
                    else{
                        tywx.NotificationCenter.trigger(tywx.EventType.START_AUTHORIZATION_SUCCESS);
                    }
                }
            })
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.wechatAuthorize——" + JSON.stringify(err));
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
        data.gameId = tywx.SystemInfo.gameId;
        data.prodName = name;
        data.prodCount = prodCount;
        data.appInfo = extraAppInfo ? extraAppInfo :{};
        data.extraProdId = extraProdId ? extraProdId : '';
        tywx.TuyooSDK.rechargeOrder(data);
    },

    orderCallFunc:function(url, platformOrderId, chargeCoin){
        try {
            if(!tywx.IsWechatPlatform()) {
                return;
            }
            var local_uuid = tywx.Util.getLocalUUID();
            var _chargeCoin = chargeCoin;
            wx.request({
                url: url,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    userId:tywx.UserInfo.userId,
                    appId: tywx.SystemInfo.appId,
                    wxAppId: tywx.SystemInfo.wxAppId,
                    clientId: tywx.SystemInfo.clientId,
                    imei: 'null',
                    uuid : local_uuid,
                    platformOrderId: platformOrderId,
                },

                method:'POST',

                success: function(results) {
                    var tips = "购买成功";
                },
                fail: function(params) {
                    tywx.LOGE(null, 'file = [Recharge] fun = [OrderCallFun] 充值失败 params = ' + JSON.stringify(params));
                },
                complete: function(params) {

                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.orderCallFunc——" + JSON.stringify(err));
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
            if(!tywx.IsWechatPlatform()) {
                return;
            }
            var local_uuid = tywx.Util.getLocalUUID();
            var sdkPath = tywx.SystemInfo.loginUrl;
            var reqUrl = tywx.SystemInfo.hall_version == 'hall37' ? sdkPath + 'open/v4/pay/order': sdkPath + 'open/v5/pay/order';
            wx.request({
                url: reqUrl,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    userId:tywx.UserInfo.userId,
                    appId: tywx.SystemInfo.appId,
                    wxAppId: tywx.SystemInfo.wxAppId,
                    clientId: tywx.SystemInfo.clientId,
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
                    tywx.LOGE(null, 'tuyoo rechargeOrder success, params:' + JSON.stringify(params));
                    var results = params.data.result;
                    if (results.code == 0) {
                        var chargeInfo = results.chargeInfo;
                        var chargeData = chargeInfo.chargeData;
                        var notifyUrl = chargeData.notifyUrl;
                        var platformOrderId = chargeData.platformOrderId;
                        var buyQuantity = chargeData.buyQuantity ? chargeData.buyQuantity : (10 * chargeInfo.chargeTotal);
                        tywx.LOGE(null, 'tuyoo rechargeOrder success 创建订单成功, chargeData.mustcharge =' + chargeData.mustcharge);
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
                                    tywx.TuyooSDK.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
                                },
                                fail:function(res) {
                                    tywx.LOGE(null, '米大师支付 fail params = ' + JSON.stringify(params));
                                    if(res.errCode && res.errCode == 1) {
                                        //支付取消
                                        tywx.TuyooSDK.cancelOrder(platformOrderId);
                                    }
                                }
                            });
                        }else if (chargeData && chargeData.mustcharge == 0){
                            tywx.TuyooSDK.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
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
            tywx.LOGE("error:", "tywx.TuyooSDK.rechargeOrder——" + JSON.stringify(err));
        }
    },

    cancelOrder: function(orderId) {
        try {
            var sendUrl = tywx.SystemInfo.loginUrl + 'open/v4/pay/cancelorder';
            var postData = {
                platformOrderId: orderId,
                appId: tywx.SystemInfo.appId,
                userId: tywx.UserInfo.userId,
                clientId: tywx.SystemInfo.clientId,
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
                    tywx.LOGE(null, 'tuyoo cancelOrder success, params:' + JSON.stringify(params));
                },
                fail: function(params) {
                    tywx.LOGE(null, 'tuyoo cancelOrder fail, params:' + JSON.stringify(params));
                },
                complete: function(params) {
                }
            });
        }
        catch(err) {
            tywx.LOGE("error:", "tywx.TuyooSDK.cancelOrder——" + JSON.stringify(err));
        }
    },

    //-------------------处理本地数据缓存并发送至BI-------------------

    freshLocalShareTimes : function () {      //分享成功后才能调用
        try {
            var localSTimesRecord = wx.getStorageSync(tywx.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};

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
                key:  tywx.TuyooSDK.LOCAL_SHARE_TIMES_RECORD,
                data: localSTimesRecord
            });
        }catch (e){
            console.error("error:", "tywx.TuyooSDK.freshLocalShareTimes ===>" + JSON.stringify(e));
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

            tywx.TuyooSDK.onShowTimeStamp = (new Date()).getTime();
            
            if(!tywx.UserInfo.userId){
                return;
            }

            //读取
            var _cDate = new Date();
            var _localDate = _cDate.toLocaleDateString();


            var localGTimeRecord = wx.getStorageSync(tywx.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};

            if (localGTimeRecord) {
                for (var k in localGTimeRecord) {

                    if (k != _localDate && 0 == localGTimeRecord[k].status) {
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeOnReportGameTime, [localGTimeRecord[k].count, k]);
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
                key:  tywx.TuyooSDK.LOCAL_GAME_TIME_RECORD,
                data: _tmpGTRecord
            });


            var localSTimeRecord = wx.getStorageSync(tywx.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};
            if (localSTimeRecord) {
                for (var k in localSTimeRecord) {

                    if (k != _localDate && 0 == localSTimeRecord[k].status) {
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeOnReportShareTimes, [localSTimeRecord[k].count, k]);
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
                key:  tywx.TuyooSDK.LOCAL_SHARE_TIMES_RECORD,
                data: _tmpSTRecord
            });

        }catch (e){
            console.error("error:", "tywx.TuyooSDK.processLocalRecord ===>" + JSON.stringify(e));
        }

    },

    writeBackLocolRecord : function () {   //onHide时候调用
        try {

            if(tywx.TuyooSDK.onShowTimeStamp < 0){
                return;
            }

            var localGTimeRecord = wx.getStorageSync(tywx.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};

            var _curDate = new Date();
            var _curTimeStamps = _curDate.getTime();
            var _playTimeOffset = _curTimeStamps - tywx.TuyooSDK.onShowTimeStamp;

            //判读是否跨天
            var _startTimeStamps = Date.parse(_curDate.toLocaleDateString());

            if (_startTimeStamps > tywx.TuyooSDK.onShowTimeStamp) {

                var _preDateGameTime = _startTimeStamps - tywx.TuyooSDK.onShowTimeStamp;
                var _curDateGameTime = _playTimeOffset - _preDateGameTime;

                var _preDateString = (new Date(tywx.TuyooSDK.onShowTimeStamp)).toLocaleDateString(); // 2018/08/19
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
                key:  tywx.TuyooSDK.LOCAL_GAME_TIME_RECORD,
                data: localGTimeRecord
            });

            tywx.TuyooSDK.onShowTimeStamp = -1;

        }catch (e){
            console.error("error:", "tywx.TuyooSDK.writeBackLocolRecord ===>" + JSON.stringify(e));
        }
    },

    /**
     * 获取每日游戏时长的本地记录（本地只对最近30日时长进行记录）
     */
    getLocalGameTimeRecord : function () {

        try{
            return wx.getStorageSync(tywx.TuyooSDK.LOCAL_GAME_TIME_RECORD) || {};
        }catch (e){
            return {};
        }

    },

    /**
     * 获取每日分享次数的本地记录（本地只对最近30日的分享次数进行记录）
     */
    getLocalShareTimesRecord : function () {

        try{
            return wx.getStorageSync(tywx.TuyooSDK.LOCAL_SHARE_TIMES_RECORD) || {};
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

        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeOnReportVideoAdsInfo, [sceneName, StatusCode]);

    },

    //获取用户特征库信息
    getUserFeature : function (gameid, cloudid, userid, successCallback, failCallBack) {

        if(!gameid || !cloudid || !userid){

            tywx.LOGE('getUserFeature', 'Error: Params Error, Please Check!');
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
                    tywx.NotificationCenter.trigger(tywx.EventType.GET_USERFEATURE_INFO_SUCCESS, res.data);
                    successCallback && successCallback(res.data);
                }else{
                    tywx.NotificationCenter.trigger(tywx.EventType.GET_USERFEATURE_INFO_FAIL);
                    failCallBack && failCallBack();
                }
            },
            fail : function (res) {
                tywx.NotificationCenter.trigger(tywx.EventType.GET_USERFEATURE_INFO_FAIL);
                failCallBack && failCallBack();
            }
        });

    },

    //-------------------------------------------------------------
}

tywx.WechatInterfaceInit = function() {
    try {
        if(tywx.IsWechatPlatform()) {
            /**
             * 小程序回到前台,具体逻辑自己实现
             */
            wx.onShow(function (result) {
                // {"0":{"scene":1044,"shareTicket":"beecdf9e-e881-492c-8a3f-a7d8c54dfcdb","query":{}}}  (从后台切到前台才有shareTicket,启动时没有)
                tywx.LOGE('', "+++++++++++++++++onShow+++++++++++++++++"+JSON.stringify(result));
                //取相关参数
                var scene = result.scene;
                var query = result.query;
                var scenePath = '';
                tywx.showScene = scene;
                tywx.showQuery = query;
                //来源处理
                tywx.UserInfo.scene_id = scene;
                tywx.UserInfo.scene_param = query.from || "";
                tywx.UserInfo.invite_id = query.inviteCode || 0;
                tywx.StateInfo.isOnForeground = true;
                tywx.NotificationCenter.trigger(tywx.EventType.GAME_SHOW, result);
                var hasUUID = tywx.Util.checkLocalUUID();
                var oldUserFlag = hasUUID ? 1 : 0;
                if (query && query.gdt_vid && query.weixinadinfo) {
                    //从广点通广告跳过来的，from的开头加入gdt标识区分
                    var from = "gdt." + query.weixinadinfo;
                    tywx.UserInfo.scene_param = from;
                    tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom,[scene, from, oldUserFlag]);
                }
                else if(query && query.sourceCode) {
                    if(scene == 1088){
                        //从小程序动态消息推送进入，该场景为"点击用户分享卡片进入游戏注册时，param01为场景值，param02和param03分别代表分享点id和分享图文id"
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.inviteCode, query.sourceCode, query.imageType, query.entryType, oldUserFlag])
                    }else {
                        //从小程序消息卡片中点入,该场景为"点击用户分享卡片进入游戏注册时，分享用户的user_id直接当做场景参数放在param02，param03和param04分别代表分享点id和分享图文id"
                        //var query = "inviteCode="+ty.UserInfo.userId+"&sourceCode="+type +"&imageType="+imageMap.imageType+"&inviteName="+ty.UserInfo.userName;
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.inviteCode, query.sourceCode, query.imageType, "CardActive", oldUserFlag,query.template_type,query.fun_type]);
                    }
                    tywx.UserInfo.FromShareCard = true;
                    if(tywx.SystemInfo.isDownZip == true){
                        tywx.SystemInfo.isDownZip = false;
                        tywx.BiLog.clickStat(tywx.clickStatEventType.downZipStart,[]); 
                    }
                } else {
                    if(tywx.Util.isSceneQrCode(scene)) {
                        //从小程序码进入,相关见文档https://developers.weixin.qq.com/minigame/dev/tutorial/open-ability/qrcode.html
                        if (query.hasOwnProperty('scene')){
                            scenePath = query.scene;
                        } else if(result.hasOwnProperty('path')) {
                            scenePath = result.path;
                        }
                        scenePath.replace(".html", "");     //生成时可能会在path后面添加.html
                        scenePath = decodeURIComponent(scenePath);
                        tywx.UserInfo.scene_param = scenePath;
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom,[scene, scenePath, oldUserFlag]);
                    } else {
                        //场景值和场景参数分别记录到可选参数param01和param02当中，如param01=1058，param02=tuyouqipai
                        //场景参数由项目组接入推广渠道时配置，如公众号dacihua、tuyouqipai，二维码填写企业或个人标识
                        tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeUserFrom,[scene, query.from, oldUserFlag]);
                    }
                }
                tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeOnShowTimeStampSubmit,[tywx.SystemInfo.tywxVersion]);
                tywx.TuyooSDK.login();
                if(tywx.SystemInfo.openLocalRecord){
                    setTimeout(tywx.TuyooSDK.processLocalRecord, 2000);
                }

                tywx.AdManager && tywx.AdManager.onForeGround && tywx.AdManager.onForeGround();
            });

            /**
             * 小程序进入后台
             */
            wx.onHide(function () {
                tywx.LOGE('',"+++++++++++++++++onHide+++++++++++++++++");
                tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeOnHideTimeStampSubmit,[]);
                tywx.UserInfo.scene_id = 0;
                tywx.StateInfo.isOnForeground = false;
                tywx.NotificationCenter.trigger(tywx.EventType.GAME_HIDE);
                // tywx.TCPClient.close();

                if(tywx.SystemInfo.openLocalRecord){
                    tywx.TuyooSDK.writeBackLocolRecord();
                }
            });

            var getNetSuccess = function (res) {
                if (res.hasOwnProperty('isConnected')){
                    tywx.StateInfo.networkConnected = res.isConnected;
                }
                else if (res.hasOwnProperty('errMsg')){
                    tywx.StateInfo.networkConnected = res.errMsg == 'getNetworkType:ok'
                }
                else{
                    tywx.StateInfo.networkConnected = res.networkType != 'none';
                }

                tywx.StateInfo.networkType = res.networkType;//wifi,2g,3g,4g,none,unknown
            };

            wx.getNetworkType({
                success:getNetSuccess
            });

            wx.onNetworkStatusChange(getNetSuccess);

            wx.onError(function (res) {
                var d = new Date();
                var errMsg = 'userId:' + tywx.UserInfo.userId + 'time:'+ d.toDateString() + ' ' + d.toTimeString() +';' + res.message;
                tywx.BiLog.uploadLogTimely(errMsg);
            });
        }else if(navigator.platform=='android'){
            tywx.TuyooSDK.login();
        }
    }
    catch(err) {
        tywx.LOGE("error:", "tywx.WechatInterfaceInit——" + JSON.stringify(err));
    }
};

tywx.WechatInterfaceInit();


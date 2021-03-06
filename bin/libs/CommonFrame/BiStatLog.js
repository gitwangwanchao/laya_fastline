/**
 * Created by xiaochuntian on 2018/6/4.
 */


//新的json打点格式,暂未启用
FZ.BiStatLog = {
    BiStatInfo: null,
    init: function() {
        this.BiStatInfo = {};
        this.getStaticInfo();
        this.getTyInfo();
        this.getLocationInfo();
        this.getSystemInfo();
    },

    getStaticInfo: function() {
        this.BiStatInfo.IP = "#IP";
        this.BiStatInfo.receiveTime = "#receiveTime";
    },

    getTyInfo: function() {
        this.BiStatInfo.cloudId = FZ.SystemInfo.cloudId;
        this.BiStatInfo.gameId = FZ.SystemInfo.gameId;
        this.BiStatInfo.appId = FZ.SystemInfo.appId;
        this.BiStatInfo.clientId = FZ.SystemInfo.clientId;
        this.BiStatInfo.intClientId = FZ.SystemInfo.intClientId;
        this.BiStatInfo.userId = FZ.UserInfo.userId;
        this.BiStatInfo.uuid = FZ.Util.getLocalUUID();
        this.BiStatInfo.gameVersion = FZ.SystemInfo.version;
        this.BiStatInfo.wxAppId = FZ.SystemInfo.wxAppId;
    },

    getUserId: function() {
        this.BiStatInfo.userId = FZ.UserInfo.userId;
    },

    getNetworkType: function() {
        this.BiStatInfo.networkType = FZ.StateInfo.networkType;
    },

    getLocationInfo: function(callback) {
        var self = this;
        wx.getLocation({
            type: 'wgs84',
            success: function(res) {
                self.BiStatInfo.latitude = res.latitude;
                self.BiStatInfo.longitude = res.longitude;
                self.BiStatInfo.speed = res.speed;
                self.BiStatInfo.accuracy = res.accuracy;
            },
            complete: function() {
                callback();
            }
        })
    },

    getSystemInfo: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.BiStatInfo.brand = res.brand;
                that.BiStatInfo.model = res.model;
                that.BiStatInfo.pixelRatio = res.pixelRatio;
                that.BiStatInfo.screenWidth = res.screenWidth;
                that.BiStatInfo.screenHeight = res.screenHeight;
                that.BiStatInfo.windowWidth = res.windowWidth;
                that.BiStatInfo.windowHeight = res.windowHeight;
                that.BiStatInfo.language = res.language;
                that.BiStatInfo.wxVersion = res.version;
                that.BiStatInfo.systemVersion = res.system;
                that.BiStatInfo.platform = res.platform;
                that.BiStatInfo.wxSDKVersion = res.SDKVersion;
                that.BiStatInfo.fontSizeSetting = res.fontSizeSetting;

            }
        })
    },

    sendEvent: function(eventId, eventParams) {
        if(typeof(eventParams) != 'object') {
            eventParams = {};
        }
        this.getNetworkType();
        this.getUserId();
        this.BiStatInfo.eventId = eventId;
        this.BiStatInfo.eventParams = eventParams;
        this.BiStatInfo.eventTime = Date.now().valueOf();

        var cb = function() {
            var eventStr = JSON.stringify(FZ.BiStatLog.BiStatInfo);
            var header = ['Content-Type:text/plain'];
            var configObj = {
                'url': FZ.SystemInfo.biLogServer,
                'headers': header,
                'postData': eventStr,
            };
            FZ.HttpUtil.httpPost(configObj);
        };

        this.getLocationInfo(cb);
    },
};

//FZ.BiStatLog.init();
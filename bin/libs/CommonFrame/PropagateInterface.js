/**
 * Created by xiaochuntian on 2018/5/25.
 * 营销传播智能管理系统对应数据获取接口
 */


FZ.PropagateInterface = {
    //ShareConfig: {},

    /**
     * 通过http获取分享相关信息,根据权重自动选择条目,
     * 本地有缓存,调用后会立刻返回分享信息,不会出现http请求带来的延迟
     * http://market.touch4.me/?act=api.getShareConfig&time=1421755384&game_mark=28-20015&sign=1d356c1417a1d58fcec442eb8f655a4e
     FZ.PropagateInterface.getShareConfigInfoAutoWeight();
     * 返回值例子:
     {
           "normalshare": {
               "sharePicUrl": "http:\/\/xiaoyouxi.qiniu.andla.cn\/pkgame\/share_wx\/mr_gun_share4.png",
               "shareContent": "精彩街机射击游戏，玩出你风格",
               "sharePointId": "024",
               "shareSchemeId": "035032",
               "extraAdd": [],
               "weight": 10
           }
     }
     *
     *
     */
    _cachedShareConfig: undefined,
    _rawConfigInfo: undefined,
    _connectConfigInfo: {},

    getShareConfigInfoAutoWeight: function () {
        return this._shuffleByWeights();
    },

    _doHttpGetShareConfig: function () {
        var reqObj = {};
        var timeStamp = new Date().getTime();
        reqObj.act = 'api.getShareConfig';
        reqObj.time = timeStamp;
        reqObj.game_mark = FZ.SystemInfo.cloudId + "-" + FZ.SystemInfo.gameId;

        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + '=' + reqObj[key]);
        }
        paramStrList.push('sign=' + signStr);
        var finalUrl = FZ.SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');

        var self = this;
        var successcb = function (ret) {

            if(ret.retmsg) {
                self._rawConfigInfo = ret.retmsg;
                self.processRawShareConfigInfo();
                self.connectRawShareConfigInfo();
            }

        };

        var failcb = function (ret) {
            FZ.NotificationCenter.trigger(FZ.EventType.GET_SHARE_CONFIG_FAIL, ret);

            var fc = function () {
                self._doHttpGetShareConfig();
            };
            setTimeout(fc, 10000);

        };
        FZ.HttpUtil.httpGet({'url': finalUrl}, successcb, failcb);
    },

    _shuffleByWeights: function () {
        var ret = {};
        for (var key in this._cachedShareConfig) {
            if(key == 'shareExt') continue;
            var slotArr = this._cachedShareConfig[key];
            if (slotArr.length == 0) {
                ret[key] = {};
            }
            else if (slotArr.length == 1) {
                ret[key] = slotArr[0];
            }
            else {
                var totalWeights = slotArr.reduce(function (x, y) {
                    return x + y.weight;
                }, 0);
                var rnd = Math.random() * totalWeights;
                for (var i = 0; i < slotArr.length; i++) {
                    rnd -= slotArr[i].weight;
                    if (rnd <= 0) {
                        ret[key] = slotArr[i];
                        break;
                    }
                }
            }
        }
        return ret;
    },

    /**
     * 获取用户特征值接口
     * http://market.touch4.me/?act=api.getUserFeature&cloud_id=24&game_id=6&time=1527235026&user_id=1404248&sign=a2b6938904ac3759fe6404ea8ed49267
     * @param reqObj
     */
    getUserFeatureInfo: function () {
        var reqObj = {};
        var timeStamp = new Date().getTime();
        reqObj.act = 'api.getUserFeature';
        reqObj.cloud_id = FZ.SystemInfo.cloudId;
        reqObj.game_id = FZ.SystemInfo.gameId;
        reqObj.user_id = FZ.UserInfo.userId;
        reqObj.time = timeStamp;

        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + '=' + reqObj[key]);
        }
        paramStrList.push('sign=' + signStr);
        var finalUrl = FZ.SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');
        var successcb = function (ret) {
            FZ.NotificationCenter.trigger(FZ.EventType.GET_USER_FEATURE_SUCCESS, ret);
        };

        var failcb = function (ret) {
            FZ.NotificationCenter.trigger(FZ.EventType.GET_USER_FEATURE_FAIL, ret);
        };
        FZ.HttpUtil.httpGet({'url': finalUrl}, successcb, failcb);
    },

    /**
     * UID处理请求信息
     */
    processRawShareConfigInfo : function () {

        var that = this;
        this._cachedShareConfig = {};

        if (!this._rawConfigInfo) {
            return;
        }
        if(!FZ.UserInfo.userId){
            return;
        }

        var sPointKeys = Object.keys(this._rawConfigInfo);
        for (var i = 0, len = sPointKeys.length; i < len; i++) {

            var sPointList = this._rawConfigInfo[sPointKeys[i]];
            var _len = sPointList.length;
            this._cachedShareConfig[sPointKeys[i]] = [];

            if (0 < _len) {

                sPointList.forEach(function(v){
                    var _black_rear_uidList = v.filter_user || [];       //uid过滤
                    var _len = _black_rear_uidList.length;

                    if (0 == _len) {
                        that._cachedShareConfig[sPointKeys[i]].push(v);
                    } else{
                        var isUIDForbidden = false;
                        for (var j = 0; j < _len; j++) {

                            var _sUid = FZ.UserInfo.userId.toString();
                            if (_sUid.charAt(_sUid.length - 1) == _black_rear_uidList[j]) {
                                isUIDForbidden = true;
                                break;
                            }
                        }
                        if (!isUIDForbidden){
                            that._cachedShareConfig[sPointKeys[i]].push(v);
                        }
                    }
                })
            }
        }
        FZ.NotificationCenter.trigger(FZ.EventType.GET_SHARE_CONFIG_SUCCESS, this._shuffleByWeights());
    },

    /**
     * 处理分享点与template_type的对应关系
     */
    connectRawShareConfigInfo : function () {

        for (var key in this._rawConfigInfo) {

            var slotArr = this._rawConfigInfo[key];
            var _len = slotArr.length;

            if(_len == 0){
                continue;
            }else {
                var _key = slotArr[0].sharePointId.toString();
                var _value = slotArr[0].template_type;
                this._connectConfigInfo[_key] = _value;
            }
        }
    },

    /**
     * 计算签名字符串
     * @param reqObj
     * @returns {string}
     */
    getConfigSignStr: function (reqObj) {
        var sortedKeys = Object.keys(reqObj).sort();
        var signStr = '';
        for (var i = 0; i < sortedKeys.length; i++) {
            var key = sortedKeys[i];
            if (key == 'act' || key == 'sign') {
                continue;
            } else {
                signStr += key + '=' + reqObj[key];
            }
        }
        var finalSign = FZ.hex_md5('market.tuyoo.com-api-' + signStr + '-market.tuyoo-api') || '';
        return finalSign;
    },
};
/**
 * 微信小程序下TCP长连接使用websocket实现
 */

FZ.TCPClient = {
    TAG : "TCP client",
    CONNECT_STATUS_OK : 1,
    CONNECT_STATUS_OPENING : 2,
    CONNECT_STATUS_CLOSING : 3,
    CONNECT_STATUS_FAIL : 0,
    connectStatus : 0,
    isTimerInited : false,
    tickCount : 0,
    filterCmds : 'heartbeat',

    /**
     * 该方法包含了心跳和tcp状态检查两项功能,结合connect中的逻辑,是一个无限重试的机制
     */
    timerSchedule : function() {
        FZ.TCPClient.tickCount = (FZ.TCPClient.tickCount + 1) % 3;
        if (FZ.TCPClient.tickCount == 2 && FZ.TCPClient.connectStatus == FZ.TCPClient.CONNECT_STATUS_OK) {
            //每3秒发送心跳
            //hall.MsgFactory.sendHeartBeat();
            //监听者进行具体的协议实现
            FZ.NotificationCenter.trigger(FZ.EventType.SEND_HEART_BEAT);
        }

        // 每1秒检查一下长连接，如果不通，则重连。
        FZ.TCPClient.reconnet();
    },

    startCheckTimer: function() {
        FZ.TCPClient.isTimerInited = true;
        FZ.Timer.setTimer(cc.director, this.timerSchedule, 1);
    },

    stopCheckTimer: function() {
        FZ.TCPClient.isTimerInited = false;
        FZ.Timer.cancelTimer(cc.director, this.timerSchedule);
    },

    //以下为websocket连接相关方法
    connect: function(url){
        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeTCPStart, [url]);
        if (FZ.TCPClient.connectStatus == FZ.TCPClient.CONNECT_STATUS_OPENING
            || FZ.TCPClient.connectStatus == FZ.TCPClient.CONNECT_STATUS_OK) {
            return;
        }

        FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_OPENING;
        if(FZ.IsWechatPlatform()) {
            this.doWechatConnect(url);
        }
    },

    doWechatConnect: function(url) {
        try{
            if(!FZ.IsWechatPlatform()) {
                return;
            }
            wx.connectSocket({
                url: url
            });

            wx.onSocketOpen(function(res) {
                FZ.LOGD(FZ.TCPClient.TAG, 'TCP webSocket opened...');
                FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_OK;

                FZ.NotificationCenter.trigger(FZ.EventType.TCP_OPENED);
                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeTCPSuccess, [url]);
                // if (!FZ.TCPClient.isTimerInited) {
                //     //启动TCP的定时检查机制,成功连接1次后将永久进行检查
                //     FZ.TCPClient.startCheckTimer();
                // }
            });

            wx.onSocketError(function(res) {
                FZ.LOGD(FZ.TCPClient.TAG, 'TCP webSocket error...');
                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeTCPFailed, [url]);

                FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_FAIL;
                FZ.NotificationCenter.trigger(FZ.EventType.TCP_ERROR);
            });


            wx.onSocketClose(function(res) {
                FZ.LOGD(FZ.TCPClient.TAG, 'WebSocket 已关闭！');
                FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_FAIL;
                FZ.NotificationCenter.trigger(FZ.EventType.TCP_CLOSE);
            });

            wx.onSocketMessage(function(res) {
                if (!FZ.StateInfo.isOnForeground){
                    //在后台不处理消息
                    return;
                }
                // 处理长连接的消息
                var content = FZ.TCPClient.decodeMessage(res["data"]);
                if (content == null || content == '0000') {
                    return;
                }

                var msgStr = "[Receive TCP Msg]: " + unescape(content.replace(/\\u/gi,'%u'));
                var strJson = content.substr(0, content.length - 0);
                if (strJson != null && strJson.length > 0) {
                    var _json = JSON.parse(strJson);
                    if (FZ.TCPClient.filterCmds.indexOf(_json.cmd) == -1){
                        FZ.LOGD(FZ.TCPClient.TAG, msgStr);
                    }

                    FZ.NotificationCenter.trigger(FZ.EventType.TCP_RECEIVE, _json);
                }

            });
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TCPClient.doWechatConnect——" + JSON.stringify(err));
        }
    },

    decodeMessage: function(data) {
        if (typeof ArrayBuffer != 'undefined' && data instanceof ArrayBuffer) {
            var databytes = new Uint8Array(data);
            var content = ''
            for (var i = 0, len = databytes.length; i < len; i++) {
                var tmpc = String.fromCharCode(databytes[i]);
                content += tmpc;
            }
            return content;
        }
        var data = FZ.EncodeDecode.base64Decode(data);
        var mask = data.slice(0, 4);
        data = data.slice(4);
        for (var i = 0, len = data.length; i < len; i++) {
            var charcode = data[i];
            charcode ^= mask[i % 4];
            data[i] = charcode;
        }
        var result = FZ.EncodeDecode.utf8Decode(data);
        return result;
    },

    reconnet:function () {
        if (!FZ.StateInfo.isOnForeground){
            //在后台不重连(IOS会出问题)
            return;
        }
        if (FZ.TCPClient.connectStatus == FZ.TCPClient.CONNECT_STATUS_FAIL) {
            FZ.NotificationCenter.trigger(FZ.EventType.TCP_RECONNECT);
            FZ.TCPClient.connect(FZ.SystemInfo.webSocketUrl);
        }
    },

    sendMsg: function(data) {
        try {
            if (FZ.TCPClient.connectStatus != FZ.TCPClient.CONNECT_STATUS_OK) {
                return;
            }

            var msgStr = JSON.stringify(data);
            if (!FZ.Util.isNullOrEmpty(data.params) &&  FZ.TCPClient.filterCmds.indexOf(data.params.action) == -1){
                FZ.LOGD(FZ.TCPClient.TAG, '[Send TCP Msg]: ' + msgStr);
            }

            if(FZ.IsWechatPlatform()) {
                wx.sendSocketMessage({
                    data:msgStr,
                    success: function(params){
                        // FZ.LOGD(FZ.TCPClient.TAG, '[Send TCP Msg Success]: ' + JSON.stringify(params));
                    },

                    fail: function(params) {
                        var errMsg = params[0];
                        if (errMsg && errMsg['errMsg'] === 'sendSocketMessage:fail taskID not exist'){
                            wx.closeSocket();
                            FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_FAIL;
                        }
                        FZ.LOGD(FZ.TCPClient.TAG, '[Send TCP Msg fail]: ' + JSON.stringify(arguments));
                    },

                    complete: function(params) {
                    }
                });
            }
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TCPClient.sendMsg——" + JSON.stringify(err));
        }
    },

    close: function(){
        try {
            FZ.TCPClient.connectStatus = FZ.TCPClient.CONNECT_STATUS_CLOSING;
            if(FZ.IsWechatPlatform()) {
                wx.closeSocket();
            }
            // FZ.TCPClient.stopCheckTimer();
            FZ.LOGD(FZ.TCPClient.TAG, 'TCP close..............');
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.TCPClient.close——" + JSON.stringify(err));
        }
    }
};

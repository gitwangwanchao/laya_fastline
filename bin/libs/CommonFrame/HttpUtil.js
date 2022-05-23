/**
 * Created by xiaochuntian on 2018/5/2.
 */

tywx.HttpUtil = {
    parseSendMsg : function (params) {
        if (!params) {
            return "";
        }
    
        var str = "",
            count = 0,
            len = Object.keys(params).length;
        for (var key in params) {
            str += key;
            str += "=";
            str += params[key];
    
            if (count < len - 1) {
                str += '&';
            }
    
            count++;
        }
        return str;
    },
    httpPost:function (cfgObj) {
        try {
            if(tywx.IsWechatPlatform()) {
                wx.request({
                    url : cfgObj.url,
                    data : cfgObj.postData,
                    header : cfgObj.header,
                    method : 'POST',
                    dataType : 'json',
                    success : function (res) {
                        if (res.statusCode == 200){
                            //正常连接{"/api/bilog5/clientlog": "ok"}
                            if (res.data && res.data.hasOwnProperty('/api/bilog5/clientlog')
                                && res.data['/api/bilog5/clientlog'] == "ok") {
                                tywx.LOGD('ty.HttpUtil.httpPost', 'post success! ');
                            }
                        }
                        else{
                            tywx.LOGD('ty.HttpUtil.httpPost', 'statusCode:' + res.statusCode);
                        }
                    },
                    fail : function (res) {
                        tywx.LOGD('ty.HttpUtil.httpPost', 'post error! ' + cfgObj.url);
                    }
                });
            }else if(navigator.platform=='android'){
                var xhr=new Laya.HttpRequest();
                xhr.http.timeout = 5000;
                xhr.once(Laya.Event.COMPLETE,this,completeHandler);
                xhr.once(Laya.Event.ERROR,this,errorHandler);
                xhr.on(Laya.Event.PROGRESS,this,processHandler);
                tywx.LOGD(this._TAG, 'http post to cfgObj = ' + JSON.stringify(cfgObj));
                var sendStr = tywx.HttpUtil.parseSendMsg(cfgObj.postData);
                xhr.send(cfgObj.url,sendStr,'POST','json',cfgObj.headers);
                function processHandler(res){
                    tywx.LOGD('ty.HttpUtil.httpPost', 'processHandler:' + res);
                }
                function errorHandler(e){
                    tywx.LOGD('ty.HttpUtil.httpPost', 'errorHandler error! ' + e);
                }
                function completeHandler(data){
                    tywx.LOGD('ty.HttpUtil.httpPost', 'completeHandler' + data);
                    if(typeof cfgObj.callback == "function")
                    cfgObj.callback(data);
                }
            }
        } catch(err) {
            tywx.LOGE("error:", "tywx.HttpUtil.httpPost——" + JSON.stringify(err));
        }
    },

    httpGet:function (cfgObj, successcb, failcb) {
        try {
            if(tywx.IsWechatPlatform()) {
                tywx.LOGD('ty.HttpUtil.httpGet', 'url:' + cfgObj.url);
                wx.request({
                    url : cfgObj.url,
                    method : 'GET',
                    success : function (res) {
                        if (res.statusCode == 200){
                            tywx.LOGD('ty.HttpUtil.httpGet', 'res:' + JSON.stringify(res.data));
                            if(successcb) {
                                res.data.state = 200;
                                successcb(res.data);
                            }
                        }
                        else{
                            tywx.LOGD('ty.HttpUtil.httpGet', 'statusCode:' + res.statusCode);
                        }
                    },
                    fail : function (res) {
                        tywx.LOGD('ty.HttpUtil.httpGet', 'post error! ' + cfgObj.url);
                        if(failcb) {
                            failcb(res);
                        }
                    }
                });
            }else if(navigator.platform=='android'){
                var xhr=new Laya.HttpRequest();
                xhr.once(Laya.Event.COMPLETE,this,completeHandler);
                xhr.once(Laya.Event.ERROR,this,errorHandler);
                xhr.on(Laya.Event.PROGRESS,this,processHandler);
                tywx.LOGD(this._TAG, 'http get to cfgObj = ' + JSON.stringify(cfgObj));
                xhr.send(cfgObj.url,'GET');
                function processHandler(data){
                    tywx.LOGD('ty.HttpUtil.httpGet', 'processHandler' + JSON.stringify(data));
                    if(successcb) {
                        successcb(data);
                    }
                }
                function errorHandler(e){
                    tywx.LOGD('ty.HttpUtil.httpGet', 'errorHandler error! ' + JSON.stringify(e));
                    if(failcb) {
                        failcb(e);
                    }
                }
                function completeHandler(data){
                    tywx.LOGD('ty.HttpUtil.httpGet', 'data:' + JSON.stringify(data));
                    if(successcb) {
                        successcb(data);
                    }
                }
            }
        } catch(err) {
            tywx.LOGE("error:", "tywx.HttpUtil.httpGet——" + JSON.stringify(err));
        }
    }
};
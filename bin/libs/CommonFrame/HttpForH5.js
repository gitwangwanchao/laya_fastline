/**
 *
 * Created by LaoZhang on 2018/9/27.
 *
 *
 * 内容:
 *
 * Copyright (c) 2016 MoYu co.All rights reserved.
 *
 */

let RequestMsg = function (url, params, cb, times) {
    this.url = url;
    this.params = params;
    this.cb = cb;
    this.times = times || 1;

    this.requestMsgH5();
};

RequestMsg.prototype.requestMsgH5 = function () {
    FZ.HttpUtil.httpGetForH5(this.url, this.params, (err, state, data) => {
        if (err || state != 200) {
            if (--this.times > 0) {
                setTimeout(() => {
                    this.requestMsgH5();
                }, 1000);
                return;
            }
        }
        typeof this.cb == "function" && this.cb(err, state, data ? data.result : {});
    });
}


var httpUtil = FZ.HttpUtil || {};

/************************新添加接口***************************/


httpUtil.parseSendMsg = function (params) {
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
};

/**
 * 新 http get
 * @param url
 * @param params
 * @param cb
 */
httpUtil.httpGetForH5 = function (url, params, cb) {

    var xhr = cc.loader.getXMLHttpRequest();
    ['abort', 'error', 'timeout'].forEach(function (eventname) {
        xhr["on" + eventname] = function () {
            cb(1, eventname);
        }
    });

    xhr.onreadystatechange = function () {
        var httpStatus = xhr.status;
        if (xhr.readyState == 4 && (httpStatus >= 200 && httpStatus <= 207)) {
            var response = xhr.responseText;

            szpp_my.LOGD && szpp_my.LOGD("Http Post", "response msg: ", response);

            cb && cb(0, httpStatus, JSON.parse(response));

        } else if (xhr.status >= 400) {

            cb && cb(1, httpStatus);
        }
    };


    params = params || {};
    var sendStr = this.parseSendMsg(params);
    url += "?" + sendStr;

    szpp_my.LOGD && szpp_my.LOGD("Http get send msg: ", url);

    xhr.timeout = 5 * 1000;
    xhr.open("GET", url, true);

    if (cc.sys.isNative) {
        xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
    } else {
        xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    }

    xhr.send();
};

/**
 * 新Http Post
 */
httpUtil.httpPostForH5 = function (url, params, callback, async) {
    var nums = arguments.length;
    if (nums == 2 && typeof arguments[1] == 'function') {
        callback = arguments[1];
        params = "";
    }

    if (typeof async =="undefined") {
        async = true;
    }

    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("POST", url, !!async);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        let err = false;
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            err = false;

            var response = xhr.responseText;
            // FZ.LOGD("FZ.HttpUtil", "response msg: ", response);

            if (!response) {
                callback && callback(err, null);
            } else {
                callback && callback(err, JSON.parse(response));
            }
        } else if (xhr.status >= 400) {
            // FZ.LOGD("FZ.HttpUtil", "xhr readyState: " + xhr.readyState + " status: " + xhr.status);
        }
    };

    params = params || {};
    var sendStr = this.parseSendMsg(params);
    FZ.LOGD("send msg: ", url, sendStr);

    try {
        xhr.send(sendStr);
    } catch (e) {
        szpp_my.notifierCenter.trigger(szpp_my.Event.APP_CATCH, e);
    }
};

httpUtil.getShareMenuActivityId = function (keyid, succcallback, failcallback) {
    let _p = {
        gameId: FZ.SystemInfo.gameId,
        userId: FZ.UserInfo.userId,
        index: keyid,
        clientId: FZ.SystemInfo.clientId
    };

    let _url = FZ.SystemInfo.loginUrl + "api/bumperio/wx/getWXActivityId";
    httpUtil.httpGetForH5(
        _url,
        _p,
        (err, state, data) => {
            szpp_my.LOGD("===getWXActivityId===", err, state, data);
            if (err || state != 200) {
                failcallback(data);
            } else {
                succcallback(data);
            }
        }
    )
};


/**
* 请求消息
*
* @param url
* @param params || cb
*/
httpUtil.requestMsgH5 =  function(url, params, cb, times){
   let _p = {
       gameId      :   FZ.SystemInfo.gameId,
       userId      :   FZ.UserInfo.userId,
       clientId    :   FZ.SystemInfo.clientId
   };

   if(cb == undefined){
       cb = params;
   }else
   if(params && typeof params != "function"){
       let keys = Object.keys(params);
       keys.forEach(v=>_p[v]= params[v]);
   }

   let _url = FZ.SystemInfo.loginUrl + "api/shootmerge/" + url;
   new RequestMsg(_url,_p,cb,times);
};
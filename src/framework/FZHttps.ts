import FZDebug from "./FZDebug";

/**
 * http 网络协议
 */
namespace fastline.framework
{
    export class FZHttps
    {

        private callback: any;
        private caller: any;
        private args : any[];
        private httpRequest: Laya.HttpRequest;
        constructor()
        {
            this.httpRequest = new Laya.HttpRequest;
        }

        private static _instance: FZHttps;
        public static get instance(): FZHttps
        {
            if (FZHttps._instance == null)
            {
                FZHttps._instance = new FZHttps();
            }

            return FZHttps._instance;
        }

        public get(url: string, caller: any, callback: any, args : any): FZHttps
        {
            FZDebug.D("服务器get----------------------------");
            this.caller = caller;
            this.callback = callback;
            args = this.getSendInfo(args);
            if (args.userId == 123  || args.userId == 0) {
                FZDebug.D("用户未登录 ----------------------------");
                this.callback.apply(this.caller, [{ state: 500, msg: "用户未登录"}]);
                return this;
            }
            let sendStr = this.parseSendMsg(args);
            url = tywx.SystemInfo.loginUrl + "api/quanmzc/" + url + "?" + sendStr;
            this.httpRequest.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
            this.httpRequest.once(Laya.Event.ERROR, this, this.onHttpRequestError);
            this.httpRequest.send(url, null, 'get', 'text');
            return this;
        }

        public post(url: string, data: any, contentType: string = "application/json", caller: any, callback: any): FZHttps
        {   
            data = this.getSendInfo(data);
            let sendStr = this.parseSendMsg(data);
            url = tywx.SystemInfo.loginUrl + "api/quanmzc/" + url + sendStr;
            this.callback = callback;
            this.httpRequest.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
            this.httpRequest.once(Laya.Event.ERROR, this, this.onHttpRequestError);
            if (contentType == null)
            {
                this.httpRequest.send(url, null, 'post', 'json');
            } else
            {
                this.httpRequest.send(url, null, 'post', 'json', ["content-type", contentType]);
            }

            return this;
        }


        private onHttpRequestError(e: any): void
        {
            FZDebug.D("服务器get----Error返回------------------------");
            this.callback.apply(this.caller, [{ state: 500, msg: e}]);
        }

        private onHttpRequestComplete(e: any): void
        {
            FZDebug.D("服务器get----正常返回------------------------");
            let dt = JSON.parse(this.httpRequest.data);
            let data = dt? dt.result : {} ;
            this.callback.apply(this.caller, [{ state: 200, data: data}]);
        }

        private parseSendMsg(params) {
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

        private getSendInfo(data){
            let _p = {
                gameId   : tywx.SystemInfo.gameId,
                userId   : tywx.UserInfo.userId || 123,
                clientId : tywx.SystemInfo.clientId,
            }
            if(data && typeof data != "function"){
                let keys = Object.keys(data);
                keys.forEach(v=>_p[v]= data[v]);
            }
            return _p;
        }
    }
}

export default fastline.framework.FZHttps;


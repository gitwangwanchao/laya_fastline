FZ={},FZ.StateInfo={debugMode:!1,networkConnected:!0,networkType:"none",isOnForeground:!0},FZ.SystemInfo={clientId:"H5_2.0_weixin.weixin.0-hall20315.weixin.quanmzc",intClientId:25683,cloudId:40,version:"10049",webSocketUrl:"",loginUrl:"https://openmy.nalrer.cn/",shareManagerUrl:"https://market.touch4.me/",deviceId:"wechatGame",wxAppId:"wx326d71f5fdaf4e17",appId:9999,gameId:20315,hall_version:"hall37",cdnPath:"https://richqn.nalrer.cn/dizhu/",remotePackPath:"remote_res/res.zip",biLogServer:"https://cbi.touch4.me/api/bilog5/text",biJsonLogServer:"https://cbi.touch4.me/api/bilog5/report",errorLogServer:"https://clienterr.touch4.me/api/bilog5/clientlog",FZVersion:1.4,openLocalRecord:!1,areaUrl:"https://iploc.ywdier.com/",isDownZip:!1,isNewUser:!1},FZ.UserInfo={userId:0,userName:"TuWechatGame",userPic:"",authorCode:"",systemType:0,wechatType:"6.6.1",model:"未知设备",system:"iOS 10.0.1",loc:"",scene_id:"",scene_param:"",invite_id:0,wxgame_session_key:"",userArea:"北京",shieldCityShareTip:[],userProvince:"北京",onlyCanVideo:!1,FromShareCard:!1},FZ.LOGD=function(e,r){if(FZ.StateInfo.debugMode){var t=(e=e||"FZ")+" : "+r;console.log(t)}},FZ.LOGE=function(e,r){if(FZ.StateInfo.debugMode){var t=(e=e||"FZ")+" : "+r;console.error(t)}},FZ.IsWechatPlatform=function(){try{return wx,wx.showShareMenu(),!0}catch(e){return!1}},function(){function e(e,r){e[r>>5]|=128<<r%32,e[14+(r+64>>>9<<4)]=r;for(var i=1732584193,u=-271733879,h=-1732584194,l=271733878,f=0;f<e.length;f+=16){var s=i,d=u,w=h,y=l;u=a(u=a(u=a(u=a(u=o(u=o(u=o(u=o(u=n(u=n(u=n(u=n(u=t(u=t(u=t(u=t(u,h=t(h,l=t(l,i=t(i,u,h,l,e[f+0],7,-680876936),u,h,e[f+1],12,-389564586),i,u,e[f+2],17,606105819),l,i,e[f+3],22,-1044525330),h=t(h,l=t(l,i=t(i,u,h,l,e[f+4],7,-176418897),u,h,e[f+5],12,1200080426),i,u,e[f+6],17,-1473231341),l,i,e[f+7],22,-45705983),h=t(h,l=t(l,i=t(i,u,h,l,e[f+8],7,1770035416),u,h,e[f+9],12,-1958414417),i,u,e[f+10],17,-42063),l,i,e[f+11],22,-1990404162),h=t(h,l=t(l,i=t(i,u,h,l,e[f+12],7,1804603682),u,h,e[f+13],12,-40341101),i,u,e[f+14],17,-1502002290),l,i,e[f+15],22,1236535329),h=n(h,l=n(l,i=n(i,u,h,l,e[f+1],5,-165796510),u,h,e[f+6],9,-1069501632),i,u,e[f+11],14,643717713),l,i,e[f+0],20,-373897302),h=n(h,l=n(l,i=n(i,u,h,l,e[f+5],5,-701558691),u,h,e[f+10],9,38016083),i,u,e[f+15],14,-660478335),l,i,e[f+4],20,-405537848),h=n(h,l=n(l,i=n(i,u,h,l,e[f+9],5,568446438),u,h,e[f+14],9,-1019803690),i,u,e[f+3],14,-187363961),l,i,e[f+8],20,1163531501),h=n(h,l=n(l,i=n(i,u,h,l,e[f+13],5,-1444681467),u,h,e[f+2],9,-51403784),i,u,e[f+7],14,1735328473),l,i,e[f+12],20,-1926607734),h=o(h,l=o(l,i=o(i,u,h,l,e[f+5],4,-378558),u,h,e[f+8],11,-2022574463),i,u,e[f+11],16,1839030562),l,i,e[f+14],23,-35309556),h=o(h,l=o(l,i=o(i,u,h,l,e[f+1],4,-1530992060),u,h,e[f+4],11,1272893353),i,u,e[f+7],16,-155497632),l,i,e[f+10],23,-1094730640),h=o(h,l=o(l,i=o(i,u,h,l,e[f+13],4,681279174),u,h,e[f+0],11,-358537222),i,u,e[f+3],16,-722521979),l,i,e[f+6],23,76029189),h=o(h,l=o(l,i=o(i,u,h,l,e[f+9],4,-640364487),u,h,e[f+12],11,-421815835),i,u,e[f+15],16,530742520),l,i,e[f+2],23,-995338651),h=a(h,l=a(l,i=a(i,u,h,l,e[f+0],6,-198630844),u,h,e[f+7],10,1126891415),i,u,e[f+14],15,-1416354905),l,i,e[f+5],21,-57434055),h=a(h,l=a(l,i=a(i,u,h,l,e[f+12],6,1700485571),u,h,e[f+3],10,-1894986606),i,u,e[f+10],15,-1051523),l,i,e[f+1],21,-2054922799),h=a(h,l=a(l,i=a(i,u,h,l,e[f+8],6,1873313359),u,h,e[f+15],10,-30611744),i,u,e[f+6],15,-1560198380),l,i,e[f+13],21,1309151649),h=a(h,l=a(l,i=a(i,u,h,l,e[f+4],6,-145523070),u,h,e[f+11],10,-1120210379),i,u,e[f+2],15,718787259),l,i,e[f+9],21,-343485551),i=c(i,s),u=c(u,d),h=c(h,w),l=c(l,y)}return Array(i,u,h,l)}function r(e,r,t,n,o,a){return c(function(e,r){return e<<r|e>>>32-r}(c(c(r,e),c(n,a)),o),t)}function t(e,t,n,o,a,i,c){return r(t&n|~t&o,e,t,a,i,c)}function n(e,t,n,o,a,i,c){return r(t&o|n&~o,e,t,a,i,c)}function o(e,t,n,o,a,i,c){return r(t^n^o,e,t,a,i,c)}function a(e,t,n,o,a,i,c){return r(n^(t|~o),e,t,a,i,c)}function i(r,t){var n=u(r);n.length>16&&(n=e(n,r.length*w));for(var o=Array(16),a=Array(16),i=0;i<16;i++)o[i]=909522486^n[i],a[i]=1549556828^n[i];var c=e(o.concat(u(t)),512+t.length*w);return e(a.concat(c),640)}function c(e,r){var t=(65535&e)+(65535&r);return(e>>16)+(r>>16)+(t>>16)<<16|65535&t}function u(e){for(var r=Array(),t=(1<<w)-1,n=0;n<e.length*w;n+=w)r[n>>5]|=(e.charCodeAt(n/w)&t)<<n%32;return r}function h(e){for(var r="",t=(1<<w)-1,n=0;n<32*e.length;n+=w)r+=String.fromCharCode(e[n>>5]>>>n%32&t);return r}function l(e){for(var r=s?"0123456789ABCDEF":"0123456789abcdef",t="",n=0;n<4*e.length;n++)t+=r.charAt(e[n>>2]>>n%4*8+4&15)+r.charAt(e[n>>2]>>n%4*8&15);return t}function f(e){for(var r="",t=0;t<4*e.length;t+=3)for(var n=(e[t>>2]>>t%4*8&255)<<16|(e[t+1>>2]>>(t+1)%4*8&255)<<8|e[t+2>>2]>>(t+2)%4*8&255,o=0;o<4;o++)8*t+6*o>32*e.length?r+=d:r+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(n>>6*(3-o)&63);return r}var s=0,d="",w=8;FZ.hex_md5=function(r){return l(e(u(r),r.length*w))},FZ.b64_md5=function(r){return f(e(u(r),r.length*w))},FZ.str_md5=function(r){return h(e(u(r),r.length*w))},FZ.hex_hmac_md5=function(e,r){return l(i(e,r))},FZ.b64_hmac_md5=function(e,r){return f(i(e,r))},FZ.str_hmac_md5=function(e,r){return h(i(e,r))}}();
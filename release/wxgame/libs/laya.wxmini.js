window=window||global,window.layalib||(window.layalib=function(i,e){(window._layalibs||(window._layalibs=[])).push({f:i,i:e})}),window.layalib(function(i,e,t){t.un,t.uns;var n=t.static,a=t.class,o=t.getset,s=(t.__newvec,laya.utils.Browser),r=(laya.events.Event,laya.events.EventDispatcher),l=laya.resource.HTMLImage,u=laya.utils.Handler,c=laya.display.Input,d=laya.net.Loader,f=laya.net.LocalStorage,h=laya.maths.Matrix,p=laya.renders.Render,v=laya.utils.RunDriver,g=laya.media.SoundChannel,m=laya.media.SoundManager,w=(laya.display.Stage,laya.net.URL),_=laya.utils.Utils,y=(function(){function i(){}a(i,"laya.wx.mini.MiniLocation"),i.__init__=function(){b.window.navigator.geolocation.getCurrentPosition=i.getCurrentPosition,b.window.navigator.geolocation.watchPosition=i.watchPosition,b.window.navigator.geolocation.clearWatch=i.clearWatch},i.getCurrentPosition=function(i,e,t){var n;(n={}).success=function(e){null!=i&&i(e)},n.fail=e,b.window.wx.getLocation(n)},i.watchPosition=function(e,n,a){i._curID++;var o;return o={},o.success=e,o.error=n,i._watchDic[i._curID]=o,t.systemTimer.loop(1e3,null,i._myLoop),i._curID},i.clearWatch=function(e){delete i._watchDic[e],i._hasWatch()||t.systemTimer.clear(null,i._myLoop)},i._hasWatch=function(){var e;for(e in i._watchDic)if(i._watchDic[e])return!0;return!1},i._myLoop=function(){i.getCurrentPosition(i._mySuccess,i._myError)},i._mySuccess=function(e){var t={};t.coords=e,t.timestamp=s.now();var n;for(n in i._watchDic)i._watchDic[n].success&&i._watchDic[n].success(t)},i._myError=function(e){var t;for(t in i._watchDic)i._watchDic[t].error&&i._watchDic[t].error(e)},i._watchDic={},i._curID=0}(),function(){function e(){}return a(e,"laya.wx.mini.MiniFileMgr"),e.isLocalNativeFile=function(i){for(var e=0,t=b.nativefiles.length;e<t;e++)if(-1!=i.indexOf(b.nativefiles[e]))return!0;return!1},e.getFileInfo=function(i){var t=e.filesListObj[i];return null==t?null:t},e.read=function(i,t,n,a,o,s){void 0===t&&(t="ascill"),void 0===a&&(a=""),void 0===o&&(o=!1),void 0===s&&(s="");var r;r=""==a||-1==a.indexOf("http://")&&-1==a.indexOf("https://")?i:e.getFileNativePath(i),r=w.getAdptedFilePath(r),e.fs.readFile({filePath:r,encoding:t,success:function(i){null!=n&&n.runWith([0,i])},fail:function(i){i&&""!=a?e.downFiles(a,t,n,a,o,s):null!=n&&n.runWith([1])}})},e.downFiles=function(i,t,n,a,o,s,r){void 0===t&&(t="ascii"),void 0===a&&(a=""),void 0===o&&(o=!1),void 0===s&&(s=""),void 0===r&&(r=!0);e.wxdown({url:i,success:function(l){200===l.statusCode?e.readFile(l.tempFilePath,t,n,a,o,s,r):403===l.statusCode?null!=n&&n.runWith([0,i]):null!=n&&n.runWith([1,l])},fail:function(i){null!=n&&n.runWith([1,i])}}).onProgressUpdate(function(i){null!=n&&n.runWith([2,i.progress])})},e.readFile=function(i,t,n,a,o,s,r){void 0===t&&(t="ascill"),void 0===a&&(a=""),void 0===o&&(o=!1),void 0===s&&(s=""),void 0===r&&(r=!0),i=w.getAdptedFilePath(i),e.fs.readFile({filePath:i,encoding:t,success:function(s){(-1!=i.indexOf("http://")||-1!=i.indexOf("https://"))&&(b.autoCacheFile||o)?e.copyFile(i,a,n,t,r):null!=n&&n.runWith([0,s])},fail:function(i){i&&null!=n&&n.runWith([1,i])}})},e.downOtherFiles=function(i,t,n,a,o){void 0===n&&(n=""),void 0===a&&(a=!1),void 0===o&&(o=!0),e.wxdown({url:i,success:function(i){200===i.statusCode?(b.autoCacheFile||a)&&-1==n.indexOf("qlogo.cn")&&-1==n.indexOf(".php")?e.copyFile(i.tempFilePath,n,t,"",o):null!=t&&t.runWith([0,i.tempFilePath]):null!=t&&t.runWith([1,i])},fail:function(i){null!=t&&t.runWith([1,i])}})},e.downLoadFile=function(n,a,o,s){void 0===a&&(a=""),void 0===s&&(s="ascii"),i.navigator.userAgent.indexOf("MiniGame")<0?t.loader.load(n,o):"image"==a||"sound"==a?e.downOtherFiles(n,o,n,!0,!1):e.downFiles(n,s,o,n,!0,a,!1)},e.copyFile=function(i,t,n,a,o){void 0===a&&(a=""),void 0===o&&(o=!0);var s=i.split("/"),r=s[s.length-1],l=e.getFileInfo(t),u=e.getFileNativePath(r),c=e.getCacheUseSize();l?l.readyUrl!=t?e.fs.getFileInfo({filePath:i,success:function(i){o&&c+4194304+i.size>=52428800&&(i.size>b.minClearSize&&(b.minClearSize=i.size),e.onClearCacheRes()),e.deleteFile(r,t,n,a,i.size)},fail:function(i){null!=n&&n.runWith([1,i])}}):null!=n&&n.runWith([0]):e.fs.getFileInfo({filePath:i,success:function(s){o&&c+4194304+s.size>=52428800&&(s.size>b.minClearSize&&(b.minClearSize=s.size),e.onClearCacheRes()),e.fs.copyFile({srcPath:i,destPath:u,success:function(i){e.onSaveFile(t,r,!0,a,n,s.size)},fail:function(i){null!=n&&n.runWith([1,i])}})},fail:function(i){null!=n&&n.runWith([1,i])}})},e.onClearCacheRes=function(){var i=b.minClearSize,t=[];for(var n in e.filesListObj)t.push(e.filesListObj[n]);e.sortOn(t,"times",16);for(var a=0,o=1,s=t.length;o<s;o++){var r=t[o];if(a>=i)break;a+=r.size,e.deleteFile("",r.readyUrl)}},e.sortOn=function(i,e,t){return void 0===t&&(t=0),16==t?i.sort(function(i,t){return i[e]-t[e]}):18==t?i.sort(function(i,t){return t[e]-i[e]}):i.sort(function(i,t){return i[e]-t[e]})},e.getFileNativePath=function(i){return laya.wx.mini.MiniFileMgr.fileNativeDir+"/"+i},e.deleteFile=function(i,t,n,a,o){void 0===t&&(t=""),void 0===a&&(a=""),void 0===o&&(o=0);var s=e.getFileInfo(t),r=e.getFileNativePath(s.md5);e.fs.unlink({filePath:r,success:function(s){var r=""!=i;if(""!=i){var l=e.getFileNativePath(i);e.fs.copyFile({srcPath:i,destPath:l,success:function(o){e.onSaveFile(t,i,r,a,n,o.size)},fail:function(i){null!=n&&n.runWith([1,i])}})}else e.onSaveFile(t,i,r,a,n,o)},fail:function(i){}})},e.deleteAll=function(){var i=[];for(var t in e.filesListObj)i.push(e.filesListObj[t]);for(var n=1,a=i.length;n<a;n++){var o=i[n];e.deleteFile("",o.readyUrl)}laya.wx.mini.MiniFileMgr.filesListObj&&laya.wx.mini.MiniFileMgr.filesListObj.fileUsedSize&&(laya.wx.mini.MiniFileMgr.filesListObj.fileUsedSize=0),laya.wx.mini.MiniFileMgr.writeFilesList("",JSON.stringify({}),!1)},e.onSaveFile=function(i,t,n,a,o,r){void 0===n&&(n=!0),void 0===a&&(a=""),void 0===r&&(r=0);var l=i;if(null==e.filesListObj.fileUsedSize&&(e.filesListObj.fileUsedSize=0),n){e.getFileNativePath(t);e.filesListObj[l]={md5:t,readyUrl:i,size:r,times:s.now(),encoding:a},e.filesListObj.fileUsedSize=parseInt(e.filesListObj.fileUsedSize)+r,e.writeFilesList(l,JSON.stringify(e.filesListObj),!0),null!=o&&o.runWith([0])}else if(e.filesListObj[l]){var u=parseInt(e.filesListObj[l].size);e.filesListObj.fileUsedSize=parseInt(e.filesListObj.fileUsedSize)-u,delete e.filesListObj[l],e.writeFilesList(l,JSON.stringify(e.filesListObj),!1),null!=o&&o.runWith([0])}},e.writeFilesList=function(i,t,n){var a=e.fileNativeDir+"/"+e.fileListName;e.fs.writeFile({filePath:a,encoding:"utf8",data:t,success:function(i){},fail:function(i){}}),!b.isZiYu&&b.isPosMsgYu&&wx.postMessage({url:i,data:e.filesListObj[i],isLoad:"filenative",isAdd:n})},e.getCacheUseSize=function(){return e.filesListObj&&e.filesListObj.fileUsedSize?e.filesListObj.fileUsedSize:0},e.existDir=function(i,t){e.fs.mkdir({dirPath:i,success:function(i){null!=t&&t.runWith([0,{data:JSON.stringify({})}])},fail:function(i){-1!=i.errMsg.indexOf("file already exists")?e.readSync(e.fileListName,"utf8",t):null!=t&&t.runWith([1,i])}})},e.readSync=function(i,t,n,a){void 0===t&&(t="ascill"),void 0===a&&(a="");var o,s=e.getFileNativePath(i);try{o=e.fs.readFileSync(s,t),null!=n&&n.runWith([0,{data:o}])}catch(i){null!=n&&n.runWith([1])}},e.setNativeFileDir=function(i){e.fileNativeDir=wx.env.USER_DATA_PATH+i},e.filesListObj={},e.fileNativeDir=null,e.fileListName="layaairfiles.txt",e.ziyuFileData={},e.ziyuFileTextureData={},e.loadPath="",e.DESCENDING=2,e.NUMERIC=16,n(e,["fs",function(){return this.fs=wx.getFileSystemManager()},"wxdown",function(){return this.wxdown=wx.downloadFile}]),e}()),x=function(){function i(){}return a(i,"laya.wx.mini.MiniLocalStorage"),i.__init__=function(){i.items=i},i.setItem=function(i,e){try{wx.setStorageSync(i,e)}catch(t){wx.setStorage({key:i,data:e})}},i.getItem=function(i){return wx.getStorageSync(i)},i.setJSON=function(e,t){i.setItem(e,t)},i.getJSON=function(e){return i.getItem(e)},i.removeItem=function(i){wx.removeStorageSync(i)},i.clear=function(){wx.clearStorageSync()},i.getStorageInfoSync=function(){try{var i=wx.getStorageInfoSync();return console.log(i.keys),console.log(i.currentSize),console.log(i.limitSize),i}catch(i){}return null},i.support=!0,i.items=null,i}(),F=function(){function i(){}a(i,"laya.wx.mini.MiniImage");return i.prototype._loadImage=function(e){if(b.isZiYu)i.onCreateImage(e,this,!0);else{var t=!1;if(y.isLocalNativeFile(e)){if(-1==e.indexOf("http://usr/")&&(-1!=e.indexOf("http://")||-1!=e.indexOf("https://")))if(""!=y.loadPath)e=e.split(y.loadPath)[1];else{var n=""!=w.rootPath?w.rootPath:w._basePath,a=e;""!=n&&(e=e.split(n)[1]),e||(e=a)}if(b.subNativeFiles&&0==b.subNativeheads.length)for(var o in b.subNativeFiles){var s=b.subNativeFiles[o];b.subNativeheads=b.subNativeheads.concat(s);for(var r=0;r<s.length;r++)b.subMaps[s[r]]=o+"/"+s[r]}if(b.subNativeFiles&&-1!=e.indexOf("/")){var l=e.split("/")[0]+"/";if(l&&-1!=b.subNativeheads.indexOf(l)){var c=b.subMaps[l];e=e.replace(l,c)}}}else t=!0,e=w.formatURL(e);y.getFileInfo(e)?i.onCreateImage(e,this,!t):-1!=e.indexOf("http://usr/")||-1==e.indexOf("http://")&&-1==e.indexOf("https://")?i.onCreateImage(e,this,!0):b.isZiYu?i.onCreateImage(e,this,!0):y.downOtherFiles(e,new u(i,i.onDownImgCallBack,[e,this]),e)}},i.onDownImgCallBack=function(e,t,n,a){void 0===a&&(a=""),n?t.onError(null):i.onCreateImage(e,t,!1,a)},i.onCreateImage=function(i,e,t,n){function a(){var i=e._imgCache[o];i&&(i.onload=null,i.onerror=null,delete e._imgCache[o])}void 0===t&&(t=!1),void 0===n&&(n="");var o;if(b.autoCacheFile)if(t)if(b.isZiYu){var r=w.formatURL(i);o=y.ziyuFileTextureData[r]?y.ziyuFileTextureData[r]:i}else o=i;else if(""!=n)o=n;else{var u=y.getFileInfo(i).md5;o=y.getFileNativePath(u)}else o=t?i:n;null==e._imgCache&&(e._imgCache={});var c,d=function(){a(),e.event("error","Load image failed")};if("nativeimage"==e._type){var f=function(){a(),e.onLoaded(c)};(c=new s.window.Image).crossOrigin="",c.onload=f,c.onerror=d,c.src=o,e._imgCache[o]=c}else{var h=new s.window.Image;f=function(){(c=l.create(h.width,h.height)).loadImageSource(h,!0),c._setCreateURL(o),a(),e.onLoaded(c)},h.crossOrigin="",h.onload=f,h.onerror=d,h.src=o,e._imgCache[o]=h}},i}(),C=function(){function e(){}return a(e,"laya.wx.mini.MiniInput"),e._createInputElement=function(){c._initInput(c.area=s.createElement("textarea")),c._initInput(c.input=s.createElement("input")),c.inputContainer=s.createElement("div"),c.inputContainer.style.position="absolute",c.inputContainer.style.zIndex=1e5,s.container.appendChild(c.inputContainer),c.inputContainer.setPos=function(i,e){c.inputContainer.style.left=i+"px",c.inputContainer.style.top=e+"px"},t.stage.on("resize",null,e._onStageResize),wx.onWindowResize&&wx.onWindowResize(function(e){i.dispatchEvent&&i.dispatchEvent("resize")}),m._soundClass=O,m._musicClass=O;var n=b.systemInfo.model,a=b.systemInfo.system;-1!=n.indexOf("iPhone")&&(s.onIPhone=!0,s.onIOS=!0,s.onIPad=!0,s.onAndroid=!1),-1==a.indexOf("Android")&&-1==a.indexOf("Adr")||(s.onAndroid=!0,s.onIPhone=!1,s.onIOS=!1,s.onIPad=!1)},e._onStageResize=function(){t.stage._canvasTransform.identity().scale(s.width/p.canvas.width/s.pixelRatio,s.height/p.canvas.height/s.pixelRatio)},e.wxinputFocus=function(i){var e=c.inputElement.target;e&&!e.editable||(b.window.wx.offKeyboardConfirm(),b.window.wx.offKeyboardInput(),b.window.wx.showKeyboard({defaultValue:e.text,maxLength:e.maxChars,multiple:e.multiline,confirmHold:!0,confirmType:e.confirmType||"done",success:function(i){},fail:function(i){}}),b.window.wx.onKeyboardConfirm(function(i){var t=i?i.value:"";e._restrictPattern&&(t=t.replace(/\u2006|\x27/g,""),e._restrictPattern.test(t)&&(t=t.replace(e._restrictPattern,""))),e.text=t,e.event("input"),laya.wx.mini.MiniInput.inputEnter(),e.event("confirm")}),b.window.wx.onKeyboardInput(function(i){var t=i?i.value:"";e.multiline||-1==t.indexOf("\n")?(e._restrictPattern&&(t=t.replace(/\u2006|\x27/g,""),e._restrictPattern.test(t)&&(t=t.replace(e._restrictPattern,""))),e.text=t,e.event("input")):laya.wx.mini.MiniInput.inputEnter()}))},e.inputEnter=function(){c.inputElement.target.focus=!1},e.wxinputblur=function(){e.hideKeyboard()},e.hideKeyboard=function(){b.window.wx.offKeyboardConfirm(),b.window.wx.offKeyboardInput(),b.window.wx.hideKeyboard({success:function(i){console.log("隐藏键盘")},fail:function(i){console.log("隐藏键盘出错:"+(i?i.errMsg:""))}})},e}(),b=function(){function e(){}return a(e,"laya.wx.mini.MiniAdpter"),e.getJson=function(i){return JSON.parse(i)},e.enable=function(){e.init(t.isWXPosMsg,t.isWXOpenDataContext)},e.init=function(n,a){void 0===n&&(n=!1),void 0===a&&(a=!1),e._inited||(e._inited=!0,(e.window=i).hasOwnProperty("wx")&&(e.window.navigator.userAgent.indexOf("MiniGame")<0||(e.isZiYu=a,e.isPosMsgYu=n,e.EnvConfig={},e.isZiYu||(y.setNativeFileDir("/layaairGame"),y.existDir(y.fileNativeDir,u.create(e,e.onMkdirCallBack))),e.systemInfo=wx.getSystemInfoSync(),e.window.focus=function(){},t._getUrlPath=function(){return""},e.window.logtime=function(i){},e.window.alertTimeLog=function(i){},e.window.resetShareInfo=function(){},e.window.CanvasRenderingContext2D=function(){},e.window.CanvasRenderingContext2D.prototype=e.window.wx.createCanvas().getContext("2d").__proto__,e.window.document.body.appendChild=function(){},e.EnvConfig.pixelRatioInt=0,s._pixelRatio=e.pixelRatio(),e._preCreateElement=s.createElement,s.createElement=e.createElement,v.createShaderCondition=e.createShaderCondition,_.parseXMLFromString=e.parseXMLFromString,c._createInputElement=C._createInputElement,e.EnvConfig.load=d.prototype.load,d.prototype.load=L.prototype.load,d.prototype._loadImage=F.prototype._loadImage,x.__init__(),f._baseClass=x,e.window.wx.onMessage(e._onMessage))))},e._onMessage=function(i){switch(i.type){case"changeMatrix":t.stage.transform.identity(),t.stage._width=i.w,t.stage._height=i.h,t.stage._canvasTransform=new h(i.a,i.b,i.c,i.d,i.tx,i.ty);break;case"display":t.stage.frameRate=i.rate||"fast";break;case"undisplay":t.stage.frameRate="sleep"}"opendatacontext"==i.isLoad?i.url&&(y.ziyuFileData[i.url]=i.atlasdata,y.ziyuFileTextureData[i.imgReadyUrl]=i.imgNativeUrl):"openJsondatacontext"==i.isLoad?i.url&&(y.ziyuFileData[i.url]=i.atlasdata):"openJsondatacontextPic"==i.isLoad&&(y.ziyuFileTextureData[i.imgReadyUrl]=i.imgNativeUrl)},e.getUrlEncode=function(i,e){return"arraybuffer"==e?"":"utf8"},e.downLoadFile=function(i,e,t,n){void 0===e&&(e=""),void 0===n&&(n="utf8");y.getFileInfo(i)?null!=t&&t.runWith([0]):y.downLoadFile(i,e,t,n)},e.remove=function(i,e){y.deleteFile("",i,e,"",0)},e.removeAll=function(){y.deleteAll()},e.hasNativeFile=function(i){return y.isLocalNativeFile(i)},e.getFileInfo=function(i){return y.getFileInfo(i)},e.getFileList=function(){return y.filesListObj},e.exitMiniProgram=function(){e.window.wx.exitMiniProgram()},e.onMkdirCallBack=function(i,e){i||(y.filesListObj=JSON.parse(e.data))},e.pixelRatio=function(){if(!e.EnvConfig.pixelRatioInt)try{return e.EnvConfig.pixelRatioInt=e.systemInfo.pixelRatio,e.systemInfo.pixelRatio}catch(i){}return e.EnvConfig.pixelRatioInt},e.createElement=function(t){if("canvas"==t){var n;return 1==e.idx?e.isZiYu?(n=sharedCanvas).style={}:n=i.canvas:n=i.wx.createCanvas(),e.idx++,n}if("textarea"==t||"input"==t)return e.onCreateInput(t);if("div"==t){var a=e._preCreateElement(t);return a.contains=function(i){return null},a.removeChild=function(i){},a}return e._preCreateElement(t)},e.onCreateInput=function(i){var t=e._preCreateElement(i);return t.focus=C.wxinputFocus,t.blur=C.wxinputblur,t.style={},t.value=0,t.parentElement={},t.placeholder={},t.type={},t.setColor=function(i){},t.setType=function(i){},t.setFontFace=function(i){},t.addEventListener=function(i){},t.contains=function(i){return null},t.removeChild=function(i){},t},e.createShaderCondition=function(i){var e=this;return function(){return e[i.replace("this.","")]}},e.sendAtlasToOpenDataContext=function(i){if(!laya.wx.mini.MiniAdpter.isZiYu){var t=d.getRes(w.formatURL(i));if(!t)throw"传递的url没有获取到对应的图集数据信息，请确保图集已经过！";t.meta.image.split(",");if(t.meta&&t.meta.image)for(var n=t.meta.image.split(","),a=i.indexOf("/")>=0?"/":"\\",o=i.lastIndexOf(a),s=o>=0?i.substr(0,o+1):"",r=0,l=n.length;r<l;r++)n[r]=s+n[r];else n=[i.replace(".json",".png")];for(r=0;r<n.length;r++){var u=n[r];e.postInfoToContext(i,u,t)}}},e.postInfoToContext=function(i,e,t){var n={frames:t.frames,meta:t.meta},a=e,o=y.getFileInfo(w.formatURL(e));if(o)var s=o.md5,r=y.getFileNativePath(s);else r=a;if(!r)throw"获取图集的磁盘url路径不存在！";wx.postMessage({url:i,atlasdata:n,imgNativeUrl:r,imgReadyUrl:a,isLoad:"opendatacontext"})},e.sendSinglePicToOpenDataContext=function(i){var e=w.formatURL(i),t=y.getFileInfo(e);if(t){var n=t.md5,a=y.getFileNativePath(n);i=e}else a=i;if(!a)throw"获取图集的磁盘url路径不存在！";wx.postMessage({url:i,imgNativeUrl:a,imgReadyUrl:i,isLoad:"openJsondatacontextPic"})},e.sendJsonDataToDataContext=function(i){if(!laya.wx.mini.MiniAdpter.isZiYu){var e=d.getRes(i);if(!e)throw"传递的url没有获取到对应的图集数据信息，请确保图集已经过！";wx.postMessage({url:i,atlasdata:e,isLoad:"openJsondatacontext"})}},e.EnvConfig=null,e.window=null,e._preCreateElement=null,e._inited=!1,e.systemInfo=null,e.isZiYu=!1,e.isPosMsgYu=!1,e.autoCacheFile=!0,e.minClearSize=5242880,e.subNativeFiles=null,e.subNativeheads=[],e.subMaps=[],e.AutoCacheDownFile=!1,e.parseXMLFromString=function(e){var t;e=e.replace(/>\s+</g,"><");try{t=(new i.Parser.DOMParser).parseFromString(e,"text/xml")}catch(i){throw"需要引入xml解析库文件"}return t},e.idx=1,n(e,["nativefiles",function(){return this.nativefiles=["layaNativeDir","wxlocal"]}]),e}(),L=function(i){function e(){e.__super.call(this)}a(e,"laya.wx.mini.MiniLoader",r);return e.prototype.load=function(i,t,n,a,o){void 0===n&&(n=!0),void 0===o&&(o=!1);if(this._url=i,i){if(0===(i=w.customFormat(i)).indexOf("data:image")?this._type=t="image":this._type=t||(t=d.getTypeFromUrl(this._url)),this._cache=n,this._data=null,!o&&d.loadedMap[w.formatURL(i)])return this._data=d.loadedMap[w.formatURL(i)],this.event("progress",1),void this.event("complete",this._data);if(null!=d.parserMap[t])return this._customParse=!0,void(d.parserMap[t]instanceof laya.utils.Handler?d.parserMap[t].runWith(this):d.parserMap[t].call(null,this));var s;switch(t){case"atlas":case"prefab":case"plf":s="json";break;case"font":s="xml";break;case"plfb":s="arraybuffer";break;default:s=t}if(d.preLoadedMap[w.formatURL(i)])this.onLoaded(d.preLoadedMap[w.formatURL(i)]);else{var r=b.getUrlEncode(i,s),l=_.getFileExtension(i);if(-1!=e._fileTypeArr.indexOf(l))b.EnvConfig.load.call(this,i,t,n,a,o);else{if(b.isZiYu&&!y.ziyuFileData[i]&&(i=w.formatURL(i)),b.isZiYu&&y.ziyuFileData[i]){var c=y.ziyuFileData[i];return void this.onLoaded(c)}if(y.getFileInfo(i)){var f=y.getFileInfo(i);f.encoding=null==f.encoding?"utf8":f.encoding,y.readFile(i,f.encoding,new u(e,e.onReadNativeCallBack,[r,i,t,n,a,o,this]),i)}else{if(y.isLocalNativeFile(i)){if(b.subNativeFiles&&0==b.subNativeheads.length)for(var h in b.subNativeFiles){var p=b.subNativeFiles[h];b.subNativeheads=b.subNativeheads.concat(p);for(var v=0;v<p.length;v++)b.subMaps[p[v]]=h+"/"+p[v]}if(b.subNativeFiles&&-1!=i.indexOf("/")){var g=i.split("/")[0]+"/";if(g&&-1!=b.subNativeheads.indexOf(g)){var m=b.subMaps[g];i=i.replace(g,m)}}var x=""!=w.rootPath?w.rootPath:w._basePath,F=i;return""!=x&&(i=i.split(x)[1]),i||(i=F),void y.read(i,r,new u(e,e.onReadNativeCallBack,[r,i,t,n,a,o,this]))}var C=w.formatURL(i);-1!=C.indexOf("http://usr/")||-1==C.indexOf("http://")&&-1==C.indexOf("https://")||b.AutoCacheDownFile?y.readFile(C,r,new u(e,e.onReadNativeCallBack,[r,i,t,n,a,o,this]),i):b.EnvConfig.load.call(this,i,t,n,a,o)}}}}else this.onLoaded(null)},e.onReadNativeCallBack=function(i,e,t,n,a,o,s,r,l){if(void 0===n&&(n=!0),void 0===o&&(o=!1),void 0===r&&(r=0),r)1==r&&b.EnvConfig.load.call(s,e,t,n,a,o);else{var u;u="json"==t||"atlas"==t||"prefab"==t||"plf"==t?b.getJson(l.data):"xml"==t?_.parseXMLFromString(l.data):l.data,!b.isZiYu&&b.isPosMsgYu&&"arraybuffer"!=t&&wx.postMessage({url:e,data:u,isLoad:"filedata"}),s.onLoaded(u)}},n(e,["_fileTypeArr",function(){return this._fileTypeArr=["png","jpg","bmp","jpeg","gif"]}]),e}(),O=function(i){function e(){this._sound=null,this.url=null,this.loaded=!1,this.readyUrl=null,e.__super.call(this)}a(e,"laya.wx.mini.MiniSound",r);var t=e.prototype;return t.load=function(i){if(y.isLocalNativeFile(i)){if(-1!=i.indexOf("http://")||-1!=i.indexOf("https://"))if(""!=y.loadPath)i=i.split(y.loadPath)[1];else{var t=""!=w.rootPath?w.rootPath:w._basePath;""!=t&&(i=i.split(t)[1])}}else i=w.formatURL(i);if(this.url=i,this.readyUrl=i,e._audioCache[this.readyUrl])this.event("complete");else if(b.autoCacheFile&&y.getFileInfo(i))this.onDownLoadCallBack(i,0);else if(b.autoCacheFile)if(y.isLocalNativeFile(i)){var n=i;if(""!=(t=""!=w.rootPath?w.rootPath:w._basePath)&&(i=i.split(t)[1]),i||(i=n),b.subNativeFiles&&0==b.subNativeheads.length)for(var a in b.subNativeFiles){var o=b.subNativeFiles[a];b.subNativeheads=b.subNativeheads.concat(o);for(var s=0;s<o.length;s++)b.subMaps[o[s]]=a+"/"+o[s]}if(b.subNativeFiles&&-1!=i.indexOf("/")){var r=i.split("/")[0]+"/";if(r&&-1!=b.subNativeheads.indexOf(r)){var l=b.subMaps[r];i=i.replace(r,l)}}this.onDownLoadCallBack(i,0)}else!y.isLocalNativeFile(i)&&-1==i.indexOf("http://")&&-1==i.indexOf("https://")||-1!=i.indexOf("http://usr/")?this.onDownLoadCallBack(i,0):y.downOtherFiles(i,u.create(this,this.onDownLoadCallBack,[i]),i);else this.onDownLoadCallBack(i,0)},t.onDownLoadCallBack=function(i,t){if(t)this.event("error");else{var n;if(b.autoCacheFile){if(y.isLocalNativeFile(i)){var a=""!=w.rootPath?w.rootPath:w._basePath,o=i;""==a||-1==i.indexOf("http://")&&-1==i.indexOf("https://")||(n=i.split(a)[1]),n||(n=o)}else{var s=y.getFileInfo(i);if(s&&s.md5){var r=s.md5;n=y.getFileNativePath(r)}else n=i}this._sound=e._createSound(),this._sound.src=this.url=n}else this._sound=e._createSound(),this._sound.src=i;this._sound.onCanplay(e.bindToThis(this.onCanPlay,this)),this._sound.onError(e.bindToThis(this.onError,this))}},t.onError=function(i){try{console.log("-----1---------------minisound-----id:"+e._id),console.log(i)}catch(i){console.log("-----2---------------minisound-----id:"+e._id),console.log(i)}this.event("error"),this._sound.offError(null)},t.onCanPlay=function(){this.loaded=!0,this.event("complete"),this._sound.offCanplay(null)},t.play=function(i,t){void 0===i&&(i=0),void 0===t&&(t=0);var n;if(this.url==m._bgMusic?(e._musicAudio||(e._musicAudio=e._createSound()),n=e._musicAudio):n=e._audioCache[this.readyUrl]?e._audioCache[this.readyUrl]._sound:e._createSound(),!n)return null;if(b.autoCacheFile&&y.getFileInfo(this.url)){var a=y.getFileInfo(this.url).md5;n.src=this.url=y.getFileNativePath(a)}else n.src=this.url;var o=new S(n,this);return o.url=this.url,o.loops=t,o.loop=0===t,o.startTime=i,o.play(),m.addChannel(o),o},t.dispose=function(){var i=e._audioCache[this.readyUrl];i&&(i.src="",i._sound&&(i._sound.destroy(),i._sound=null,i=null),delete e._audioCache[this.readyUrl])},o(0,t,"duration",function(){return this._sound.duration}),e._createSound=function(){return e._id++,b.window.wx.createInnerAudioContext()},e.bindToThis=function(i,e){return i.bind(e)},e._musicAudio=null,e._id=0,e._audioCache={},e}(),S=(function(i){function e(){e.__super.call(this)}a(e,"laya.wx.mini.MiniAccelerator",i);var t=e.prototype;t.on=function(t,n,a,o){return i.prototype.on.call(this,t,n,a,o),e.startListen(this.onDeviceOrientationChange),this},t.off=function(t,n,a,o){return void 0===o&&(o=!1),this.hasListener(t)||e.stopListen(),i.prototype.off.call(this,t,n,a,o)},e.__init__=function(){try{var i;if(!(i=laya.device.motion.Accelerator))return;i.prototype.on=e.prototype.on,i.prototype.off=e.prototype.off}catch(i){}},e.startListen=function(i){if(e._callBack=i,!e._isListening){e._isListening=!0;try{wx.onAccelerometerChange(e.onAccelerometerChange)}catch(i){}}},e.stopListen=function(){e._isListening=!1;try{wx.stopAccelerometer({})}catch(i){}},e.onAccelerometerChange=function(i){var t;(t={}).acceleration=i,t.accelerationIncludingGravity=i,t.rotationRate={},null!=e._callBack&&e._callBack(t)},e._isListening=!1,e._callBack=null}(r),function(i){function e(i,t){this._audio=null,this._onEnd=null,this._miniSound=null,e.__super.call(this),this._audio=i,this._miniSound=t,this._onEnd=e.bindToThis(this.__onEnd,this),i.onEnded(this._onEnd)}a(e,"laya.wx.mini.MiniSoundChannel",g);var n=e.prototype;return n.__onEnd=function(){if(O._audioCache[this.url]=this._miniSound,1==this.loops)return this.completeHandler&&(t.systemTimer.once(10,this,this.__runComplete,[this.completeHandler],!1),this.completeHandler=null),this.stop(),void this.event("complete");this.loops>0&&this.loops--,this.startTime=0,this.play()},n.play=function(){this.isStopped=!1,m.addChannel(this),this._audio.play()},n.stop=function(){this.isStopped=!0,m.removeChannel(this),this.completeHandler=null,this._audio&&(this._audio.stop(),this._audio.offEnded(null),this._miniSound.dispose(),this._audio=null,this._miniSound=null,this._onEnd=null)},n.pause=function(){this.isStopped=!0,this._audio.pause()},n.resume=function(){this._audio&&(this.isStopped=!1,m.addChannel(this),this._audio.play())},o(0,n,"startTime",null,function(i){this._audio&&(this._audio.startTime=i)}),o(0,n,"autoplay",function(){return this._audio.autoplay},function(i){this._audio.autoplay=i}),o(0,n,"position",function(){return this._audio?this._audio.currentTime:0}),o(0,n,"duration",function(){return this._audio?this._audio.duration:0}),o(0,n,"loop",function(){return this._audio.loop},function(i){this._audio.loop=i}),o(0,n,"volume",function(){return this._audio?this._audio.volume:1},function(i){this._audio&&(this._audio.volume=i)}),e.bindToThis=function(i,e){return i.bind(e)},e}())},1e3);
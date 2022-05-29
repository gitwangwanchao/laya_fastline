/**
 * 交叉导流相关系统接口, 调用导流接口使用showAd 接口， 刷新导流显示icon使用resetBtnIcon 接口
 */
FZ.AdManagerWx = {

    retryCrossTimes: 3, //3次网络重试的机会
    retryBannerTimes: 3, //3次网络重试的机会

    AnimType: {
        STATIC: 1, //静态
        SHAKE: 2, //抖动
        FRAME: 3 //帧动画

    },

    adNodeList: [], //存放icon节点列表
    bannerNodeList: [], //存放banner节点列表
    allAdInfoList: [], //存放icon信息列表
    allBannerInfoList: [], //存放banner信息列表
    rawAdInfoList: [], //存放服务端返回的原始icon信息
    rawBannerInfoList: [], //存放服务端返回的原始banner信息
    selfBanner: false, // 检测banner导流存在 

    //创建导流icon，每调用一次就会创建一个
    showAd: function (node, tag) {
        var _adnode = null;
        var _adnode = new FZ.AdManagerWx.adNodeClass();
        _adnode.adInfoList = JSON.parse(JSON.stringify(FZ.AdManagerWx.allAdInfoList));
        _adnode.adType = 1;
        _adnode.adTag = tag || '';
        FZ.AdManagerWx.adNodeList.push(_adnode);
        _adnode.createAdNode(node);
    },

    //创建导流banner, 每调用一次就会创建一个
    showBanner: function (node, tag) {
        if (node == undefined) {
            node = this._getBannerPosition();
        }
        this.selfBanner = true; // 设置为true则判断为 banner导流状态
        var _adnode = null;
        var _adnode = new FZ.AdManagerWx.adNodeClass();
        _adnode.adInfoList = JSON.parse(JSON.stringify(FZ.AdManagerWx.allBannerInfoList));
        _adnode.adType = 2;
        _adnode.adTag = tag || '';
        FZ.AdManagerWx.bannerNodeList.push(_adnode);
        _adnode.createBannerNode(null, node);
    },

    showBannerOnBottom: function (tag) {
        var position = this._getBannerPosition();
        this.showBanner(position, tag);
    },

    // Banner 位置
    _getBannerPosition: function() {
        var tuyouAdWidth = 982;
        var tuyouAdHeight = 500;
        var iphoneXBottom = 33;
        var xRatio = cc.winSize.width / tuyouAdWidth;
        var position = {
            x: cc.winSize.width / 2,
            y: 83,
        };

        if (FZ.UserInfo.model.search('iPhone X') != -1) {
            position.y += (iphoneXBottom * 3 - 15);
        } else {
            // position.y = tuyouAdHeight * xRatio / 2;
        }
        return position;
    },

    //获取所有导流icon节点的列表
    getAdNodeList: function () {
        return this.adNodeList;
    },

    //根据自定义的tag, 获取添加到界面上的导流icon节点
    getAdNodeByTag: function (tag) {
        if (!tag) return null;
        for (var n in this.adNodeList) {
            if (this.adNodeList[n].adTag.toString() == tag.toString()) {
                return this.adNodeList[n];
            }
        }
        return null;
    },

    //获取所有导流banner节点的列表
    getBannerNodeList: function () {
        return this.bannerNodeList;
    },

    //根据自定义的tag, 获取添加导界面上的导流banner节点
    getBannerNodeByTag: function (tag) {
        if (!tag) return null;
        for (var n in this.bannerNodeList) {
            if (this.bannerNodeList[n].adTag.toString() == tag.toString()) {
                return this.bannerNodeList[n];
            }
        }
        return null;
    },

    //获取当前所有导流icon的信息
    getAdInfoList: function () {
        return this.allAdInfoList;
    },

    //获取当前所有导流banner的信息
    getBannerInfoList: function () {
        return this.allBannerInfoList;
    },

    adNodeClass: function () {
        this.adType = 0; //1 icon   2 banner
        this.adIconBtn = null;
        this.currentAdInfo = null;
        this.currentWebPage = null;
        this.adInfoList = [];
        this.adTag = '';
    },

    adNodeObj: {
        createBannerNode: function (node, pos) {
            this.createAdNode(node, pos);
        },
        createAdNode: function (node, pos) {
            this.genRandomFirstAdInfo();
            if (!this.currentAdInfo) {
                // current AdInfo 不存在 。
                return;
            }
            if (this.adIconBtn) {
                this.adIconBtn.active = true;
            } else {
                var that = this;
                var adNodePath = 'prefab/adNode';
                if (that.adType == 2) {
                    adNodePath = 'prefab/bannerNode'
                }
                //动态加载资源必须放在resources目录下,导流入口强制命名为adNode,放在resources/prefabs下
                cc.loader.loadRes(adNodePath, function (err, prefab) {
                    var preFabNode = cc.instantiate(prefab);
                    preFabNode.position = cc.v2(0, 0);
                    that.adIconBtn = preFabNode;
                    if (node) {
                        node.addChild(preFabNode);
                    } else {
                        cc.game.addPersistRootNode(preFabNode);
                    }
                    if (!pos) {
                        pos = cc.v2(0, 0);
                    }
                    preFabNode.position = pos;
                    that.adIconNode();
                    that.adNode = preFabNode;
                    var adButton = that.adIconBtn.getChildByName('adButton');
                    adButton.on('click', function () {
                        that.onClickAdIconBtn();
                    });
                });
            }
        },

        //移除adicon
        removeAdView: function () {
            if (this.adIconBtn) {
                this.adIconBtn.destroy();
            }
            this.adIconBtn = null;
        },

        genRandomFirstAdInfo: function () {
            var that = this;

            if (this.adInfoList.length == 0) {
                return;
            }

            var weight_list = [{
                'weight': 0,
                'id': '000'
            }];

            for (var i in this.adInfoList) {

                var _randomObj = {
                    'weight': parseInt(that.adInfoList[i].icon_weight),
                    'id': that.adInfoList[i].icon_id,
                };
                weight_list.push(_randomObj);
            }

            weight_list.sort(function (a, b) {
                return a.weight > b.weight;
            });

            var _total = 0;

            weight_list.forEach(function (element) {
                _total += element.weight;
            });

            var _randomIndex = parseInt(Math.random() * 10000) % (_total + 1);

            var _tTotal = 0;

            var _selectIndex = 0;

            for (var i = 0; i < (weight_list.length - 1); i++) {
                _tTotal += weight_list[i].weight;
                if (_tTotal < _randomIndex && (_tTotal + weight_list[i + 1].weight) >= _randomIndex) {
                    _selectIndex = i + 1;
                    break;
                }
            }
            var _selectObj = weight_list[_selectIndex];

            this.adInfoList.forEach(function (element) {
                if (element.icon_id == _selectObj.id) {
                    that.currentAdInfo = element;
                }
            });

        },

        genRandomSecondAdInfo: function () {

            var that = this;

            var _webPages = this.currentAdInfo.webpages;

            if (typeof _webPages === 'undefined' || _webPages.length == 0) {
                return;
            }

            var weight_list = [{
                'weight': 0,
                'id': '000'
            }];

            for (var i in _webPages) {

                var _randomObj = {
                    'weight': parseInt(_webPages[i].webpage_weight),
                    'id': _webPages[i].config_id
                }

                weight_list.push(_randomObj);
            }

            weight_list.sort(function (a, b) {
                return a.weight > b.weight;
            });

            var _total = 0;

            weight_list.forEach(function (element) {
                _total += element.weight;
            });

            var _randomIndex = parseInt(Math.random() * 10000) % (_total + 1);

            var _tTotal = 0;

            var _selectIndex = 0;
            for (var i = 0; i < (weight_list.length - 1); i++) {
                _tTotal += weight_list[i].weight;
                if (_tTotal < _randomIndex && (_tTotal + weight_list[i + 1].weight) >= _randomIndex) {
                    _selectIndex = i + 1;
                    break;
                }
            }
            var _selectObj = weight_list[_selectIndex];


            _webPages.forEach(function (element) {
                if (element.config_id == _selectObj.id) {
                    that.currentWebPage = element;
                }
            });

        },

        adIconNode: function () {
            if (!this.currentAdInfo || !this.adIconBtn) {
                return;
            }

            var _animaType = this.currentAdInfo.icon_type;
            var that = this;

            var spriteIco = this.adIconBtn.getChildByName('adIcon');
            var adButton = this.adIconBtn.getChildByName('adButton');

            spriteIco.stopAllActions();
            spriteIco.removeComponent(cc.Animation);

            spriteIco.setRotation(0);

            FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeShowAdBtn, [that.currentAdInfo.icon_id,
                '0',
                '',
                that.currentAdInfo.toappid,
                that.currentAdInfo.togame,
                '0',
                that.adType
            ]);
            switch (_animaType) {

                case FZ.AdManagerWx.AnimType.STATIC:

                    cc.loader.load({
                        url: that.currentAdInfo.icon_url[0]
                    }, function (err, texture) {
                        if (!err) {

                            spriteIco.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                            if (texture && texture.width && texture.height) {
                                spriteIco.setContentSize(cc.size(texture.width, texture.height));
                                adButton.setContentSize(cc.size(texture.width, texture.height));
                            }
                        } else {

                        }
                    });

                    break;
                case FZ.AdManagerWx.AnimType.SHAKE:

                    cc.loader.load({
                        url: that.currentAdInfo.icon_url[0]
                    }, function (error, texture) {

                        spriteIco.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                        if (texture && texture.width && texture.height) {
                            spriteIco.setContentSize(cc.size(texture.width, texture.height));
                            adButton.setContentSize(cc.size(texture.width, texture.height));

                        }
                        spriteIco.anchorX = 0.5;
                        spriteIco.anchorY = 0.5;
                        var _act1 = cc.rotateBy(0.06, -20);
                        var _act2 = cc.rotateBy(0.12, 40);
                        var _act3 = cc.rotateBy(0.12, -40);
                        var _act4 = cc.rotateBy(0.06, 20);
                        var _delay = cc.delayTime(1);
                        spriteIco.runAction(cc.repeatForever(cc.sequence(_act1,
                            cc.repeat(cc.sequence(_act2, _act3), 4),
                            _act4,
                            _delay)));
                    });


                    break;
                case FZ.AdManagerWx.AnimType.FRAME:

                    var allFrames = [];

                    var playFrameAction = function () {
                        spriteIco.stopAllActions();
                        spriteIco.removeComponent(cc.Animation);
                        var _firstFrameIcon = allFrames[0].getTexture();
                        if (_firstFrameIcon && _firstFrameIcon.width && _firstFrameIcon.height) {
                            spriteIco.setContentSize(cc.size(_firstFrameIcon.width, _firstFrameIcon.height));
                            adButton.setContentSize(cc.size(_firstFrameIcon.width, _firstFrameIcon.height))
                        }

                        var _time_interval = that.currentAdInfo.time_interval;
                        var _frameRate = (_time_interval && _time_interval > 0) ? 1000 / _time_interval : 10;

                        var animation = spriteIco.addComponent(cc.Animation);
                        var clip = cc.AnimationClip.createWithSpriteFrames(allFrames, _frameRate);
                        clip.name = 'anim_frame';
                        clip.wrapMode = cc.WrapMode.Loop;
                        animation.addClip(clip);
                        animation.play('anim_frame');
                    };

                    cc.loader.load(that.currentAdInfo.icon_url, function (err, results) {

                        if (err) {
                            for (var i = 0; i < err.length; i++) {
                                cc.log('Error url [' + err[i] + ']: ' + results.getError(err[i]));
                            }
                        }

                        for (var i = 0; i < that.currentAdInfo.icon_url.length; i++) {
                            if (results.getContent(that.currentAdInfo.icon_url[i])) {
                                var _frame = new cc.SpriteFrame(results.getContent(that.currentAdInfo.icon_url[i]));
                                allFrames.push(_frame);
                            }
                        }

                        playFrameAction();
                    });

                    break;
                default:
                    break;

            }

        },

        onClickAdIconBtn: function () {

            try {

                this.genRandomSecondAdInfo();

                //先尝试直接跳转
                var skip_type = this.currentAdInfo.icon_skip_type;
                var toappid = this.currentAdInfo.toappid;
                var togame = this.currentAdInfo.togame;
                var topath = this.currentAdInfo.path;
                var second_toappid = this.currentAdInfo.second_toappid;

                console.log('topath ====>' + topath);

                var that = this;

                var icon_id = this.currentAdInfo.icon_id;
                var config_id = '0';
                var webpage_url = '';
                var webpage_id = '0';

                if (this.currentWebPage && 1 == this.adType) {
                    webpage_url = this.currentWebPage.webpage_url;
                    config_id = this.currentWebPage.config_id;
                    webpage_id = this.currentWebPage.webpage_id;
                }

                var bi_paramlist = [icon_id, config_id, webpage_url, toappid, togame, webpage_id, that.adType];

                console.log('bi_paramlist ====> ' + JSON.stringify(bi_paramlist));

                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickAdBtn, bi_paramlist);


                // //先尝试直接跳转
                if (wx && wx.navigateToMiniProgram) {
                    if (1 == skip_type) {

                        wx.navigateToMiniProgram({
                            appId: toappid,
                            path: topath ? topath : '?from=adcross',
                            envVersion: 'release',
                            extraData: {
                                from: topath ? topath : '?from=adcross',
                            },
                            success: function (res) {

                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);

                                console.log('wx.navigateToMiniProgram success');
                                console.log(res);
                            },
                            fail: function (res) {
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
                                console.log('wx.navigateToMiniProgram fail');
                                console.log(res);
                            },
                            complete: function (res) {
                                console.log('navigateToMiniProgram ==== complete');
                                that.resetBtnIcon();
                            }
                        });

                        return;
                    } else if (2 == skip_type) {
                        wx.navigateToMiniProgram({
                            appId: second_toappid,
                            path: topath ? topath : '?from=adcross',
                            envVersion: 'release',
                            extraData: {
                                from: topath ? topath : '?from=adcross',
                            },
                            success: function (res) {
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);
                                console.log('wx.navigateToMiniProgram success');
                                console.log(res);
                            },
                            fail: function (res) {
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
                                console.log('wx.navigateToMiniProgram fail');
                                console.log(res);
                            },
                            complete: function (res) {
                                that.resetBtnIcon();
                                console.log('navigateToMiniProgram ==== complete');
                            }
                        });

                    } else {
                        console.error('Unsupported skip type! Please Check!');
                    }

                    return;
                }

                //直接跳转接口不好使，展示 小程序/小游戏 二维码图片

                if (!that.currentWebPage || !that.currentWebPage.webpage_url) {
                    that.resetBtnIcon();
                    return;
                }

                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeClickShowQRCode, bi_paramlist);

                if (FZ.IsWechatPlatform()) {
                    wx.previewImage({
                        current: [that.currentWebPage.webpage_url],
                        urls: [that.currentWebPage.webpage_url],
                        success: function (res) {
                            FZ.LOGD(null, "预览图片成功！");
                        },
                        fail: function (res) {
                            FZ.LOGD(null, "预览图片失败！");
                        },
                        complete: function (res) {
                            console.log('预览图片完成');
                            that.resetBtnIcon();
                        },
                    });
                }
            } catch (err) {
                console.log("error:", "FZ.AdManagerWx.onClickAdIconBtn——" + JSON.stringify(err));
            }
        },

        resetBtnIcon: function () {

            if (!this.adIconBtn) {
                return;
            } else {
                this.genRandomFirstAdInfo();
                this.adIconNode();
            }

        },

        onForeGround: function () {
            this.adIconNode();
        },

        showAdNode: function () {
            if (this.adIconBtn) {
                this.adIconBtn.active = true;
            }
        },

        hideAdNode: function () {
            FZ.LOGD("隐藏全部Banner","隐藏全部Banner--------------3");
            if (this.adIconBtn) {
                this.adIconBtn.active = false;
            }
        },
    },

    //定时刷新导流icon
    freshAdIconByTime: function () {

        FZ.AdManagerWx.adNodeList.forEach(function (_adNode) {
            _adNode && _adNode.resetBtnIcon && _adNode.resetBtnIcon();
        });
    },

    //定时刷新导流banner
    freshAdBannerByTime: function () {
        FZ.AdManagerWx.bannerNodeList.forEach(function (_adNode) {
            _adNode && _adNode.resetBtnIcon && _adNode.resetBtnIcon();
        });
    },

    //开始定时刷新导流icon
    startFreshAdIcon: function () {

        try {

            //定时刷新icon
            var icon_interval = 10; //默认是10s刷新一次

            if (this.allAdInfoList && this.allAdInfoList.length && this.allAdInfoList.length > 0) {

                for (var i = 0; i < this.allAdInfoList.length; i++) {
                    var _icon_interval = this.allAdInfoList[i].icon_interval;
                    if (_icon_interval) {
                        icon_interval = parseInt(_icon_interval) > 0 ? parseInt(_icon_interval) : icon_interval;
                        break;
                    }
                }
                clearInterval(FZ.AdManagerWx.freshAdIconByTime);
                setInterval(FZ.AdManagerWx.freshAdIconByTime, icon_interval * 1000);
            }

            //定时刷新banner
            var banner_interval = 10; //默认是10s刷新一次

            if (this.allBannerInfoList && this.allBannerInfoList.length && this.allBannerInfoList.length > 0) {

                for (var i = 0; i < this.allBannerInfoList.length; i++) {
                    var _icon_interval = this.allBannerInfoList[i].icon_interval;
                    if (_icon_interval) {
                        banner_interval = parseInt(_icon_interval) > 0 ? parseInt(_icon_interval) : banner_interval;
                        break;
                    }
                }
                clearInterval(FZ.AdManagerWx.freshAdBannerByTime);
                setInterval(FZ.AdManagerWx.freshAdBannerByTime, banner_interval * 1000);
            }

        } catch (e) {

            console.error('Error: startFreshAdIcon==>' + JSON.stringify(e));
        }

    },

    //从后台回到前台
    onForeGround: function () {

        this.freshAdIconByTime();
        this.freshAdBannerByTime();
        this.startFreshAdIcon();
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

    /**
     * 请求交叉倒流的信息
     */
    requestADInfo: function () {
        try {
            if (!FZ.IsWechatPlatform()) {
                return;
            }
            this.retryCrossTimes--;
            var reqObj = {};
            var timeStamp = new Date().getTime();
            reqObj.act = 'api.getCrossConfig';
            reqObj.time = timeStamp;
            reqObj.game_mark = FZ.SystemInfo.cloudId + "-" + FZ.SystemInfo.gameId;
            var signStr = this.getConfigSignStr(reqObj);
            var paramStrList = [];
            for (var key in reqObj) {
                paramStrList.push(key + '=' + reqObj[key]);
            }
            paramStrList.push('sign=' + signStr);
            var finalUrl = FZ.SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');
            var that = this;

            wx.request({
                url: finalUrl,
                method: 'GET',
                success: function (res) {
                    if (res.statusCode == 200) {

                        var ret = res.data;
                        that.allAdInfoList = [];
                        if (ret.retmsg) {
                            that.rawAdInfoList = ret.retmsg;
                            that.processRawConfigInfo();
                        }
                        that.retryCrossTimes = 3;

                    } else {
                        if (that.retryCrossTimes > 0) {
                            that.requestADInfo();
                        } else {
                            that.retryCrossTimes = 3;
                        }
                    }

                },
                fail: function (res) {

                    if (that.retryCrossTimes > 0) {
                        that.requestADInfo();
                    } else {
                        that.retryCrossTimes = 3;
                    }
                }
            });
        } catch (err) {
            FZ.LOGE("error:", "FZ.AdManagerWx.requestADInfo——" + JSON.stringify(err));
        }
    },


    /**
     * 请求交叉倒流banner的信息
     */
    requestBannerInfo: function () {
        try {
            if (!FZ.IsWechatPlatform()) {
                return;
            }
            this.retryBannerTimes--;
            var reqObj = {};
            var timeStamp = new Date().getTime();
            reqObj.act = 'api.getBannerConfig';
            reqObj.time = timeStamp;
            reqObj.game_mark = FZ.SystemInfo.cloudId + "-" + FZ.SystemInfo.gameId;
            var signStr = this.getConfigSignStr(reqObj);
            var paramStrList = [];
            for (var key in reqObj) {
                paramStrList.push(key + '=' + reqObj[key]);
            }
            paramStrList.push('sign=' + signStr);
            var finalUrl = FZ.SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');
            var that = this;

            wx.request({
                url: finalUrl,
                method: 'GET',
                success: function (res) {
                    if (res.statusCode == 200) {

                        var ret = res.data;
                        that.allBannerInfoList = [];
                        if (ret.retmsg) {
                            that.rawBannerInfoList = ret.retmsg;
                            that.processRawConfigInfo();
                            FZ.NotificationCenter.trigger(FZ.EventType.GET_ADMANAGER_BANNER_INFO_SUCCESS);
                        }
                        that.retryBannerTimes = 3;

                    } else {
                        if (that.retryBannerTimes > 0) {
                            that.requestBannerInfo();
                        } else {
                            that.retryBannerTimes = 3;
                        }
                    }

                },
                fail: function (res) {

                    if (that.retryBannerTimes > 0) {
                        that.requestBannerInfo();
                    } else {
                        that.retryBannerTimes = 3;
                    }
                }
            });
        } catch (err) {
            FZ.LOGE("error:", "FZ.AdManagerWx.requestADInfo——" + JSON.stringify(err));
        }
    },

    /**
     * 请求本地的IP、地域等信息
     */
    requestLocalIPInfo: function () {
        var that = this;
        var _url = 'https://iploc.ywdier.com/api/iploc5/search/city';
        wx.request({
            url: _url,
            success: function (res) {
                if (res.statusCode == 200) {
                    if (res.data && res.data.loc) {
                        that.ipLocInfo = res.data;
                    }

                    that.processRawConfigInfo();
                }

                FZ.LOGD('AdManagerWx', 'requestLocalIPInfo ==>' + JSON.stringify(res));
            },
            fail: function (res) {}
        });

    },

    /**
     * 处理服务端返回的信息（根据城市白名单等进行过滤筛选）
     */
    processRawConfigInfo: function () {

        var that = this;
        this.allBannerInfoList = [];
        this.allAdInfoList = [];
        if (this.ipLocInfo && this.ipLocInfo.loc && this.ipLocInfo.loc[1]) { //获取到了本地的ip信息

            var _locProvince = this.ipLocInfo.loc[1];

            this.rawAdInfoList.forEach(function (v) {

                if (v.icon_weight == undefined || Math.floor(v.icon_weight) <= 0.1) {
                    v.icon_weight = 0;
                }

                v.icon_weight = 10;

                var isForbidden = true;
                if (v.province && (v.province instanceof Array)) {

                    if (v.province.length == 0) {
                        isForbidden = false;
                    } else {
                        for (var i in v.province) {
                            var _iProvince = v.province[i];
                            if (_iProvince.indexOf(_locProvince) > -1) { //在允许显示的城市配置内
                                isForbidden = false;
                                break;
                            }
                        }
                    }
                } else {
                    isForbidden = false;
                }

                if (!isForbidden) {
                    that.allAdInfoList.push(v);
                }
            });

            this.rawBannerInfoList.forEach(function (v) {
                if (v.icon_weight == undefined || Math.floor(v.icon_weight) <= 0.1) {
                    v.icon_weight = 0;
                }

                v.icon_weight = 10;
                var isForbidden = true;
                if (v.province && (v.province instanceof Array)) {

                    if (v.province.length == 0) {
                        isForbidden = false;
                    } else {
                        for (var i in v.province) {
                            var _iProvince = v.province[i];
                            if (_iProvince.indexOf(_locProvince) > -1) { //在允许显示的城市配置内
                                isForbidden = false;
                                break;
                            }
                        }
                    }
                } else {
                    isForbidden = false;
                }

                if (!isForbidden) {
                    that.allBannerInfoList.push(v);
                }
            });

        } else {

            this.rawAdInfoList.forEach(function (v) {
                if (v.icon_weight == undefined || Math.floor(v.icon_weight) <= 0.1) {
                    v.icon_weight = 0;
                }

                if (!v.province || ((v.province instanceof Array) && v.province.length == 0)) {
                    that.allAdInfoList.push(v);
                }
            });
            this.rawBannerInfoList.forEach(function (v) {
                if (v.icon_weight == undefined || Math.floor(v.icon_weight) <= 0.1) {
                    v.icon_weight = 0;
                }

                if (!v.province || ((v.province instanceof Array) && v.province.length == 0)) {
                    that.allBannerInfoList.push(v);
                }
            });

        }
    },

    /**
     * 初始化交叉导流模块
     */
    init: function () {

        this.requestLocalIPInfo();
        this.requestADInfo();
        this.requestBannerInfo();

    },

    //隐藏全部Banner
    hideBanner() {
        FZ.LOGD("隐藏全部Banner","隐藏全部Banner--------------1");
        try {
            FZ.AdManagerWx.bannerNodeList.forEach(function (_adNode) {
                FZ.LOGD("隐藏全部Banner","隐藏全部Banner--------------2");
                _adNode && _adNode.hideAdNode && _adNode.hideAdNode();
            });
        } catch (err) {
            FZ.LOGE('FZ.AdManagerWx hideBanner getError err=', err);
        }
    },

};

FZ.AdManagerWx.adNodeClass.prototype = FZ.AdManagerWx.adNodeObj;
FZ.AdManagerWx.init();
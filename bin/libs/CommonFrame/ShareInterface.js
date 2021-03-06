/**
 * Created by xiaochuntian on 2018/5/3.
 */

FZ.ShareInterface = {
    OnShareAppMessageInfo: null,   //右上角转发对应的分享点信息

    shareWithSharePoint: function(sharePointStr, successCallback, failCallback, extraInfo) {
        if(FZ.PropagateInterface._cachedShareConfig) {
            var randomShareInfo = FZ.PropagateInterface._shuffleByWeights();
            if(randomShareInfo && randomShareInfo[sharePointStr]) {
                var sharePointInfo = randomShareInfo[sharePointStr];
                FZ.ShareInterface.share(sharePointInfo.shareContent, sharePointInfo.sharePicUrl,
                    sharePointInfo.sharePointId, sharePointInfo.shareSchemeId, successCallback, failCallback, extraInfo);
            }
        } else {
            return null;
        }
    },

    /**
     * 设置右上角"转发"对应的分享信息(通过给出分享点)
     */
    setOnShareAppMessageInfoWithSharePoint: function(sharePointStr){
        if(FZ.PropagateInterface._cachedShareConfig) {
            var randomShareInfo = FZ.PropagateInterface._shuffleByWeights();
            if(randomShareInfo && randomShareInfo[sharePointStr]) {
                var sharePointInfo = randomShareInfo[sharePointStr];
                this.OnShareAppMessageInfo = {
                    title: sharePointInfo.shareContent,
                    imageUrl: sharePointInfo.sharePicUrl,
                    sharePointId: sharePointInfo.sharePointId,
                    shareSchemeId: sharePointInfo.shareSchemeId
                }
            }
        }
    },

    /**
     * 设置右上角"转发"对应的分享信息
     * @param title
     * @param imageUrl
     * @param sharePointId
     * @param shareSchemeId
     */
    setOnShareAppMessageInfo: function(title, imageUrl, sharePointId, shareSchemeId){
        this.OnShareAppMessageInfo = {
            title: title,
            imageUrl: imageUrl,
            sharePointId: sharePointId,
            shareSchemeId: shareSchemeId
        }
    },

    /**
     * 获取右上角"转发"对应的分享信息
     * @returns {null}
     */
    getOnShareAppMessageInfo: function() {
        return this.OnShareAppMessageInfo;
    },

    /**
     * 随机获取一个分享点作为"转发"对应的分享信息
     * @returns {*}
     */
    getRandomOnShareAppMessageInfo: function() {
        var shareKeys = [];

        for(var _key in FZ.PropagateInterface._cachedShareConfig){
            var _value = FZ.PropagateInterface._cachedShareConfig[_key];
            if (_value.length && (!_value[0].template_type)) {
                shareKeys.push(_key);
            }
        }
        if(shareKeys && shareKeys.length > 0) {
            var randomIndex = (Math.floor(Math.random()*10000))%shareKeys.length;
            var sharePointKey = shareKeys[randomIndex];
            var sharePointInfo = FZ.PropagateInterface._cachedShareConfig[sharePointKey];
            if(sharePointInfo && sharePointInfo.length > 0) {
                randomIndex = (Math.floor(Math.random()*10000))%sharePointInfo.length;
                var config = {
                    title: sharePointInfo[randomIndex].shareContent,
                    imageUrl: sharePointInfo[randomIndex].sharePicUrl,
                    sharePointId: sharePointInfo[randomIndex].sharePointId,
                    shareSchemeId: sharePointInfo[randomIndex].shareSchemeId
                }
                return config;
            }
        }
        return null;
    },

    /**
     * 根据分享信息调用分享接口,并封装了必要的打点和处理
     * @param title
     * @param imageUrl
     * @param sharePointId
     * @param shareSchemeId
     * @param successCallback
     * @param failCallback
     * @param extraInfo 额外信息
     */
    share: function(title, imageUrl, sharePointId, shareSchemeId, successCallback, failCallback, extraInfo) {
        try {
            if (FZ.IsWechatPlatform()) {
                var template_type = FZ.PropagateInterface._connectConfigInfo[sharePointId];

                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [sharePointId, 1, shareSchemeId,template_type,'share']);

                wx.shareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    query: 'inviteCode=' + FZ.UserInfo.userId
                    + '&sourceCode=' + sharePointId
                    + "&inviteName=" + FZ.UserInfo.userName
                    + "&imageType=" + shareSchemeId
                    + "&template_type=" + template_type
                    + "&fun_type=" + 'share'
                    + "&extraInfo=" + (extraInfo ? extraInfo : ''),
                    success: function (result) {
                        //分享成功相关处理
                        if (successCallback) {
                            successCallback(result);
                        }
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [sharePointId, 2, shareSchemeId,template_type,'share']);
                        if(FZ.SystemInfo.openLocalRecord){
                            FZ.TuyooSDK.freshLocalShareTimes();
                        }
                    },
                    fail: function (result) {
                        //分享失败相关处理
                        if (failCallback) {
                            failCallback(result);
                        }
                    },
                    complete: function () {
                    }
                });
            }
        }
        catch(err) {
            FZ.LOGE("error:", "FZ.ShareInterface.share——" + JSON.stringify(err));
        }
    },

    /**
     * 根据动态消息 调用分享接口,并封装了必要的打点和处理，如非动态消息调用此接口则切换至普通分享
     * @param activityData （配置系统处获得的某条分享信息）
     * @param successCallback
     * @param failCallback
     * @param extraInfo 额外信息
     */
    activityShare: function (activityData, successCallback, failCallback, extraInfo) {
        try {
            var template_type = activityData.template_type;

            if (template_type) {

                wx.updateShareMenu({
                    withShareTicket: true,
                    isUpdatableMessage: true,
                    activityId: activityData.activity_id, // 活动 ID
                    templateInfo: {
                        parameterList: [{
                            name: 'member_count',
                            value: activityData.user_num_lower.toString()
                        }, {
                            name: 'room_limit',
                            value: activityData.user_num_upper.toString()
                        }]
                    },
                    success: function (res) {
                        //分享成功相关处理
                        wx.shareAppMessage({
                            title: activityData.shareContent,
                            imageUrl: activityData.sharePicUrl,
                            query: 'inviteCode=' + FZ.UserInfo.userId
                            + '&sourceCode=' + activityData.sharePointId
                            + "&inviteName=" + FZ.UserInfo.userName
                            + "&imageType=" + activityData.shareSchemeId
                            + "&template_type=" + activityData.template_type
                            + "&fun_type=" + 'activityShare'
                            + "&extraInfo=" + (extraInfo ? extraInfo : ''),
                            success: function (result) {
                                //分享成功相关处理
                                if (successCallback) {
                                    successCallback(result);
                                }
                                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [activityData.sharePointId, 2, activityData.shareSchemeId, template_type, 'activityShare']);
                                if(FZ.SystemInfo.openLocalRecord){
                                    FZ.TuyooSDK.freshLocalShareTimes();
                                }
                            },
                            fail: function (result) {
                                //分享失败相关处理
                                if (failCallback) {
                                    failCallback(result);
                                }
                            },
                        });
                        FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [activityData.sharePointId, 1, activityData.shareSchemeId, template_type, 'activityShare']);
                    },
                    fail: function (result) {
                        //分享失败相关处理
                        FZ.ShareInterface.share(activityData.shareContent, activityData.sharePicUrl, activityData.sharePointId, activityData.shareSchemeId, successCallback, failCallback, extraInfo);
                    },
                    complete: function () {
                        var fc = function(){
                            wx.updateShareMenu({
                                withShareTicket: true,
                                isUpdatableMessage: false,
                                activityId: '', // 活动 ID
                                templateInfo: {}
                            });
                        };
                        setTimeout(fc,1000);
                    }
                });

            } else {
                FZ.ShareInterface.share(activityData.shareContent, activityData.sharePicUrl, activityData.sharePointId, activityData.shareSchemeId, successCallback, failCallback, extraInfo);
            }
        }
        catch (err) {
            FZ.LOGE("error:", "FZ.ShareInterface.activityShare——" + JSON.stringify(err));
        }
    }
};

FZ.onShareAppMessageInit = function() {
    try{
        if(FZ.IsWechatPlatform()) {
            wx.onShareAppMessage(function (result) {
                /**
                 * 获取转发信息,手动设置过则使用设置信息,否则随机获取一个分享点信息
                 */
                FZ.ShareInterface.setOnShareAppMessageInfoWithSharePoint("defaultSharePoint");
                var config = FZ.ShareInterface.getOnShareAppMessageInfo();
                if(config == null) {
                    config = FZ.ShareInterface.getRandomOnShareAppMessageInfo();
                }

                config = config || {};
                var template_type = FZ.PropagateInterface._connectConfigInfo[config.sharePointId];

                FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [config.sharePointId, 1, config.shareSchemeId, template_type, 'onShareAppMessage']);
                    return {
                        title: config.title || '',
                        imageUrl: config.imageUrl || '',
                        query: "inviteCode=" + FZ.UserInfo.userId
                        + "&sourceCode=" + config.sharePointId
                        + "&inviteName=" + FZ.UserInfo.userName
                        + "&imageType=" + config.shareSchemeId
                        + "&template_type=" + template_type
                        + "&fun_type=" + 'onShareAppMessage',
                        success: function (shareTickets, groupMsgInfos) {
                            FZ.BiLog.clickStat(FZ.clickStatEventType.clickStatEventTypeUserShare, [config.sharePointId, 2, config.shareSchemeId, template_type, 'onShareAppMessage']);
                            if(FZ.SystemInfo.openLocalRecord){
                                FZ.TuyooSDK.freshLocalShareTimes();
                            }
                        },
                        fail : function () {
    
                        },
                        complete : function () {
                        }
                    }
            });
        };
    }
    catch(err) {
        FZ.LOGE("error:", "FZ.ShareInterface.share——" + JSON.stringify(err));
    }
};

FZ.onShareAppMessageInit();
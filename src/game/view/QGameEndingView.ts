
import QBaseUI from "../core/QBaseUI";
import QSoundMgr from "../core/QSoundMgr";
import QUIMgr from "../core/QUIMgr";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QGameData from "../data/QGameData";
import QMergeData from "../data/QMergeData";
import QUtil from "../../framework/QUtil";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QGameConst from "../data/QGameConst";
import { ui } from "../../ui/layaMaxUI";
import QDebug from "../../framework/QDebug";
import QSequence from "../../framework/QSequence";
import QCfgMgr from "../core/QCfgMgr";
import QJcdlTypeView from "../../game/view/QJcdlTypeView";
import QSavedDateItem from "../data/QSavedDateItem";

namespace game.view
{
    export class QGameEndingView extends QBaseUI
    {

        public scene: ui.view.GameEndingSceneUI ;
        public isWin: boolean = true;
        private fanPaiCfg:any;
        private carCfg:any;
        private buy_car_info:any;
        private awardNumCfg:any;

        private randomAwardId:number[];
        private CarMaxLevel:number;

        private sequence : QSequence;

        private timeLine:Laya.TimeLine;

        private getAwardTimes:number = 0;

        private curGetAwardId:number = 0;
        private curClickCardIndex:number = 0;
        private fanpai_guide:boolean = true;
        private check_point:number;
        private left_index:number[] = [1,2,3];//剩余可选牌index
        private show_guide:boolean;

        public init():void
        {
            this.scene = new ui.view.GameEndingSceneUI();
            this.setStateToJCDL();
            var isShare = QGameData.instance.getShareOrVideo();
            this.scene.free_type_icon.skin = isShare ?  "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            this.scene.free_type_icon0.skin = isShare ?  "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            // QUtil.doUIPopAnim(this.scene.box_result_Info);
            this.fanPaiCfg =QCfgMgr.instance.dicConfig[QGameConst.QCfgType.GameConfig]['fanPai_config'];
            this.carCfg = QCfgMgr.instance.dicConfig[QGameConst.QCfgType.GameConfig]['carCfg'];

            this.awardNumCfg = {};

            this.CarMaxLevel = QMergeData.instance.CarMaxLevel;
            let carLevel = this.CarMaxLevel >= 6 ? this.CarMaxLevel-4 : 1;
            this.buy_car_info = QMergeData.instance.getCarBuyPrice(carLevel);

            this.randomAwardId = [];
            this.randomWinCardAwardId();

            this.scene.lblTextHint.visible = false;
            this.scene.lblTextbg.visible = false;
            // this.scene.ani_bgguang.visible = false;
            this.scene.boxGetAward.visible = false;
            this.scene.btn_abandonTimes.visible = false;
            this.scene.btnConfirm.visible = false;

            for(let i = 1;i<=3;i++)
            {
                this.scene['imgHint'+i].visible = false;
            }

            this.timeLine = new Laya.TimeLine();

            QGameData.instance.game_revive_times = 0;

            if (QUIMgr.instance.longScreen()) {
                Laya.timer.once(20, this, () => {
                    this.scene.box_title.y += 70;
                });
            }
        }

        public updateDataUI()
        {
            this.scene.lab_game_diamond.text =  QUtil.formatNumberStr(QMergeData.instance.getGameDiamond()+ "");
            this.scene.lab_game_money.text =  QUtil.formatNumberStr(QGameData.instance.getWeaponsCoin() + "");
            this.scene.game_lab_gold.text = QUtil.formatNumberStr(QGameData.instance.checkpoint_dollars + "");
            QGameData.instance.checkpoint_diamond = this.isWin ? QGameData.instance.getCheckPointData().end_diamond : 0;
            this.scene.game_lab_diamond.text = QUtil.formatNumberStr(QGameData.instance.checkpoint_diamond + "");
            this.scene.lab_game_gold.text = QUtil.formatNumberStr(QMergeData.instance.getGameGold());
            var count = Math.floor((1 - QGameData.instance.LevelEnemyCount/QGameData.instance.LevelEnemyCountMax)*100);
            this.scene.label_fail_txt.text = "完成度: " + count + "%";
            this.show_guide = true;
            var delayTime = this.getAwardTimes==1?2300:1600;
            Laya.timer.once(delayTime,this, function(){
                if(this.show_guide){
                    this.checkFanpaiGuide();
                }
            });
        }

        private unique(arr) {
            var result = [], hash = {};
            for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                var code = elem.commodity.commodityCode;
                if (!hash[code]) {
                    result.push(elem);
                    hash[code] = true;
                }
            }
            return result;
        }

        private checkFanpaiGuide(){
            if(this.check_point!=1) return;
            this.scene.ani_hand_guide.gotoAndStop(0);
            this.scene.ani_hand_guide_0.gotoAndStop(0);
            this.scene.ani_hand_guide_1.gotoAndStop(0);
            this.scene.ani_hand_guide_2.gotoAndStop(0);
            this.scene.guide_hand.scaleX = 1.8;
            this.scene.guide_hand.scaleY = 1.8;
            this.scene.guide_click.scaleX = 1.8;
            this.scene.guide_click.scaleY = 1.8;
            if(this.getAwardTimes>0&&this.getAwardTimes<3){
                this.left_index.forEach(element => {
                    if(element==2){
                        this.scene.guide_hand.x = 330;//调整动画横坐标
                        this.scene.guide_hand.visible = true;
                        this.scene.guide_click.x = 370;//调整动画横坐标
                        this.scene.guide_click.visible = true;
                        this.scene.ani_hand_guide.play(0,true);
                        return;
                    }
                });
                if(this.left_index[0]==1){
                    this.scene.guide_hand.x = 80;//调整动画横坐标
                    this.scene.guide_hand.visible = true;
                    this.scene.guide_click.x = 120;//调整动画横坐标
                    this.scene.guide_click.visible = true;
                    this.scene.ani_hand_guide.play(0,true);
                }else if(this.left_index[0]==3){
                    this.scene.guide_hand.x = 580;//调整动画横坐标
                    this.scene.guide_hand.visible = true;
                    this.scene.guide_click.x = 620;//调整动画横坐标
                    this.scene.guide_click.visible = true;
                    this.scene.ani_hand_guide.play(0,true);
                }
            }
            else if(this.getAwardTimes==3){
                this.scene.guide_hand.x = 358;//调整动画横坐标
                this.scene.guide_hand.y = 1120;
                this.scene.guide_hand.visible = true;
                this.scene.guide_click.x = 370;//调整动画横坐标
                this.scene.guide_click.y = 1120;
                this.scene.guide_click.visible = true;
                this.scene.ani_hand_guide_1.play(0,true);
            }
        }

        private cardArrayX:any=[129,375,622];
        public setParam(params:any) :void
        {
            if(true/*QUIMgr.instance.longScreen()*/)
            {
                this.scene.box_result_Info.y -= 150;
            }

            this.scene.box_result_Info.visible = false;
            this.scene.label_fail_txt.visible = false;
            // this.scene.ani_win.visible = false;
            this.scene.ani_fail.visible = false;
            let stepIdx  = QGameData.instance.newPlayerGudieStep(null);
            this.scene.btn_receive3.visible = !(stepIdx + 1 == QGameConst.NumForGuide.getResult);

            this.scene.boxWin.visible = !(params == 0);
            this.scene.boxFail.visible = (params == 0);

            this.check_point = QGameData.instance.getCheckPoint();
            // 添加 底部的 Banner 导流
            // if(tywx.IsWechatPlatform()){
            // }

            if (params == 0) {
                // 失败
                this.isWin = false;
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.fail);
                this.scene.img_item_2.visible = false;
                this.scene.img_item_1.x  = 375;

                if(this.check_point > 2){  //右侧交叉导流
                    this.scene.permanent1.visible = true;
                    this.scene.btnSingleJcdlIcon.visible = true;
                    QJcdlTypeView.instance.create({type : 0 });  //添加底部交叉导流
                    this.createResidentRoll();
                    this.createRollBanner();
                }else{
                    this.scene.permanent1.visible = false;
                    this.scene.btnSingleJcdlIcon.visible = false;
                }
            } else {
                // 胜利

                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_Get, this, this.onClickBtnGetAward,[]);
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_moreGet, this, this.onClickBtnMoreGetAward,[]);
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_return, this, this.onClickBtnGetAward,[]);
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_abandonTimes, this, this.onClickBtnAbandonTimes,[]);
                QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnConfirm, this, this.onClickBtnAbandonTimes,[]);

                this.isWin = true;
                this.check_point-=1;  
                if(this.check_point > 2){
                    QJcdlTypeView.instance.create({type : 0 });  //创建滚动交叉导流
                    QJcdlTypeView.instance.create({type : 1 });  //创建抽屉交叉导流
                }else if(this.check_point == 2){
                    QJcdlTypeView.instance.create({type : 0 });  //创建滚动交叉导流
                    QJcdlTypeView.instance.create({type : 1 });  //创建抽屉交叉导流
                }
                
            }
            this.scene.lab_check_point.text = "第" + this.check_point + "关";
            this.updateDataUI();
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_receive, this, this.clickFlyRes,[]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_receive3, this, this.onBackHall3,[]);
            //检测是否存在引导
            this.scene.box_btn.visible = false;

            //1 胜利
            if (this.isWin == true) {

                QMergeData.instance.setPlayGameWinTimes();

                let awardCount:any = 0;
                let iconPath:any = "";
                let nameAndLevel:any = "";
                for(let i = 0;i<3;i++)
                {
                    let awardcfg = this.fanPaiCfg[this.randomAwardId[i] + ""];
                    //如果不是车辆奖励
                    if(awardcfg['award_type'] !=3)
                    {
                        //金币钻石  类型:1
                        if(awardcfg['award_type'] == 1)
                        {
                            let factor = 0;
                            for(let j = 0;j<awardcfg['award'].length;j++)
                            {
                                if(this.CarMaxLevel <= awardcfg['award'][j][0])
                                {
                                    factor = awardcfg['award'][j][1];
                                    break;
                                }
                            }

                            if(this.CarMaxLevel < 3)
                            {
                                this.CarMaxLevel = 3;
                            }
                            var ___level = this.CarMaxLevel-2;
                            let diamondNum = Number(QMergeData.instance.getCarBuyPriceDiamond(this.carCfg[___level + ""]['id']));
                            //获取进步或者钻石数量(pS: 钻石数量最低为10)
                            let awardNum = awardcfg['type'] == 1 ? this.buy_car_info*factor : (diamondNum*factor >= 10) ? diamondNum*factor : 10;
                            awardCount = awardNum;
                        }
                        else
                        {
                            //钞票  类型:2
                            awardCount = QGameData.instance.checkpoint_dollars;
                        }
                        iconPath = this.fanPaiCfg[this.randomAwardId[i] + ""]['path'];
                        nameAndLevel = "";
                    }
                    else
                    {
                        var index = QCfgMgr.instance.getCarInfoById(this.CarMaxLevel).unlock_buy_diamond_level;
                        var factor = 0;
                        for(let j = 0;j<awardcfg['award'].length;j++)
                        {
                            if(this.CarMaxLevel <= awardcfg['award'][j][0])
                            {
                                factor = awardcfg['award'][j][1];
                                break;
                            }
                        }
                        let level = this.CarMaxLevel >=6 ? index - factor: 1;
                        //车 类型:3
                        iconPath = this.carCfg[level]['path'];
                        awardCount = 1;
                        nameAndLevel = this.carCfg[level]['name'];//+" LV"+this.carCfg[this.CarMaxLevel]['id'];
                    }

                    //将所有数据放入新的JSON,方便翻牌发放奖励
                    this.awardNumCfg[this.randomAwardId[i]] = {};
                    this.awardNumCfg[this.randomAwardId[i]]["award_type"] = awardcfg['award_type'];
                    this.awardNumCfg[this.randomAwardId[i]]['iconPath'] = iconPath;
                    this.awardNumCfg[this.randomAwardId[i]]['awardCount'] = Math.floor(awardCount);
                    this.awardNumCfg[this.randomAwardId[i]]['nameAndLevel'] = nameAndLevel;

                    this.scene['imgAward'+(i+1)].skin = iconPath;
                    let textInfo = awardcfg['award_type'] == 3 ? nameAndLevel : "+"+QUtil.formatNumberStr(Math.floor(awardCount).toString());
                    this.scene['lblAward'+(i+1)].text = textInfo;
                    if(textInfo.length>8){
                        this.scene['lblAward'+(i+1)].scaleX = 0.5;
                        this.scene['lblAward'+(i+1)].scaleY = 0.5;
                    }
                }

                QDebug.log(" awardNumCfg : "+JSON.stringify(this.awardNumCfg));

                // this.scene.ani_win.visible = true;
                // this.scene.ani_win.play(0, false);

                this.sequence = QSequence.create();

                this.sequence.add(0.2, function(){
                    this.scene.box_result_Info.visible = true;
                    this.scene.box_result_Info.scale(2,2);
                    this.scene.box_result_Info.alpha = 0;
                    Laya.Tween.to(this.scene.box_result_Info,{alpha:1,scaleX:1, scaleY:1},400,null, Laya.Handler.create(this, function(){
                        //this.scene.box_btn.visible = true;
                        this.scene.box_btn.alpha = 0;
                        this.scene.box_btn.scale(2,2);
                        Laya.Tween.to(this.scene.box_btn,{alpha:1,scaleX:1, scaleY:1},100,Laya.Ease.backOut, Laya.Handler.create(this, function(){
                            this.checkGuide();
                        }))
                    }));
                }, this)

                this.sequence.add(2.2, function(){
                    for(let i = 1;i<=3;i++)
                    {
                        this.scene['boxAward'+i].visible=false;
                    }

                    this.scene.ani_fanpai_fan.play(0,false);
                }, this)
                if( ! this.scene ){
                    return;
                }
                this.sequence.add(2.7, function(){
                    if( ! this.scene ){
                        return;
                    }
                    this.scene.ani_move.play(0, false);
                //     this.timeLine.addLabel("1",0).to(this.scene.boxCard1,{x:622},50,null,0)
                //                 .addLabel("2",0).to(this.scene.boxCard2,{x:129},50,null,0)
                //                 .addLabel("3",0).to(this.scene.boxCard3,{x:375},50,null,0)
                //                 .addLabel("4",0).to(this.scene.boxCard1,{x:129},50,null,0)
                //                 .addLabel("5",0).to(this.scene.boxCard2,{x:375},50,null,0)
                //                 .addLabel("6",0).to(this.scene.boxCard3,{x:622},50,null,0)
                //                 .addLabel("7",0).to(this.scene.boxCard1,{x:622},50,null,0)
                //                 .addLabel("8",0).to(this.scene.boxCard2,{x:129},50,null,0)
                //                 .addLabel("9",0).to(this.scene.boxCard3,{x:375},50,null,0)
                //                 .addLabel("10",0).to(this.scene.boxCard1,{x:129},50,null,0)
                //                 .addLabel("11",0).to(this.scene.boxCard2,{x:375},50,null,0)
                //                 .addLabel("12",0).to(this.scene.boxCard3,{x:622},50,null,0);
                // this.timeLine.play(0,false);
                }, this)

                this.sequence.add(3.7, function(){

                    if(!QUtil.isNullOrEmpty(this.timeLine))
                    {
                        this.timeLine.destroy();
                    }

                    this.scene.boxCard1.x = 129;
                    this.scene.boxCard2.x = 375;
                    this.scene.boxCard3.x = 622;

                    // this.scene.lblTextHint.visible = true;
                    this.scene.lbl_return.visible = true;
                    this.scene.lblTextbg.y = 945;
                    this.scene.lblTextbg.visible = true;


                    for(let i = 1;i<=3;i++)
                    {
                        this.scene['imgHint'+i].visible = true;
                        this.scene['ani_light'+i].play(0,true);
                        this.scene['imgCard'+i+'_4'].on(Laya.Event.CLICK,this,this.onClickAward,[i]);
                    }

                    this.refreshShareOrVideo();
                    if(this.fanpai_guide && this.check_point == 1){
                        var guidetimes = parseInt(QSavedDateItem.instance.getItemFromLocalStorage("END_FANPAI_GUIDE", '0'));
                        if(guidetimes < 1){
                            guidetimes++;
                            this.scene.guide_hand.scaleX = 1.8;
                            this.scene.guide_hand.scaleY = 1.8;
                            this.scene.guide_click.scaleX = 1.8;
                            this.scene.guide_click.scaleY = 1.8;
                            this.scene.guide_hand.visible = true;
                            this.scene.guide_click.visible = true;
                            this.scene.ani_hand_guide.play(0, true);
                            QSavedDateItem.instance.setItemToLocalStorage("END_FANPAI_GUIDE", guidetimes + '');
                        }else{
                            this.fanpai_guide = false;
                        }
                    }
                }, this)

                this.sequence.start();

            } else if(this.isWin == false) {
                this.scene.ani_fail.visible = true;
                this.scene.ani_fail.play(0, false);
                Laya.timer.once(600,this, function(){
                    this.scene.box_result_Info.visible = true;
                    this.scene.box_result_Info.alpha = 0;
                    this.scene.box_result_Info.scale(2,2);
                    this.scene.btn_receive.visible = false; // 延迟 "普通领取"  游戏失败 - 提前进行关闭行为
                    Laya.Tween.to(this.scene.box_result_Info,{alpha:1,scaleX:1, scaleY:1},400,null, Laya.Handler.create(this, function(){
                        this.scene.box_btn.visible = true;
                        this.scene.box_btn.alpha = 0;
                        this.scene.box_btn.scale(2,2);
                        Laya.Tween.to(this.scene.box_btn,{alpha:1,scaleX:1, scaleY:1},100,Laya.Ease.backOut, Laya.Handler.create(this, function(){
                            // this.checkGuide();

                            // 延迟 "普通领取"  游戏失败 - ( 延迟出现 )
                            var delayTime = QGameData.instance.delay_show_time;
                            if( ! delayTime ){
                                delayTime = 2000;
                            }
                            Laya.timer.once( delayTime , this , this.showBtnReceive);
                        }));
                    }));
                })
            }
        }

        public jcdlListData: any = null;  // 交叉导流 列表 
        public iconTimestamp : number;  // 交叉导流(使用的随机数)
        public jdclSingleIndex : number = 0; // 交叉导流循环 坐标
        public jdclSingleIndex_down : number = 1; //  第二个 交叉导流循环 坐标  （ 默认从第二位开始 )
        public jdclList_middle : number = 4; // 记录交叉导流列表中间值

        // 设置 交叉导流读取的信息
        setStateToJCDL(){
            // this.scene.btnSingleJcdlIcon.visible = false; // 起始不显示 滚动导流
            QJcdlTypeView.instance.remove();
            this.jcdlListData = QGameData.instance.getJcdlDataList();  // 获取交叉导流的数值信息
            this.iconTimestamp = Math.sqrt(Math.random());

            this.jdclList_middle =  Math.floor( this.jcdlListData.length / 2 );  // 获取配置 中间值
            this.jdclSingleIndex =  this.jdclList_middle;

        }

        // 【常驻“滚动导流】 - 创建 常驻滚动导流
        private createResidentRoll() : void {
            // this.scene.jcdlRollShake_down.play(0,true);
            this.JcdlResidentSingleInfo();
            Laya.timer.loop(4000,this,this.JcdlResidentSingleInfo);
        }

        //  停止 常驻滚动导流 
        private stopResidentRollBanner() : void {
            // this.scene.jcdlRollShake_down.stop();
            this.scene.permanent1.rotation = 0;
            Laya.timer.clear(this,this.JcdlResidentSingleInfo);
         }

        // 常驻滚动导流 - 底部    ( 循环 前半部分 )
        private JcdlResidentSingleInfo() : void {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex_down] ){
                    return;
                }
                this.scene.permanent1.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex_down]);
                this.scene.imgSingleJcdlIcon1.skin = this.jcdlListData[this.jdclSingleIndex_down].icon_url[0]+ "?v=" + this.iconTimestamp;
                this.scene.lblSingleJcdlName1.text = this.jcdlListData[this.jdclSingleIndex_down].gameName;
                this.jdclSingleIndex_down++;
                if(this.jdclSingleIndex_down == this.jdclList_middle)
                {
                    this.jdclSingleIndex_down = 1;
                }
            } catch(e){

            }
        }

        //【空投箱 “滚动" 导流】 - 创建 滚动导流
        private createRollBanner() : void {
            // this.scene.btnSingleJcdlIcon.visible = true;
            // this.scene.jcdlRollShake.play(0,true);
            this.JcdlSingleInfo();
            Laya.timer.loop(4000,this,this.JcdlSingleInfo);
        }

        //  停止 滚动导流
        private stopRollBanner() : void {
            // this.scene.jcdlRollShake.stop();
            this.scene.btnSingleJcdlIcon.rotation = 0;
            Laya.timer.clear(this,this.JcdlSingleInfo);
            // this.scene.btnSingleJcdlIcon.visible = false;
        }

        // 执行 交叉导流信息循环   ( 循环 后半部分 )
        private JcdlSingleInfo():void
        {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex] ){
                    return;
                }
                this.scene.btnSingleJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex]);
                this.scene.imgSingleJcdlIcon.skin = this.jcdlListData[this.jdclSingleIndex].icon_url[0]+ "?v=" + this.iconTimestamp;
                // this.scene.btnSingleJcdlIcon.visible = true;
                this.scene.lblSingleJcdlName.text = this.jcdlListData[this.jdclSingleIndex].gameName;
                this.jdclSingleIndex++;
                if(this.jdclSingleIndex == this.jcdlListData.length)
                {
                    this.jdclSingleIndex = this.jdclList_middle;  //  回到中间值
                }
            } catch(e){
                
            }
        }
        
        // 交叉导流 按下执行事件
        private onClickBtnJcdlIconByMain(iconIndex : number):void
        {
            let toappid =  this.jcdlListData[iconIndex]["toappid"];
            QWxSDK.instance.clickAdIcon(toappid);
        }

        /**
         * 领取按钮的出现
         */
        public showBtnReceive(){
            this.checkGuide();
            this.scene.btn_receive.visible = true;
            QUtil.doUIPopAnim(this.scene.btn_receive);
        }

        private refreshShareOrVideo():void
        {
            let isFree = (QMergeData.instance.getPlayGameWinTimes() <= 2 && QGameData.instance.getCheckPoint() < 4) || this.getAwardTimes == 0;
            let isShareOrVideo = QGameData.instance.getShareOrVideo();
            let path = isFree ? "ui_game/game_mianfeidakai.png" : isShareOrVideo ? "ui_game/game_share.png":"ui_game/game_video.png";
            QDebug.log(" path ===== : "+path);
            this.scene.imgHint1.skin = path;
            this.scene.imgHint2.skin = path;
            this.scene.imgHint3.skin = path;
        }

        private playFanPaiAni(posX:number,posY:number):void
        {
            this.scene.ani_fanpai.visible=true;
            this.scene.ani_fanpai.pos(posX,posY);
            this.scene.ani_fanpai.play(0,false);
        }

        private onClickAward(clickIndex:number):void
        {
            if (this.touch ==true) {
                return;
            }
            this.touch = true;
            if(this.fanpai_guide){
                this.scene.guide_hand.visible = false;
                this.scene.guide_click.visible = false;
                this.scene.ani_hand_guide.gotoAndStop(0);
            }
            for(var i = 0;i<this.left_index.length;i++){//删除剩余牌中对应index
                if(this.left_index[i]==clickIndex){
                    this.left_index.splice(i, 1)
                    break;
                }
            }
            //胜利次数小于2或者第一次翻牌时,为免费翻牌
            if((QMergeData.instance.getPlayGameWinTimes() <= 2 && QGameData.instance.getCheckPoint() < 4) || this.getAwardTimes == 0)
            {
                this.successFanpaiHandle(clickIndex);
            }
            else
            {
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
                let param = QShareParam.create();
                param.shareType = QGameConst.QShareType.FanPai;
                var isShare = QGameData.instance.getShareOrVideo();
                if (isShare == true){
                    // 分享

                    let path = "ui_game/game_share.png";
                    QDebug.log(" path ===== : "+path);
                    this.scene.imgHint1.skin = path;
                    this.scene.imgHint2.skin = path;
                    this.scene.imgHint3.skin = path;

                    QWxSDK.instance.fakeShare(param, this, function(self : any){
                        self.successFanpaiHandle(clickIndex);
                    }, [this],function(self : any){
                        self.touch = false;
                    })
                } else {
                    // 视频

                    let path = "ui_game/game_video.png";
                    QDebug.log(" path ===== : "+path);
                    this.scene.imgHint1.skin = path;
                    this.scene.imgHint2.skin = path;
                    this.scene.imgHint3.skin = path;

                    QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                        this.successFanpaiHandle(clickIndex);
                    }), Laya.Handler.create(this, function(value){
                        if(Laya.Browser.onMiniGame&&value == 1){
                            QWxSDK.instance.fakeShare(param, this, function(self : any){
                                self.successFanpaiHandle(clickIndex);
                            }, [this],function(self : any){
                                self.touch = false;
                            })
                        }else if(value == 0){
                            this.touch = false;
                            QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                        }
                    }));
                }
            }
        }

        private successFanpaiHandle(clickIndex:number):void
        {
            if( ! this.scene ){
                return;
            }

            if(tywx.clickStatEventType.flopRewardSuc[this.getAwardTimes]){
                tywx.BiLog.clickStat(tywx.clickStatEventType.flopRewardSuc[this.getAwardTimes],[]);
            }
            if(tywx.clickStatEventType.flopRewardSuc_gameEnd[this.getAwardTimes]){
                tywx.BiLog.clickStat(tywx.clickStatEventType.flopRewardSuc_gameEnd[this.getAwardTimes],[]);
            }
            if(tywx.clickStatEventType.flopRewardSuc_firstgameEnd[this.getAwardTimes]){
                tywx.BiLog.clickStat(tywx.clickStatEventType.flopRewardSuc_firstgameEnd[this.getAwardTimes],[]);
            }
            this.getAwardTimes++;
            this.curClickCardIndex = clickIndex;

            var finish = this.getAwardTimes == 3;
            if(finish){
                this.scene.lblTextbg.y = 845;
            }
            this.scene.btnConfirm.visible = finish;
            this.scene.btn_abandonTimes.visible = !finish;
            if(this.check_point < 3){  //前两关直接免费给
                this.scene.btn_abandonTimes.visible = false;
                this.scene.guide_hand.visible = false;
                this.scene.guide_click.visible = false;
                this.scene.ani_hand_guide.gotoAndStop(0);
                this.show_guide = false;
                this.scene.free_type_icon0.visible = false;
                this.scene.btn_get_lbl.y = 80;
                this.scene.btn_get_lbl.scaleX = 1;
                this.scene.btn_get_lbl.scaleY = 1;
                if(this.getAwardTimes == 1 && this.check_point == 1){
                    this.scene.guide_hand.x = 358;
                    this.scene.guide_click.x = 370;
                    this.scene.moreget_hand.scaleX = 1.8;
                    this.scene.moreget_hand.scaleY = 1.8;
                    this.scene.moreget_click.scaleX = 1.8;
                    this.scene.moreget_click.scaleY = 1.8;
                    this.scene.moreget_hand.visible = true;
                    this.scene.moreget_click.visible = true;
                    this.scene.ani_hand_guide_0.play(0,true);
                }else if(this.check_point == 1){
                    this.scene.guide_hand.x = 358;
                    this.scene.guide_click.x = 370;
                    this.scene.guide_hand.scaleX = 1.8;
                    this.scene.guide_hand.scaleY = 1.8;
                    this.scene.guide_click.scaleX = 1.8;
                    this.scene.guide_click.scaleY = 1.8;
                    Laya.timer.once(800, this, function(){
                        this.scene.guide_hand.visible = true;
                        this.scene.guide_click.visible = true;
                        this.scene.ani_hand_guide_2.play(0,true);
                    });
                }
            }


            if(this.getAwardTimes == 3)
            {
                // this.scene.lblTextHint.skin = "ui_game/game_gongxi.png";//.changeText("恭喜获得全部大奖!");
                if(this.check_point==1){
                    // this.scene.lblTextHint.visible = false;
                    this.scene.lbl_return.fontSize = 50;
                    this.scene.lbl_return.text = '点击返回主页面';
                    // this.scene.lbl_return.visible = true;
                }else{
                    this.scene.lbl_return.fontSize = 50;
                    this.scene.lbl_return.text = '恭喜获得全部大奖!';
                    // this.scene.lbl_return.visible = true;
                }
            }
            else if(this.getAwardTimes == 1)
            {
                // let skinPath = QGameData.instance.getShareOrVideo() ? "ui_game/game_fenxiangfanpai.png":"ui_game/game_textFanpai.png";
                // this.scene.lblTextHint.skin = skinPath;
                this.scene.lbl_return.fontSize = 40;
                var text = QGameData.instance.getShareOrVideo() ? "分享可获得更多翻牌机会":"看视频可获得更多翻牌机会";
                this.scene.lbl_return.text = text;
            }

            if((QMergeData.instance.getPlayGameWinTimes() <= 2 && this.check_point < 3&&this.getAwardTimes<3))
            {
                // this.scene.lblTextHint.skin = "ui_game/game_freeget.png";
                this.scene.lbl_return.fontSize = 42;
                this.scene.lbl_return.text = '点击翻牌领取丰厚奖励!';
            }

            let cardAwardId = this.getCardAwardId(this.getAwardTimes);
            this.updateCardInfo(clickIndex,cardAwardId);

            this.scene.boxMoreGet.visible = (this.getAwardTimes==1);
            // 延迟 "普通领取" 成功过关 翻牌 - ( 延迟出现 )
            if( this.scene.boxMoreGet.visible == true ){
                this.scene.btn_return.visible = false;
                var delayTime = QGameData.instance.delay_show_time;
                if( ! delayTime ){
                    delayTime = 2000;
                }
                if(this.check_point>=3){
                    Laya.timer.once( delayTime , this , function(){
                        this.scene.btn_return.visible = true;
                    })
                }
            }

            this.scene.btn_Get.visible = !(this.getAwardTimes==1);

            QDebug.log(" getAwardTimes : "+this.getAwardTimes);
            this.scene['imgCard'+clickIndex+'_4'].off(Laya.Event.CLICK,this,this.onClickAward);

            this.scene['ani_light'+clickIndex].stop();
            Laya.Tween.to(this.scene['boxCard'+clickIndex],{alpha:0},100);
            this.scene['imgLight'+clickIndex].visible =false;

            this.playFanPaiAni(this.scene['boxCard'+clickIndex].x,this.scene['boxCard'+clickIndex].y);
            Laya.timer.frameOnce(10,this,()=>{
                this.scene['boxAward'+clickIndex].scaleX = 0;
                this.scene['boxAward'+clickIndex].scaleY = 1;
                this.scene['boxAward'+clickIndex].alpha = 1;
                this.scene['boxAward'+clickIndex].visible = true;
                Laya.Tween.to(this.scene['boxAward'+clickIndex], {scaleX:1.2,scaleY:1.2},300,Laya.Ease.backOut,Laya.Handler.create(this,function(){

                }))
            });
            Laya.timer.frameOnce(this.scene.ani_fanpai.count*2,this,()=>{

                this.scene.ani_fanpai.visible = false;
                this.scene['boxAward'+clickIndex].scaleX = 1;
                this.scene['boxAward'+clickIndex].scaleY = 1;
                this.scene.boxGetAward.visible = true;
                Laya.Tween.to(this.scene.boxAward, {scaleX:1.6,scaleY:1.6},200,Laya.Ease.backOut,Laya.Handler.create(this,function(){
                    Laya.Tween.to(this.scene.boxAward, {scaleX:1.2,scaleY:1.2},100);
                }))

                this.scene.ani_bgguang.play(0,true);
                // this.scene.ani_baiguang.play(0,false);

                this.scene['boxAward'+clickIndex].visible = true;
                this.touch = false;
            });

            Laya.timer.frameOnce(20,this,()=>{
                this.refreshShareOrVideo();
            });
        }

        private updateCardInfo(clickIndex:number,cardId:number):void
        {
            this.curGetAwardId = cardId;
            this.scene['imgAward'+clickIndex].skin = this.awardNumCfg[cardId]['iconPath'];
            let textInfo = cardId == 4 ? this.awardNumCfg[cardId]['nameAndLevel'] : "+"+QUtil.formatNumberStr(this.awardNumCfg[cardId]['awardCount'].toString());
            this.scene['lblAward'+clickIndex].text = textInfo;
            if(textInfo.length>8){
                this.scene['lblAward'+clickIndex].scaleX = 0.5;
                this.scene['lblAward'+clickIndex].scaleY = 0.5;
            }

            this.scene.imgGetAward.skin = this.awardNumCfg[cardId]['iconPath'];
            if (cardId == 4){
                this.scene.imgGetAward.scaleX = 1.2;
                this.scene.imgGetAward.scaleY = 1.2;
            } else {
                this.scene.imgGetAward.scaleX = 1;
                this.scene.imgGetAward.scaleY = 1;
            }
            this.scene.lblGetAward.text = textInfo;
        }

        private getCardAwardId(clickTimes:number):number
        {
            let factor = 100000;
			let random = Math.random()*factor;
            let value : number = 0;

            let randomId = 0;

            //第一次点击翻牌, 从金币与钞票中随机抽取一种
            if(clickTimes == 1)
            {
                if(this.check_point <= 2){
                    randomId = 2;  //第一关和第二关第一次发牌直接给美钞
                }else{
                    let needRandomArray = [1,2];  //数组中[1,2] 1:金币奖励id  2:钞票奖励id

                    //随机抽取奖励ID
                    for(let i = 0;i < needRandomArray.length;i++)
                    {
                        value += QGameData.instance.cardChangce[clickTimes-1][i]*factor;
                        if(random <= value)
                        {
                            randomId = needRandomArray[i];
                            break;
                        }
                    }
                }
            }
            else if(clickTimes == 2) //第二次点击翻牌,从未获得的(金币与钞票)和(钻石与车)中抽取
            {
                //随机抽取奖励ID
                for(let i = 0;i < this.randomAwardId.length;i++)
                {
                    value += QGameData.instance.cardChangce[clickTimes-1][i]*factor;
                    if(random <= value)
                    {
                        //概率配置 index = 0 为(金币或者钞票)的概率  =1 为(钻石或者车)的概率
                        if(i == 0)
                        {
                            for(let j = 0;j < this.randomAwardId.length;j++)
                            {
                                if(this.randomAwardId[j] == 1 || this.randomAwardId[j] == 2)
                                {
                                    randomId = this.randomAwardId[j];
                                    break;
                                }
                            }
                        }
                        else
                        {
                            for(let j = 0;j < this.randomAwardId.length;j++)
                            {
                                if(this.randomAwardId[j] == 3 || this.randomAwardId[j] == 4)
                                {
                                    randomId = this.randomAwardId[j];
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
            else if(clickTimes == 3) //第三次给最后剩余的奖励
            {
                randomId = this.randomAwardId[0];
            }

            //从之前选取的数组中移除已抽取的ID
            for(let i = 0;i<this.randomAwardId.length;i++)
            {
                if(randomId == this.randomAwardId[i])
                {
                    return this.randomAwardId.splice(i,1)[0];
                }
            }
            return 1;
        }

        private onClickBtnGetAward(isGetAward:boolean=true):void
        {
            if(this.check_point==1){//第一关直接免费给
                this.scene.guide_hand.visible = false;
                this.scene.guide_click.visible = false;
                this.show_guide = false;
                this.scene.ani_hand_guide_2.gotoAndStop(0);
                this.scene.ani_hand_guide_1.gotoAndStop(0);
                this.scene.ani_hand_guide_0.gotoAndStop(0);
                this.scene.ani_hand_guide.gotoAndStop(0);
            }
            let awardNum = this.awardNumCfg[this.curGetAwardId]['awardCount'];
            switch(this.curGetAwardId)
            {
                case 1:  //金币
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMuchMoney);
                    QMergeData.instance.addGameGold((awardNum).toString());
                    QGameData.instance.playResFlyAni(this.scene.imgGetAward,this.scene.title_gold,{type: 1,countType: 1},this.removeGetAwardView.bind(this));
                    break;
                case 2:  //美钞
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMuchMoney);
                    QGameData.instance.playResFlyAni(this.scene.imgGetAward,this.scene.title_money,{type: 0,countType: 1},this.removeGetAwardView.bind(this));
                    QGameData.instance.addWeaponsCoin(awardNum);
                    break;
                case 3:  //钻石
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getDiamond);
                    QGameData.instance.playResFlyAni(this.scene.imgGetAward,this.scene.title_diamond,{type: 2,countType: 1,closeSound: true},this.removeGetAwardView.bind(this));
                    QMergeData.instance.addGameDiamond(awardNum);
                    break;
                case 4:  //车辆
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.unlock);
                    var data :any = {};
                    // let level = this.CarMaxLevel >=6 ? this.CarMaxLevel-2 : 1;

                    var carLevel = this.CarMaxLevel - 2;
                    if(this.CarMaxLevel <= 15){
                        ;  //当玩家车辆等级≤15级时，奖励玩家的车辆为玩家所能购买最高等级;
                    }else if(this.CarMaxLevel <= 25){
                        carLevel -= 1;  //奖励玩家的车辆为玩家所能购买最高等级的车辆减 1;
                    }else if(this.CarMaxLevel <= 45){
                        carLevel -= 2;  //奖励玩家的车辆为玩家所能购买最高等级的车辆减 2;
                    }else if(this.CarMaxLevel <= 50){
                        carLevel -= 3;  //奖励玩家的车辆为玩家所能购买最高等级的车辆减 3;
                    }

                    let level = this.CarMaxLevel >= 6 ? carLevel : 1;
                    data.level = this.carCfg[level].level;
                    data.state = 0; // 显示宝箱
                    // 增加车辆的购买次数
                    QMergeData.instance.addBuyCarCount(this.carCfg[level].level, QGameConst.QMoneyType.Video);
                    let index = QMergeData.instance.JudgeSolt();
                    if(index >= 0){
                        // 更改车位数据
                        QMergeData.instance.changeCarSlotData(index, data);
                        //更新车的位置
                        QEventMgr.instance.sendEvent(QEventType.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": index});
                    }
                    this.removeGetAwardView();
                    break;
            }

            this.updateDataUI();
        }

        private onClickBtnMoreGetAward():void
        {
            if (this.touch ==true) {
                return;
            }
            this.touch = true;
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            if(this.check_point<3){//第一关直接免费给
                this.scene.moreget_hand.visible = false;
                this.scene.moreget_click.visible = false;
                this.scene.ani_hand_guide_0.gotoAndStop(0);
                this.moreGetSuccessHandle();
                return;
            }
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.FanPai;
            var isShare = QGameData.instance.getShareOrVideo();
            if (isShare == true){
                // 分享
                QWxSDK.instance.fakeShare(param, this, function(self : any){
                    self.moreGetSuccessHandle();
                }, [this],function(self : any){
                    self.touch = false;
                })
            } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.moreGetSuccessHandle();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.moreGetSuccessHandle();
                        }, [this], function(self : any){
                            self.touch = false;
                        })
                    }else if(value == 0){
                        this.touch = false;
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        private moreGetSuccessHandle():void
        {
            if( ! this.scene ){
                return;
            }
            if(tywx.clickStatEventType.tripleRewardCard){
                tywx.BiLog.clickStat(tywx.clickStatEventType.tripleRewardCard,[]);
            }
            let awardNum = this.awardNumCfg[this.curGetAwardId]['awardCount']*3;
            if(this.curGetAwardId == 1)
            {
                //点击三倍领取之后，奖励提示出现缩放的效果
                this.scene.lblGetAward.text = "+" + QUtil.formatNumberStr(awardNum + "");
                Laya.Tween.to(this.scene.lblGetAward, {scaleX: 1.5, scaleY: 1.5}, 300);
                Laya.timer.once(400, this, function(){
                    Laya.Tween.to(this.scene.lblGetAward, {scaleX: 0.6, scaleY: 0.6}, 300);
                });
                Laya.timer.once(700, this, function(){
                    QGameData.instance.playResFlyAni(this.scene.imgGetAward,this.scene.title_gold,{type: 1,countType: 1},this.removeGetAwardView.bind(this));
                });

                QMergeData.instance.addGameGold((awardNum).toString());
            }
            else
            {
                //点击三倍领取之后，奖励提示出现缩放的效果
                this.scene.lblGetAward.text = "+" + QUtil.formatNumberStr(awardNum + "");
                Laya.Tween.to(this.scene.lblGetAward, {scaleX: 1.5, scaleY: 1.5}, 300);
                Laya.timer.once(400, this, function(){
                    Laya.Tween.to(this.scene.lblGetAward, {scaleX: 0.6, scaleY: 0.6}, 300);
                });
                Laya.timer.once(700, this, function(){
                    QGameData.instance.playResFlyAni(this.scene.imgGetAward,this.scene.title_money,{type: 0,countType: 1},this.removeGetAwardView.bind(this));
                });

                QGameData.instance.addWeaponsCoin(awardNum);
            }
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMuchMoney);
            this.updateDataUI();
            this.scene['lblAward'+this.curClickCardIndex].text = "+" + QUtil.formatNumberStr(awardNum + "");  //更新排面的显示
            this.touch = false;
        }

        private removeGetAwardView():void
        {
            this.scene['boxAward'+this.curClickCardIndex].visible = true;
            this.scene['boxAward'+this.curClickCardIndex].alpha = 0;
            Laya.Tween.to(this.scene['boxAward'+this.curClickCardIndex], {alpha:1},100)
            if(this.check_point==1){
                this.scene.btn_abandonTimes.visible = false;
            }else{
                this.scene.btn_abandonTimes.visible = !(this.getAwardTimes==0) && !(this.getAwardTimes==3);
            }
            this.scene.boxGetAward.visible = false;
            Laya.Tween.to(this.scene['boxAward'+this.curClickCardIndex], {scaleX:1,scaleY:1},200);
        }

        private onClickBtnAbandonTimes():void
        {
            this.onBackHall(0);
        }

        public checkGuide(){
            let stepIdx  = QGameData.instance.newPlayerGudieStep(null);
            if(stepIdx + 1 == QGameConst.NumForGuide.getResult){
                this.scene.img_guide.visible = true;
                this.scene.image_click.visible= true;
                this.scene.image_guide.visible= true;
                this.scene.ani_hand_guide_3.play(0, true);
            }
        }

        public clickFlyRes(){
            if (this.touch ==true) {
                return;
            }
            this.touch = true;

            this.scene.btn_receive3.visible = false;
            this.scene.btn_receive.visible  = false;
            this.scene.img_guide.visible = false;
            this.scene.image_click.visible= false;
            this.scene.image_guide.visible= false;

            if(this.isWin)
            {
                //this.scene.ani1.stop();
                QGameData.instance.playResFlyAni(this.scene.img_item_1,this.scene.title_money,{type: 0,countType: 0},null);
                QGameData.instance.playResFlyAni(this.scene.img_item_2,this.scene.title_diamond,{type: 2,countType: 0},this.onBackHall.bind(this));
                QGameData.instance.addWeaponsCoin(QGameData.instance.checkpoint_dollars);
                QMergeData.instance.addGameDiamond(QGameData.instance.checkpoint_diamond);
            }
            else
            {
                QGameData.instance.playResFlyAni(this.scene.img_item_1,this.scene.title_money,{type: 0,countType: 0},this.onBackHall.bind(this));
                QGameData.instance.addWeaponsCoin(QGameData.instance.checkpoint_dollars);
            }

            this.updateDataUI();
        }

        /**
         * 返回大厅
         */
        public touch:any = false;
        public onBackHall(delayTime:number=800):void
        {
            if(this.scene.guide_hand.visible){
                this.scene.guide_hand.visible = false;
                this.scene.guide_click.visible = false;
                this.show_guide = false;
                this.scene.ani_hand_guide_2.gotoAndStop(0);
                this.scene.ani_hand_guide_1.gotoAndStop(0);
                this.scene.ani_hand_guide_0.gotoAndStop(0);
                this.scene.ani_hand_guide.gotoAndStop(0);
            }
            Laya.timer.once(delayTime, this, function(){
                // this.scene.img_guide.visible = false;
                // this.scene.image_guide.visible = false;
                QEventMgr.instance.sendEvent(QEventType.GAME_GUIDE_CTRL);
                this.scene.btn_receive.offAll();
                this.scene.btn_receive3.offAll();
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_OVER);
                QGameData.instance.GameDataReset();
                QUIMgr.instance.createUI(QUIMgr.UI_QGameLoadingView,"main");
                //QSoundMgr.instance.playBgm(QSoundMgr.instance.soundInfo_mp3.bgMusic);
                tywx.BiLog.clickStat(tywx.clickStatEventType.doubleSettlement,[]);
            })
        }
        public onBackHall3 ():void
        {
            if (this.touch ==true) {
                return;
            }
            this.touch = true;
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.ResultReward;
            var isShare = QGameData.instance.getShareOrVideo();
            if (isShare == true){
                // 分享
                QWxSDK.instance.fakeShare(param, this, function(self : any){
                    self.clickFlyRes3();
                }, [this],function(self : any){
                    self.touch = false;
                })
            } else {
                // 视频
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.clickFlyRes3();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.clickFlyRes3();
                        }, [this],function(self : any){
                            self.touch = false;
                        })
                    }else if(value == 0){
                        this.touch = false;
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }

        public clickFlyRes3(){
            if (this.scene == null) {
                return;
            }

            this.scene.btn_receive3.visible = false;
            this.scene.btn_receive.visible  = false;
            this.scene.img_guide.visible = false;
            this.scene.image_click.visible= false;
            this.scene.image_guide.visible= false;

            if(this.isWin)
            {
                QGameData.instance.playResFlyAni(this.scene.img_item_1,this.scene.title_money,{type: 0,countType: 1,closeSound: true},null);
                QGameData.instance.playResFlyAni(this.scene.img_item_2,this.scene.title_diamond,{type: 2,countType: 1,closeSound: true},this.shareCallBack.bind(this));
                QGameData.instance.addWeaponsCoin(QGameData.instance.checkpoint_dollars *3);
                QMergeData.instance.addGameDiamond(QGameData.instance.checkpoint_diamond*3);
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMuchMoney);
            }
            else
            {
                QGameData.instance.playResFlyAni(this.scene.img_item_1,this.scene.title_money,{type: 0,countType: 1},this.shareCallBack.bind(this));
                QGameData.instance.addWeaponsCoin(QGameData.instance.checkpoint_dollars *3);
            }
            //成功观看视频后领取按钮不再显示
            Laya.timer.clear(this, this.showBtnReceive);
            this.scene.btn_receive.visible = false;
            this.updateDataUI();
        }

        public shareCallBack () {
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "获得翻倍"});
            this.scene.btn_receive.offAll();
            this.scene.btn_receive3.offAll();
            Laya.timer.once(800, this, function() {
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_OVER);
                QGameData.instance.GameDataReset();
                QUIMgr.instance.createUI(QUIMgr.UI_QGameLoadingView,"main");
                //QSoundMgr.instance.playBgm(QSoundMgr.instance.soundInfo_mp3.bgMusic);
                tywx.BiLog.clickStat(tywx.clickStatEventType.settlement3TimesGet,[]);
            })
        }

        private randomWinCardAwardId():void
        {
            this.randomAwardId=[];
            let randomArray:number[] = [];
            //随机抽取卡牌奖励
            for(let key in this.fanPaiCfg)
            {
                if(this.fanPaiCfg[key]['changce'] == 1 && randomArray.length < 3)
                {
                    randomArray.push(Number(key));
                }
                if(randomArray.length < 3)
                {
                    let randomId = Math.round(Math.random()+3);
                    if(QMergeData.instance.JudgeSolt() == -1 || QGameData.instance.getCheckPoint() <= 2)
                    {
                        randomId = 3;
                    }
                    randomArray.push(Number(randomId));
                }
            }



            QDebug.log(' randomArray: '+randomArray.toString());

            //打乱随机抽到卡牌奖励ID数组
            for(let i = 0;i<randomArray.length;)
            {
                let randomIndex = Math.floor(Math.random()*randomArray.length);
                let removeId = randomArray.splice(randomIndex,1);
                this.randomAwardId.push(removeId[0]);
            }

            QDebug.log(' this.randomAwardId : '+this.randomAwardId.toString());
        }
    }
}
export default game.view.QGameEndingView;
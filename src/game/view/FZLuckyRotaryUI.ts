import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZDebug from "../../framework/FZDebug";
import FZGameStatus from "../data/FZGameStatus";
import FZGameData from "../data/FZGameData";
import FZCfgManager from "../core/FZCfgManager";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import QBIEvent from "../data/QBIEvent";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZSceneManager from "../core/FZSceneManager";

namespace game.view
{
    export class FZLuckyRotaryUI extends FZBaseUI
    {
        public scene:ui.view.LuckyRotaryTableNewUI;

        public rotaryTabelData: {};
        public isRunning: boolean;
        public curCount: number;  //剩余抽奖次数
        public addCount: number = 5;
        public itemIndex: number;  //道具对应的ID
        public nextTimes: number = 1;  //奖励的倍数

        public share_info: any = null;
        public luckTableParam: any = null;

        private curLuckyAllTimes: number;  //所有的抽奖次数（已经抽了多少次奖）

        public registerEvent(): void {
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD, this.onUpdateGameGold, this);
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateMoney, this);
            
            //播放飞钻石，金币，美钞的动画
            FZEventManager.instance.register(FZEvent.GAME_FLYRES_CTRL,this.flyResAni, this);
            
            FZEventManager.instance.register(FZEvent.UPDATE_NEXT_REWARD_TIMES,this.updateNextRewardTimes, this);
        }
        public unregisterEvent(): void {
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD, this.onUpdateGameGold, this);
            
            FZEventManager.instance.unregister(FZEvent.GAME_FLYRES_CTRL,this.flyResAni, this);
            FZEventManager.instance.unregister(FZEvent.UPDATE_NEXT_REWARD_TIMES,this.updateNextRewardTimes, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_CASH,this.onUpdateMoney, this);
        }
        
        public init():void
        {
            this.scene = new ui.view.LuckyRotaryTableNewUI();

            if(FZMergeDateManager.instance.getIsFirstClickLuckyState() == 0)
            {
                FZMergeDateManager.instance.setIsFirstClickLuckyState(1);
            }

            this.onUpdateGameGold();
            this.onUpdareDiamond();
            this.onUpdateMoney();

            this.share_info = FZCfgManager.instance.getShareCfg();
            this.luckTableParam = this.share_info.luckTableParam;

            this.isRunning = false;

            // let new_date = new Date();
            // let date_str = new_date.toLocaleDateString();
            // let local_date_str = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_DATE", "0");
            // if (date_str != local_date_str) {
            //     FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_DATE", date_str); 
            //     if (this.luckTableParam) {
            //         this.curCount = this.luckTableParam.baseCount;
            //     }
            //     FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", this.curCount+""); 
            // } else {
            this.curCount = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", "5"));
            // }
            this.nextTimes = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("GAME_ROTARY_TABEL_NEXT_TIMES", "1"));
            this.curLuckyAllTimes = parseInt(FZSaveDateManager.instance.getItemFromLocalStorage("CUR_LUCKY_ALL_TIMES", "0"));

            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnClose, this, this.onClickClose, ["btnClose"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btAddCount, this, this.onClickAddCountBtn, ["btAddCount"]);
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnPlayRotary, this, this.onClickPlayRotaryBtn, ["btnPlayRotary"]);
            
            this.rotaryTabelData = FZCfgManager.instance.getRotaryTableCof();  //获取转盘配置
            this.setAllItemInfo();

            this.scene.guy_grid_box.rotation = 0;
            
            // this.scene.box_move.x = - 375;
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
           
            this.onUpdateGameGold();


            this.refreshMulInfo();
            // this.scene.btnPlayRotary.disabled = (this.curCount==0);
            
            if (FZUIManager.instance.longScreen()) {  //长屏手机适配
                Laya.timer.once(20, this, () => {
                    this.scene.box_title.y += 70;
                });
            }
            if(FZ.clickStatEventType.openWheelPanel){             
                FZ.BiLog.clickStat(FZ.clickStatEventType.openWheelPanel,[]);
            }
            
            this.moveLuckyRotary();  //转盘出现的缓动动画
            this.noChance();
            //更新按钮的 视频 or 分享 icon显示
            let isShare = FZGameData.instance.getShareOrVideo();
            this.scene.img_more_chance.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
        }

        /**
         * 转盘出现的缓动动画
         */
        public moveLuckyRotary(){
            this.scene.guy_bg.scale(0, 0);
            this.scene.box_reward.scale(0, 0);
            Laya.timer.once(100,this,function(){
                Laya.Tween.to(this.scene.guy_bg, {scaleX: 1,scaleY: 1}, 200, Laya.Ease.backOut);
            })
            Laya.timer.once(250,this,function(){
                Laya.Tween.to(this.scene.box_reward, {scaleX: 1,scaleY: 1}, 300, Laya.Ease.backOut);
            })
            this.scene.guy_stop_img.scaleX = 0;
            this.scene.guy_stop_img.scaleY = 0;
            Laya.timer.once(550,this,function(){
                Laya.Tween.to(this.scene.guy_stop_img, {scaleX: 1,scaleY: 1}, 300, Laya.Ease.backOut);
            })
        }
        /**
         * 更新倍数信息，抽奖之前在弹窗的上部显示本次奖励三倍或者六倍
         */
        private refreshMulInfo():void{
            this.scene.imgMulHintText.visible = (this.nextTimes == 6 || this.nextTimes == 3);
            let text = this.nextTimes == 6 ? "本次奖励6倍":"本次奖励3倍";
            this.scene.imgMulHintText.changeText(text);
        }

        setAllItemInfo(){
            for (let i = 1; i <= 8; i++) {
                let info = this.rotaryTabelData[i + ""];  //每种道具的信息
                let icon = "item_icon_"+(i-1);
                this.scene[icon].skin = info.icon;  //道具的img资源
            }
            this.scene.lbl_shengyu_value.text = this.curCount.toString();
            this.scene.lbl_times_value.text = "+"+this.luckTableParam.addCount;
        }

        /**
         * 点击关闭按钮
         */
        private onClickClose() {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            if (this.isRunning) {
                return;
            }
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_LuckyGuy);
            });
            FZEventManager.instance.sendEvent(FZEvent.MAIN_REFRESH_LUCKY_RED_POINT);
        }

        /**
         * 点击增加次数按钮
         */
        private onClickAddCountBtn(){
            if (this.isRunning) {
                return;
            }
            var that = this;
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.LuckyDraw;
            var isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self: any){
                    self.shareSuccessHandle();
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(self: any){
                    that.videoSuccessHandle();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, that, function(self: any){
                            self.shareSuccessHandle();
                        }, [that]);
                    }else{
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }  
        }

        /**
         * 视频播放成功
         */
        private videoSuccessHandle():void
        {
            if( ! this.scene ){
                return;
            }
            this.curCount+=this.addCount;
            FZ.BiLog.clickStat(FZ.clickStatEventType.successAddDialTimes,[]);
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", this.curCount+""); 
            
            //更新按钮的 视频 or 分享 icon显示
            let isShare = FZGameData.instance.getShareOrVideo();
            this.scene.img_more_chance.skin = isShare ? "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";

            this.scene.lbl_shengyu_value.text = this.curCount.toString();
            this.noChance();
            // this.scene.btnPlayRotary.disabled = (this.curCount==0);
        }

        /**
         * 分享成功
         */
        private shareSuccessHandle():void
        {
            if (this.scene) {
                this.curCount+=this.addCount;
                FZ.BiLog.clickStat(FZ.clickStatEventType.successAddDialTimes,[]);
                FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", this.curCount+""); 
                this.scene.lbl_shengyu_value.text = this.curCount.toString();
                // this.scene.btnPlayRotary.disabled = (this.curCount==0);
                this.noChance();
            }
        }

        /**
         * 点击抽奖按钮
         */
        private onClickPlayRotaryBtn(){
            if(this.curCount <= 0){  //次数用完后抽奖变成+5
                this.onClickAddCountBtn();
                this.noChance();
            }else{
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
                if (this.isRunning) {
                    return;
                }
                if (this.curCount <= 0) {
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "次数已用完"});
                    return;
                }
                this.launchGuy();
            }
        }

        /**
         * 按照权重获取抽奖所得的道具
         */
        getSelectItem(){
            switch(this.curLuckyAllTimes)
            {
                case 0:
                    return this.rotaryTabelData[1+""];
                case 1:
                    return this.rotaryTabelData[8+""];
                case 2:
                    return this.rotaryTabelData[3+""];
                case 3:
                    return this.rotaryTabelData[4+""];
            }
            let allCount = 0;
            for (let i = 1; i <= 8; i++) {
                let info = this.rotaryTabelData[i+""];
                if (this.nextTimes > 1 && info.type == 0) {
                    continue;
                }
                allCount+=info.weight;
            }

            let randomIndex = Math.floor(Math.random()*allCount)+1;

            let addCount = 0
            for (let i = 1; i <= 8; i++) {
                let info = this.rotaryTabelData[i+""];
                if (this.nextTimes > 1 && info.type == 0) {
                    continue;
                }
                addCount+=info.weight;
                if (randomIndex <= addCount) {
                    return info;
                }
            }
        }
        
        /**
         * 获取抽奖结果
         */
        launchGuy(){
            if (this.scene == null) {
                return;
            }
            this.isRunning = true;
            this.scene.guy_grid_box.rotation = 0;
            this.scene.btnPlayRotary.disabled = true;  //抽奖按钮不可点击

            this.curCount -= 1;  //抽奖次数-1
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_CURR_COUNT", this.curCount+"");  //存储抽奖次数
            this.scene.lbl_shengyu_value.text = this.curCount.toString();  //更新剩余次数的显示

            //获取本次所得道具
            let get_item = this.getSelectItem();
            this.itemIndex = get_item.turn_table_id;  //本次获得的道具对应的ID
            //根据道具得到转盘旋转角度
            let to_rotation = -(this.itemIndex-1)*45+360*3;
            //转盘旋转到所得道具
            Laya.Tween.to(this.scene.guy_grid_box, {rotation: to_rotation}, 5000, Laya.Ease.strongOut, Laya.Handler.create(this, this.finishGuy));
            FZ.BiLog.clickStat(FZ.clickStatEventType.successTurnDial,[]);

            this.setCurLuckyAllTimes();
        }

        /**
         * 次数用完之后的处理
         */
        public noChance(){
            if(this.curCount <= 0){  //次数耗尽后，隐藏+5按钮，抽奖按钮变成“次数+5”
                this.scene.btAddCount.visible = false;  //隐藏+5
                //+5按钮隐藏时，剩余次数的显示居中
                this.scene.lbl_shengyu_value.x = 174;
                this.scene.lbl_shengyu.x = 167;
                //改变抽奖按钮的显示
                this.scene.box_more_chance.visible = true;
                this.scene.rotary_btn_label.visible = false;
            }else{
                this.scene.btAddCount.visible = true;  //显示+5
                this.scene.lbl_shengyu_value.x = 74;
                this.scene.lbl_shengyu.x = 67;
                //改变抽奖按钮的显示
                this.scene.box_more_chance.visible = false;
                this.scene.rotary_btn_label.visible = true;
            }
        }
        
        /**
         * 抽奖完成后的动作
         */
        finishGuy(){
            this.isRunning = false;
            this.scene.btnPlayRotary.visible = true;
            // this.scene.btnPlayRotary.disabled = (this.curCount==0);
            this.scene.btnPlayRotary.disabled = false;
            this.noChance();
            let itemInfo = this.rotaryTabelData[this.itemIndex + ""]; //本次获得的道具信息
            let itemType = itemInfo.type;  //道具的type
            let itemParam = itemInfo.num;  //控制获得奖励的数量
            let itemValue = 0;
            let getType = 1;
            switch (itemType) {
                case 0:{  //倍数
                    itemInfo.des = "下次转盘奖励x"+itemParam;
                    itemValue = itemParam;
                    getType = 2;
                    break;
                }     
                    
                case 1:{  //金币
                    let out = FZMergeDateManager.instance.getCarSlotOutputByTime(itemParam);  //金币数量
                    //判断是否翻倍
                    itemInfo.des = (this.nextTimes > 1) ? FZUtils.formatNumberStr(out+"")+"x"+this.nextTimes : FZUtils.formatNumberStr(out+"");
                    itemValue = out*this.nextTimes;  //翻倍之后的金币数量
                    //FZMergeDateManager.instance.addGameGold(itemValue+"");
                    this.nextTimes = 1;  //重置倍数
                    break;
                }     
                    
                case 2:{  //钻石
                    //判断是否翻倍
                    itemInfo.des = (this.nextTimes > 1) ? itemParam+"x"+this.nextTimes : itemParam;
                    itemValue = itemParam*this.nextTimes;  //翻倍之后的钻石数量
                    //FZMergeDateManager.instance.addGameDiamond(itemValue);
                    this.nextTimes = 1;
                    break;
                }     
                    
                case 3:{  //美钞
                    let maxLevel = FZGameData.instance.getCheckPoint();
                    let money = FZCfgManager.instance.getCheckPoint(FZGameData.instance.check_point).dropCash;  //美钞数量
                    if(3 == this.itemIndex){  //大量美钞
                        money *= 1;
                    }else if(6 == this.itemIndex){  //小量美钞
                        money *= 1/3;
                    }
                    //判断是否翻倍
                    money = Math.floor(money);
                    itemInfo.des = (this.nextTimes > 1) ? FZUtils.formatNumberStr(money + "") + "x" + this.nextTimes : FZUtils.formatNumberStr(money + "");
                    itemValue = Math.floor(money) * this.nextTimes;  //翻倍之后的美钞数量
                    // FZGameData.instance.addWeaponsCoin(itemValue);
                    this.nextTimes = 1;
                    break;
                }
            }
            let param = {
                itemType: itemType,
                itemDes: itemInfo.des,
                itemValue: itemValue,
                getType: getType
            };
            FZUIManager.instance.createUI(FZUIManager.UI_CongratulationGet, param);
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_NEXT_TIMES", this.nextTimes.toString());
        }

        public onUpdateGameGold(){
            var gold_str = FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold());
            let _scale = 0.5;
            this.scene.lab_game_gold.text = gold_str;
            this.scene.lab_game_gold.scaleX = _scale;
            this.scene.lab_game_gold.scaleY = _scale;

            Laya.Tween.to(this.scene.lab_game_gold, { scaleX: _scale*1.2, scaleY: _scale*1.2 }, 200, Laya.Ease.expoInOut, Laya.Handler.create(this, function ()
            {
                this.scene.lab_game_gold.scaleX = _scale*1;
                this.scene.lab_game_gold.scaleY = _scale*1;
            }));
        }

        public onUpdareDiamond(){
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
        }

        public onUpdateMoney(){
            var money = FZGameData.instance.getWeaponsCoin();
            this.scene.lab_game_money.text = FZUtils.formatNumberStr(money+"");
            
        }

        public flyResAni(param){
            let itemType = param.itemType;
            let target = param.target;
            switch(itemType)
            {
                case 1:{
                    FZGameData.instance.playResFlyAni(target,this.scene.title_gold,{type:1,countType:0},null);
                    break;
                }
                    
                case 2:{
                    FZGameData.instance.playResFlyAni(target,this.scene.title_diamond,{type: 2,countType: 0},null);
                    break;
                }

                case 3:{
                    FZGameData.instance.playResFlyAni(target,this.scene.title_money,{type: 0,countType: 0},null);
                    break;
                }
            }
            this.refreshMulInfo();
        }
        public updateNextRewardTimes(times){
            if(times==3&&FZ.clickStatEventType.tripleRewards){
                FZ.BiLog.clickStat(FZ.clickStatEventType.tripleRewards,[]);
            }else if(times==6&&FZ.clickStatEventType.doubleTripleRewards){
                FZ.BiLog.clickStat(FZ.clickStatEventType.doubleTripleRewards,[]);
            }
            this.nextTimes = times;
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_ROTARY_TABEL_NEXT_TIMES", times+'');
            FZ.BiLog.clickStat(FZ.clickStatEventType.successMoreMutipleAward,[]);

            this.refreshMulInfo();
        }

        /**
         * 存储玩家抽奖的次数
         */
        private setCurLuckyAllTimes():void
        {
            this.curLuckyAllTimes++;
            FZSaveDateManager.instance.setItemToLocalStorage("CUR_LUCKY_ALL_TIMES",this.curLuckyAllTimes.toString());
        }
    }
}
export default game.view.FZLuckyRotaryUI;
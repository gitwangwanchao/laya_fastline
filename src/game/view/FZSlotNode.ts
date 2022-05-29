import { ui } from "../../ui/layaMaxUI";
import FZBaseNode from "../core/FZBaseNode";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZCfgManager from "../core/FZCfgManager";
import FZDebug from "../../framework/FZDebug";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import FZSoundManager from "../core/FZSoundManager";
import FZDestoryCarNode from "./FZDestoryCarNode";
import FZGameData from "../data/FZGameData";
import FZShareInfo from "../logic/FZShareInfo";
import FZGameStatus from "../data/FZGameStatus";
import FZWechat from "../core/FZWechat";
import FZUIManager from "../core/FZUIManager";

/**
 * 主场景
 */
namespace game.view
{
    export class FZSlotNode extends FZBaseNode
    {
        public scene : ui.view.CarNodeUI;
        private mergeEffect : Laya.Animation;
        // 车位索引
        private car_slot_index: number = -1;
        // 车位状态 0.生成 1.激活 2.有车 3.随机生成车辆 4:执行动作中 5空投箱
        private car_slot_state: number = 0;
        // 车的等级
        private car_level:number = -1; 
        // 数据
        private car_data: any;
        // 位置
        private pos:any = {};
        private time:any = 400;
        private restartTimer: boolean = false;
        private car_slot_data:any = {};
        private box_time = 10000; //宝箱时间 

        private var_off_x = -10;
        private var_off_y = -50;

        registerEvent():void {
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_DOWN, this.onMouseDown, this);
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_OUT, this.onMouseOut, this);
            // 监听 显示提示装态
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_SHOW_PROMPT, this.onShowPrompt, this);
            // 监听 抬起 
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
            // 合成 
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP_MERGE_SUCCESS, this.onMerge, this);
            // 交换 
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS, this.onExchange, this);
            // 更新数据
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, this.onUpdateData, this);
            // 出售
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_CAR_SELL, this.onSell, this);
            // 暂停定时器
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_ClEAN_TIMER, this.onStopGoldTimer, this);
            // 恢复定时器
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_RESTART_TIMER, this.onStartGoldTimer, this);
            // 选择车辆
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_CAR_SELECT_CAR, this.onSelectCar, this);
            // 删除节点 
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_REMOVE_CAR_UI, this.removeDestroy, this);
            

            FZEventManager.instance.register(FZEvent.CLOSE_AIRDROP, this.closeAirDrop, this)

            FZEventManager.instance.register(FZEvent.UPDATE_AIRDROP_RED_NUM, this.upDateAirDrop, this);
        }

        unregisterEvent():void {
            this.scene.off(Laya.Event.CLICK,this,this.onClickBtn);
            // 删除监听
            // FZDebug.D("unregisterEvent-----------------------------------");
            FZEventManager.instance.unregister(FZEvent.CLOSE_AIRDROP, this.closeAirDrop, this)
            FZEventManager.instance.unregister(FZEvent.UPDATE_AIRDROP_RED_NUM, this.upDateAirDrop, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_DOWN, this.onMouseDown, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_OUT, this.onMouseOut, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_SHOW_PROMPT, this.onShowPrompt, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP_MERGE_SUCCESS, this.onMerge, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS, this.onExchange, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, this.onUpdateData, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_CAR_SELL, this.onSell, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_ClEAN_TIMER, this.onStopGoldTimer, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_RESTART_TIMER, this.onStartGoldTimer, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_REMOVE_CAR_UI, this.removeDestroy, this);  
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_CAR_SELECT_CAR, this.onSelectCar, this);          
            
        }
        removeDestroy():void
        {
            Laya.timer.once(1, this, this.destroy);
        }

        private static _instance: FZSlotNode;
		public static get instance(): FZSlotNode
		{
			if (FZSlotNode._instance == null)
			{
				FZSlotNode._instance = new FZSlotNode();
			}
			return FZSlotNode._instance;
        }
        
        init() 
        {
            
            this.car_slot_index = -1;
            // 车位状态 0.生成 1.激活 2.有车 3.随机生成车辆
            this.car_slot_state = 0;
            // 车的等级
            this.car_level = -1; 
            // 数据
            this.car_data = null;
            this.state = 0;
            // 位置
            this.pos ={};
            this.time = 400;
            this.scene = new ui.view.CarNodeUI();   
            this.scene.img_box.visible = false;
            this.scene.box_car.visible = false;

            //this.createMergeEffect();
        }

        createMergeEffect(){
            // this.mergeEffect = new Laya.Animation();
            // this.mergeEffect.loadAnimation("particle/carMerge.ani");
            // this.scene.box_car.addChild(this.mergeEffect);
            // this.mergeEffect.x = 72.5;
            // this.mergeEffect.y = 72.5;
            //this.mergeEffect.visible = false;
        }

        //设置位置
        public setPos(param: any):void
        {
            this.pos = param;
            this.scene.x = param.x+this.var_off_x;
            this.scene.y = param.y+this.var_off_y;
        }
        /**
         * 设置车位
         * @param param 
         */
        public setParam(param : any) : void {
            // 设置车位
            this.car_slot_index = param.index;  //车位索引
            this.scene.zOrder = this.car_slot_index;  //设置层级
            this.scene.updateZOrder();
            this.scene.img_tips_1.visible = false;
            this.scene.visible = false;
            this.car_slot_state = 0; 
        }

        /**
         * 刷新位置
         */
        onUpdateData(param):void 
        {
            if(FZUtils.isNullOrEmpty(param)){
                return;
            }
            let index = param.index||0;
            let from = param.from || 0;
            FZDebug.D("刷新车位数据-----------index-  " + index);
            if (this.car_slot_index != index) {
                return;
            }
            this.scene.zOrder = this.car_slot_index;
            this.scene.updateZOrder();
            // 位置
            var count = FZMergeDateManager.instance.getGameCarSlot();
            var pos_list = FZMergeDateManager.instance.getGameCarSlotPos(count);
            var pos = pos_list[this.car_slot_index];
            this.scene.x = pos.x+this.var_off_x;
            this.scene.y = pos.y+this.var_off_y;
            this.scene.box_airdrop.visible = false;
            // 如果车位没有车刷新
            if (this.car_slot_state != 2) {
                this.scene.box_car.visible = false;
                this.scene.img_box.visible = false;
                var CarSlotData = FZMergeDateManager.instance.getCarSlotData();
                FZDebug.D("所有车位数据=       "+ JSON.stringify(CarSlotData));
                this.car_slot_data = CarSlotData[this.car_slot_index + ""];
                FZDebug.D("车位数据=       "+ JSON.stringify(this.car_slot_data));
                if (!FZUtils.isNullOrEmpty(this.car_slot_data)) {
                    FZDebug.D("刷新车位数据------------  " + JSON.stringify(this.car_slot_data));
                    if (this.car_slot_data.state == 1) {
                        this.scene.box_car.visible = true;
                        this.onUpdateCarDate(this.car_slot_data);
                    }else if (this.car_slot_data.state == 0) {
                        this.scene.visible = true;
                        this.scene.on(Laya.Event.CLICK,this,this.onClickBtn);
                        // 显示宝箱
                        this.car_slot_state = 3;
                        this.car_level = this.car_slot_data.level;
                        let skin = (from == 2) ? "ui_car_main/car_box_1.png" : "ui_car_main/car_box.png";
                        this.scene.img_box.skin = skin;
                        this.scene.img_box.visible = true;
                        this.scene.ani_box_down.play(0, false);
                        this.scene.ani_box.play(0, true);
                        Laya.timer.once(this.box_time, this, this.onChangeCarSlotState);
                    }else if (this.car_slot_data.state == 2) {
                        this.scene.box_car.visible = true;
                        this.onUpdateCarDate(this.car_slot_data);
                        this.scene.ani_start.play(0, false);
                        var data:any = {};
                        data.level = this.car_slot_data.level;
                        data.state = 1;
                        FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, data);
                    }else if (this.car_slot_data.state == 3) {
                        this.scene.zOrder = 100;
                        this.scene.updateZOrder();
                        this.car_slot_state = 5;
                        this.scene.visible = true;
                        this.scene.airdrop_state.skin = "ui_main/airDropBox.png";
                        this.scene.airdrop_state.x = 61;
                        this.scene.airdrop_state.y = 66;
                        // 空投箱
                        this.scene.red_num.text = FZMergeDateManager.instance.AirDropCount + "";
                        this.scene.box_airdrop.visible = true;
                        this.scene.ani_box_airdrop_down.play(0,false);
                        Laya.timer.once(300, this, function(){
                            this.scene.zOrder = this.car_slot_index;
                            this.scene.updateZOrder();
                            this.scene.ani_airdrop_roat.play(0,true);
                            var data:any = {};
                            data.level = this.car_slot_data.level;
                            data.state = 4;
                            this.car_slot_data.state = 4;
                            this.scene.on(Laya.Event.CLICK,this,this.onClickBtn);
                            FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, data);
                        })
                    }else if (this.car_slot_data.state == 4) {
                        this.car_slot_state = 5;
                        this.scene.airdrop_state.rotation = 0;
                        if (FZMergeDateManager.instance.AirDropIsOpen == 1){
                            this.scene.airdrop_state.skin = "ui_main/airDropBox_1.png";
                            this.scene.airdrop_state.x = 77;
                            this.scene.airdrop_state.y = 74;
                        }else {
                            this.scene.airdrop_state.skin = "ui_main/airDropBox.png";
                            this.scene.airdrop_state.x = 61;
                            this.scene.airdrop_state.y = 66;
                        }
                        this.scene.zOrder = this.car_slot_index;
                        this.scene.updateZOrder();
                        this.scene.visible = true;
                        this.scene.on(Laya.Event.CLICK,this,this.onClickBtn);
                        if (FZMergeDateManager.instance.AirDropCount == 0){
                            FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, null);
                            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": this.car_slot_index});
                            return;
                        }
                        // 空投箱
                        this.scene.red_num.text = FZMergeDateManager.instance.AirDropCount + "";
                        this.scene.box_airdrop.visible = true;
                        this.scene.ani_airdrop_roat.play(0,true);
                    }else if (this.car_slot_data.state == 5) {
                        this.scene.box_car.visible = true;
                        this.onUpdateCarDate(this.car_slot_data);
                        this.scene.ani_start.play(0, false);
                        var data:any = {};
                        data.level = this.car_slot_data.level;
                        data.state = 1;
                        FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, data);
                        var pos :any = {};
                        pos.x = this.scene.x;
                        pos.y = this.scene.y;
                        if (param.pos&& param.pos.x){
                            this.scene.x = param.pos.x;
                            this.scene.y = param.pos.y;
                        }else {
                            this.scene.x = FZMergeDateManager.instance.AirdropPos.x;
                            this.scene.y = FZMergeDateManager.instance.AirdropPos.y;
                        }
                        this.scene.zOrder = 300;
                        this.scene.updateZOrder();
                        Laya.Tween.to(this.scene, {x: pos.x, y: pos.y},200, Laya.Ease.linearIn,Laya.Handler.create(this, function(){
                            if (this.scene) {
                                this.scene.zOrder = this.car_slot_index;
                                this.scene.updateZOrder();
                            }
                        }));
                    }
                }else {
                    FZDebug.D("删除数据--------刷新------------------------");
                    this.car_slot_state = 1;
                    this.scene.img_tips_1.visible = false;
                    this.scene.visible = false;
                }
            }else {
                var CarSlotData = FZMergeDateManager.instance.getCarSlotData();
                this.car_slot_data = CarSlotData[this.car_slot_index + ""];
                if (!FZUtils.isNullOrEmpty(this.car_slot_data)) {
                    this.onUpdateCarDate(this.car_slot_data);
                }else {
                    this.car_slot_state = 1;
                    this.scene.img_tips_1.visible = false;
                    this.scene.visible = false;
                    this.state = 0;
                    this.scene.img_car_icon.alpha = 1;
                    Laya.timer.clearAll(this);
                }
            }
        }
        /**
         * 刷新汽车数据
         */
        private onUpdateCarDate(car_slot_data: any):void{
            this.scene.zOrder = this.car_slot_index;
            this.scene.updateZOrder();
            this.car_slot_state = 2;
            this.scene.visible = true;
            this.scene.box_airdrop.visible = false;
            this.scene.img_tips_1.visible = false;
            this.car_level = car_slot_data.level;
            this.car_data = FZCfgManager.instance.getCarInfoById(car_slot_data.level);
            if(this.car_data&&this.car_data.path){
                this.scene.img_car_icon.skin = this.car_data.path;
                this.scene.img_car_1.skin = this.car_data.path;
                this.scene.img_car_2.skin = this.car_data.path;
            }
            this.scene.label_level.text = car_slot_data.level;
            if(!this.car_data || !this.car_data.output_gold ) return;
            var gold = Math.ceil(this.car_data.output_gold * FZMergeDateManager.instance.getGameEarnings());
            if(this.scene&&this.scene.label_add_gold){
                this.scene.label_add_gold.text = "+$" + FZUtils.formatNumberStr(gold + "");
                this.scene.label_add_gold.visible = false;
            }
            Laya.timer.clearAll(this);
            Laya.timer.loop(Math.max(500,this.car_data.gold_interval/FZMergeDateManager.instance.game_temp_speed), this, this.onTips);
            this.checkReveneLightAni();
        }

        /**
         * 切换状态
         */
        private onChangeCarSlotState():void{
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.hecheng);
            this.car_slot_state = 1;
            this.scene.off(Laya.Event.CLICK,this,this.onClickBtn);
            var data:any = {};
            data.level = this.car_slot_data.level;
            data.state = 1;
            FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, data);
            Laya.timer.clearAll(this);
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": this.car_slot_index});
        }
        /**
         * 单纯修改车位
         */
        private onUpdatePos():void 
        {
            Laya.timer.frameOnce(1, this, this.onUpdatePos2);
           
        }
        onUpdatePos2():void 
        {
            this.scene.zOrder = this.car_slot_index;
            this.scene.updateZOrder();
            var count = FZMergeDateManager.instance.getGameCarSlot();
            var pos_list = FZMergeDateManager.instance.getGameCarSlotPos(count);
            var pos = pos_list[this.car_slot_index];
            this.scene.x = pos.x+this.var_off_x;
            this.scene.y = pos.y+this.var_off_y;
        }
        /**
         * 飘字
         */
        private onTips():void 
        {
            if(!this.car_data || !this.car_data.output_gold ) return;
            var gold = Math.ceil(this.car_data.output_gold * FZMergeDateManager.instance.getGameEarnings());
            FZMergeDateManager.instance.addGameGold(gold + "");
            if(this.scene&&this.scene.label_add_gold){
                this.scene.label_add_gold.text = "+$" + FZUtils.formatNumberStr(gold + "");
                this.scene.label_add_gold.visible = true;
            }
            Laya.Tween.to(this.scene.label_add_gold, {y : -15}, this.time, Laya.Ease.backOut, Laya.Handler.create(this, function(){
                    if(this.scene&&this.scene.label_add_gold){
                        this.scene.label_add_gold.visible = false;
                        this.scene.label_add_gold.y = 60;
                    }
                }),0, true,true);
            if (this.restartTimer == true) {
                this.restartTimer = false;
                Laya.timer.clearAll(this);
                Laya.timer.loop(Math.max(500,this.car_data.gold_interval/FZMergeDateManager.instance.game_temp_speed), this, this.onTips);
            }
        }
        // 0.普通 1.选中 2.合成（交换位置）
        private state:number = 0;
        

        //判断点是否在view中
        public onJudge(param):any 
        {
            var pos:any = (this.scene as Laya.Sprite).localToGlobal(new Laya.Point(this.scene.img_touch.x, this.scene.img_touch.y));
            if (param.stageX > pos.x  && param.stageX < pos.x + this.scene.img_touch.width) {
                if (param.stageY > pos.y && param.stageY < pos.y + this.scene.img_touch.height) {
                    return true;
                }
            }
            return false;
        }
        /**
         * 显示提示
         */
        onShowPrompt(level:number):void {
            if(this.car_slot_state == 2 && this.state == 0 && level == this.car_level) {
                this.scene.img_tips_1.visible = true;
            }
        }   
        /**
         * 按下
         */
        public onMouseDown(param):void 
        {
            if(this.onJudge(param) == false){
                return
            }
            this.state = 0;
            // 判断有没有车 
            if (this.car_slot_state == 2) {
                FZDebug.D("按下----------------------------------------" + this.car_slot_index);
                FZDebug.D("按下----------------------------------------" + this.car_level);
                this.state = 1;
                FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_SELECTED, this.car_slot_index);
                this.scene.img_car_icon.alpha = 0.5;
            }
        }
        /**
         * 点击空投箱
         */ 
        public startPullVideo(){
            let param = FZShareInfo.create();
            param.shareType = FZGameStatus.FZShareType.AirDrop;
            var isShare = FZGameData.instance.getShareOrVideo();
            if (isShare == 1){
                // 分享
                FZWechat.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack({isFree: false});
                }, [this])
            } else {
                // 视频
                FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack({isFree: false});
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        FZWechat.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack({isFree: false});
                        }, [this])
                    }else if(value == 0) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                    }
                }));
            }
        }
        
        /**
         * 空投返回
         */
        public shareCallBack(param: any){
            FZDebug.D("点击空投箱--------------------------------------1--1");
            if(!param.isFree){  //分享或者视频打开空投打点
                FZ.BiLog.clickStat(FZ.clickStatEventType.shareVideoGetAirdropPackage,[]);
            }
            FZ.BiLog.clickStat(FZ.clickStatEventType.OpenAirDropSuc,[]);  //打开空投打点
            FZMergeDateManager.instance.setAirDropOpenState(1,this.scene);
            if(FZMergeDateManager.instance.JudgeSolt() == -1) {
                this.scene.ani_open_tips.play(0, false);
                this.scene.ani_airdrop_open.play(0,false);
                FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
            }else {
                FZDebug.D("点击空投箱--------------------------------------1--2");
                this.scene.ani_airdrop_roat.stop();
                this.scene.airdrop_state.rotation = 0;
                this.scene.ani_airdrop_open.play(0,false);
                FZMergeDateManager.instance.onCreateAirDrop();
            }
        }
        /**
         * 刷新红点数量
         */
        public upDateAirDrop(){
            if (this.scene == null || FZMergeDateManager.instance.AirDropIsOpen != 1 || (this.car_slot_data && this.car_slot_data.state && this.car_slot_data.state != 4)) {
                return;
            }
            this.scene.red_num.text = FZMergeDateManager.instance.AirDropCount + "";
        }
        /**
         * 关闭空投
         */
        public closeAirDrop(){
            if (this.scene == null || FZMergeDateManager.instance.AirDropIsOpen != 1 || (this.car_slot_data && this.car_slot_data.state && this.car_slot_data.state != 4)) {
                return;
            }
            FZDebug.D("关闭空投-----------------------------this.car_slot_index--    " + this.car_slot_index);
            this.scene.visible = false;
            this.scene.ani_airdrop_roat.stop();
            this.scene.box_airdrop.visible = false;
            
        }

        /**
         * 移出
         */
        public onMouseOut(): void 
        {
            this.scene.img_tips_1.visible = false;
            if (this.car_slot_state == 2 && this.state == 1) {
                this.state = 0;
                this.scene.img_car_icon.alpha = 1;
            }
        }
        /**
         * 抬起
         */
        public onMouseUp(param):void
        {
            if (this.car_slot_data&& this.car_slot_data.state && this.car_slot_data.state == 4){
               return;
            }
            if (this.car_slot_state == 4) {
                FZDebug.D("执行动作中----------------------------------------");
                return;
            }
            if (this.state == 0 && this.onJudge(param) == true) {
                FZDebug.D("抬起----------------------------------------" + this.car_slot_index);
                FZDebug.D("抬起----------------------------------------" + this.car_level);
                if (this.scene.img_tips_1.visible == true)
                {
                    if (this.car_level == FZMergeDateManager.instance.curTableCarMaxLevel ) {
                        return;
                    }
                    FZMergeDateManager.instance.isMergeState = true;
                    this.car_slot_state = 4;
                    this.scene.zOrder = 1000;
                    this.scene.updateZOrder();
                    this.scene.img_car_icon.visible = false;
                     // 播放升级动画
                    // this.scene.ani2.play(0, false);
                    this.scene.img_car_1.visible = true;
                    this.scene.img_car_2.visible = true;
                    var carImage1X = 83;
                    this.car_level += 1; 
                    FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, {"level":this.car_level, "state":1});
                    FZMergeDateManager.instance.changeCarSlotData(param.select_index, null);
                    // FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_MERGE_SUCCESS);
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, { "index": param.select_index });
                    Laya.Tween.to(this.scene.img_car_1,{x:carImage1X-140},200,Laya.Ease.circOut,Laya.Handler.create(this,()=>{
                        this.scene.animation_merge.play(0,false);
                        Laya.Tween.to(this.scene.img_car_1,{x:carImage1X},100,Laya.Ease.quartInOut,Laya.Handler.create(this,()=>{  
                            this.scene.img_car_1.visible = false;
                        }),0,false,false);
                    }),0,false,false);
                
                    Laya.Tween.to(this.scene.img_car_2,{x:carImage1X+140},200,Laya.Ease.circOut,Laya.Handler.create(this,()=>{
                        Laya.Tween.to(this.scene.img_car_2,{x:carImage1X},100,Laya.Ease.quartInOut,Laya.Handler.create(this,()=>{
                            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.hecheng);
                            var id = this.car_level;
                            this.onUpdateLevel();
                            FZMergeDateManager.instance.setExperience(id);
                            this.scene.img_car_icon.visible = true;
                            this.state = 0;
                            this.car_slot_state = 2;
                            this.scene.img_car_2.visible = false;
                            FZMergeDateManager.instance.isMergeState = false;
                        }),0,false,false);
                    }),0,false,false);
                    if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                        FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "MERGE"); // 合成车辆后,判断停止删除引导
                    }
                }else {
                    if (this.car_slot_state == 2 || this.car_slot_state == 3) {
                        this.state = 0;
                        var car_slot_index = this.car_slot_index;
                        // 播放交换动画
                        FZMergeDateManager.instance.exchangeCarSlotData(param.select_index, car_slot_index);
                        FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS, {"ower_index": param.select_index , "target_index":car_slot_index});
                        this.car_slot_index = param.select_index; // 切换的位置
                        this.onUpdatePos(); // 刷新位置
                    }else if (this.car_slot_state == 1){
                        // 空车位
                        this.state = 0;
                        // 播放交换动画
                        var car_slot_index = this.car_slot_index;
                        FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS, {"ower_index": param.select_index , "target_index":car_slot_index});
                        FZMergeDateManager.instance.exchangeCarSlotData(param.select_index, car_slot_index);
                        this.car_slot_index = param.select_index; // 切换的位置
                        this.onUpdatePos(); // 刷新位置
                    }
                }
                FZEventManager.instance.sendEvent(FZEvent.GAME_GUIDE_CTRL);
                FZEventManager.instance.sendEvent(FZEvent.SOFT_GUIDE_INTERVENTION);
            }
            this.state = 0;
            this.scene.img_car_icon.alpha = 1;
            this.scene.img_tips_1.visible = false;
        }

        /**
         * 点击
         */
        onClickBtn():void
        {
            if (this.car_slot_state == 3){
                this.scene.animation_merge.play(0,false);
                this.onChangeCarSlotState();
            }   
            if (this.car_slot_data&& this.car_slot_data.state && this.car_slot_data.state == 4){
                // FZDebug.D("点击空投箱--------------------------------------");
                // 点击空投箱
                if (FZMergeDateManager.instance.FreeAirDropOpen == 1) {
                    // FZDebug.D("点击空投箱--------------------------------------1");
                    FZMergeDateManager.instance.setFreeAirDropOpen();
                    this.shareCallBack({isFree: true});
                }else {
                    // FZDebug.D("点击空投箱--------------------------------------2");
                    if (FZMergeDateManager.instance.AirDropIsOpen == 0) {
                        // FZDebug.D("点击空投箱--------------------------------------3");
                        this.startPullVideo();
                    }else {
                        // FZDebug.D("点击空投箱--------------------------------------2-2");
                        if( FZMergeDateManager.instance.JudgeSolt() == -1){
                            FZUIManager.instance.createUI(FZUIManager.UI_Tip, { text: "车位已满，请先合成或回收车辆" });
                        } 
                        FZMergeDateManager.instance.onCreateAirDrop();
                    }
                }
            }
        }

        /**
         * 收到合成消息
         */
        onMerge() :void 
        {
            if (this.car_slot_state == 2 && this.state == 1) {
                this.removeData();
            }
            this.scene.img_tips_1.visible = false;
        }
        /**
         * 删除车位数据
         */
        public removeData():void {
            this.car_slot_state = 1;
            // 被移动方删除
            this.state = 0;
            this.scene.img_car_icon.alpha = 1;
            // 删除 车位数据
            // FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, null);
            Laya.timer.clearAll(this);
            this.scene.img_tips_1.visible = false;
            this.scene.visible = false;
        }
        /**
         * 切换
         */
        onExchange(value:any) : void 
        {
            if(FZUtils.isNullOrEmpty(value)){
                return;
            }
            if (value && value.ower_index == this.car_slot_index) {   
                // 被移动方 修改
                this.state = 0;
                this.scene.img_car_icon.alpha = 1;
                this.car_slot_index = value.target_index;
                // FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, {"level":this.car_level, "state":1});
                this.onUpdatePos(); // 刷新位置
            }
        }
        /**
         * 升级
         */
        onUpdateLevel():void
        {   
            // 1.播发升级动画
            // 2.升级
            FZMergeDateManager.instance.setCarMaxLevel(this.car_level);
            FZDebug.D("播放升级动画 -----------------------level = " + this.car_level);
            this.onUpdateUI(this.car_level);
            FZEventManager.instance.sendEvent(FZEvent.ON_CREATE_AIRDROP);
        }
        /**
         * 刷新UI
         */
        onUpdateUI(level:number) :void 
        {
            this.scene.zOrder = this.car_slot_index;
            this.scene.updateZOrder();
            // FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, {"level":level , "state" :1});
            var CarSlotData = FZMergeDateManager.instance.getCarSlotData();
            this.car_slot_data = CarSlotData[this.car_slot_index + ""];
            this.car_data = FZCfgManager.instance.getCarInfoById(level);
            this.scene.img_car_icon.skin = this.car_data.path;
            this.scene.img_car_1.skin = this.car_data.path;
            this.scene.img_car_2.skin = this.car_data.path;
            this.scene.label_level.text = level + "";
            if(this.scene&&this.scene.label_add_gold&&this.car_data){
                this.scene.label_add_gold.text = "+$" + FZUtils.formatNumberStr(this.car_data.output_gold + "");
                this.scene.label_add_gold.visible = false;
            }
            Laya.timer.clearAll(this);
            Laya.timer.loop(Math.max(500,this.car_data.gold_interval/FZMergeDateManager.instance.game_temp_speed), this, this.onTips);
        }
        /**
         * 出售
         */
        public onSell():void
        {
            if (this.car_slot_state == 2 && this.state == 1) {   
                // 数据 出售
                var sell_gold = FZMergeDateManager.instance.getCarSellPrice(this.car_level);
                FZEventManager.instance.sendEvent(FZEvent.CAR_SELL_PRICE, sell_gold);
                FZMergeDateManager.instance.addGameGold(sell_gold + "");
                FZMergeDateManager.instance.changeCarSlotData(this.car_slot_index, null);
                FZMergeDateManager.instance.sendUpdataData();// 同步数据
                this.removeData();
                FZEventManager.instance.sendEvent(FZEvent.ON_CREATE_AIRDROP);
            }
        }
        /**
         * 选择车辆
         */ 
        public onSelectCar():void
        {
            if (this.car_slot_state == 2 && this.state == 1) {   
                FZMergeDateManager.instance.setCarUsedLevel(this.car_level);
            }
        }
        /**
         * 删除定时器
         */
        private onStopGoldTimer(){
            Laya.timer.clearAll(this);
        }

        /**
         * 恢复定时器
         */
        private onStartGoldTimer(){
            if (this && this.car_data) {
                this.restartTimer = true;
                // Laya.timer.loop(this.car_data.gold_interval/FZMergeDateManager.instance.game_temp_speed , this, this.onTips);
                this.checkReveneLightAni();
            }
        }
        //加速状态显示车位光闪烁动画
        private checkReveneLightAni(){
            if(FZMergeDateManager.instance.game_temp_speed != 1 && !this.scene.revenue_light.visible){
                this.scene.revenue_light.visible = true;
                this.scene.revenue_light_ani.play(0,true);
            }else if(FZMergeDateManager.instance.game_temp_speed == 1){
                this.scene.revenue_light.visible = false;
                this.scene.revenue_light_ani.gotoAndStop(0);
            }
        }
    }
}
export default game.view.FZSlotNode;
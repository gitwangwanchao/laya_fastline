import QBaseUI from "../core/QBaseUI";
import QPlayerCar from "./QPlayerCar";
import QUIMgr from "../core/QUIMgr";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QDebug from "../../framework/QDebug";
import QConst from "../../framework/QConst";
import QMapView from "./QMapView";
import QProgrssBar from "./QComponent/QProgrssBar";
import QMergeData from "../data/QMergeData";
import QUtil from "../../framework/QUtil";
import QSoundMgr from "../core/QSoundMgr";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr"

namespace game.view
{
    export class QGameView extends QBaseUI 
    {
        
        public scene: ui.view.GameViewUI;
        // 游戏状态
        public game_state: any = {
            game_initRes : 0,
            game_start: 1,
            game_running: 2,
            game_stop: 3,
            game_over: 4,
            game_win: 5,
            game_enemy_over:6,
            game_fail:7,
            game_resurrect:8,
            game_wait:9,
            game_wait_resurrect:10,
            game_paly_win_animation: 11,
        }
        public game_state_current = -1; // 当前游戏状态
        public playerCar:any = null; // 玩家车辆
        public QBossNode:any = null; // boss  
        public SprintTime:any = 0;// 冲刺时间
        public SprintTimer: Laya.Timer;
        public isInHPGuide = true;
        public isInPropGuide = true;
        public isInObsGuide1 = true;
        public isInObsGuide2 = true;
        public isInHandGuide = true;

        private HPValue:number = 0;//血量显示（暂时只用于开始动画显示）
        /**
         * 监听
         */
        public registerEvent():void
        {   
            QEventMgr.instance.register(QEventType.OBS_GUIDE, this.onGuide, this);  //监听  障碍物引导1
            QEventMgr.instance.register(QEventType.GAME_FAIL_NO_CONTINUE, this.hideLabCon, this);  //隐藏长按继续游戏文字提示
        }
        /**
         * 删除监听
         */
        public unregisterEvent():void
        {
            if (this.playerCar != null){
                this.playerCar.unregisterEvent();
                this.playerCar.destroy();
                this.playerCar = null;
            }
            QGameData.instance.game_stop = false;
            this.scene.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_CREATE_PROBS, this.onCreateProbs, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_BOSS_START, this.onBossStart, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_BOSS_OVER, this.onBossOver, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_RUNNING_CHANGE_DATA, this.onChangeEnemyCount, this);        
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_ITME_EFFECT,this.onGamePlayItemEffect, this);    
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_ITME_EFFECT_REMOVE,this.onRemoveItemEffect, this);    
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);  
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_CHANGE_HP,this.onChangeHp, this);    
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_WEAPONS_COIN,this.onChangeWeaponsCoin, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onPlayGameOver, this);   
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_RESURRECT_START,this.onStartResurrect, this);   
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_RESURRECT_FAIL,this.onStartResurrectFail, this);   
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_CHANGE_GAME_WIN_STATE,this.onChangeGameWinState, this);   
            QEventMgr.instance.unregister(QEventType.EVNET_ENTER_GAME,this.onEnterGame, this);
            QEventMgr.instance.unregister(QEventType.HIT_OBSTACLES,this.playVibrationAnimation, this);
            QEventMgr.instance.unregister(QEventType.OBS_GUIDE, this.onGuide, this);
            QEventMgr.instance.unregister(QEventType.GAME_FAIL_NO_CONTINUE, this.hideLabCon, this);
            
        }
        public onDestroy():void
        {
            // QEventMgr.instance.sendEvent(QEventType.IN_OBS_GUIDE);
        }
        
        /**
         * 更改状态
         */
        public onChangeGameState(state:number){
            this.scene.box_ui_stop.visible = false;
            this.game_state_current = state;
            switch (state){
                case this.game_state.game_initRes:   
                    this.initRes();
                    break;
                case this.game_state.game_wait:   
                    this.onGameWait(); 
                    break;   
                case this.game_state.game_start:   
                    this.onGameStart();
                    break;  
                case this.game_state.game_running:   
                    this.onGameRunning();
                    break;
                case this.game_state.game_stop:   
                    this.onGameStop();
                    break;  
                case this.game_state.game_enemy_over:
                    break;  
                case this.game_state.game_over:   
                    break;               
                case this.game_state.game_win:
                    this.onGameWin();
                    break;    
                case this.game_state.game_fail:    
                    this.onGameFail();
                    break;
                case this.game_state.game_resurrect:
                    this.onGameResurrect();
                    break;    
                case this.game_state.game_wait_resurrect:
                    break; 
                case this.game_state.game_paly_win_animation:
                    this.onPlayWinAnimation();
                    break;     
                     
            }
        }
        
        /**
         * 加载
         */
        public MaskSprite :Laya.Sprite;
        public pie:laya.display.cmd.DrawPieCmd;
        public ItemProgressBarList:any = [];
        public ItemProgressBarJsList:any = [];
        public FIRE = true;
        public gameOver:boolean = false;
        public init():void
        {
            QGameData.instance.onUpdateCheckPointData();
            this.FIRE = true;
            QDebug.D("init--------------------------------------------------");
            this.scene = new ui.view.GameViewUI();
            this.scene.box_map.getComponent(QMapView).registerEvent();
            // 加载玩家 
            this.initPlayerCar();
            // 加载Boss技能 
            QGameData.instance.initSkillPool(this.scene.box_bullet);
            // 加载敌人
            QGameData.instance.initEnemyCarPool(this.scene.box_enemy);
            // 加载子弹
            QGameData.instance.initBulletPool(this.scene.box_bullet);
            //  加载银币
            QGameData.instance.initCoinPool(this.scene.box_game);
            //  加载道具
            QGameData.instance.initProbsPool(this.scene.box_bullet);
            // 加载障碍物
            QGameData.instance.initObstaclesPool(this.scene.box_enemy);
            // 爆炸特效 子弹
            QGameData.instance.initEffectPool(this.scene.box_bullet);

            this.ItemProgressBarList = [];

            let isFitByWidth = (Laya.stage.scaleMode == Laya.Stage.SCALE_FIXED_WIDTH);    
            let radio = (isFitByWidth ? QConst.DesignWidth / Laya.Browser.width : QConst.DesignHeight / Laya.Browser.height);
            this.scene.sprite_boss_ani.height = (isFitByWidth ? Laya.Browser.height * radio : QConst.DesignHeight);

            for (var i = 0; i < 6; i++ ) {
                var js = new QProgrssBar();
                js.addParent(this.scene.box_game);
                this.ItemProgressBarList.push(js);    
            } 
            if (QUIMgr.instance.longScreen()) {
                Laya.timer.once(20, this, () => {
                    this.scene.box_title.y += 70;
                    this.scene.box_guide.y += 70;
                    this.scene.hp_guide.y += 70;
                    this.scene.prop_guide.y += 70;
                    this.scene.obs_guide.y += 70;
                });
            }

            var index:any = QMergeData.instance.getCarUsedLevel();
            var data = QCfgMgr.instance.getCarInfoById(index);
            tywx.BiLog.clickStat(tywx.clickStatEventType.useGunLevel,[data.mainWeaponId]);
            if(QMergeData.instance.getCarMaxLevel()<7)
            {
                Laya.timer.loop(1000,this,this.noCtrlTimesAdd);
            }

            QDebug.D("BOSS____________________________________________________ " + QGameData.instance.getCheckPointData().bossNeedid);

            if (QGameData.instance.getCheckPointData().bossNeedid > 0) {
                QDebug.D("BOSS____________________________________________________存在");
                this.scene.img_boss.visible = true;
            }else {
                this.scene.img_boss.visible = false;
            }
            tywx.BiLog.clickStat(tywx.clickStatEventType.loadGameView,[]);            
        }

        public noCtrlTimesAdd()
        {
            QMergeData.instance.setBuyGuideTime(1);
        }
        
        /**
         * 设置数据
         */
        
        public setParam(params:any) :void
        {
            this.onChangeGameState(this.game_state.game_initRes);    
        }
        
        /**
         * 加载数据
         */
        public initRes():void 
        {
            // if(QGameData.instance.getCheckPoint() == 1 /*&& this.isInHPGuide == true*/){
            //     // this.onGuide({index: 2});  //血条引导
            //     this.onGuide({index: 1});  //滑动引导
            // }
            this.gameOver = true;
            this.scene.box_game.visible = true;
            this.FIRE = false;
            QGameData.instance.aircraft_index = 0;
            this.game_touch = false;
            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            QEventMgr.instance.register(QEventType.GAME_VIEW_CREATE_PROBS, this.onCreateProbs, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_BOSS_START, this.onBossStart, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_RUNNING_CHANGE_DATA, this.onChangeEnemyCount, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_BOSS_OVER, this.onBossOver, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_ITME_EFFECT,this.onGamePlayItemEffect, this);     
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_ITME_EFFECT_REMOVE,this.onRemoveItemEffect, this);     
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_FAIL,this.onPlayerFail, this);    
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_CHANGE_HP,this.onChangeHp, this);    
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_WEAPONS_COIN,this.onChangeWeaponsCoin, this);    
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onPlayGameOver, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_RESURRECT_START,this.onStartResurrect, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_RESURRECT_FAIL,this.onStartResurrectFail, this);   
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_CHANGE_GAME_WIN_STATE,this.onChangeGameWinState, this);   
            QEventMgr.instance.register(QEventType.EVNET_ENTER_GAME,this.onEnterGame, this);
            QEventMgr.instance.register(QEventType.HIT_OBSTACLES,this.playVibrationAnimation, this);

            // this.scene.box_win.visible = false;
            // this.scene.box_resurrect.visible = false;
            QGameData.instance.setMapSpeed(QGameData.instance.map_speed_normal);
            this.scene.box_map.rotation = 0;
            this.scene.box_map.scaleX = 1;
            this.scene.box_map.scaleY = 1;
            this.onUpdatePlayerCarPos();
            let point = QGameData.instance.getCheckPoint();
            this.scene.label_checkpoint.text = "第 " + point + " 关";

            // if (point <= 1){
            //     this.scene.img_last.visible = false;
            // }else {
            //     this.scene.img_last.visible = true;
            //     this.onCheckPointFontSize(this.scene.label_last_checkpoint, point-1);
            // }
            // if (point + 1 > QGameData.instance.max_check_point_count){
            //     this.scene.img_next.visible = false;
            // }else {
            //     this.scene.img_next.visible = true;
            //     this.onCheckPointFontSize(this.scene.label_next_checkpoint, point + 1);
            // }
            // this.onCheckPointFontSize(this.scene.label_checkpoint, point, [45,40,30,25]);
           
            if(Number(point) == 2)
            {
                tywx.BiLog.clickStat(tywx.clickStatEventType.onClickSecondLevel,[]);
            }
            this.onChangeWeaponsCoin();
            this.onChangeEnemyCount();
            this.startAngle = -26;  //从顶部开始
            this.endAngle = 150;
            this._angle = 0;
            this.onChangeHp(0, true);
            this.HPValue = 0;
            Laya.timer.once(1500, this, function(){
                Laya.timer.loop(40,this,this.addHPtoMax);
            });
            this.onChangeGameState(this.game_state.game_wait);
        }
        //游戏开始加血动作(0-1)
        private addHPtoMax(){
            this.HPValue+=0.1;
            this.onChangeHp(this.HPValue, true);
            this.HPValue = Math.min(1,this.HPValue);
            if(this.HPValue>=1){
                this.onChangeHp(1, true);
                Laya.timer.clear(this,this.addHPtoMax);
                return;
            }
        }
        /**
         * 根据关卡设置字体大小
         * @param obj 
         * @param ponit 
         */
        private fontSize:any = [50,40,30]; 
        public onCheckPointFontSize(obj, point, fontlist:any = [35,30,28,20]) {
            var font = fontlist[0];
            if (point > 10 && point <=99){
                font = fontlist[1];
            }else if (point > 100 && point <=999){
                font = fontlist[2];
            }else if (point >= 1000) {
                font = fontlist[3];
            }
            obj.text = "" + point;
            obj.fontSize = font;
        }
        /**
         * 播放地图抖动
         */
        public playVibrationAnimation() {
            this.scene.ani_vibration.play(0,false);
        }
        /**
         * 开始之后的等待
         */
        public onGameWait() 
        {
            //启动汽车
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.startPlay);
            this.scene.box_ui_stop.visible = true;
            this.scene.box_guide.visible = false;
            this.scene.box_normal.visible = false;
            let point = QGameData.instance.getCheckPoint();
            if(point == 1) {
                if(this.isInHandGuide){
                    this.scene.box_guide.visible = true;
                    this.isInHandGuide = false;
                    this.scene.guideHandMove.play(0, true);
                }else {
                    this.scene.box_guide.visible = false;
                }
            }else {
                this.scene.box_normal.visible = true;
                this.scene.box_guide.visible = false;
                this.scene.ani1.play(0, true);
            }
        }
        /**
         * 游戏开始
         */
        public onEnterGame() {
            this.gameOver = false; 
        }
        private _angle = 0;
        private tween1: laya.utils.Tween;
        private tweenTime: number;  //以秒为单位
        private startAngle: number;  //圆的初始角度
        private endAngle: number;  //圆的初始角度

        /**
         * 更改血量
         */
        public oldBlood:number = 0;
        public onChangeHp(value:any, ani:boolean = false):void
        {
            QDebug.D("更改血量 --------------------------- " + value);
            if(value < 1)
            {
                if (ani == false) {
                    if (this.oldBlood > value) {
                        this.scene.ani_hurt.play(0,false);
                    }
                }
            }
            if (value == 0) {
                this.scene.img_progrss_hp.x = -115;
            }else {
                if(value >= 0.7) {
                    this.scene.img_progrss_hp.filters = [QGameData.instance.greenFilter];
                }else if(value >= 0.4){
                    this.scene.img_progrss_hp.filters = [QGameData.instance.yellowFilter];
                } else {
                    this.scene.img_progrss_hp.filters = [QGameData.instance.redFilter];    
                }
                
                this.scene.img_progrss_hp.x =  - 115* (1-value);
            }
            this.oldBlood = value;
        }
        
        /**
         * 刷新银币
         */
        public onChangeWeaponsCoin():void
        {
            this.scene.lab_g_count.text = QUtil.formatNumberStr(QGameData.instance.checkpoint_dollars + "");
        }
        /**
         * 更改数据
         */
        public onChangeEnemyCount():void
        {
            // var count = QGameData.instance.LevelEnemyCount/QGameData.instance.LevelEnemyCountMax;
            // var pro = Math.floor((count)*100);
            // this.scene.lab_progress.text = "剩余敌人: " + pro + "%"; 
            var count  = QGameData.instance.getCheckPointData().bossNeedid > 0?QGameData.instance.LevelEnemyCount+1:QGameData.instance.LevelEnemyCount;
            this.scene.enemy_count.text = count+'';
            
            if(QGameData.instance.getCheckPointData().bossNeedid > 0&&QGameData.instance.LevelEnemyCount==0){
                this.scene.enemy_icon.skin = "ui_game/enemy_icon_boss.png"
                this.scene.enemy_count.text = "1";
            }
            // if(count <= 0) {
            //     this.scene.img_checkpoint_progress.visible = false;
            // }else {
            //     this.scene.img_checkpoint_progress.visible = true;
            //     this.scene.img_checkpoint_progress.width = Math.max(count* 446, 1);  
            // }
        }

        public perRoadLength:number = 0;
        public posHeight:number = 1280;
        public map_speed:number = 0;
        /**
         * 加载地图
         */ 
        public initMap():void
        {
        }

        /**
         * 地图左右移动
         */
        public tween: Laya.Tween;
        public onMapMove():void
        {    
            var x  = this.playerCar.getPlayerCarPos().x;
            var width = (x - this.scene.box_map.width/2)/5;
            this.tween = Laya.Tween.to(this.scene.box_map,{x: this.scene.box_map.width/2 - width},100);        
        }
        
        /**
         * 加载玩家
         */
        public initPlayerCar() :void
        {
            this.playerCar = new QPlayerCar();
            this.playerCar.addParent(this.scene.box_bullet);
            this.onUpdatePlayerCarPos();
            QGameData.instance.setQPlayerCar(this.playerCar);
        }
        /**
         * 刷新位置
         */
        public onUpdatePlayerCarPos(start:Boolean = true)
        {
            var pos:any = {};
            let isFitByWidth = (Laya.stage.scaleMode == Laya.Stage.SCALE_FIXED_WIDTH);    
			let radio = (isFitByWidth ? QConst.DesignWidth / Laya.Browser.width : QConst.DesignHeight / Laya.Browser.height)
            pos.x = this.scene.player_pos.x;
            pos.y =  (isFitByWidth ? Laya.Browser.height * radio : QConst.DesignHeight)-240
            if (start == true) {
                // 开始
                this.playerCar.initPos(pos);
                this.scene.box_map.x = this.scene.box_map.width/2;
            }else {
                // 复活
                this.scene.box_normal.visible = true;
                this.playerCar.onResurrect(pos);
            }
            
        }
        
        public oldpos:any = {}; // 位置
        public game_touch:boolean = false; // 是否点击中
        /**
         * 按下
         */
        private onMouseDown(param):void
        {  
            // if(QGameData.instance.getCheckPoint() == 1 && this.isInHandGuide == true){
            //     this.scene.box_guide.visible = true;
            //     this.scene.box_normal.visible = false;
            //     this.scene.guideHandMove.play(0, true);
            //     // QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0);
            //     this.isInHandGuide = false;
            //     this.onGuideHide(1);  //隐藏血条引导
            // }else{ 
                this.scene.box_guide.visible = false;   
                this.onMouseOn();
                this.scene.box_normal.visible = true;
                this.scene.shoot_guide.visible = true;
                if (this.gameOver == true) {
                    return;
                }
                if (this.game_state.game_paly_win_animation == this.game_state_current){
                    return;
                }
                this.oldpos.x = param.stageX;
                if (this.game_state_current == this.game_state.game_stop) {
                    QDebug.D("onMouseDown ----------------------------game_stop");
                    this.game_touch = true;
                    this.onChangeGameState(this.game_state.game_running);
                } else if (this.game_state_current == this.game_state.game_wait) {
                    this.game_touch = true;
                    QDebug.D("onMouseDown ----------------------------game_wait");
                    this.onChangeGameState(this.game_state.game_start);
                } else if (this.game_state_current == this.game_state.game_wait_resurrect) {
                    this.game_touch = true;
                    QDebug.D("onMouseDown ----------------------------game_wait_resurrect");
                    this.scene.box_ui_stop.visible = false;
                    this.scene.ani1.stop();
                    QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT_MAP);
                    this.playerCar.startFire();
                    this.onChangeGameState(this.game_state.game_running);
                }
            // }         
        }

        /**
         * 移动
         */
        private onMouseMove(param):void 
        {
            if (this.game_state.game_paly_win_animation == this.game_state_current){
                return;
            }
            if (this.game_state.game_resurrect == this.game_state_current) {
                return;
            }

            if (this.game_touch == true){
                var count = (param.stageX - this.oldpos.x);
                // 刷新位置
                this.playerCar.onMove(count * 1.42);
                this.oldpos.x = param.stageX;
                this.onMapMove();
            }
        }

        /**
         * 移出
         */
        private onMouseOut(param):void 
        {
            if (this.game_state.game_paly_win_animation == this.game_state_current){
                return;
            }
            if (this.game_state.game_win == this.game_state_current || this.game_state.game_resurrect == this.game_state_current) {
                this.game_touch = false;
                return;
            }
            if (this.game_touch == true){
                this.game_touch = false;
                this.onChangeGameState(this.game_state.game_stop);
            }
        }

        /**
         * 抬起
         */
        private onMouseUp(param):void 
        {
            if (this.game_state.game_paly_win_animation == this.game_state_current){
                return;
            }
            if (this.game_state.game_win == this.game_state_current || this.game_state.game_resurrect == this.game_state_current) {
                this.game_touch = false;
                return;
            }
            if (this.game_touch == true){
                this.game_touch = false;
                this.onChangeGameState(this.game_state.game_stop);
            }
        }

        //  ------------------------------    新手引导  Begin  ------------------------------
        
        /**
         * 新手引导
         */
        public onGuide(param: any){
            switch(param.index){
                case 1: {  // 车辆移动引导
                    break; 
                }
                case 2: {  // 血条引导
                    this.isInHPGuide = false;
                    this.scene.box_ui_stop.visible = true;
                    this.scene.hp_guide.visible = true;  //显示血条引导
                    
                    //血条引导遮罩层
                    this.scene.hp_guide_01.visible = true;
                    this.scene.hp_guide_02.visible = true;

                    this.scene.hpHandMove.play(0, true);  //血条引导的小手移动
                    // QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0);
                    break;
                }
                case 3: {  //道具引导
                    // this.scene.guideHandMove.stop();  //车辆移动引导的小手移动
                    // this.scene.box_normal.visible = false;
                    // this.scene.shoot_guide.visible = false;

                    // this.isInPropGuide = false;
                    // //隐藏血条引导
                    // this.scene.hp_guide_02.visible = false;
                    // this.scene.hp_guide_01.visible = false;
                    // this.scene.hp_guide.visible = false;  

                    // // this.onChangeGameState(this.game_state.game_stop);
                    // this.onMouseOff();
                    // QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0);
                    // this.onChangeGameState(this.game_state.game_wait);
                    
                    // this.onMouseOff();
                    // this.scene.prop_guide.visible = true;
                    // this.scene.prop_bg.visible = true;
                    // this.scene.prop_hand.visible = true;
                    // QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_prop, this, this.onClickBtnProp,[]);  
                    // this.scene.propHandMove.play(0,true);
                    // Laya.timer.once(3000, this, function(){
                    //     if(this.scene.prop_guide.visible){
                    //         QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.prop_guide, this, this.onClickBtnProp,[]); //点击引导相当于延时点击知道了按钮
                    //     }
                    // })
                    break;
                }
                case 4: {  //障碍物引导1
                    // Laya.timer.once(1000, this, function(){
                    //     this.scene.box_normal.visible = true;
                    //     this.scene.shoot_guide.visible = true;
                    //     //暂停游戏
                    //     // this.onChangeGameState(this.game_state.game_stop);
                    //     QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0);
                    //     this.onChangeGameState(this.game_state.game_wait);
                    //     // this.scene.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);  //取消鼠标move监听
                    //     this.scene.obs_guide.on(Laya.Event.CLICK, this, this.onClickBtnProp);
                    //     this.onMouseOff();
                    //     this.scene.obs_watchout.x = param.pos.x - 110;  //警示标志位置校准
                    //     this.scene.obs_watchout.visible = true;
                    //     this.isInObsGuide1 = false;
                    //     this.scene.game_continue.text = "点击继续游戏";
                    // });
                    this.isInObsGuide1 = false;
                    break;
                }
                case 5: {  //障碍物引导2
                    Laya.timer.once(1000, this, function(){
                        this.scene.box_normal.visible = false;
                        this.scene.shoot_guide.visible = false;
                        
                        this.isInObsGuide2 = false;
                        // this.onChangeGameState(this.game_state.game_stop);
                        QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0);
                        this.onChangeGameState(this.game_state.game_wait);
                        this.scene.box_normal.visible = false;
                        this.scene.box_obs2.visible = true;
                        QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.obs_btn, this, this.onClickBtnObs,[]);
                        this.onMouseOff();
                    })
                    break;
                }
            }  
        }

        /**
         * 新手引导界面隐藏
         */
        public onGuideHide(param: any){
            switch(param){
                case 1: {  //隐藏血条引导
                    this.scene.hp_guide.visible = false;  
                    this.scene.hp_guide_02.visible = false;
                    this.scene.hp_guide_01.visible = false;
                    this.scene.stop_bg.visible = true;  //显示暂停的遮罩层
                }
                case 4: {  //隐藏障碍物引导1
                    // this.scene.obs_watchout.visible = false;
                    this.scene.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);  //恢复鼠标move监听
                }
            }
        }
        /**
         * 取消鼠标点击监听
         */
        public onMouseOff(){
            this.scene.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }
        /**
         * 恢复鼠标点击监听
         */
        public onMouseOn(){
            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.scene.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }
        /**
         * 道具引导时点击知道了执行，恢复鼠标监听
         */
        private onClickBtnProp(){
            this.scene.box_normal.visible = true;
            this.scene.obs_guide.off(Laya.Event.CLICK, this, this.onClickBtnProp);
            this.scene.prop_guide.visible = false;
            this.scene.prop_bg.visible = false;
            this.scene.prop_hand.visible = false;
            this.scene.propHandMove.gotoAndStop(0);
            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            // QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0.1);
        }

        /**
         * 障碍物引导时点击知道了执行，恢复鼠标监听
         */
        private onClickBtnObs(){
            this.scene.box_normal.visible = true;
            this.scene.box_obs2.visible = false;
            this.scene.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            // QEventMgr.instance.sendEvent(QEventType.GAME_CURRENT_TIME, 0.1);
        }

        //  ------------------------------    新手引导  End  ------------------------------

        /**
         * 开始游戏
         */
        public onGameStart():void
        {
            // 关闭 开始界面
            this.scene.box_ui_stop.visible = true;
            this.scene.ani1.play(0, true);
            // 地图
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_START);
            // 开火
            this.playerCar.startFire();
            this.onChangeGameState(this.game_state.game_running);
            let level = QGameData.instance.getCheckPoint();
            if(tywx.clickStatEventType.startGameLevel[level+'']){
                tywx.BiLog.clickStat(tywx.clickStatEventType.startGameLevel[level+''],[]);
            }
        }

        /**
         * 游戏中
         */
        private onGameRunning():void
        {
            QGameData.instance.game_stop = false;
            this.scene.ani1.stop();
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RUNNING);
            QGameData.instance.startGameRunning();
        }
        /**
         * 游戏暂停
         */
        private onGameStop():void
        {     
            this.scene.box_ui_stop.visible = true;
            let point = QGameData.instance.getCheckPoint();
            if(point == 1) {
                // this.scene.box_guide.visible = true;
                // this.scene.guideHandMove.play(0, true);
                this.scene.box_guide.visible = false;
            }else {
                this.scene.box_normal.visible = !this.hide;
                if(this.hide){
                    this.hide = !this.hide;
                }
                this.scene.box_guide.visible = false;
                // this.scene.ani1.play(0, true);
            }
            this.scene.ani1.play(0, true);
            QGameData.instance.game_stop = true;
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_STOP);
            QGameData.instance.startGameStop();
            tywx.BiLog.clickStat(tywx.clickStatEventType.pauseTimesOfGameInterface,[]);
        }

        /**
         * 普通敌人死亡
         */
        public onGameEnemyOver():void
        {
            this.onChangeGameState(this.game_state.game_enemy_over);
        }
        
        /**
         * 播发游戏关卡结束 子弹时间         
         */
        public onPlayGameOver():void
        {
            if (this.gameOver == false) {
                this.gameOver = true;
                this.onChangeGameState(this.game_state.game_paly_win_animation);
                Laya.Tween.to(this.scene.finish_tip, {y:Laya.stage.height*0.3},500,Laya.Ease.sineIn,Laya.Handler.create(this,function(){
                    Laya.timer.once(1000, this, function(){
                        Laya.Tween.to(this.scene.finish_tip, {y:0},500,Laya.Ease.sineIn,null);
                    })
                }));
                // QGameData.instance.startGameOver();
            }
            
        }
        
        /**
         * boss
         */
        public initBoss():void 
        {
            // this.QBossNode = new QEnemyBossNode();
            // this.QBossNode.addParent(this.scene.box_car);  
        }
        // boss 来袭
        public onBossStart():void {
            if(this.game_state.game_fail == this.game_state_current) {
                return;
            }
            QDebug.D("BOSS 来袭------------------------------------------------------");
            this.scene.ani_boss.play(0,false);
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.boss);
            Laya.timer.once(1000, this, function(){
                QSoundMgr.instance.stopSfx(QSoundMgr.instance.soundInfo_wav.boss);
                var data:any = QGameData.instance.getBossEnemyData();
                data.car_pic = data.bosspic;
                data.attack_grow = 0;
                data.attack = data.bossAttack;
                data.cartype = 4;
                var pos_x = QGameData.instance.car_pos[2];
                var pox_y = -400;
                var enemy_js = QGameData.instance.getBoosPool(); 
                enemy_js.setEnemyData(data);
                var position = {x:pos_x, y: pox_y};                
                enemy_js.startMove(position);
            })   
        }

        /**
         * BOSS 死亡
         */
        public onBossOver():void{
            this.scene.enemy_count.text = "0";
        }
        public onPlayWinAnimation():void
        {
            this.scene.ani_flash.play(0, false);
            Laya.Tween.to(this.scene.box_map,{scaleX:1, scaleY:1},10);
        }
        /**
         * 播放完子弹时间结算界面 
         */
        public onChangeGameWinState(){
            this.onChangeGameState(this.game_state.game_win);
        }
        /**
         * 游戏胜利
         */
        public onGameWin():void
        {
            QEventMgr.instance.sendEvent(QEventType.DEPUTY_PROBATION_OVER);  //游戏结束时发送副武器试用结束事件
            QGameData.instance.addCheckPoint();
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_WIN);
            this.scene.box_game.visible = false;
            QUIMgr.instance.createUI(QUIMgr.UI_GameEndingView, 1);
        }

        /**
         * 复活界面
         */
        public onGameResurrect():void
        {
            if(this.checkCanRevive())
            {
                QUIMgr.instance.createUI(QUIMgr.UI_GameResurrectView);
            }else {
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT_FAIL);
            }
        }
        private checkCanRevive():boolean
        {
            var point = QGameData.instance.getCheckPoint();
            if(point==1){
                return true;
            }
            return QGameData.instance.game_revive_times == 0;
        }
        
        /**
         * 开始复活
         */
        public onStartResurrect() {
            this.onUpdatePlayerCarPos(false);
             // 地图
             // 开火
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT);
            this.onChangeGameState(this.game_state.game_wait_resurrect);
            QGameData.instance.game_stop = false;
            this.scene.box_ui_stop.visible = true;
            this.scene.ani1.play(0, true);
            
        }
        
        /**
         * 游戏失败
         */
        
        public onPlayerFail():void
        {
            this.onChangeGameState(this.game_state.game_resurrect);
        }

        public hide;
        /**
         * 隐藏长按继续游戏
         */
        public hideLabCon(){
            this.hide = true;
        }

        /**
         * 复活倒计时结束
         */ 
        public onStartResurrectFail():void
        {
            this.onGameFail();
        }
        /**
         * 游戏失败界面
         */
        public onGameFail() {
            QEventMgr.instance.sendEvent(QEventType.DEPUTY_PROBATION_OVER);  //游戏结束时发送副武器试用结束事件
            this.scene.box_game.visible = false;
            this.scene.box_ui_stop.visible = false;
            // this.unregisterEvent();
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.fail);
            QUIMgr.instance.createUI(QUIMgr.UI_GameEndingView, 0);
        }
        
        public ProbsIndex:number = 0;
        public CoinIndex:number = 0;
        /**
         * 创建道具
         */
        public onCreateProbs(param :any):void
        {
            if (param.Boss == 1 || param.Boss == 2 || param.Boss == 3) {
                this.createDollarItem(param);
                return;
            } else {
                this.createDollarItem(param);
            }

            //医疗车必定爆出医疗包
            if(param.cartype == 6)
            {
                var itemDate = QCfgMgr.instance.getitemConfig()["4"];  // 医疗包
                itemDate.param_type = 3; 
                itemDate.param_data =[param, this.ProbsIndex];
                QGameData.instance.addNodeFrameOnce(itemDate);
                this.ProbsIndex += 1;
                return;
            }

            // // 第一关没出过道具引导，必出氮气并弹道具引导
            // if (QGameData.instance.getCheckPoint() == 1 && this.isInPropGuide) {
            //     var itemDate = QCfgMgr.instance.getitemConfig()["1"];  // 氮气
            //     itemDate.param_type = 3; 
            //     itemDate.param_data =[param, this.ProbsIndex];
            //     QGameData.instance.addNodeFrameOnce(itemDate);
            //     this.ProbsIndex += 1;
            //     //道具引导
            //     this.onGuide({index: 3});
            //     return;
            // }
            if (QGameData.instance.LevelEnemyCount == 0) {
                return;
            }
            var value = QGameData.instance.getCheckPointDropchance();
            var index = Math.random();
            if (index < value ) {
                return;
            }
            var itemDate = QGameData.instance.getItemData();
            // 银币
            let passDollar = true;      // 爆到美钞时跳过
            if (itemDate.probs_type == 2) {   
            }else{
                itemDate.param_type = 3; 
                itemDate.param_data =[param, this.ProbsIndex];
                QGameData.instance.addNodeFrameOnce(itemDate);
                this.ProbsIndex += 1;
            }
        }
        /**
         * 
         * 创建美钞
         */
        createDollarItem(param :any){
            
            var local_pos =  param.obj.parent.localToGlobal(new Laya.Point(param.x, param.y));
            var point_start = this.scene.box_game.globalToLocal(new Laya.Point(local_pos.x, local_pos.y));
            var local_pos_2 = (this.scene.img_gold.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.scene.img_gold.x , this.scene.img_gold.y));
            var point_end = this.scene.box_game.globalToLocal(new Laya.Point(local_pos_2.x, local_pos_2.y));
            var num = 0; 
            var itemDate :any = {}; 
            if(param.Boss == 1) {
                itemDate = QGameData.instance.getLargeDollar();
                itemDate.amount1 = itemDate.amount* QGameData.instance.getCheckPointAcount()* QGameData.instance.DollarDouble;
                var data = QGameData.instance.getCheckPointBossDrop();
                var index = Math.round(Math.random()*(data[1]- data[0]) + data[0]);
                num = index ;
            }else if (param.Boss == 2 ){
                itemDate = QGameData.instance.getLargeDollar();
                itemDate.amount1 = itemDate.amount*QGameData.instance.getCheckPointAcount() * QGameData.instance.DollarDouble;
                var data = QGameData.instance.getCheckPointBossDrop();
                var index = Math.round(Math.random()*(data[3]- data[2]) + data[2]);
                num = index ;
            }else if (param.Boss == 3 ){
                //美钞车
                itemDate = QGameData.instance.getLargeDollar();
                itemDate.amount1 = itemDate.amount*QGameData.instance.getCheckPointAcount() ;
                var data = QGameData.instance.getCheckPointBossDrop();
                var index = Math.round(Math.random()*(data[5]- data[4]) + data[4]);
                num = index * QGameData.instance.DollarDouble;
            }else {
                var index___ = Math.round(Math.random()*10);
                if (index___ <= 1) {
                    itemDate = QGameData.instance.getLargeDollar();
                }else {
                    itemDate = QGameData.instance.getLessDollar();    
                }
                itemDate.amount1 =  itemDate.amount* QGameData.instance.getCheckPointAcount()* QGameData.instance.DollarDouble;
                num = 1;
            }
            for (var i = 0; i < num; i++ ) {
                var probs_js = QGameData.instance.getCoinPool(); 
                probs_js.setParam(itemDate);
                probs_js.startMove(point_start, this.CoinIndex, point_end);
                this.CoinIndex += 1;
            }                
        }
        /**
         * 计算道具倒计时位置 
         */
        public calculateItemPos(index):any
        {
            var data :any = {};
            data.posx = this.scene.img_item_pos.x;
            data.posy = this.scene.img_item_pos.y + index * 140;
            return data;
        }
        /**
         * 道具 倒计时结束
         * @param value 
         */
        public onRemoveItemEffect(value) {
            var index = this.ItemProgressBarJsList.indexOf(value);
            if (index != -1) {
                this.ItemProgressBarJsList.splice(index, 1);
                this.ItemProgressBarList.push(value);
            }
            var count = this.ItemProgressBarJsList.length;
            for (var i = 0; i < count; i++) {
                this.ItemProgressBarJsList[i].setPos(this.calculateItemPos(i));
            }
        }
        /**
         * 道具特效
         */
        public onGamePlayItemEffect(value: any):void 
        {
            // 检测当前正在进行倒计时的是否存在
            var count = this.ItemProgressBarJsList.length;
            var flag = -1;
            for (var i = 0; i < count; i++)
            {
                if (this.ItemProgressBarJsList[i].isJudgeType(value.item_type) == true) {
                    flag = i;
                }
            }
            if (flag != -1) {
                // 存在
                value.pos = this.calculateItemPos(flag);
                this.ItemProgressBarJsList[flag].setParam(value);
            } else {
                // 不存在
                var node_js = this.ItemProgressBarList.shift();
                value.pos = this.calculateItemPos(count);
                node_js.setParam(value);
                this.ItemProgressBarJsList.push(node_js);
            }
        }

        /**
         * 打开弹窗
         * @param box 
         */
        public DoUIAnim_DialogPop(box: any)
		{
			//如果没有设置中心点则，先把控件的中心点设置为中间
            box.visible = true;
			let oldSX = box.scaleX;
			let oldSY = box.scaleY;
			box.scale(oldSX * 0.8, oldSY * 0.8);
			Laya.Tween.to(box, { scaleX: oldSX, scaleY: oldSY }, 200, Laya.Ease.expoInOut);
        }
        /**
         * 关闭 弹窗
         * @param box 
         */
        public DoUIAnim_DialogClose(box: any)
		{
            box.visible = false;
        }
    }
    
}

export default game.view.QGameView;
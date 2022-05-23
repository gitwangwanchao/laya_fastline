import { ui } from "../../ui/layaMaxUI";
import QUIMgr from "../core/QUIMgr";
import QBaseNode from "../core/QBaseNode";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QSequence from "../../framework/QSequence";
import QUtil from "../../framework/QUtil";
import QCfgMgr from "../core/QCfgMgr";
import QMergeData from "../data/QMergeData";
import QAirCraft from "./QAirCraft";
import QSoundMgr from "../core/QSoundMgr";
import QGameConst from "../data/QGameConst";


namespace game.view
{
    export class QPlayerCar extends QBaseNode
    {
        public scene : ui.view.PalyerCarUI;
        public game_state:number = 0;  // 0 死亡 1 正常状态 2暂停
        public level:number = 1;
        public sequence: QSequence;
        public bullet_index :number = 0;  
        public eventType:any = "QPalyerCar";
        public state:number = 0;
        public carHp:number = 0;
        public carHpMax:number = 0;
        public mainWeaponId:number =0;  // 主武器等级
        public deputyWeaponId:number =0; // 副武器等级
        public main_level:number = 0; // 主武器
        public deputy_level:number = 0; // 副武器
        public fireFrequency:number = 130; // 开火频率
        public bulletSpeed:number = 0; // 子弹速度
        public bulletInjure:number =0; // 子弹伤害
        public bulletModel:string = ""; // 子弹图片
        public AirCraftTime:number = 500; // 导弹时间
        public PosY:number = 0; 
        public PosX:number =0;
        public startHeight = 80;
        public sprintHeight = 150; 
        public move_time = 500;
        public AirNode1:any;
        public AirNode2:any;
        public deputy_data:any = {};// 副武器
        public main_ballistic:number = 1;
        public deputy_ballistic:number = 1;
        public registerEvent():void
        {
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_STOP,this.onGameStop,this);
            QEventMgr.instance.register(QEventType.GAME_CURRENT_TIME,this.onGameStop,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_RUNNING,this.onGameRunning,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_BULLET_HIT + this.eventType ,this.onHit,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_PLAY_EFFECT, this.onItemEffect, this);      
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_ITME_EFFECT_REMOVE, this.onItemEffectRemove, this) 
            QEventMgr.instance.register(QEventType.GAME_VIEW_BOSS_OVER,this.onPlayWinAnimation, this);  
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onGameWin, this);      
        }
        public unregisterEvent():void
        {
            QEventMgr.instance.unregister(QEventType.GAME_CURRENT_TIME,this.onGameStop,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_STOP,this.onGameStop,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_RUNNING,this.onGameRunning,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_BULLET_HIT + this.eventType ,this.onHit,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_PLAY_EFFECT, this.onItemEffect, this);     
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_ITME_EFFECT_REMOVE, this.onItemEffectRemove, this)
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_BOSS_OVER,this.onPlayWinAnimation, this);  
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onGameWin, this);    
            if(this.AirNode1 != null){
                this.AirNode1.destroy();
                this.AirNode2.destroy();
                this.AirNode1 = null;
                this.AirNode2 = null;
            }
        }

        public init():void
        {
            this.scene = new ui.view.PalyerCarUI();
            this.scene.zOrder = 11;
            this.game_state = 0;
            // 加载飞行器
            this.initAirCraft();
            this.scene.animation_jiasu.visible = false;
        }
        /**
         * 加载飞行器
         */
        public initAirCraft():void{
            this.AirNode1 = new QAirCraft();
            this.AirNode1.addParent(this.scene);
            this.AirNode1.setParam("left");
            this.AirNode1.setBulletPosition(- this.scene.width);
            this.AirNode2 = new QAirCraft();
            this.AirNode2.addParent(this.scene);
            this.AirNode2.setParam("right");
            this.AirNode2.setBulletPosition(this.scene.width*2);
        }

        /**
         * 碰撞
         */
        public playHitPos:any = {};
        public getPos():any {
            this.playHitPos.x = this.scene.x - this.scene.width/2;
            if (QGameData.instance.StateSprint == true){
                this.playHitPos.x = this.scene.x - this.scene.width;
                this.playHitPos.y = this.scene.y - this.scene.height;
                this.playHitPos.width = this.scene.width*2;
                this.playHitPos.height = this.scene.height*2;
            }else {
                this.playHitPos.x = this.scene.x - this.scene.width/2;
                this.playHitPos.y = this.scene.y - this.scene.height/2;
                this.playHitPos.width = this.scene.width;
                this.playHitPos.height = this.scene.height;
            }
            return this.playHitPos;
        }
        /**
         *获得汽车位置 
         */
        public getPlayerCarPos():any{
            var data :any = {};
            data.x = this.scene.x;
            data.y = this.scene.y;
            return data;
        }
        public bullet_data:any ={};

        /**
         * 原始位置
         * @param value 
         */
        public mianWeaponLevel :string = "0";
        public car_level:any = "1";
        public weapon_data_cur:any = null;
        public initPos(value: any, flag:Boolean = true):void
        {
            this.scene.rotation = 0;
            this.scene.img_car_icon_1.visible = true;
            this.scene.effect_double.visible = false;
            this.PosY = value.y;
            this.PosX = value.x;
            if (flag == true) {
                this.scene.y = value.y;
                this.scene.x = value.x;
            }
            var index:any = QMergeData.instance.getCarUsedLevel();
            this.car_level = index + "";
            var data = QCfgMgr.instance.getCarInfoById(index);
            // 车图片
            this.scene.img_car_icon.skin = "ui_car/p_EventCar_" + index + ".png";
            this.scene.img_car_icon_shadow.skin = "ui_car/p_EventCar_" + index + ".png";
            this.scene.img_car_icon_shadow.filters = [QGameData.instance.blackFilter];
            this.carHpMax = data.carHp;
            // HP 
            this.carHp = data.carHp;
            // 武器等级
            this.mainWeaponId = data.mainWeaponId;
            this.deputyWeaponId = 0;
            var bese_data = QCfgMgr.instance.getBaseMainWeapons();
            this.weapon_data_cur = QCfgMgr.instance.getMainWeapons(this.mainWeaponId);
            
            // this.weapon_data_cur = weapon_data[this.car_level];
            if(QGameData.instance.newPlayerGudieStep(null) == QGameConst.NumForGuide.enterGameAgain){
                this.mianWeaponLevel = "3";
            }else {
                this.mianWeaponLevel = QGameData.instance.getMainWeaponLevel()+ "";    
            }

            // "fireFrequency": 130,
            // "bulletNumber": 1,
            // "mainWeaponModel": "ui_weapons/main_weapons_1.png",
            // "bullet": 2,
            // "weapons_count": 1,
            // "main_3dModel": 1,
            // "main_ballistic_id": 1
            // 开火频率
            this.fireFrequency = this.weapon_data_cur.fireFrequency; //bese_data[this.mianWeaponLevel].fireFrequency;
            // 主武器弹道
            this.main_ballistic = this.weapon_data_cur.main_ballistic_id;//bese_data[this.mianWeaponLevel].main_ballistic_id;
            // 子弹数据
            this.bullet_data = QCfgMgr.instance.getBulletList(this.weapon_data_cur.bullet);
            // 子弹速度
            this.bulletSpeed = 5;
            // 子弹伤害
            this.bulletInjure = (bese_data[this.mianWeaponLevel].base_damage + this.weapon_data_cur.sDps)/(1000/this.fireFrequency)/this.weapon_data_cur.bulletNumber;
            this.bulletInjure = parseFloat(this.bulletInjure.toFixed(1));
            QDebug.D("子弹伤害-------------------  " + this.bulletInjure);
            // 子弹图片
            this.bulletModel = this.bullet_data.bullet_pic;
            this.scene["box_weapons_1"].visible = true;
            this.scene["box_fire_1"].visible = false;
            this.scene["box_fire_2"].visible = false;
            this.scene["box_fire_" + this.weapon_data_cur.weapons_count].visible = true;
            // 测试
            this.main_level = this.weapon_data_cur.bulletNumber;
            
            
            // 更改图片  主武器
            // todo
            this.scene.img_weapons_icon1.skin = this.weapon_data_cur.mainWeaponModel;    
            this.scene["box_deputy_weapon1"].visible = false;

            var deputy_level = QGameData.instance.getDeputyWeaponLocalLevel()
            if (deputy_level > 0) {
                if(QGameData.instance.deputy_full_level_try != 0) {
                    deputy_level = QGameData.instance.deputy_full_level_try;
                }
                this.deputy_data = QCfgMgr.instance.getDeputyWeapons(deputy_level);
                this.scene.img_deputy_weapons_icon_1_0.skin = this.deputy_data.sPic;
                this.scene.img_deputy_weapons_icon_1_1.skin = this.deputy_data.sPic;
                this.deputy_level = this.deputy_data.sBulletNumber;
                // 副武器弹道
                this.deputy_ballistic = this.deputy_data.s_ballistic_id;
                this.scene.box_deputy_weapon1.visible = true;
                // 子弹数据
                this.deputy_data.bullet_data = QCfgMgr.instance.getBulletList(this.deputy_data.sBullet);
                //this.deputy_bulletInjure = this.deputy_data.sDps/this.deputy_data.sBulletNumber;
                this.deputy_bulletInjure = Math.ceil(this.deputy_data.sDps/(1000/this.deputy_data.sFireFrequency)/(this.deputy_data.sBulletNumber*2));
                Laya.timer.loop(this.deputy_data.sFireFrequency, this, this.deputyonFire); // 武器 开火     
            }
            var p = Math.max(0,this.carHp / this.carHpMax);
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_CHANGE_HP, p); 
            //飞行器
            this.onUpdateAirCraft();
            this.game_state = 0;
            Laya.timer.loop(this.fireFrequency, this, this.onFire); // 武器 开火
        }

        /**
         * 飞行器
         */
        public onUpdateAirCraft(){
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_DATA);
        }

        /**
         * 移动
         * @param value 
         */
        public tween :Laya.Tween = null;
        public onMove(value:number):void
        {
            if(this.game_state == 0) {
                return;
            }
            this.scene.x += value;
            if (this.scene.x <= 60) {
                this.scene.x = 60;
                return
            } else if (this.scene.x >= 690){
                this.scene.x = 690;
                return
            }
            if (value < -5) {
                this.scene.img_car_icon.rotation = -3;
                this.scene.img_car_icon_shadow.rotation = -3;
            } else if(value > 5 ) {
                this.scene.img_car_icon.rotation = 3;
                this.scene.img_car_icon_shadow.rotation = 3;
            } 
            QGameData.instance.setQPlayerCarPos({x: this.scene.x , y: this.scene.y});
            Laya.Tween.to(this.scene.img_car_icon, { rotation: 0 }, 500);
            Laya.Tween.to(this.scene.img_car_icon_shadow, { rotation: 0 }, 500);
        }

        /**
         * 开火
         */
        public startFire():void {
            // 播放 进场
            Laya.Tween.to(this.scene, {y: this.PosY - this.startHeight},this.move_time,Laya.Ease.sineOut, Laya.Handler.create(this, function(){
                QGameData.instance.setQPlayerCarPos({x: this.scene.x , y: this.scene.y});
                QDebug.D("QPlayerCar-------startFire----------------------------");
            }))
            this.game_state = 1;
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_FIRE);
        }

        /**
         * 游戏暂停
         */
        public laya_stop:any = null;
        onGameStop():void{
            QDebug.D("QPlayerCar游戏暂停-------onGameStop----------------------------");
            if (this.game_state != 0) {
                QDebug.D("QPlayerCar游戏暂停-----------------------------------");
                this.game_state = 2;
                this.laya_stop =  Laya.Tween.to(this.scene, {y: this.PosY}, this.move_time*8, Laya.Ease.sineOut);
                this.closeLoopSound();
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.machine_gunfireOver);
                this.AirNode1.onGameStop();
                this.AirNode2.onGameStop();
            }   
        }
        /**
         * 游戏运行中
         */
        onGameRunning():void
        {
            if (this.game_state == 0) {
                return;
            }
            if (this.laya_stop != null) {
                Laya.Tween.clear(this.laya_stop);
            }
            QDebug.D("QPlayerCar游戏运行中------onGameRunning-----------------------------");
            this.game_state = 1;
            Laya.Tween.to(this.scene, {y: this.PosY - this.startHeight}, this.move_time, Laya.Ease.sineOut) 
        }
        /**
         * 创建子弹
         */
        public main_number:any =null;
        public onFire():void
        {
            if (this.game_state == 0 || this.game_state == 2){
                return;
            }
            this.main_number = this.main_level;
            if(QGameData.instance.StateBallistic == true) {
                this.main_number = 5; // 弹幕道具 5排子弹
            } 
            Laya.timer.frameOnce(1,this, function(){
                this.onWeaponsMain(this.main_number);
            })
            // Laya.timer.frameOnce(2,this, function(){
            //     this.onWeapons(this.deputy_level);
            // })
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.gunfire);
        }
        /**
         * 副武器
         */
        public deputyonFire():void{
            if (this.game_state == 0 || this.game_state == 2){
                return;
            }
            Laya.timer.frameOnce(2,this, function(){
                this.onWeapons(this.deputy_level);
            })
        }
        /**
         *  主武器
         */
        public bulletPoint:any =null; 
        public onWeaponsMain(count): void
        {
            var rota = 0;
            for (var i = 0; i < count; i++) {
                var pos_data = QGameData.instance.getDeputyButtonInitialPos(this.main_ballistic,i,count);
                this.bulletPoint = {x:this.scene.x + pos_data.x , y:this.scene.y -120 + pos_data.y ,type: "QPlayerCarBullet", 
                rotation:rota, speed: this.bulletSpeed, bulletInjure : this.bulletInjure, bulletModel: this.bulletModel , bullet_data: this.bullet_data ,change_data:pos_data};
                QGameData.instance.getBulletPool(0).startFire(this.bulletPoint);
            }
            this.scene.playfire.play(0, false);
        }
        /**
         *  副武器
         * flag 0 左 1 右
         *  this
         */
        public deputy_bulletInjure:any= null;
        public deputy_rota :any = 10;
        public deputy_dis :any = 60;
        public onWeapons(count): void
        {
            if (count == 0) {
                return;
            }
            this.deputy_rota = 20;
            this.deputy_dis = 60;
            for (var j =0; j<2;j++) {
                if (j == 0){
                    this.deputy_dis = -60;
                    this.deputy_rota = -10;
                }else {
                    this.deputy_dis = 60;
                    this.deputy_rota = 10;
                }
                for (var i = 0; i < count; i++) {
                    var pos_data = QGameData.instance.getDeputyButtonInitialPos(this.deputy_ballistic,i,count);
                    var y = Math.sin(this.deputy_rota * (Math.PI/180))*(pos_data.x) +  Math.cos(this.deputy_rota * (Math.PI/180))*(pos_data.y);
                    var x = Math.cos(this.deputy_rota * (Math.PI/180))*(pos_data.x) -  Math.sin(this.deputy_rota * (Math.PI/180))*(pos_data.y);
                    this.bulletPoint = {x:this.scene.x + this.deputy_dis + x , y:this.scene.y -50 + y ,type: "QPlayerCarBullet", 
                    rotation:this.deputy_rota, speed: this.deputy_data.bullet_data.bulletSpeed, bulletInjure : this.deputy_bulletInjure, bulletModel: this.deputy_data.bullet_data.bullet_pic, bullet_data:this.deputy_data.bullet_data,change_data:pos_data};
                    QGameData.instance.getBulletPool(0).startFire(this.bulletPoint);
                }
            }
            
        }
        /**
         * 碰撞反馈
         * @param type  1 普通敌人车 2 路障 3 敌人子弹
         */
        public onHit(params:any):void
        {
            // 冲刺状态 碰撞无敌
            if (QGameData.instance.StateSprint == true) {
                return;
            }
            if (this.game_state == 0) {
                return;
            }
            if (params.type == 1 ) {
                var modulus = QGameData.instance.getCheckPoint()<3?0.05:0.2;//前两关撞车伤害系数调整为0.05
                this.carHp -= this.carHpMax*modulus;
            } else if (params.type == 2) {
                this.carHp = 0;
            } else if (params.type == 3){
                this.carHp -=  params.attack;
            } else if (params.type == 4){
                this.carHp -=  this.carHpMax * params.attack;
            } 
            QDebug.D("伤害来源------------------" + params.type);
            // 振动
            if(QSoundMgr.instance.isVibrateOn){
                if (Laya.Browser.onMiniGame) {
                    if (params.vibrateType == 1 || params.vibrateType == 2) {
                        Laya.Browser.window.wx.vibrateLong();
                    }else {
                        Laya.Browser.window.wx.vibrateShort();
                    }
                }else if(navigator.platform=='android'){
                    if (params.vibrateType == 1 || params.vibrateType == 2) {
                        tywx.AndroidHelper.startVibrate(400);
                    }else {
                        tywx.AndroidHelper.startVibrate(100);
                    }
                }
            }
            
            if (params.vibrateType == 2) {
                // 碰到 障碍物 地图抖动
                QEventMgr.instance.sendEvent(QEventType.HIT_OBSTACLES);
            }

            this.hp_p = Math.max(0,this.carHp / this.carHpMax);
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_CHANGE_HP, this.hp_p); 
            if (this.carHp <= 0) {
                // 死亡
                this.playDeath();
            }
        }
        
        /**
         * 子弹时间重置位置
         */
        public onPlayWinPos():void
        {
            this.scene.x = this.PosX;
        }
        // Boss 死亡
        public onPlayWinAnimation():void
        {
            Laya.Tween.clearAll(this);
            QDebug.D("QPlayerCar_onPlayWinAnimation-----------------------------------");
            Laya.Tween.to(this.scene, {y:this.PosY - 1500},800,Laya.Ease.sineIn, Laya.Handler.create(this, function(){
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_CHANGE_GAME_WIN_STATE);   
            }));
        }
        /**
         * 子弹判断
         */
        public Judge_bullet:any ={};
        public attack :any = 0;
        public hp_p:any = 1;
        /**
         * 死亡动作
         */ 
        public playDeath() {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.deathBomb);
            this.closeLoopSound();
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.scene.rotation = 0;
            this.game_state = 0;
            this.scene.animation_hp.visible = false;
            this.scene.img_car_icon_1.visible = false;
            this.scene.playfire.stop();
            this.scene.playfire.gotoAndStop(0);
            // 爆炸
            this.scene.animation_fire.play(0, false);
            // 武器升级
            this.scene.animation_weapons.visible = false;
            // 美钞翻倍
            this.scene.effect_double.visible = false;
            this.scene.effect_double.stop();
            this.AirNode1.scene.visible = false;
            this.AirNode1.gameOver();
            this.AirNode2.scene.visible = false;
            this.AirNode2.gameOver();
            QEventMgr.instance.sendEvent(QEventType.GAME_FAIL_NO_CONTINUE);
            Laya.timer.once(800,this, function(){
                // if(QGameData.instance.game_revive_times == 0)
                // {
                    QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_FAIL);
                // }
                // else
                // {
                    // QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT_FAIL);
                // }
            });
        }
        /**
         * 胜利
         */
        public onGameWin():void {
            this.game_state = 0;
            this.closeLoopSound();
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.win);
            this.scene.animation_jiasu.stop();
            this.scene.animation_jiasu.gotoAndStop(0);
            this.scene.animation_jiasu.visible = false;
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.scene.playfire.stop();
            this.scene.playfire.gotoAndStop(0);
            this.scene.rotation = 0;
        }
        /**
         * 冲刺
         */
        public onPlaySprint()
        {
            QDebug.D("冲刺-----------------------------------");
            if (this.scene){
                this.scene.animation_jiasu.visible = true;
                this.scene.animation_jiasu.play(0, true)
                Laya.Tween.to(this.scene, {y: this.PosY - this.sprintHeight}, this.move_time ,Laya.Ease.sineOut);
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.get_nitrogenPass);
            }
        }

        /**
         * 取消冲刺
         */
        public onPlaySprintCannel(){
            if ( this.game_state == 0){
                return;
            }
            QDebug.D("QPlayerCar取消冲刺-----------------------------------");
            this.scene.animation_jiasu.stop();
            this.scene.animation_jiasu.gotoAndStop(0);
            this.scene.animation_jiasu.visible = false;
            Laya.Tween.to(this.scene, {y: this.PosY - this.startHeight}, this.move_time ,Laya.Ease.sineOut);
        }

        /**
         * 关闭循环音效
         */
        public closeLoopSound(){
            
        }

        /**
         * 复活
         */
        public onResurrect(value:any) {
            // this.scene.visible = true;
            this.initPos(value, false);
            // 播放重生动画
        }

        /**
         * 吃道具播放特效
         */
        public onItemEffect(value) {
            if(QUtil.isNullOrEmpty(value)){
                return;
            }
            if (this.game_state == 0) {
                return;
            }   
            if (value.item_type == 4) {
                this.scene.animation_hp.visible = true
                this.scene.animation_hp.play(0,false);
                // this.scene.addHp.play(0, false);
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.damageUp);
                // 增加血量
                this.carHp += this.carHpMax*0.2;
                this.carHp = Math.min(this.carHpMax , this.carHp);
                var p = Math.max(0,this.carHp / this.carHpMax);
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_CHANGE_HP, p); 
                tywx.BiLog.clickStat(tywx.clickStatEventType.numberOfMedicalBagPickup,[]);
            } else if (value.item_type == 1)
            {
                // 氮气
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.get_nitrogen)
                this.onPlaySprint();
                tywx.BiLog.clickStat(tywx.clickStatEventType.pickupAcceleration,[]);
            } else if (value.item_type == 2)
            {  //弹幕
                this.scene.animation_weapons.visible = true
                this.scene.animation_weapons.play(0,true);
                QSoundMgr.instance.playSfx( QSoundMgr.instance.soundInfo_wav.damageUp);
                tywx.BiLog.clickStat(tywx.clickStatEventType.pickupIncreasesBarrageCount,[]);
                // 武器升级
                // this.scene.img_damage.visible = true;
                // this.scene.effect_damage.play(0, true);
            } else if (value.item_type == 3)
            {
                // 美钞翻倍
                QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMoneyDouble)
                this.scene.effect_double.visible = true;
                this.scene.effect_double.play(0, true);
                tywx.BiLog.clickStat(tywx.clickStatEventType.doubleYourDollarBills,[]);
            }
        }

        /**
         * 倒计时道具 结束
         */
        public onItemEffectRemove(value:any) {
            if(QUtil.isNullOrEmpty(value)||QUtil.isNullOrEmpty(value.item_data)) {
                return;
            }
            if (value.item_data.item_type == 1) {
                // 氮气
                this.onPlaySprintCannel();
            } else if (value.item_data.item_type == 2) {
                // 武器升级
                this.scene.animation_weapons.visible = false;
                this.scene.animation_weapons.stop();
            } else if (value.item_data.item_type == 3) {
                // 美钞翻倍
                this.scene.effect_double.visible = false;
                this.scene.effect_double.stop();
            }
        }
    }
}
export default game.view.QPlayerCar;
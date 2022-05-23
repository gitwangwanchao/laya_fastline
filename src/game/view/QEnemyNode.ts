import { ui } from "../../ui/layaMaxUI";
import QUIMgr from "../core/QUIMgr";
import QBaseNode from "../core/QBaseNode";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QSequence from "../../framework/QSequence";
import QUtil from "../../framework/QUtil";
import QSoundMgr from "../core/QSoundMgr";
import QAirCraft from "./QAirCraft";

namespace game.view
{
    export class QEnemyNode extends QBaseNode 
    {
        public scene : ui.view.EnemyCarUI;
        public speed_running:number = 6;
        public speed:number = 0.1;
        public state:number = 0;   // 4 快速入场  1 正常游戏 2.爆炸 3， 出场
        public id:number = -1;
        public HP_MAX = 25;
        public HP:number = 20;
        public HPMax:number = 20;
        public oldTime:number = 0;
        public tween: Laya.Tween = null;
        public d_max:number = 2400;
        public prob:number = 0;
        public TIME :number = 1;
        public cartype:number = 1;// 1 普通车 2.机枪怪 3. 精英  4.BOSS
        public running_flag:number = -1;  // -1 是向左移动  1 向右移动
        public bullet_attack:number =0;
        public AirNode1:any;
        public AirNode2:any;
        public boss_shadow = [36,200];
        public enemy_shadow = [46,190];
        private normal_sacle:any = 0.85;
        public box_posit:any = {};
        public registerEvent():void
        {
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_JUDGE_BULLET_POS,this.judgeHit, this)
        }
        public unregisterEvent():void
        {
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_JUDGE_BULLET_POS,this.judgeHit, this)
        }
        public init() {
            this.scene = new ui.view.EnemyCarUI();
            this.scene.visible = false;
            this.scene.zOrder = 10;
            this.state = 0;
            this.box_posit = {};
        }
        public fireSpeed:number = 500;
        public setEnemyData(value:any):void 
        {
            this.fireSpeed = 1000;
            // 刷新 敌人图片
            var data = QGameData.instance.getCheckPointData();
            // 血量
            if (value.cartype == 4) {
                this.HP_MAX =  data.bossHp; 
            } else if (value.cartype == 3) {
                this.HP_MAX =  data.creamHp; 
            } else {
                this.HP_MAX = data.enemyHp; 
            }
            this.HPMax = this.HP_MAX;
            this.HP = this.HP_MAX;
            // 图片 
            this.scene.img_car_icon_shadow.skin = value.car_pic;
            this.scene.img_car_icon.skin = value.car_pic;
            // 根据血量分配 图片
            this.scene.img_car_icon_shadow.filters = [QGameData.instance.blackFilter];
            this.speed = QGameData.instance.getMapSpeed() - this.speed_running;
            this.cartype = value.cartype;
            this.scene.img_car_icon_shadow.scaleX = this.normal_sacle;
            this.scene.img_car_icon_shadow.scaleY = this.normal_sacle;
            this.scene.img_car_icon.scaleX = this.normal_sacle;
            this.scene.img_car_icon.scaleY = this.normal_sacle;
            this.scene.img_car_icon_shadow.x = this.enemy_shadow[0];
            this.scene.img_car_icon_shadow.y = this.enemy_shadow[1];
            if (this.cartype == 2) {
                this.bullet_attack = data.mobSDps;
            } else if (this.cartype == 3){
                this.bullet_attack = data.creamSDps;
            } else if (this.cartype == 4){
                // Boss
                this.bullet_attack = data.bossSDps;    
            }
            this.onUpdateHP();
            this.gameOver = false;
            this.box_posit.width = this.scene.img_car_icon.width * this.scene.img_car_icon.scaleX;
            this.box_posit.height = this.scene.img_car_icon.height * this.scene.img_car_icon.scaleY;
        }
        /**
         * 获得位置
         */
        // public pos_data:any ={};
        // public getPos():any {
        //     this.pos_data.x = this.scene.x  - (this.scene.img_car_icon.width * this.scene.img_car_icon.scaleX)/2;
        //     if (this.state == 2 || this.state == 0) {
        //         this.pos_data.y =-200    
        //     }else {
        //         this.pos_data.y = this.scene.y + 75  - this.scene.img_car_icon.height * this.scene.img_car_icon.scaleY;
        //     }
        //     this.pos_data.width = this.scene.img_car_icon.width * this.scene.img_car_icon.scaleX;
        //     this.pos_data.height = this.scene.img_car_icon.height * this.scene.img_car_icon.scaleY;
        //     return this.pos_data;
        // }   
        /**
         * 刷新位置
         */
        public onUpdateBoxPosit(){
            this.box_posit.x = this.scene.x  - (this.scene.img_car_icon.width * this.scene.img_car_icon.scaleX)/2;
            if (this.state == 2 || this.state == 0) {
                this.box_posit.y = -200    
            }else {
                this.box_posit.y = this.scene.y + 75  - this.scene.img_car_icon.height * this.scene.img_car_icon.scaleY;
            }
        }

        /**
         * 当前车辆是否显示
         */
        public getCarIsShow():boolean{
            return this.scene.box_car.visible;
        }

        /**
         * 获得类型
         */
        public getCartype():any {
            return this.cartype;
        }
        /**
         * 判断是否可以作为目标
         */
        public judgeDeath():any 
        {
            if(this.state == 0 || this.state == 2) {
                return 0;
            }
            return 1;
        }
        /**
         * 刷新血
         */
        public onUpdateHP():void
        {
            this.scene.progress_bar.visible = true;
            if (this.HP <= 0) {
                this.scene.progress_bar_hp.visible  = false;
            }else {
                this.scene.progress_bar_hp.visible  = true;
                this.scene.progress_bar_hp.width = Math.floor(this.HP/this.HPMax* 100) 
            }
        }
        public setId(id:number):void {
            this.id = id;
        }

        public Max:number = 0;
        public statestop:boolean = false;
        public startMove(position:any):void
        {
            this.statestop = false;
            QDebug.log(" x :"+position.x+" y : "+position.y);
            this.scene.x = position.x;
            this.scene.y = position.y;
            this.scene.visible = true;
            this.scene.box_car.visible = true;
            this.scene.progress_bar.visible = false;
            this.Max = 0;
            this.state = 4;
            this.scene.img_weapons.visible = false;
            if ( this.cartype == 2) {
                this.scene.img_weapons.visible = true;
                // 机枪小怪
                Laya.timer.loop(this.fireSpeed, this, this.startFire); 
            } if (this.cartype == 3 || this.cartype == 4) {
                // 精英
                this.scene.img_weapons.visible = true;
                Laya.timer.loop(this.fireSpeed, this, this.startFire); 
            }
            this.onUpdateBoxPosit();
        }


        /**
         * 开火
         */
        public global_pos :any = null;
        public local_pos :any = null;
        public bullet_rota :any =null;
        public startFire() {
            if (this.state == 1 && this.statestop == false && QGameData.instance.game_stop == false) {

                //QEventMgr.instance.sendEvent(QEventType.BOSS_START_SHOOT);
                var pos = QGameData.instance.getQPlayerCarPos();
                this.global_pos  = (this.scene.img_weapons_icon.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.scene.img_weapons_icon.x , this.scene.img_weapons_icon.y));
                this.local_pos = (this.scene.parent as Laya.Sprite).globalToLocal(this.global_pos);
                this.bullet_rota = QUtil.getAngle(this.local_pos.x , this.local_pos.y , pos.x, pos.y);
                if (this.bullet_rota <= 135 || this.bullet_rota >= 225 ) {
                    return
                }
                QSoundMgr.instance.playSfx( QSoundMgr.instance.soundInfo_wav.gunfire);
                Laya.Tween.to(this.scene.img_weapons_icon, {rotation: this.bullet_rota}, 50, null ,Laya.Handler.create(this, function(){
                    this.global_pos = (this.scene.img_weapons_icon.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.scene.img_weapons_icon.x , this.scene.img_weapons_icon.y));
                    this.local_pos = (this.scene.parent as Laya.Sprite).globalToLocal(this.global_pos);
                    this.scene.ani2.play(0, false);
                    var position = {x:this.local_pos.x, y:this.local_pos.y+40, rotation: this.bullet_rota, type: "QEnemyBossBullet", 
                    speed: 15, bulletInjure : this.bullet_attack, bulletModel: "ui_bullet/p_bullet_1.png", cartype: this.cartype};
                    QGameData.instance.getBulletPool(1).startFire(position);
                }));
            }
        }

        /**
         * 游戏结束
         */
        public onGameOver() {
            if (this.scene.visible == true) {
                QGameData.instance.killEnemyPoolList(this);
            }
        }

        /**
         * 玩家复活
         */
        public onGameResurrect() {
            if (this.scene.visible == true){
                if(this.cartype == 1 || this.cartype == 2 || this.cartype == 5 || this.cartype == 6 || this.cartype == 7) {
                    this.playAni(false);
                }else {
                    if(this.state != 2) {
                        Laya.timer.loop(this.fireSpeed, this, this.startFire);     
                    }
                }
            }
        }
        /**
         * 游戏结束
         */
        public gameOver = false; 
        public onPlayGameOver() {
            if (this.scene.visible == true && this.state !=2){
                //子弹时间
                this.playAni(false);
            }
        }
        /**
         *  结束车
         */
        public onkill():void{
            Laya.timer.clearAll(this);   
            this.id = null;
            this.state = 0;   
            this.scene.visible = false;
            this.scene.box_car.visible = true;
        }
        /**
         * 刷新冲刺后的速度
         */
        public onUpdateSpeed(){
            if (this.scene.visible == true) {
                if  (this.cartype == 1 || this.cartype == 2 || this.cartype == 5 || this.cartype == 6 || this.cartype == 7) {
                    this.speed = QGameData.instance.getMapSpeed() -this.speed_running;
                }else {
                    this.speed = 3;
                }
            }
        }
        /**
         * 更新位置
         * 
         */
        public speed_w :number =0;
        public UpdatePos():void
        {
            if (this.scene.visible == false) {
                return
            }
            this.speed_w = this.speed * QGameData.instance.getGameTime();
            if (this.state == 3) {
                this.scene.y += this.speed_w
                this.speed += 2;
            } 
            if (this.state == 1 || this.state == 2){
                this.scene.y += this.speed_w;
                if (this.state == 1 && this.scene.y >=  QGameData.instance.getQPlayerCarPos().y+150) {
                    this.state = 3;
                }
            }   
            if (this.state == 4) {
                this.scene.y += this.speed_w;
                this.speed -= 0.1;
                if (this.scene.y > this.Max) {
                    this.speed = QGameData.instance.getMapSpeed() - this.speed_running;
                    this.state = 1;
                } else {
                    this.speed = Math.max(QGameData.instance.getMapSpeed() - this.speed_running, this.speed); 
                }
            }
            this.onUpdateBoxPosit();
        }
        /**
         * 判断是否移出屏幕 
         */
        public onJudgeOutScreen(){
            if (this.state != 3) {
                return
            }
            if (this.scene.y > QGameData.instance.getQPlayerCarPos().y + 300) {
                this.state = 0;
                QGameData.instance.killEnemyPoolList(this);
            }
        }

        private bossPosIndex:any = [1,2,1,3];
        private bossPos:any = [[382,300],[228,500],[520,500]];
        private curBossMovePos:number = 1;
        private isStop:boolean = false;
        /**
         *  精英 
         */
        public UpdateElitePos():void {
            if (this.scene.visible == false ) {
                return;
            }
            //QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_FIRE);
            if (this.state == 1 ) {
                //BOSS 寻路
                if(!this.isStop)
                {
                    this.isStop = true;
                    Laya.Tween.to(this.scene,{x:this.bossPos[this.bossPosIndex[this.curBossMovePos-1]-1][0],y:this.bossPos[this.bossPosIndex[this.curBossMovePos-1]-1][1]},1500,null,Laya.Handler.create(this,()=>{
                        let sequence = QSequence.create(); 
                        sequence.add(1.5,function(){
                            this.isStop = false;
                            this.curBossMovePos++;
                            if(this.curBossMovePos > this.bossPosIndex.length)
                            {   
                                this.curBossMovePos = 1;
                            }
                        },this);
                        sequence.start();
                    }));
                }
            }
            if (this.state == 4) {
                this.scene.y  += 10 * QGameData.instance.getGameTime(); 
                if (this.scene.y >= 300) {
                    this.state = 1;
                }
            }
        }

        private recoverStopState():void
        {
            this.isStop = false;
        }
       
        /**
         * 播放爆炸
         */
        public playAni(falg:Boolean = true,isDelayTime:boolean = false) {
            this.state = 2;
            this.onUpdateBoxPosit();
            if (falg == true) {
                QGameData.instance.killEnemy();
            }
            
            if (QGameData.instance.judgeBossCheckPoint == false) {
                // 没有boss
                if (QGameData.instance.LevelEnemyCount == 0 ) {
                    // this.state = 5;
                    if (falg == true){
                        QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER);
                    }
                    // this.scene.animation_fire.interval = 120;
                }else {
                    // this.scene.animation_fire.interval = 30;
                }
            } else if(QGameData.instance.judgeBossCheckPoint == true) {
                // 有boss
                if(QGameData.instance.LevelEnemyCount == 0){
                    if (this.cartype == 4) {
                        if (falg == true){
                            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER);
                        }
                        // this.scene.animation_fire.interval = 120;
                    }else {
                        // this.scene.animation_fire.interval = 30;
                    }
                }
            }

            if(this.getCartype() == 5)
            {
                // this.scene.animation_fire.interval = 60;
            }  

            //如果被油罐车炸毁,则延迟0.2s,否则不延迟
            let delayTime = isDelayTime ? 200:0;
            Laya.timer.once(delayTime,this,()=>{
                this.speed = QGameData.instance.getMapSpeed();
                this.scene.box_car.visible = false;
               
                Laya.timer.frameOnce(1, this, function(){
                    QGameData.instance.playExplosion({type:3,x:this.scene.x , y:this.scene.y });
                    if (falg == true) {
                        // 判断道具
                        this.JudgeProps();
                    }
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.explosionflame);
                    Laya.timer.once(1000, this, function(){
                        QGameData.instance.killEnemyPoolList(this);
                    })
                })
            });
        }

        /**
         * 判断是否产生道具
         */
        public JudgeProps() :void
        {
            var position = {x:this.scene.x, y:this.scene.y, obj: this.scene};
            position["cartype"] = this.cartype;
            if (this.cartype == 3){
                position["Boss"] = 1;
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_CREATE_PROBS, position);
            } else if ( this.cartype == 4 ){
                position["Boss"] = 2;
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_CREATE_PROBS, position);
            } else if ( this.cartype == 7 ){
                position["Boss"] = 3;
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_CREATE_PROBS, position);
            } else {
                position["Boss"] = 0;
                QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_CREATE_PROBS, position);
            }
        }

        /**
         * 发生碰撞
         */
        public attack :any =0;
        public onHit(param:any):any {
            if (this.state == 4 || this.state == 0 || this.state == 2 || this.scene.visible == false) {
                return;
            }  
            // 车辆碰撞
            if (param.type == 1) {
                this.attack = this.HP;
            }else if(param.type == 2) {
                // 子弹 伤害
                this.attack = param.attack;
            }
           
            this.HP -= this.attack;
            this.onUpdateHP();
            if (this.HP <= 0){
                //若为油罐车,则对指定范围内的敌人进行爆炸销毁
                if(this.getCartype() == 5)
                {
                    QGameData.instance.explodeCarDie(this);
                }
                
                this.playAni();
                // }
            }
        }
        /**
         * 判断碰撞
         */
        public judgeHit(params) {
            if (this.state == 1 && QGameData.instance.JudgeRectangular(params, this.box_posit) == true) {
                this.onHit({type:2, attack: params.attack});
            } 
        }

        /**
         * 游戏暂停
         */
        onGameStop():void 
        {
            if (this.scene.visible == false ) {
                return;
            }
            if (this.state == 1 && this.cartype != 1 && this.cartype != 5) {
                this.statestop = true;
            }
        }

        /**
         * 游戏继续
         */
        onGameRunning() {
            if (this.scene.visible == false ) {
                return;
            }
            if (this.statestop == true && this.cartype != 1 && this.cartype != 5)  {
                this.statestop = false;
            }
        }
        /**
         * 游戏死亡
         */
        public onGameFail() 
        {
            if (this.scene.visible == false ) {
                return;
            }
            if(this.state != 2) {
                Laya.timer.clearAll(this);
            }
        }

    }
}
export default game.view.QEnemyNode;
import FZBaseNode from "../../core/FZBaseNode";
import { ui } from "../../../ui/layaMaxUI";
import FZEventManager from "../../../framework/FZEventManager";
import FZEvent from "../../data/FZEvent";
import FZGameData from "../../data/FZGameData";
import FZDebug from "../../../framework/FZDebug";
import FZUtils from "../../../framework/FZUtils";
import FZSoundManager from "../../core/FZSoundManager";

/**
 * 子弹
 */
namespace game.view
{
    export class FZBullet extends FZBaseNode
    {
        public scene : ui.view.BulletNodeUI;
        public speed_running:number = 15;
        public speed_x:number = 0.1;
        public speed_y:number = 0.1;
        public bullet_state:number = 0; // 0未开启 1 活跃中 2 死亡 3 安全期
        public bullet_id :number = -1;
        public attack:number = 1;
        public bulletType:string = null;
        public m_type:number = 0; // 0普通子弹 1 追踪弹
        public TIME :number = 1;
        public angle:number = 0; // 追踪弹的方向
        public enemy_js: any = null;
        public safe_distance:number = 60;
        public safe_distance_start:number = 0;
        public bz_ani:boolean=false;
        public box_posit:any = {};
        public registerEvent():void {
                 
        }
        public unregisterEvent():void
        {
        }
        public init() 
        {
            this.scene = new ui.view.BulletNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 12;
            this.safe_distance = 60;
            this.point_zero = new Laya.Point(0,0);
            this.box_posit = {};
        }
        /**
         * 获取位置信息
         */
        // public pos_data:any ={};
        // public getPos():any
        // {
        //     this.pos_data.x = this.scene.x - this.scene.img_bullet.width/2;
        //     if (this.bullet_state == 1 ) {
        //         this.pos_data.y = this.scene.y - this.scene.img_bullet.height/2;
        //     }else {
        //         this.pos_data.y = -200;
        //     }
        //     this.pos_data.width = this.scene.img_bullet.width;
        //     this.pos_data.height = this.scene.img_bullet.height;
        //     return this.pos_data;
        // }
        /**
         * 刷新位置
         */
        public onUpdateBoxPosit(){
            this.box_posit.x = this.scene.x - this.scene.img_bullet.width/2;
            if (this.bullet_state == 1 ) {
                this.box_posit.y = this.scene.y - this.scene.img_bullet.height/2;
            }else {
                this.box_posit.y = -1200;
            }
        }
        /**
         * 刷新UI
         */
        public onUpdateUI() 
        {
            // 刷新子弹UI
            
        }
        public point_endx :any = null;
        public point_zero:any = null; 
        public setBulletId(id:number):void {
            this.bullet_id = id;
        }
        /**
         * 开火
         */
        public old_car_path :any = null;
        public old_shadow_path :any = null;
        public old_shadow_path_old :any = null;
        public __width:number = 0;
        public __height:number = 0;
        public getCartype:number = 0;
        public change_data:any = {};
        public startFire(params:any):void
        {
            this.getCartype = 0;
            this.scene.zOrder = 11;
            this.safe_distance_start = 0;
            this.scene.img_bullet_shadow.scaleX = 1;
            this.scene.img_bullet_shadow.scaleY = 1;
            this.scene.img_bullet.scaleX = 1;
            this.scene.img_bullet.scaleY = 1;
            this.speed_running = -5//params.speed;
            this.scene.img_bullet_shadow.visible = true;
            if(params.type == "QEnemyBossBullet") {
                if (params.cartype){
                    this.getCartype = params.cartype;
                }
                this.scene.zOrder = 21;
                this.bulletType = params.type;
                this.speed_running = -3;
                this.old_shadow_path_old = "ui_bullet/p_bullet_shadow1.png";
                if (this.old_shadow_path != this.old_shadow_path_old) {
                    this.old_shadow_path = this.old_shadow_path_old;    
                    this.scene.img_bullet_shadow.skin = this.old_shadow_path;
                }
                //BOSS 子弹
            }  else {
                if (params.type != null) {
                    this.bulletType = params.type;
                    this.scene.zOrder = 9;
                } else {
                    this.bulletType = "QPlayerBullet";
                }
                this.old_shadow_path_old = "ui_bullet/p_bullet_shadow2.png";
                if (!FZUtils.isNullOrEmpty(params.bullet_data)) {
                    this.old_shadow_path_old = params.bullet_data.shadow_pic;
                }
                if (this.old_shadow_path != this.old_shadow_path_old) {
                    this.old_shadow_path = this.old_shadow_path_old;
                    this.scene.img_bullet_shadow.skin = this.old_shadow_path;
                }
                // this.scene.img_bullet_shadow.skin = this.old_shadow_path_old;
            } 
            this.m_type = params.m_type; // 路径类型
            if (params.m_type == null) {
                this.m_type = 0;
            }
            if (params.bzAni)
            {
                this.bz_ani = params.bzAni;
            }
            if (params.change_data) {
                this.change_data = params.change_data; 
            }else {
                this.change_data = {scale :1 ,move_roate: 0 ,rotating:0,zoder:0};
            }                
            this.scene.zOrder = 11 + this.change_data.zoder;

            if (this.m_type == 0) {
                // 特殊大小
                // var P_S = [[1],[1,1],[1,1.1,1], [1, 1.1, 1.1, 1],[1, 1.1, 1.1 ,1.1, 1], [1, 1, 1.1 ,1.1, 1, 1]];
                this.scene.img_bullet_shadow.scaleX = this.change_data.scale;
                this.scene.img_bullet_shadow.scaleY = this.change_data.scale;
                this.scene.img_bullet.scaleX = this.change_data.scale;
                this.scene.img_bullet.scaleY = this.change_data.scale;
                // this.scene.img_bullet.
            }else if (this.m_type == 1) {
                
                // 追踪弹
                this.angle = 0; 
            }
            this.scene.ani_effect_1.visible = false;
            if (this.m_type == 2) {
                this.scene.ani_effect_1.visible = true;
                this.m_type =0;    
            }
            // 切换图片
            if (this.old_car_path != params.bulletModel) {
                this.old_car_path = params.bulletModel
                this.scene.img_bullet.skin = this.old_car_path;
            }
            
            if (params.rotation != null) {
                this.scene.rotation = params.rotation;
                this.__width =this.scene.width;
                this.__height =this.scene.height;
            }else {
                this.__width =this.scene.width;
                this.__height =this.scene.height;
                this.scene.rotation = 0;
            }
            this.scene.x = params.x;
            this.scene.y = params.y;
            this.onUpdateBoxPosit();
            this.box_posit.width = this.scene.img_bullet.width;
            this.box_posit.height = this.scene.img_bullet.height;

            this.attack = params.bulletInjure;
            this.speed_x = Math.sin(this.scene.rotation * (Math.PI/180))*(FZGameData.instance.getMapSpeed() - this.speed_running);
            this.speed_y = Math.cos(this.scene.rotation * (Math.PI/180))*(FZGameData.instance.getMapSpeed() - this.speed_running);
            
            this.change_data.pos_y = Math.sin(this.scene.rotation * (Math.PI/180))*(this.change_data.move_roate/2);
            this.change_data.pos_x = Math.cos(this.scene.rotation * (Math.PI/180))*(this.change_data.move_roate/2);




            this.TIME = FZGameData.instance.game_running_time;
            if (FZGameData.instance.game_stop == true) {
                this.TIME = FZGameData.instance.game_stop_time;
            }
            this.scene.visible = true;
            this.bullet_state = 1;
            // 判断结束位置
            this.pos_end = (this.parentNode as Laya.Sprite).globalToLocal(new Laya.Point(0,0));

            this.scene.img_bullet.rotation = 0;
            if(this.change_data.rotating != 0) {
                Laya.timer.loop(30, this, function(){
                    this.scene.img_bullet.rotation = this.scene.img_bullet.rotation + 4;
                })
            }
            this.onUpdateBoxPosit();
        }
        /**
         * 刷新结束位置
         */
        public onUpdatePosEnd():void
        {
            this.pos_end = (this.parentNode as Laya.Sprite).globalToLocal(new Laya.Point(0,0));
        }

        /**
         * 游戏死亡
         */
        public onGameResurrect() 
        {
            if (this.scene.visible == true){    
                Laya.timer.frameOnce(1, this, function(){
                    this.playDeathAni();
                });
            }
        }

        /**
         * 游戏成功
         */
        public onGameWin():void {
            if (this.scene.visible == true){    
                this.playDeathAni();
            }
        }

        /**
         * 游戏结束
         */
        public onGameOver() {
            if (this.scene.visible == true) {
                this.bullet_state = 0;
                this.onUpdateBoxPosit();
                FZGameData.instance.killPoolNodeList(this);
            }
        }
        /**
         *  结束子弹
         */
        public onkill():void{     
            Laya.timer.clearAll(this);
            this.enemy_js = null;       
            this.m_type = null;
            this.bullet_id = -1;
            this.bulletType = null;  
            this.scene.visible = false;
            this.scene.img_bullet.visible = true;
            this.scene.img_bullet_shadow.visible = true;
            
            this.bullet_state = 0;
            this.onUpdateBoxPosit();
            // FZDebug.D("子弹销毁------------------------------------------------------------");
        }
        /**
         * 播放爆炸特效
         */
        public playDeathAni():void
        {
            this.bullet_state = 2;
            this.onUpdateBoxPosit();
            this.scene.img_bullet.visible = false;
            this.scene.img_bullet_shadow.visible = false;
            
            if(this.bz_ani && (this.bulletType == "FZFeiXingQiBullet_left" || this.bulletType == "FZFeiXingQiBullet_right"))
            {
                FZGameData.instance.playExplosion({type:2,x:this.scene.x + this.scene.img_bullet.x, y:this.scene.y + this.scene.img_bullet.y});
                // Laya.timer.once(1000, this, function(){
                    FZGameData.instance.killPoolNodeList(this);
                // })
            }
            else
            {
                FZGameData.instance.playExplosion({type:1,x:this.scene.x + this.scene.img_bullet.x, y:this.scene.y + this.scene.img_bullet.y});
                // Laya.timer.once(300, this, function(){
                    FZGameData.instance.killPoolNodeList(this);
                // })
            }            
            
        }
        /**
         * 碰撞到敌人
         */
        public onHit():void
        {
            if (this.scene.visible == true && this.bullet_state == 1) {
                this.scene.zOrder = 20;
                this.playDeathAni();      
            }
        }
        /**
         * 刷新位置
         */
        public UpdatePos():void {
            if (this.scene.visible == false){
                return
            }
            if (this.m_type == 1) {
                this.onTrackMove();
                return
            }
            if (this.bullet_state == 1) {
                this.scene.y  -= (this.speed_y - this.change_data.pos_y)* FZGameData.instance.getGameTime();
                this.scene.x  += (this.speed_x + this.change_data.pos_x)* FZGameData.instance.getGameTime();
                this.onUpdateBoxPosit();
            }
            if(this.bullet_state == 2) {
                // this.scene.y  += this.speed_y * FZGameData.instance.getGameTime();
                // this.scene.x  += this.speed_x * FZGameData.instance.getGameTime();
                this.onUpdateBoxPosit();
            }
        }
         /**
         * 判断是否移出屏幕 
         */
        public onJudgeOutScreen(){
            if (this.bullet_state != 1){
                return
            }
            this.onJudgeRemove();
        }
        /**
         * 导弹逻辑
         */
        public onTrackMove():void
        {
            if (this.scene.visible == false){
                return
            }
            if (this.bullet_state == 1) {
                // 计算当前位置与目标位置的角度
                let ang = this.getlookAngle();           
                // 当前位置到目标位置的两个方案顺时针和逆时针
                let r1 = (ang - this.angle);
                let r2 = 360 - Math.abs(r1);
                r2 = this.angle > ang ? r2 : -r2;
                // 选择一个最近的方案
                let opt =  Math.abs(r1) < Math.abs(r2) ? r1 : r2;
                // 如果这个方案的偏转角度大于 3 度
                if (Math.abs(opt) > 3) {
                    // 最多只允许偏转3度
                    this.angle = opt > 0 ? this.angle + 3 : this.angle - 3;
                } else {
                    this.angle = ang;
                }
                this.scene.rotation = this.angle;
                this.speed_x = Math.sin(this.scene.rotation * (Math.PI/180))* (FZGameData.instance.getMapSpeed() - this.speed_running);
                this.speed_y = Math.cos(this.scene.rotation * (Math.PI/180))* (FZGameData.instance.getMapSpeed() - this.speed_running);
                this.scene.x += this.speed_x * FZGameData.instance.getGameTime();
                this.scene.y -= this.speed_y * FZGameData.instance.getGameTime();
            }
            if(this.bullet_state == 2) {
                // this.speed_x = Math.sin(this.scene.rotation * (Math.PI/180)) * (FZGameData.instance.getMapSpeed() - this.speed_running);
                // this.speed_y = Math.cos(this.scene.rotation * (Math.PI/180)) * (FZGameData.instance.getMapSpeed() - this.speed_running);
                // this.scene.y  += this.speed_y * FZGameData.instance.getGameTime();
                // this.scene.x  += this.speed_x * FZGameData.instance.getGameTime();
            }
            this.onUpdateBoxPosit();
        }
        /**
         * 判断是否超出屏幕 
         */
        public pos_end:any = null;
        public onJudgeRemove(){    
            if (this.scene.y <= this.pos_end.y || this.scene.y > 2000) {
                this.bullet_state = 0;
                this.onUpdateBoxPosit();
                FZGameData.instance.killPoolNodeList(this);
            }
        }

        /**
         * 获得角度
         */
        public getlookAngle():any
        {
            // 获取目标 
            if (this.enemy_js != null && FZGameData.instance.judgeEnemyDeath(this.enemy_js) == 1) {
                // 存在目标点
                var rota = FZUtils.getAngle(this.scene.x , this.scene.y , this.enemy_js.scene.x, this.enemy_js.scene.y);
                return rota;
            } else {
                // 重新选定目标
                var data :any = FZGameData.instance.getEnemyNearly();
                if (data == -1){
                    this.enemy_js = null;
                    // 没有目标
                    return 0;
                } else {
                    this.enemy_js = data;
                    // 存在目标
                    var rota = FZUtils.getAngle(this.scene.x , this.scene.y , data.scene.x, data.scene.y);
                    return rota;
                }
            }
        }
    }
}
export default game.view.FZBullet;
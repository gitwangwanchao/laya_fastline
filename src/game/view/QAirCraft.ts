import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QDebug from "../../framework/QDebug";
import QBaseNode from "../core/QBaseNode";
import { ui } from "../../ui/layaMaxUI";
import QGameData from "../data/QGameData";
import QCfgMgr from "../core/QCfgMgr";
import QSoundMgr from "../core/QSoundMgr";
namespace game.view
{
    export class QAirCraft extends QBaseNode{
        public scene : ui.view.AirCraftUI;
        public m_type : number = 0; //1导弹、2追踪火箭、3机关枪、4激光切割机、5治疗
        public state:number = 0;
        public m_time:number = 0;
        public falg:string = "left";
        public bullet_pos: Laya.Point;
        
        public registerEvent():void
        {
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_STOP,this.onGameStop,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_RUNNING,this.onGameRunning,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_DATA, this.onUpdata, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_FIRE, this.startFire, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_FAIL, this.gameOver, this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_WIN,this.onGameWin,this);
            QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onGameWin, this);

            // QEventMgr.instance.register(QEventType.GAME_VIEW_GAME_PLAY_WIN_ANIMATION, this.onPlayWinAnimation, this);
        }
        public unregisterEvent():void
        {
            QDebug.D("QAirCraft 销毁-------------------------------------------");
            // QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_PLAY_WIN_ANIMATION, this.onPlayWinAnimation, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_STOP,this.onGameStop,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_RUNNING,this.onGameRunning,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_DATA, this.onUpdata, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_UPDATE_AIRCRAFT_FIRE, this.startFire, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_FAIL, this.gameOver, this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_WIN,this.onGameWin,this);
            QEventMgr.instance.unregister(QEventType.GAME_VIEW_GAME_PLAY_GAME_OVER,this.onGameWin, this);
            
        }
        public init() {
            this.scene = new ui.view.AirCraftUI();
            this.scene.img_aircraft_fire.visible = false;
            this.scene.visible = false;
            this.m_time = 0;
        }
        
        public setParam(value:any) {
            this.falg = value;
            QDebug.D("setParams ======  "  + this.falg);
        }
        public setBulletPosition(pos:any) 
        {
            this.scene.x = pos;
        }
        /**
         * 设置数据
         * {path: "ui_aircraft/p_aircarft_3.png", m_type :1, m_time:1000, bulletModel: "ui_aircraft/p_missile_1.png",speed: 20, bulletInjure : 50, bullet_count:2} // 导弹
         * {path: "ui_aircraft/p_aircarft_1.png", m_type :2, m_time:130, bulletModel: "ui_bullet/p_bullet_1.png",speed:20, bulletInjure:10, bullet_count:1}; // 机关枪
         * {path: "ui_aircraft/p_aircarft_4.png", m_type :3, m_time:1500, bulletModel: "ui_aircraft/p_missile_2.png",speed:15, bulletInjure:100, bullet_count:1 , bullet_type:1};//追踪弹
         * {path: "ui_aircraft/p_aircarft_9.png", m_type :4, m_time:1000, bulletModel: "ui_aircraft/p_missile_6.png",speed:20, bulletInjure:100, bullet_count:3}; // 转盘
         * {path: "ui_aircraft/p_aircarft_2.png", m_type :5, m_time:10, bulletInjure:1}; // 激光
         *  "1": {"drone_id": 1,"drone_name": "gun","bulletNumber": 1,"fireFrequency": 130,"type": 1,
        "mainWeaponModel": "ui_aircraft/p_aircarft_1.png",
        "bullet": 9,
        "damage_grow": 1,
        "lv_upper": 100,
        "cash_basic": 75,
        "cash_index": 1.175,
        "diamond_index": 1.175,
        "lvup_diamond": "5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95"
    },
         */
        public baseUavData :any = null;
        public bullet_data :any = null;
        public onUpdata(): void
        {
            QDebug.D("飞行器 = " + QGameData.instance.player_aircraft);
            QGameData.instance.player_aircraft = QGameData.instance.getCurUseUAV();
            if (QGameData.instance.player_aircraft == -1){
                return;
            }
            this.scene.visible = true;
            var UAVData = QGameData.instance.getUAVData();
            var cur_level = UAVData[QGameData.instance.player_aircraft + ""];
            let curIdUavData = QCfgMgr.instance.getUAVWeaponsById(QGameData.instance.player_aircraft);
            if (curIdUavData == null || curIdUavData == undefined || (typeof (curIdUavData) == "string" && curIdUavData == ""))
			{
				return;
			}
            
            this.baseUavData = curIdUavData["1"];
            QDebug.D("无人机的数据--baseUavData-------------" + JSON.stringify(this.baseUavData));
            this.bullet_data = curIdUavData[cur_level+""]; // {path: "ui_aircraft/p_aircarft_4.png", m_type :3, m_time:1500, bulletModel: "ui_aircraft/p_missile_2.png",speed:15, bulletInjure:100, bullet_count:1 , bullet_type:1};//追踪弹
            QDebug.D("无人机的数据--bullet_data-------------" + JSON.stringify(this.bullet_data));
            var bulletdata = QCfgMgr.instance.getBulletList(this.baseUavData.Bullet);            
            this.bullet_data.bulletdata = bulletdata;

            //this.bullet_data.bulletdata.bullet_damage1 = bulletdata.bullet_damage + cur_level * this.bullet_data.damage_grow;
            this.bullet_data.bulletdata.bullet_damage1 = Math.ceil(this.bullet_data.Dps/(1000/this.baseUavData.FireFrequency)/(this.baseUavData.BulletNumber*2));
            // 类型 m_type  导弹、追踪火箭、机关枪、激光切割机、治疗
            this.scene.img_aircraft.skin = this.baseUavData.Model;
            this.scene.img_aircraft_shadow.skin = this.baseUavData.Model;
            this.scene.img_aircraft_shadow.filters = [QGameData.instance.blackFilter];
            this.scene.img_aircraft_shadow.visible = false;
            this.m_type = this.baseUavData.type;
            this.state = 0;
            QDebug.D("无人机的数据--baseUavData-------------" + JSON.stringify(this.baseUavData));
            this.m_time = this.baseUavData.FireFrequency;
            this.scene.img_laser_flare.visible = false;
            QDebug.D("飞行器--------this.m_time--------------------------+ " + this.m_time);
        }
        /**
         * 开火
         */
        public startFire(): void  
        {
            if(this.scene.visible == true) {
                this.scene.img_aircraft_fire.visible = false;
                this.enterFireState();
            }
        }    

        public enterFireState():void {
            
            Laya.timer.clearAll(this);
            if (this.m_type == 5) {
                this.scene.img_laser_flare.visible = true;
                // 激光
                Laya.timer.loop(this.m_time, this, function(){
                    if (this.state == 1) {
                        this.onJudgePos();
                    }
                })
            } else {
                Laya.timer.loop(this.m_time, this, function(){
                    if (this.state == 1) {
                        // QDebug.D("循环----------------------------------");
                        this.scene.img_aircraft_fire.visible = true;
                        this.scene.play_aircraft_fire.play(0,false);
                        if (this.m_type == 1 || this.m_type == 2 || this.m_type == 3) {
                            // 1  导弹 2 机关枪 3 追踪弹
                            for (var i = 0; i < this.baseUavData.BulletNumber; i++) {
                                this.startBulletFire(i);
                            }
                        }else if (this.m_type == 4) {
                            for (var i = 0; i < this.baseUavData.BulletNumber; i++) {
                                this.startMissileFire(i);
                            }
                        }
                    }
                });
            }
        }
        /**
         *  创建子弹
         */
        public startBulletFire(index):void 
        {
            var bullet_js = QGameData.instance.getBulletPool(0); 
            index = QGameData.instance.getWeaposX(index, this.baseUavData.BulletNumber);
            var bullet_pos = (this.scene.parent as Laya.Sprite).x - (this.scene.parent as Laya.Sprite).width/2 + this.scene.x;
            this.position = {x:bullet_pos + index, y:(this.scene.parent as Laya.Sprite).y ,
                 type: "QAirCraftBullet_" + this.falg, speed: this.bullet_data.bulletdata.bulletSpeed,
                 bzAni  : this.baseUavData.type == 2,
                 bulletInjure : this.bullet_data.bulletdata.bullet_damage1, bulletModel: this.bullet_data.bulletdata.bullet_pic , m_type: this.bullet_data.bulletdata.bullet_type, direction:this.falg};
            bullet_js.startFire(this.position);
        }
        /**
         * 创建轮盘
         */
        public RotaList = [-5,0,5];
        public position :any ={};
        public startMissileFire(___index):void{
            var bullet_js = QGameData.instance.getBulletPool(0); 
            var index = QGameData.instance.getWeaposX(___index, this.baseUavData.BulletNumber);
            var bullet_pos = (this.scene.parent as Laya.Sprite).x - (this.scene.parent as Laya.Sprite).width/2 + this.scene.x;
            this.position = {x:bullet_pos + index, y:(this.scene.parent as Laya.Sprite).y ,
                 type: "QAirCraftBullet_" + this.falg, speed: this.bullet_data.bulletdata.bulletSpeed,
                 bulletInjure : this.bullet_data.bulletdata.bullet_damage1, bulletModel: this.bullet_data.bulletdata.bullet_pic , 
                 m_type: this.bullet_data.bulletdata.bullet_type ,rotation: this.RotaList[___index]};
            bullet_js.startFire(this.position);
        }
        /**
         * 游戏暂停
         */
        onGameStop():void{
            this.state = 2;
            this.scene.play_aircraft_fire.stop();
            this.scene.img_aircraft_fire.visible = false;
        }
        /**
         * 游戏运行中
         */
        onGameRunning():void
        {
            this.state = 1;
            this.scene.img_aircraft_fire.visible = false;   
            
        }
        /**
         * 胜利动作
         */
        public onPlayWinAnimation(){
            this.onGameWin();
        }
        /**
         * 游戏结束
         */
        public gameOver() {
            this.state = 2;
            //this.closeSound();
            Laya.timer.clearAll(this);
            this.scene.play_aircraft_fire.stop();
            this.scene.img_aircraft_fire.visible = false;
        }
        /**
         * 游戏胜利
         */
        public onGameWin() {
            this.state = 2;
            Laya.timer.clearAll(this);
            //this.closeSound();
            this.scene.play_aircraft_fire.stop();
            this.scene.img_aircraft_fire.visible = false;
            this.scene.visible = false;
        }

        /**
         * 关闭所有音效
         */
        public closeSound() {
            //QSoundMgr.instance.stopSfx(QSoundMgr.instance.soundInfo_wav.plane_laserLoop);
        }

        /**
         * 发送判断事件
         */
        public judgepos :any = {};
        public pos_old:any ={};
        public onJudgePos():void 
        {
            if (this.scene.visible != true) {
                return;
            }
            
            this.judgepos.x = this.scene.x - this.scene.img_laser_flare.width/2;
            this.judgepos.y = this.scene.y - this.scene.img_laser_flare.height;
            this.pos_old = (this.scene.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.judgepos.x, this.judgepos.y));
            this.pos_old =  (this.scene.parent.parent as Laya.Sprite).globalToLocal(this.pos_old);
            this.judgepos.x = this.pos_old.x;
            this.judgepos.y = this.pos_old.y;
            this.judgepos.width = this.scene.img_laser_flare.width;
            this.judgepos.height = this.scene.img_laser_flare.height;
            this.judgepos.id = "LASER_FLARE_Bullet";
            this.judgepos.attack = this.bullet_data.bulletdata.bullet_damage1;
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_JUDGE_BULLET_POS, this.judgepos);
        }
    }
}
export default game.view.QAirCraft;
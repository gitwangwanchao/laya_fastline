import QBaseNode from "../../core/QBaseNode";
import { ui } from "../../../ui/layaMaxUI";
import QGameData from "../../data/QGameData";
import QDebug from "../../../framework/QDebug";
namespace game.view
{
    export class QSkills extends QBaseNode
    {
        public scene : ui.view.wheelNodeUI;
        public skillstate :any = 0; //
        public skillspeed:any = {"1": 25, "2": 20, "3": 40};
        public skill1speed:any = 10;
        public skilltype:any = 0;
        public attack:number = 0;
        public registerEvent():void {
                 
        }
        public unregisterEvent():void
        {
        }

        public init() 
        {
            this.scene = new ui.view.wheelNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 1000;
            this.skillstate = 0;
            this.box_posit ={};
           
        }
        /**
         * 刷新位置
         */
        public box_posit:any ={};
        public onUpdateBoxPosit(){
            this.box_posit.x = this.scene.x - this.img_box.width/2;
            this.box_posit.y = this.scene.y - this.img_box.height/2;
        }

        /**
         * 获取位置信息
         */
        public pos_data:any ={};
        public img_box:any = null;
        // public getPos():any
        // {
        //     this.pos_data.x = this.scene.x - this.img_box.width/2;
        //     this.pos_data.y = Math.ceil(this.scene.y - this.img_box.height/2);
        //     this.pos_data.width = this.img_box.width;
        //     this.pos_data.height = this.img_box.height;
        //     return this.pos_data;
        // }
        
        /**
         * 播放技能
         * @param params 
         * type 1003 轮胎
         * type 1002 滚筒
         * type 1004 导弹
         */
        public playSkill(params:any):void
        {
            this.scene.box_warning.alpha = 0;
            this.scene.x = this.getPosX(params.x);
            this.scene.y = params.y;
            this.skillstate = 1;
            this.skilltype = params.skilltype;
            this.scene.visible = true;
            this.scene.animation_d.visible = true;
            this.scene.animation_run.visible = true;
            this.scene.img_skill_1.visible = false;
            this.scene.img_skill_2.visible = false;
            this.scene.img_box_3.visible = false;
            QDebug.D("播放技能----------------------" + JSON.stringify(params));
            if (this.skilltype == 1003) {
                this.pos_end =  (this.getPosX(QGameData.instance.getQPlayerCarPos().x) - this.getPosX(params.x))/100;
                this.img_box = this.scene.img_box_1;
                this.attack = params.dps;
                this.updatePosState = 1;
                this.scene.img_skill_1.visible = true;
                this.playSkill1();
            }else if (this.skilltype == 1002) {
                this.scene.img_skill_2.visible = true;
                this.img_box = this.scene.img_box_2;
                this.attack = params.dps;
                this.playSkill2();
            }else if (this.skilltype == 1004) {
                this.skillstate = 3;
                this.scene.y = 0;
                this.scene.x = this.getPosX(QGameData.instance.getQPlayerCarPos().x);
                this.img_box = this.scene.img_box_3;
                this.scene.img_box_3.visible = true;
                this.attack = params.dps;
                this.playSkill3();
            }
            this.box_posit.width = this.img_box.width;
            this.box_posit.height = this.img_box.height;
        }
        public getPosX(posx){
            var car_pos = QGameData.instance.car_pos;
            for (var i = 0;i < car_pos.length; i++){
                if (posx <=  car_pos[i]+77) {
                    return car_pos[i];
                }
            }
        }
        //= [96, 239, 382, 525, 668]
        /**
         * 播放技能1 轮胎
         */
        public playSkill1():void 
        {   
            this.scene.animation_d.visible = true;
            this.scene.animation_d.play(0, false);
            Laya.timer.frameOnce(120, this, function(){
                this.updatePosState = 2;
                this.scene.animation_run.visible = true
                this.scene.animation_run.play(0, true);
            })
        }
        /**
         * 刷新位置
         */
        public UpdatePos():void {
            if (this.skillstate != 1 || this.scene.visible == false){
                return
            }
            QDebug.D("UpdatePos刷新技能 位置-------Y   = " + this.scene.y);
            if (this.skilltype == 1003) {
                this.skill1UpdatePos();
            } else if (this.skilltype == 1002) {
                this.skill2UpdatePos();
            } else if (this.skilltype == 1004) {
                this.skill3UpdatePos();
            }
            this.onUpdateBoxPosit();
        }
        
        /**
         *  技能1 位置刷新
         */
        public updatePosState:any = 1;
        public skill1UpdatePos(){
            if (this.updatePosState == 1) {
                // 爆炸
                this.scene.y += this.skill1speed * QGameData.instance.getGameTime();
                // this.pos_end 
            }else if (this.updatePosState == 2) {
                this.scene.y += this.skillspeed["1"] * QGameData.instance.getGameTime();
            }
        }
        public skill3UpdatePos() {
            if (this.skillstate == 1){
                this.scene.y += this.skillspeed["3"] * QGameData.instance.getGameTime();
            }
        }
         /**
         * 判断是否移出屏幕 
         */
        public onJudgeOutScreen(){
            if (this.skillstate != 1){
                return
            }
            this.onJudgeRemove();
        }
        /**
         * 判断是否超出屏幕 
         */
        public pos_end:any = null;
        public onJudgeRemove(){    
            if (this.scene.y > 2000) {
                this.skillstate = 0;
                QGameData.instance.killSkillPoolList(this);
            }
        }

         /**
         *  技能2 位置刷新
         */
        public skill2UpdatePos(){
            // 爆炸
            this.scene.y += this.skillspeed["2"] * QGameData.instance.getGameTime();
        }

        /**
         * 播放技能2 滚筒
         */
        public playSkill2():void
        {
            this.scene.ani3.play(0, true);
        }
        /**
         * 播放技能3 导弹
         */
        public playSkill3():void
        {
            this.scene.ani_warning.play(0,false);
            Laya.timer.once(1000, this, function(){
                this.skillstate = 1;
            })
        }

        public onkill():void 
        {
            if (this.skillstate != 0) {
                this.skillstate = 0;
                this.scene.visible = false;
            }
        }

        public onHit():void 
        {
           if (this.skillstate == 1) {
                this.skillstate = 2;
                this.scene.img_skill_1.visible = false;
                this.scene.img_skill_2.visible = false;
                this.scene.img_box_3.visible = false;
                this.scene.ani_explosion.play(0,false);
                Laya.timer.once(1000, this, function(){
                    QGameData.instance.killSkillPoolList(this);    
                })
           }
        }
        public onGameOver() {
            QGameData.instance.killSkillPoolList(this);    
        }
    }
}
export default game.view.QSkills;
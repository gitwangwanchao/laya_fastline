import QBaseNode from "../core/QBaseNode";
import { ui } from "../../ui/layaMaxUI";
import QMergeData from "../data/QMergeData";
namespace game.view
{
    export class QDBullet extends QBaseNode
    {
        public scene : ui.view.DBulletNodeUI;
      
        public registerEvent():void {

        }

        public unregisterEvent():void {
           
        }
        public init() :void {
            this.scene = new ui.view.DBulletNodeUI();
            this.scene.visible = false;
            this.scene.zOrder = 12;
        }
        public change_data:any = null;
        public old_car_path:any = null;
        public speed_x: any = null;
        public speed_y: any = null;
        public pos_end: any = null;
        public startFire(params):void
        {
            // 子弹数据
            if (params.change_data) {
                this.change_data = params.change_data; 
            }else {
                this.change_data = {scale :1 ,move_roate: 0 ,rotating:0,zoder:0}
            }     
            this.scene.zOrder = 12 + this.change_data.zoder;
            this.scene.scaleX = 1.5;
            this.scene.scaleY = 1.5;
            // 特殊大小
            this.scene.img_icon_shadow.scaleX = this.change_data.scale;
            this.scene.img_icon_shadow.scaleY = this.change_data.scale;
            this.scene.img_icon.scaleX = this.change_data.scale;
            this.scene.img_icon.scaleY = this.change_data.scale;
            // 切换图片
            if (this.old_car_path != params.bulletModel) {
                this.old_car_path = params.bulletModel
                this.scene.img_icon.skin = this.old_car_path;
                this.scene.img_icon_shadow.skin = params.shadow_pic;
            }
            if (params.rotation != null) {
                this.scene.rotation = params.rotation;
            }else {
                this.scene.rotation = 0;
            }
            this.scene.x = params.x;
            this.scene.y = params.y;
            this.speed_x = Math.sin(this.scene.rotation * (Math.PI/180))*(10);
            this.speed_y = Math.cos(this.scene.rotation * (Math.PI/180))*(10);
            this.change_data.pos_y = Math.sin(this.scene.rotation * (Math.PI/180))*(this.change_data.move_roate/2);
            this.change_data.pos_x = Math.cos(this.scene.rotation * (Math.PI/180))*(this.change_data.move_roate/2);
            this.scene.visible = true;
            // 判断结束位置
            this.pos_end = (this.parentNode as Laya.Sprite).globalToLocal(new Laya.Point(0,0));
            this.scene.img_icon.rotation = 0;
            if(this.change_data.rotating != 0) {
                Laya.timer.loop(30, this, function(){
                    this.scene.img_icon.rotation = this.scene.img_icon.rotation + 4;
                })
            }
        }
         /**
         * 刷新位置
         */
        public UpdatePos():void {
            if (this.scene.visible == false){
                return
            }
            this.scene.y  -= (this.speed_y - this.change_data.pos_y);
            this.scene.x  += (this.speed_x + this.change_data.pos_x);
            if(this.scene.y <= 50) {
                QMergeData.instance.killDBulletPool(this);
            }
        }
        public onkill(){
            Laya.timer.clearAll(this);
            this.scene.visible = false;
        }
    }
}
export default game.view.QDBullet;
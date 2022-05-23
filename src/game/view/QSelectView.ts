import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QUIMgr from "../core/QUIMgr";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QDebug from "../../framework/QDebug";
import QGameData from "../data/QGameData";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QSavedDateItem from "../data/QSavedDateItem";
import QSoundMgr from "../core/QSoundMgr";
import QSceneMgr from "../core/QSceneMgr";

namespace game.view
{
    export class QSelectView extends QBaseUI
    {
        public scene : ui.view.ShowSelectViewUI;

        private carConfig:any;
        private listCarData:Array<any> = new Array<any>();
        private listCarEntity:Array<any> = new Array<any>();
        private listCarPos:Array<any> = new Array<any>();
        private curSelectCarIndex:number = 0;
        private curCarMaxLevel: number = 1;
        private curUsedCarLevel: number = 1;

        private canMove:boolean = false;
        private start_x: number;
        private target_x: number;
        private max_x: number = 250;
        private min_x: number = 0;

        private mianWeaponLevel: number = 1;
        private baseMainWeaponData: any;
        
        private blackFilter:any;
        private restoreColor:any;

        public registerEvent() : void
        {
            
        }

        public unregisterEvent() : void   
        {
            this.scene.show_car_container.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.show_car_container.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.scene.show_car_container.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.show_car_container.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
        }

        onMouseDown(event){
            this.canMove = true;
            this.start_x = event.stageX;
        }
        
        onMouseUp(event){
            if (this.canMove != true) {
                this.canMove = false;
                return;
            }

            this.updateShow(this.target_x);
            this.scene.list_container.x = this.listCarPos[this.curSelectCarIndex];

            if (this.scene.list_container.x > this.max_x) {
                this.scene.list_container.x = this.max_x
            }

            this.canMove = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseOut(event){
            if (this.canMove != true) {
                this.canMove = false;
                return;
            }
            
            this.updateShow(this.target_x);
            this.scene.list_container.x = this.listCarPos[this.curSelectCarIndex];

            if (this.scene.list_container.x > this.max_x) {
                this.scene.list_container.x = this.max_x
            }

            this.canMove = false;
            let stage_x = event.stageX, stage_y = event.stageY;
        }

        onMouseMove(event){
            if (this.canMove != true) {
                return;
            }
            let stage_x = event.stageX;
            let off_x = stage_x - this.start_x;
            this.start_x = stage_x;
            let taget_x = this.scene.list_container.x;
            if (this.scene.list_container.x >= this.max_x && off_x > 0) {
                taget_x = this.max_x;
            } else if (this.scene.list_container.x <= this.min_x && off_x < 0) {
                taget_x = this.min_x;
            } else {
                taget_x+=off_x;
            }
            this.scene.list_container.x = taget_x;
            
            this.target_x = taget_x;
        }

        private updateShow(x: number){
            if (x >= this.max_x) {
                this.curSelectCarIndex = 0;
            } else {
                let len = this.listCarPos.length;
                for (let i = 1; i < len; i++) {
                    // pos_0 < pos_1
                    let pos_0 = this.listCarPos[i];
                    let pos_1 = this.listCarPos[i-1];
                    if (x >= pos_0 && x < pos_1) {
                        if (Math.abs((x - pos_0)) >= Math.abs((x - pos_1))) {
                            this.curSelectCarIndex = i-1;
                        } else {
                            this.curSelectCarIndex = i;
                        }
                        break;
                    }
                }
            }
            
            // console.log("curSelectCarIndex = "+this.curSelectCarIndex);
            let len = this.listCarData.length;
            for (let i = 0; i < len; i++) {
                let car = this.listCarEntity[i];
                let _scale = (this.curSelectCarIndex == i) ? 2 : 1;
                car.scaleX = _scale;
                car.scaleY = _scale;
            }

            let carBattleData = QCfgMgr.instance.getCarInfoById(this.curSelectCarIndex+1);
            let mainWeaponData = QCfgMgr.instance.getMainWeapons(carBattleData.mainWeaponId);
            if (mainWeaponData) {
                let bullteData = QCfgMgr.instance.getBulletList(mainWeaponData.bullet);
                //this.scene.lbl_sh_value.text = Math.round(mainWeaponData.damage/mainWeaponData.fireFrequency*1000)+"";
                //this.scene.lbl_sh_value.text = mainWeaponData.showTips;
                // this.scene.lbl_sh_value.text = this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage*(this.curSelectCarIndex+1)*3+"";
                this.scene.lbl_sh_value.text = (this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + mainWeaponData.sDps) * 3+"";
                this.scene.lbl_hj_value.text = carBattleData.carHp+"";
            }

            let curSelectCarData = this.listCarData[this.curSelectCarIndex];
            this.scene.lblCarName.text = "Lv." + curSelectCarData.level + " " + curSelectCarData.name;
            
            if (this.curSelectCarIndex == (this.curUsedCarLevel - 1)) {
                this.scene.btn_select.visible = false;
                this.scene.lblDes.visible = true;
                this.scene.lblDes.text = "当前正在使用";
            } else {
                if (this.curSelectCarIndex <= (this.curCarMaxLevel - 1)) {
                    this.scene.btn_select.visible = true;
                    this.scene.lblDes.visible = false;   
                } else {
                    this.scene.btn_select.visible = false;
                    this.scene.lblDes.visible = true;
                    this.scene.lblDes.text = "完成一次合成后解锁";
                }
            }

            if (QDebug.isDebug) {
                let carInfo = QCfgMgr.instance.getCarInfoById(this.curSelectCarIndex+1);
                var weaponInfo = QCfgMgr.instance.getMainWeapons(carInfo.mainWeaponId);
                var bulletInjure = (this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + weaponInfo.sDps)/(1000/this.baseMainWeaponData[this.mianWeaponLevel.toString()].fireFrequency)/this.baseMainWeaponData[this.mianWeaponLevel.toString()].bulletNumber;
                bulletInjure = parseFloat(bulletInjure.toFixed(1));
                this.scene.lbl_dfzd_sh_value.text = bulletInjure + "";//Math.ceil((this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + weaponInfo.sDps)/(1000/weaponInfo.fireFrequency)/weaponInfo.bulletNumber) + "";
            }
        }

        public init():void
        {
            this.scene = new ui.view.ShowSelectViewUI();

            this.scene.show_car_container.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.scene.show_car_container.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.scene.show_car_container.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.scene.show_car_container.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);

            if (QUIMgr.instance.longScreen()) {
                this.scene.btn_close.y+=70;
                this.scene.lblTitle.y+=70;
            }

            QUtil.doUIPopAnim(this.scene.AnchorCenter);

            this.carConfig = QCfgMgr.instance.getRoadsideCarList();
    
            //要用滚动列表，参数需要是数组，所以这里json转成数组，且需要in这种得到key的形式。
            for(let key in this.carConfig){
                this.carConfig[key].pos = key
                this.listCarData.push(this.carConfig[key])
            }

            this.createFilter();

            this.mianWeaponLevel = QGameData.instance.getMainWeaponLevel();
            this.baseMainWeaponData = QCfgMgr.instance.getBaseMainWeapons();

            this.curCarMaxLevel = QMergeData.instance.getCarMaxLevel();
            this.curUsedCarLevel = QMergeData.instance.getCarUsedLevel()
            this.curSelectCarIndex = this.curUsedCarLevel - 1;

            this.createCarsList();
            this.createCarsPos();

            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_close, this, this.onClickBtnClose, ["btn_close"]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_select, this, this.onClickBtnSelect, ["btn_select"]);

            this.scene.lbl_dfzd_sh.visible = QDebug.isDebug;
            this.scene.lbl_dfzd_sh_value.visible = QDebug.isDebug;
            if (QDebug.isDebug) {
                let carInfo = QCfgMgr.instance.getCarInfoById(this.curUsedCarLevel);
                var weaponInfo = QCfgMgr.instance.getMainWeapons(carInfo.mainWeaponId);
                var bulletInjure = (this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + weaponInfo.sDps)/(1000/this.baseMainWeaponData[this.mianWeaponLevel.toString()].fireFrequency)/this.baseMainWeaponData[this.mianWeaponLevel.toString()].bulletNumber;
                bulletInjure = parseFloat(bulletInjure.toFixed(1));
                this.scene.lbl_dfzd_sh_value.text = bulletInjure + "";
                // this.scene.lbl_dfzd_sh_value.text = Math.ceil(weaponInfo.sDps/(1000/weaponInfo.fireFrequency)/weaponInfo.bulletNumber) + "";
            }

            tywx.BiLog.clickStat(tywx.clickStatEventType.goToTheAutoRacingInterface,[]);
        }

        private createCarsList () {
            let len = this.listCarData.length;
            for (let i = 0; i < len; i++) {
                this.createOneCar(this.listCarData[i], i);
            }
            this.scene.list_container.width = len*250;
            this.scene.list_container.x = 250-(this.curSelectCarIndex*250);
            this.min_x = 250-((len-1)*250);

            let carBattleData = QCfgMgr.instance.getCarInfoById(this.curSelectCarIndex+1);
            let mainWeaponData = QCfgMgr.instance.getMainWeapons(carBattleData.mainWeaponId);
            if (mainWeaponData) {
                let bullteData = QCfgMgr.instance.getBulletList(mainWeaponData.bullet);
                //this.scene.lbl_sh_value.text = Math.round(mainWeaponData.damage/mainWeaponData.fireFrequency*1000)+"";
                //this.scene.lbl_sh_value.text = mainWeaponData.showTips;
                
                this.scene.lbl_sh_value.text = (this.baseMainWeaponData[this.mianWeaponLevel.toString()].base_damage + mainWeaponData.sDps) * 3+"";
                this.scene.lbl_hj_value.text = carBattleData.carHp+"";
            }

            let curSelectCarData = this.listCarData[this.curSelectCarIndex];
            this.scene.lblCarName.text = "Lv." + curSelectCarData.level + " " + curSelectCarData.name;
            this.scene.btn_select.visible = false;
            this.scene.lblDes.text = "当前正在使用";
        }

        createOneCar(carData: any, index: number){
            let car = new Laya.Image(carData.path);
            
            let max_unlock_index = this.curCarMaxLevel - 1;
            let carColor = (index <= max_unlock_index) ? [this.restoreColor] : [this.blackFilter];
            car.filters = carColor;

            if (index > max_unlock_index) {
                let lock = new Laya.Image("ui_main/ui_lock_img.png");
                lock.filters = [this.restoreColor];
                lock.anchorX = 0.5;
                lock.anchorY = 0.5;
                lock.scaleX = 0.6;
                lock.scaleY = 0.6;
                lock.x = car.width/2;
                lock.y = car.height/2;
                car.addChild(lock);
            }

            car.x = index*250+125;
            car.y = this.scene.list_container.height/2;
            car.anchorX = 0.5;
            car.anchorY = 0.5;
            let _scale = (index == this.curSelectCarIndex) ? 2 : 1;
            car.scaleX = _scale;
            car.scaleY = _scale;
            this.scene.list_container.addChild(car);

            this.listCarEntity.push(car);

            /*if (index > max_unlock_index) {
                let lock = new Laya.Image("ui_main/ui_lock_img.png");
                lock.x = index*250+125;
                lock.y = this.scene.list_container.height/2;
                lock.anchorX = 0.5;
                lock.anchorY = 0.5;
                lock.scaleX = 0.5;
                lock.scaleY = 0.5;
                this.scene.list_container.addChild(lock);
            }*/
        }

        private createFilter():void{
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，黑色
		    let blackMat = [
			    0, 0, 0, 0, 0, // R
			    0, 0, 0, 0, 0, // G
			    0, 0, 0, 0, 0, // B
			    0, 0, 0, 1, 0  // A
		    ];
            this.blackFilter = new Laya.ColorFilter(blackMat);
            this.restoreColor = new Laya.ColorFilter();
        }

        createCarsPos(){
            /*
            0   1   2       3
            250 0   -250    -500
            */
            let len = this.listCarData.length;
            for (let i = 0; i < len; i++) {
                this.listCarPos.push(this.max_x - (i*250));
            }
        }

        /**
         * 
         */
        private onClickBtnSelect(param):void
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let selectLevel = this.listCarData[this.curSelectCarIndex].level;
            QMergeData.instance.setCarUsedLevel(selectLevel);
            QUIMgr.instance.removeUI(QUIMgr.UI_SelectView);
            tywx.BiLog.clickStat(tywx.clickStatEventType.clickTheSelectInRacingInterface,[]);
        }
        /**
         * 关闭界面
         */
        private onClickBtnClose():void
        {
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            QUIMgr.instance.removeUI(QUIMgr.UI_SelectView);
        }
    }
}
export default game.view.QSelectView;
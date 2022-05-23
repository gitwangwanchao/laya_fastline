import QGameConst from "../data/QGameConst";
import Transform3D = Laya.Transform3D;
import Scene3D = Laya.Scene3D;
import Sprite3D = Laya.Sprite3D;
import Vector3 = Laya.Vector3;
import MeshSprite3D = Laya.MeshSprite3D;
import Vector4 = Laya.Vector4;
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QCfgMgr from "./QCfgMgr";
import QMergeData from "../data/QMergeData";
import QUtil from "../../framework/QUtil";
import QUIMgr from "./QUIMgr";
import QGameData from "../data/QGameData";
import QDebug from "../../framework/QDebug";

module game.core
{
	export class QSceneMgr
	{
        private constructor() { }

		private static _instance: QSceneMgr;
		public static get instance(): QSceneMgr
		{
			if (QSceneMgr._instance == null)
			{
				QSceneMgr._instance = new QSceneMgr();

				if (Laya.Browser.onMiniGame)
				{
					// tywx.TuyooSDK.wechatLogin();
				}
			}
			return QSceneMgr._instance;
        }
		private pathGarageScene : string = "res/unity/LayaScene_gamesingle_garage/Conventional/gamesingle_garage.ls";
		private pathUIScene : string = "res/unity/LayaScene_uiScene/Conventional/uiScene.ls";
        public garageScene:any= null;
		public carParent:any = null;
		public role:any = null;
		public role_animator:any =null;
		public carModel:any =null;
		public Weapon_all:any = null;
        public loadScene(): void
		{
			if(Laya.Browser.onMiniGame) {
				this.pathGarageScene =Laya.Browser.window.wx.env.USER_DATA_PATH+"/v"+ tywx.SystemInfo.version + "/" + this.pathGarageScene;
				this.pathUIScene = Laya.Browser.window.wx.env.USER_DATA_PATH+"/v"+ tywx.SystemInfo.version + "/" + this.pathUIScene;
			}
			var that = this;
			Laya.timer.frameOnce(1, this, function() {
				Laya.loader.create(that.pathGarageScene, Laya.Handler.create(that, that.loadGarageSceneFinish));
			})
		}
		/**
		 * 3d 场景加载完成
		 */
		public scene_bg:any = null;
		public scene_bg_1:any = null;
		public scene_bg_2:any = null;
		public particle:any = null;
        public loadGarageSceneFinish ()
        {
			QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.GarageScene);
			QEventMgr.instance.register(QEventType.GAME_CHANGE_CUR_USE_CAR, this.changeCurUseCar, this);
			this.garageScene = Laya.loader.getRes(this.pathGarageScene) as Scene3D;
			this.garageScene.active = false;
			Laya.stage.addChild(this.garageScene);
			this.garageScene.zOrder = 0;
			var UIModelRoot = this.garageScene.getChildByName('UIModelRoot') as Laya.Sprite3D;

			this.carParent = UIModelRoot.getChildByName("CarRoot").getChildByName("CarRotate") as Laya.Sprite3D;
			// this.carParent.transform.localScale = new Vector3(0.5, 0.5, 0.5);

			var taiz = UIModelRoot.getChildByName("CarRoot").getChildByName("taizi") as Laya.MeshSprite3D;
			taiz.meshRenderer.castShadow = false;
			taiz.meshRenderer.receiveShadow = false;			
			var garageCarCamera = this.garageScene.getChildByName("GarageCarCamera") as Laya.Camera;
			QUtil.setCameraFov(garageCarCamera);

			let light = this.garageScene.getChildByName('light') as Laya.DirectionLight;
			light.transform.localRotationEuler = new Vector3(-2, light.transform.localRotationEuler.y-2, light.transform.localRotationEuler.z);
			light.intensity = 0.8;
			// light.shadow = true;
			// light.shadowDistance = 50;
			// light.shadowPCFType = 1;
			// light.shadowResolution = 1024;

			// this.particle = UIModelRoot.getChildByName("car_glow_particle");
			// this.role = this.carParent.getChildByName("RoleRoot").getChildByName("Role").getChildByName("role");
			// this.role_animator = this.role.getComponent(Laya.Animator);
			// this.role_animator.play("idle");
			this.Weapon_all = this.carParent.getChildByName("Weapon_all") as Laya.Sprite3D;
			this.carModel= [];
			for (var i=1;i <=50;i++) {
				var index :any = i;
				if (i <10) {
					index = "0"+i;
				}
				var node = this.carParent.getChildByName("Car_0" +index) as Laya.Sprite3D;
				(node as Laya.MeshSprite3D).meshRenderer.castShadow = true;
				(node as Laya.MeshSprite3D).meshRenderer.sharedMaterial.renderQueue = 2000;
				this.carModel.push(node);
			}
			this.changeCurUseCar();
			

			this.scene_bg_2 = new Laya.Image();
			this.scene_bg_2.skin = "ui_common/main_bg_1.png";
			this.scene_bg_2.right = 0;
			this.scene_bg_2.bottom = 0;
			this.scene_bg_2.scaleY = 2;
			this.scene_bg_2.scaleX = 2;
			Laya.stage.addChild(this.scene_bg_2);
			this.scene_bg_2.visible = false;
			this.scene_bg_2.zOrder = 0;


			tywx.BiLog.clickStat(tywx.clickStatEventType.onload3dScene,[]);
		}
		public isStartRotation :boolean = true;
		/**
		 * 刷新3d模型
		 */
		public changeCurUseCar(){
			let curUseCarLevel = QMergeData.instance.getCarUsedLevel();
			curUseCarLevel = Math.max(curUseCarLevel, 1);
			curUseCarLevel = Math.min(curUseCarLevel, 50);
			var car_data = QCfgMgr.instance.getCarInfoById(curUseCarLevel);
			var weapon_data = QCfgMgr.instance.getMainWeapons(car_data.mainWeaponId);				
			for (var i=1;i <=50;i++) {
				if (curUseCarLevel == i) {
					this.carModel[i-1].active = true;
					this.carModel[i-1].getChildByName("weapon").addChild(this.Weapon_all);
				}else {
					this.carModel[i-1].active = false;
				}
				this.Weapon_all.getChildByName("weapon_"+ i).active = false;
			}
			this.Weapon_all.getChildByName("weapon_"+ weapon_data.main_3dModel).active = true;

			if(this.isStartRotation)
            {
                this.isStartRotation = false;
                Laya.timer.loop(10,this,this.carRotationFun);
			}
			this.carParent.transform.localRotationEulerY = 130;

		}
		public restAnmiation() {
			// this.role_animator.play("idle");
		}
		public startGame () {
			// this.garageScene.active = true;
		}
		public setActive(value) {
			if(this.garageScene){
				this.garageScene.active = value;
				this.scene_bg_2.visible = value;
				if (value == true){
					this.isStartRotation = true;
					this.changeCurUseCar();
				} else {
					Laya.timer.clearAll(this);
				}
			}
		}
		private carRotationFun():void
        {
            this.carParent.transform.localRotationEulerY +=0.4;
		}
		
		/**
		 *加载特效
		 */  
		public initUIEffect():void
		{
			if (this.uiScene == null){
				// 加载合成车辆特效
				Laya.loader.create(this.pathUIScene, Laya.Handler.create(this, this.loadUISceneFinish));
			}
		}
		/**
		 * 加载完成特效
		 */
		public uiScene:Scene3D = null;
		public uiSceneParticle:Laya.Sprite3D = null;
		public loadUISceneFinish():void {
			this.uiScene = Laya.loader.getRes(this.pathUIScene) as Scene3D;
			var camera = this.uiScene.getChildByName('Camera') as  Laya.Camera;
			camera.orthographic = true;
			camera.orthographicVerticalSize = 12 * QUtil.getHeightWidthRatio();
			this.uiScene.active = false;
			Laya.stage.addChild(this.uiScene);
		}
	}
}
export default game.core.QSceneMgr;
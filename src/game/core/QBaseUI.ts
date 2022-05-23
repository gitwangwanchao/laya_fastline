import View = Laya.View;
import Scene = Laya.Scene;
import { ui } from "../../ui/layaMaxUI";
import QDebug from "../../framework/QDebug";
import QSequence from "../../framework/QSequence";
/**
 * UI 基类
 */
namespace game.core
{
    export class QBaseUI 
    {
		public addToStage : boolean = true;
		public dicSubUI : { [key: number] : QBaseUI } = {};

		onstructor(){}

		public start()
		{
			this.registerEvent();
			this.init();

			this.scene.width = 1200;
			this.scene.height = 1800;

			if(this.addToStage)
			{
				Laya.stage.addChild(this.scene);
			}

			this.postInit();
		}

		public destroy() : void
		{
			this.unregisterEvent();
			this.scene.offAllCaller(this.scene);
			Laya.timer.clearAll(this);
			QSequence.clearAll(this);
			QDebug.D("destroy------------------------");
			this.onDestroy();
			Laya.stage.removeChild(this.scene);
			this.scene.destroy();
			this.scene = null;
		}

		public scene : Scene;

		public setActive(isActive : boolean) : void 
		{
			this.scene.visible = isActive;
		}
		public getActive() : boolean
		{
			return this.scene.visible;
		}

		public init() : void {}
		public postInit() : void {}
		public registerEvent() : void {}
		public unregisterEvent() : void {}
		public doEnabled() : void {}
		public doDisabled() : void {}
		public onDestroy() : void {}
		public setParam(param : any) : void {}
		public createForcedGuide(param : any, idx: number):void {}
		public createSoftGuide(param : any):void {}
    }
}
export default game.core.QBaseUI;
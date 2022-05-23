
import Scene = Laya.Scene;
/**
 * 主场景
 */
namespace game.view
{
    export class QBaseNode 
    {
        constructor(){
        }
        public scene : Scene;
        public parentNode: any;
		public start()
		{
			this.registerEvent();
            this.init();
        }
        public addParent(node: any): void
        {
            this.start();
            this.parentNode = node;
            this.parentNode.addChild(this.scene);
        }
        public destroy() : void
		{
			this.unregisterEvent();
			this.scene.offAll(Laya.Event.CLICK);
            Laya.timer.clearAll(this);
            this.scene.destroy();
            this.scene = null;
        }
        
        public init() : void {}
		public registerEvent() : void {}
		public unregisterEvent() : void {}
		public doEnabled() : void {}
		public doDisabled() : void {}
		public onDestroy() : void {}
		public setParam(param : any) : void {}
    }
}
export default game.view.QBaseNode;
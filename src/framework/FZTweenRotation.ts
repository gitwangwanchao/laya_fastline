import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import FZTween from "./FZTween";
import FZUtils from "./FZUtils";

module fastline.framework
{
	export class FZTweenRotation extends FZTween
	{
		constructor() 
        {
            super();
        }

		public executeOn() : void
		{
			this.transform.localRotationEuler = this.tempVec3;
		}

		public executeEnd() : void
		{
			this.transform.localRotationEuler = this.to;
		}

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : FZTweenRotation
		{	
			let tp = sprite3D.getComponent(FZTweenRotation) as FZTweenRotation;
			if(!FZUtils.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(FZTweenRotation) as FZTweenRotation;

			tp.initParam(from, to, duration, true, delay, callback, caller);

			tp.tempVec3 = from;
			Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);

			return tp;
		}
	}
}

export default fastline.framework.FZTweenRotation;
import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import FZTween from "./FZTween";
import FZUtils from "./FZUtils";

namespace fastline.framework
{
	export class FZTweenScale extends FZTween
	{
		constructor()
		{
			super();
		}

		public executeOn() : void
		{
			this.transform.localScale = this.tempVec3;
		}

		public executeEnd() : void
		{
			this.transform.localScale = this.to;
		}

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : FZTweenScale
		{	

			let tp = sprite3D.getComponent(FZTweenScale) as FZTweenScale;
			
			if(!FZUtils.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(FZTweenScale) as FZTweenScale;

			tp.initParam(from, to, duration, true, delay, callback, caller);
			tp.tempVec3 = from.clone();
			Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);
			
			return tp;
		}
	}
}
export default fastline.framework.FZTweenScale;
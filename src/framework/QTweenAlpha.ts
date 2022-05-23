import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import QTween from "./QTween";
import QUtil from "./QUtil";

namespace fastline.framework
{
	export class QTweenScale extends QTween
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

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : QTweenScale
		{	

			let tp = sprite3D.getComponent(QTweenScale) as QTweenScale;
			
			if(!QUtil.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(QTweenScale) as QTweenScale;

			tp.initParam(from, to, duration, true, delay, callback, caller);
			tp.tempVec3 = from.clone();
			Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);
			
			return tp;
		}
	}
}
export default fastline.framework.QTweenScale;
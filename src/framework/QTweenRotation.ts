import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import QTween from "./QTween";
import QUtil from "./QUtil";

module fastline.framework
{
	export class QTweenRotation extends QTween
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

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : QTweenRotation
		{	
			let tp = sprite3D.getComponent(QTweenRotation) as QTweenRotation;
			if(!QUtil.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(QTweenRotation) as QTweenRotation;

			tp.initParam(from, to, duration, true, delay, callback, caller);

			tp.tempVec3 = from;
			Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);

			return tp;
		}
	}
}

export default fastline.framework.QTweenRotation;
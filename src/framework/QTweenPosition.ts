import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import QTween from "./QTween";
import QUtil from "./QUtil";

namespace fastline.framework
{
	export class QTweenPosition extends QTween
	{
		constructor() 
        {
            super();
        }

		public executeOn() : void
		{
			if(this.isLocal)
			{
				this.transform.localPosition = this.tempVec3;
			}
			else
			{
				this.transform.position = this.tempVec3;
			}
		}

		public executeEnd() : void
		{
			if(this.isLocal)
			{
				this.transform.localPosition = this.to;
			}
			else
			{
				this.transform.position = this.to;
			}
		}

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, isLocal : boolean = false, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : QTweenPosition
		{	

			let tp = sprite3D.getComponent(QTweenPosition) as QTweenPosition;
			if(!QUtil.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(QTweenPosition) as QTweenPosition;

			tp.initParam(from, to, duration, isLocal, delay, callback, caller);
			tp.tempVec3 = from.clone();
			tp.tween = Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);
			return tp;
		}

		private tween : Laya.Tween = null;
		public onDestroy() : void
		{
			if(!QUtil.isNullOrEmpty(this.tween))
			{
				this.tween.clear();
			}
		}
	}
}

export default fastline.framework.QTweenPosition;
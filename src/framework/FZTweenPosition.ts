import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

import FZTween from "./FZTween";
import FZUtils from "./FZUtils";

namespace fastline.framework
{
	export class FZTweenPosition extends FZTween
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

		public static DoTween(sprite3D : Laya.Sprite3D, from : Laya.Vector3, to : Laya.Vector3, duration : number, isLocal : boolean = false, delay : number = 0, callback : Function = null, caller : any = null, ease : Function = Laya.Ease.linearOut) : FZTweenPosition
		{	

			let tp = sprite3D.getComponent(FZTweenPosition) as FZTweenPosition;
			if(!FZUtils.isNullOrEmpty(tp))
			{
				tp.destroy();	
			}
			tp = sprite3D.addComponent(FZTweenPosition) as FZTweenPosition;

			tp.initParam(from, to, duration, isLocal, delay, callback, caller);
			tp.tempVec3 = from.clone();
			tp.tween = Laya.Tween.to(tp.tempVec3, {x: to.x, y: to.y, z : to.z}, duration*1000, ease);
			return tp;
		}

		private tween : Laya.Tween = null;
		public onDestroy() : void
		{
			if(!FZUtils.isNullOrEmpty(this.tween))
			{
				this.tween.clear();
			}
		}
	}
}

export default fastline.framework.FZTweenPosition;